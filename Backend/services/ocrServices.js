const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const sharp = require("sharp");


// ==========================================
// OCR FOR IMAGE FILES
// ==========================================

async function extractTextFromImage(imagePath) {

    const processedImagePath = path.join(
        os.tmpdir(),
        `medilingo-processed-${Date.now()}-${Math.random().toString(16).slice(2)}.png`
    );

    try {

        console.log("Pre-processing image for OCR...");

        await sharp(imagePath)
            .rotate()
            .resize({
                width: 2400,
                withoutEnlargement: true
            })
            .grayscale()
            .normalize()
            .sharpen()
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

        return text.trim();

    } catch (error) {

        console.error(
            "Image OCR Error:",
            error
        );

        throw new Error(
            "Failed to extract text from image"
        );

    } finally {

        if (fs.existsSync(processedImagePath)) {
            fs.unlinkSync(processedImagePath);
        }
    }
}



// ==========================================
// OCR FOR PDF FILES
// ==========================================

async function extractTextFromPDF(pdfPath) {

    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({
        data: fs.readFileSync(pdfPath)
    });

    try {

        console.log("Rendering PDF pages for OCR...");

        const { pages } = await parser.getScreenshot({
            scale: 2,
            imageDataUrl: false
        });
        const pageTexts = [];

        for (const page of pages) {
            pageTexts.push(await extractTextFromImage(page.data));
        }

        return pageTexts.filter(Boolean).join("\n\n");

    } catch (error) {

        console.error("PDF OCR Error:", error);

        throw new Error(
            "Failed to process PDF using OCR"
        );

    } finally {

        await parser.destroy();
    }
}



module.exports = {
    extractTextFromImage,
    extractTextFromPDF
};