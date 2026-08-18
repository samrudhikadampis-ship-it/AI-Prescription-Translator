const express = require("express");
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

module.exports = router;