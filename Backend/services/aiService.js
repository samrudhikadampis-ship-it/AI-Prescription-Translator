function analyzePrescription(text) {

    const lowerText = text.toLowerCase();

    const medicines = [];

    // Simple medicine detection for testing
    const knownMedicines = [
        "paracetamol",
        "azithromycin",
        "amoxicillin",
        "ibuprofen",
        "cetirizine",
        "omeprazole",
        "pantoprazole",
        "metformin"
    ];

    knownMedicines.forEach((medicine) => {
        if (lowerText.includes(medicine)) {
            medicines.push({
                name: medicine,
                purpose: "General purpose will be identified from the prescription.",
                dosage: "Not clearly mentioned",
                frequency: "Not clearly mentioned",
                duration: "Not clearly mentioned"
            });
        }
    });

    return {
        disclaimer:
            "This is an informational explanation only. Always confirm prescription details with a qualified healthcare professional.",

        medicines: medicines,

        instructions: "No specific instructions detected.",

        originalText: text
    };
}

module.exports = {
    analyzePrescription
};