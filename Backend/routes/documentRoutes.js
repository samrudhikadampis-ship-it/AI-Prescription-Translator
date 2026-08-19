const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const { analyzePrescription } = require("../services/aiService");

const {
    extractTextFromPDF,
    extractTextFromImage
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


            let extractedText = "";


            // ======================================
            // PDF PROCESSING
            // ======================================

            if (
                req.file.mimetype ===
                "application/pdf"
            ) {

                console.log("PDF detected.");


                // Read PDF
                const dataBuffer =
                    fs.readFileSync(
                        req.file.path
                    );


                // Try normal PDF text extraction
                const parser = new PDFParse({
                    data: dataBuffer
                });


                const result =
                    await parser.getText();


                await parser.destroy();


                extractedText =
                    result.text
                        ? result.text.trim()
                        : "";


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

                console.log(
                    "Starting image OCR..."
                );


                extractedText =
                    await extractTextFromImage(
                        req.file.path
                    );


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
        }
    }
);


module.exports = router;