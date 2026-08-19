const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function analyzePrescription(text) {

    const response = await client.responses.create({
        model: "gpt-5.6",

        instructions: `
You are MediLingo, a medical document explanation assistant.

Analyze the prescription text provided to you.

Identify:
- Medicine names
- Dosage, if mentioned
- Frequency/timing, if mentioned
- Duration, if mentioned
- General purpose of each medicine
- Important instructions
- Important warnings or precautions explicitly mentioned

Rules:
- Do not invent information.
- If information is missing or unclear, say "Not clearly mentioned".
- Do not change the doctor's prescribed dosage.
- Do not diagnose the patient.
- Do not tell the patient to start, stop, or change medication.
- Keep the explanation simple and easy to understand.
- Clearly state that this is an informational explanation and
  the prescription should be confirmed with a qualified healthcare professional.
`,

        input: text
    });

    return response.output_text;
}

module.exports = {
    analyzePrescription
};