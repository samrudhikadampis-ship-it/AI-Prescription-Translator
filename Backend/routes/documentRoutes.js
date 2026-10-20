const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { analyzePrescription } = require("../services/aiService");

const {
    extractTextFromPDF,
    extractTextFromImage,
    extractTextWithVision
} = require("../services/ocrServices");

const router = express.Router();


// ==========================================
// FILE STORAGE CONFIGURATION
// ==========================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});


// ==========================================
// FILE UPLOAD CONFIGURATION
// ==========================================

const upload = multer({

    storage: storage,

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF, JPG, JPEG and PNG files are allowed"
                )
            );
        }
    }
});


// ==========================================
// UPLOAD + OCR + PRESCRIPTION ANALYSIS
// ==========================================

router.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {

        try {

            // --------------------------------------
            // Check file
            // --------------------------------------

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }


            console.log(
                "File uploaded:",
                req.file.path
            );

            const enhancedRecognitionRequested =
                req.body.enhancedRecognition === "true";
            let recognitionMode = "local";
            let recognitionWarning = "";

            let extractedText = "";


            // ======================================
            // PDF PROCESSING
            // ======================================

            if (
                req.file.mimetype ===
                "application/pdf"
            ) {

                console.log("PDF detected.");

                if (enhancedRecognitionRequested) {
                    try {
                        extractedText = await extractTextFromPDF(
                            req.file.path,
                            extractTextWithVision
                        );
                        recognitionMode = "enhanced";
                    } catch (error) {
                        console.error("Enhanced PDF recognition failed:", error);
                        recognitionWarning = "Enhanced recognition was unavailable; local OCR was used instead. Verify every detail.";
                    }
                }

                if (!extractedText) {
                    const { PDFParse } = require("pdf-parse");
                    const parser = new PDFParse({
                        data: fs.readFileSync(req.file.path)
                    });

                    try {
                        const result = await parser.getText();
                        extractedText = result.text
                            ? result.text
                                .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
                                .trim()
                            : "";
                    } finally {
                        await parser.destroy();
                    }
                }


                console.log(
                    "PDF text extraction completed."
                );


                // ----------------------------------
                // OCR FALLBACK
                // ----------------------------------

                if (!extractedText) {

                    console.log(
                        "No readable PDF text found."
                    );

                    console.log(
                        "Starting PDF OCR..."
                    );


                    extractedText =
                        await extractTextFromPDF(
                            req.file.path
                        );


                    console.log(
                        "PDF OCR completed."
                    );

                } else {

                    console.log(
                        "Readable PDF text found."
                    );
                }

            }


            // ======================================
            // IMAGE PROCESSING
            // ======================================

            else {

                console.log(
                    "Image detected."
                );

                if (enhancedRecognitionRequested) {
                    try {
                        extractedText = await extractTextWithVision(req.file.path);
                        recognitionMode = "enhanced";
                    } catch (error) {
                        console.error("Enhanced image recognition failed:", error);
                        recognitionWarning = "Enhanced recognition was unavailable; local OCR was used instead. Verify every detail.";
                    }
                }

                if (!extractedText) {
                    console.log("Starting image OCR...");
                    extractedText = await extractTextFromImage(req.file.path);
                }


                console.log(
                    "Image OCR completed."
                );
            }


            // ======================================
            // PRESCRIPTION ANALYSIS
            // ======================================

            console.log(
                "Extracted text:"
            );

            console.log(
                extractedText
            );


            const aiAnalysis =
                analyzePrescription(
                    extractedText
                );


            console.log(
                "Prescription analysis completed."
            );


            // ======================================
            // RESPONSE
            // ======================================

            res.status(200).json({

                success: true,

                message:
                    "File uploaded and analyzed successfully",

                file: {

                    originalName:
                        req.file.originalname,

                    fileName:
                        req.file.filename,

                    fileType:
                        req.file.mimetype,

                    size:
                        req.file.size
                },

                extractedText:
                    extractedText,

                recognition: {
                    mode: recognitionMode,
                    warning: recognitionWarning
                },

                aiAnalysis:
                    aiAnalysis
            });


        } catch (error) {

            console.error(
                "File processing error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to process file",

                error:
                    error.message
            });

        } finally {
            if (req.file?.path) {
                try {
                    await fs.promises.unlink(req.file.path);
                } catch (error) {
                    if (error.code !== "ENOENT") {
                        console.error("Failed to remove uploaded file:", error);
                    }
                }
            }
        }
    }
);


module.exports = router;