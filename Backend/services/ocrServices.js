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

async function extractTextWithVision(image) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Enhanced recognition is not configured on this server");
    }

    const OpenAI = require("openai");
    const imageBuffer = Buffer.isBuffer(image)
        ? image
        : fs.readFileSync(image);
    const preparedImage = await sharp(imageBuffer)
        .rotate()
        .resize({ width: 3000, withoutEnlargement: true })
        .jpeg({ quality: 95 })
        .toBuffer();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
        model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
        temperature: 0,
        messages: [{
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Transcribe all visible prescription text exactly, preserving line breaks. Do not infer, expand abbreviations, or correct medicine names or numbers. If any character, medicine name, or dose is ambiguous, write [unclear] for that part instead of guessing. Return only the transcription."
                },
                {
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${preparedImage.toString("base64")}`,
                        detail: "high"
                    }
                }
            ]
        }]
    });

    const transcription = response.choices[0]?.message?.content;
    if (typeof transcription !== "string" || !transcription.trim()) {
        throw new Error("Enhanced recognition returned no transcription");
    }

    return transcription.trim();
}



// ==========================================
// OCR FOR PDF FILES
// ==========================================

async function extractTextFromPDF(pdfPath, recognizeImage = extractTextFromImage) {

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
            pageTexts.push(await recognizeImage(page.data));
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
    extractTextWithVision,
    extractTextFromPDF
};