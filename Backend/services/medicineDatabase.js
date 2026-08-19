const medicineDatabase = {

    paracetamol: {
        purpose: "Used to relieve pain and reduce fever.",
        commonUses: [
            "Fever",
            "Headache",
            "Body pain"
        ]
    },

    acetaminophen: {
        purpose: "Used to relieve pain and reduce fever.",
        commonUses: [
            "Fever",
            "Headache",
            "Body pain"
        ]
    },

    ibuprofen: {
        purpose: "Used to reduce pain, fever and inflammation.",
        commonUses: [
            "Pain",
            "Fever",
            "Inflammation"
        ]
    },

    amoxicillin: {
        purpose: "An antibiotic used to treat certain bacterial infections.",
        commonUses: [
            "Bacterial infections"
        ]
    },

    azithromycin: {
        purpose: "An antibiotic used to treat certain bacterial infections.",
        commonUses: [
            "Bacterial infections"
        ]
    },

    cetirizine: {
        purpose: "An antihistamine used to relieve allergy symptoms.",
        commonUses: [
            "Allergic rhinitis",
            "Sneezing",
            "Itching"
        ]
    },

    pantoprazole: {
        purpose: "Reduces stomach acid production.",
        commonUses: [
            "Acidity",
            "Heartburn",
            "Acid reflux"
        ]
    },

    omeprazole: {
        purpose: "Reduces stomach acid production.",
        commonUses: [
            "Acidity",
            "Heartburn",
            "Acid reflux"
        ]
    },

    metformin: {
        purpose: "Used to help control blood sugar levels in people with type 2 diabetes.",
        commonUses: [
            "Type 2 diabetes"
        ]
    },

    ondansetron: {
        purpose: "Used to help prevent nausea and vomiting.",
        commonUses: [
            "Nausea",
            "Vomiting"
        ]
    }

};

function getMedicineInformation(medicineName) {

    const normalizedName = medicineName
        .toLowerCase()
        .trim();

    return medicineDatabase[normalizedName] || {
        purpose: "Medicine information not available in the local database.",
        commonUses: []
    };
}

module.exports = {
    getMedicineInformation
};