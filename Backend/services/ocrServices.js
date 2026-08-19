const Tesseract = require("tesseract.js");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const sharp = require("sharp");

const execFileAsync = promisify(execFile);


// ==========================================
// OCR FOR IMAGE FILES
// ==========================================

async function extractTextFromImage(imagePath) {

    try {

        console.log("Pre-processing image for OCR...");

        const processedImagePath = path.join(
            path.dirname(imagePath),
            `processed-${Date.now()}.png`
        );

        await sharp(imagePath)
            .resize({
                width: 2000,
                withoutEnlargement: false
            })
            .grayscale()
            .normalize()
            .sharpen()
            .threshold(180)
            .png()
            .toFile(processedImagePath);

        console.log("Image preprocessing completed.");
        console.log("Starting OCR...");

        const {
            data: { text }
        } = await Tesseract.recognize(
            processedImagePath,
            "eng",
            {
                logger: info => {

                    if (info.status === "recognizing text") {

                        console.log(
                            `OCR Progress: ${Math.round(
                                info.progress * 100
                            )}%`
                        );

                    }
                }
            }
        );

        console.log("Image OCR completed.");

        if (fs.existsSync(processedImagePath)) {
            fs.unlinkSync(processedImagePath);
        }

        return text;

    } catch (error) {

        console.error(
            "Image OCR Error:",
            error
        );

        throw new Error(
            "Failed to extract text from image"
        );
    }
}



// ==========================================
// OCR FOR PDF FILES
// ==========================================

async function extractTextFromPDF(pdfPath) {

    const outputPrefix = path.join(
        path.dirname(pdfPath),
        `ocr-${Date.now()}`
    );

    const imagePath = `${outputPrefix}.png`;

    try {

        console.log("Converting PDF to image...");

        await execFileAsync(
            "pdftoppm",
            [
                "-png",
                "-f",
                "1",
                "-singlefile",
                pdfPath,
                outputPrefix
            ]
        );

        console.log("PDF converted to image.");

        const text = await extractTextFromImage(
            imagePath
        );

        return text;

    } catch (error) {

        console.error("PDF OCR Error:", error);

        throw new Error(
            "Failed to process PDF using OCR"
        );

    } finally {

        // Delete temporary PNG
        if (fs.existsSync(imagePath)) {

            fs.unlinkSync(imagePath);

        }
    }
}



module.exports = {
    extractTextFromImage,
    extractTextFromPDF
};