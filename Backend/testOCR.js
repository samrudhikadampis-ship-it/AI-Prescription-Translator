const { extractTextFromPDF } = require("./services/ocrServices");

const pdfPath = "./uploads/1787142067485-606599576.pdf";

async function testOCR() {
    try {
        const text = await extractTextFromPDF(pdfPath);

        console.log("\n========== EXTRACTED TEXT ==========\n");
        console.log(text);
        console.log("\n====================================\n");

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testOCR();