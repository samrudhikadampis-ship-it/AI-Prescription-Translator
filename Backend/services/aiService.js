const {
    getMedicineInformation
} = require("./medicineDatabase");


// ==========================================
// ANALYZE PRESCRIPTION
// ==========================================

function analyzePrescription(text) {

    const medicines = [];

    const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);


    // ------------------------------------------
    // Known medicines from our local database
    // ------------------------------------------

    const knownMedicines = [
        "paracetamol",
        "acetaminophen",
        "ibuprofen",
        "amoxicillin",
        "azithromycin",
        "cetirizine",
        "pantoprazole",
        "omeprazole",
        "metformin",
        "ondansetron"
    ];


    // ------------------------------------------
    // Process every OCR line
    // ------------------------------------------

    for (const line of lines) {

        const lowerLine = line.toLowerCase();


        // --------------------------------------
        // Check if line contains known medicine
        // --------------------------------------

        const matchedMedicine =
            knownMedicines.find(medicine =>
                lowerLine.includes(medicine)
            );


        // --------------------------------------
        // Check for medicine-related words
        // --------------------------------------

        const hasMedicineKeyword = [
            "tablet",
            "tab",
            "capsule",
            "cap",
            "syrup",
            "injection",
            "drops",
            "ointment",
            "cream"
        ].some(keyword =>
            lowerLine.includes(keyword)
        );


        // --------------------------------------
        // Check dosage
        // --------------------------------------

        const dosageMatch = line.match(
            /\b\d+(?:\.\d+)?\s*(mg|mcg|g|ml|%)\b/i
        );


        // --------------------------------------
        // Check duration
        // --------------------------------------

        const durationMatch = line.match(
            /\b\d+\s*(day|days|week|weeks|month|months)\b/i
        );


        // --------------------------------------
        // Check frequency
        // --------------------------------------

        let frequency =
            "Not clearly mentioned";


        if (/1\s*-\s*0\s*-\s*1/i.test(line)) {

            frequency =
                "Morning and night";

        } else if (/1\s*-\s*1\s*-\s*1/i.test(line)) {

            frequency =
                "Morning, afternoon and night";

        } else if (/0\s*-\s*1\s*-\s*0/i.test(line)) {

            frequency =
                "Afternoon";

        } else if (/0\s*-\s*0\s*-\s*1/i.test(line)) {

            frequency =
                "Night";

        } else if (/once\s*(daily|a day)/i.test(line)) {

            frequency =
                "Once daily";

        } else if (/twice\s*(daily|a day)/i.test(line)) {

            frequency =
                "Twice daily";

        } else if (/thrice\s*(daily|a day)/i.test(line)) {

            frequency =
                "Three times daily";
        }


        // --------------------------------------
        // Decide whether this is a medicine line
        // --------------------------------------

        const looksLikeMedicine =
            matchedMedicine ||
            hasMedicineKeyword ||
            dosageMatch;


        if (!looksLikeMedicine) {
            continue;
        }


        // --------------------------------------
        // Determine medicine name
        // --------------------------------------

        let medicineName;


        if (matchedMedicine) {

            medicineName = matchedMedicine;

        } else {

            medicineName = line
                .replace(
                    /\b\d+(?:\.\d+)?\s*(mg|mcg|g|ml|%)\b/gi,
                    ""
                )
                .replace(
                    /\b\d+\s*(day|days|week|weeks|month|months)\b/gi,
                    ""
                )
                .replace(
                    /\b(tablet|tab|capsule|cap|syrup|injection|drops|ointment|cream)\b/gi,
                    ""
                )
                .trim();
        }


        // --------------------------------------
        // Get medicine information
        // --------------------------------------

        const medicineInfo =
            getMedicineInformation(
                medicineName
            );


        // --------------------------------------
        // Add medicine
        // --------------------------------------

        medicines.push({

            name:
                medicineName,

            dosage:
                dosageMatch
                    ? dosageMatch[0]
                    : "Not clearly mentioned",

            frequency:
                frequency,

            duration:
                durationMatch
                    ? durationMatch[0]
                    : "Not clearly mentioned",

            purpose:
                medicineInfo.purpose,

            commonUses:
                medicineInfo.commonUses
        });
    }


    // ==========================================
    // RETURN RESULT
    // ==========================================

    return {

        disclaimer:
            "This is an informational explanation only. Confirm prescription details with a qualified healthcare professional.",

        medicines:
            medicines,

        instructions:
            extractInstructions(text),

        originalText:
            text
    };
}



// ==========================================
// EXTRACT INSTRUCTIONS
// ==========================================

function extractInstructions(text) {

    const instructions = [];


    const patterns = [

        {
            regex: /after\s+food/gi,
            message: "Take after food"
        },

        {
            regex: /before\s+food/gi,
            message: "Take before food"
        },

        {
            regex: /with\s+food/gi,
            message: "Take with food"
        },

        {
            regex: /empty\s+stomach/gi,
            message: "Take on an empty stomach"
        }

    ];


    for (const pattern of patterns) {

        if (pattern.regex.test(text)) {

            instructions.push(
                pattern.message
            );
        }
    }


    return instructions.length > 0
        ? instructions
        : ["No specific instructions detected"];
}



module.exports = {
    analyzePrescription
};