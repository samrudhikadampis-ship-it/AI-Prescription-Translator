/*const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Where uploaded files will be stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// Allow only PDF files
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

// POST /api/documents/upload
router.post("/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No PDF file uploaded"
        });
    }

    res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file: {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            fileType: req.file.mimetype,
            size: req.file.size
        }
    });
});

module.exports = router;*/
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const router = express.Router();

// -----------------------------
// FILE STORAGE CONFIGURATION
// -----------------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// -----------------------------
// PDF FILE FILTER
// -----------------------------

const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {

        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

// -----------------------------
// UPLOAD + EXTRACT TEXT
// -----------------------------

router.post("/upload", upload.single("file"), async (req, res) => {

    try {

        // Check if PDF was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF file uploaded"
            });
        }

        console.log("PDF uploaded:", req.file.path);

        // Read the uploaded PDF
        const dataBuffer = fs.readFileSync(req.file.path);

        // Create PDF parser
        const parser = new PDFParse({
            data: dataBuffer
        });

        // Extract text from PDF
        const result = await parser.getText();

        // Release parser resources
        await parser.destroy();

        console.log("PDF text extracted successfully");

        // Show extracted text in terminal
        console.log(result.text);

        // Send response to Postman
        res.status(200).json({
            success: true,
            message: "PDF uploaded and text extracted successfully",

            file: {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                fileType: req.file.mimetype,
                size: req.file.size
            },

            extractedText: result.text
        });

    } catch (error) {

        console.error("PDF processing error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to process PDF",
            error: error.message
        });
    }
});

module.exports = router;