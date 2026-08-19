document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // HOW IT WORKS MODAL
    // ==========================================

    const howItWorksBtn = document.getElementById("howItWorksBtn");
    const howItWorksModal = document.getElementById("howItWorksModal");
    const closeHowItWorks = document.getElementById("closeHowItWorks");
    const gotItBtn = document.getElementById("gotItBtn");


    if (howItWorksBtn && howItWorksModal) {

        howItWorksBtn.addEventListener("click", function (event) {

            event.preventDefault();

            howItWorksModal.classList.add("active");

            document.body.style.overflow = "hidden";

        });

    }


    if (closeHowItWorks) {

        closeHowItWorks.addEventListener("click", function () {

            howItWorksModal.classList.remove("active");

            document.body.style.overflow = "";

        });

    }


    if (gotItBtn) {

        gotItBtn.addEventListener("click", function () {

            howItWorksModal.classList.remove("active");

            document.body.style.overflow = "";

        });

    }


    if (howItWorksModal) {

        howItWorksModal.addEventListener("click", function (event) {

            if (event.target === howItWorksModal) {

                howItWorksModal.classList.remove("active");

                document.body.style.overflow = "";

            }

        });

    }


    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            howItWorksModal &&
            howItWorksModal.classList.contains("active")
        ) {

            howItWorksModal.classList.remove("active");

            document.body.style.overflow = "";

        }

    });



    // ==========================================
    // PRESCRIPTION UPLOAD
    // ==========================================

    const prescriptionInput =
        document.getElementById("prescription");

    const decodeBtn =
        document.getElementById("decodeBtn");


    // Create status message
    const statusMessage =
        document.createElement("p");

    statusMessage.id = "statusMessage";

    statusMessage.style.textAlign = "center";
    statusMessage.style.marginTop = "20px";
    statusMessage.style.fontWeight = "600";


    // Put status message after decode button
    if (decodeBtn) {

        decodeBtn.insertAdjacentElement(
            "afterend",
            statusMessage
        );

    }


    // Create result container
    const resultContainer =
        document.createElement("div");

    resultContainer.id = "resultContainer";

    resultContainer.style.marginTop = "30px";


    if (decodeBtn) {

        decodeBtn.insertAdjacentElement(
            "afterend",
            resultContainer
        );

    }



    // ==========================================
    // SHOW SELECTED FILE
    // ==========================================

    if (prescriptionInput) {

        prescriptionInput.addEventListener(
            "change",
            function () {

                if (!prescriptionInput.files.length) {
                    return;
                }

                const file =
                    prescriptionInput.files[0];

                statusMessage.textContent =
                    `Selected: ${file.name}`;

            }
        );

    }



    // ==========================================
    // DECODE PRESCRIPTION
    // ==========================================

    if (decodeBtn) {

        decodeBtn.addEventListener(
            "click",
            async function () {


                // Check file
                if (
                    !prescriptionInput ||
                    !prescriptionInput.files.length
                ) {

                    statusMessage.textContent =
                        "Please select a prescription image first.";

                    return;
                }


                const file =
                    prescriptionInput.files[0];


                // Allowed image types
                const allowedTypes = [
                    "image/jpeg",
                    "image/png"
                ];


                if (!allowedTypes.includes(file.type)) {

                    statusMessage.textContent =
                        "Please upload a JPG or PNG image.";

                    return;
                }


                // Check size
                if (file.size > 10 * 1024 * 1024) {

                    statusMessage.textContent =
                        "File size must be less than 10 MB.";

                    return;
                }


                // ======================================
                // CREATE FORM DATA
                // ======================================

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );


                // ======================================
                // UI LOADING
                // ======================================

                decodeBtn.disabled = true;

                decodeBtn.style.opacity = "0.6";

                statusMessage.textContent =
                    "Reading your prescription...";

                resultContainer.innerHTML = "";


                try {


                    // ==================================
                    // SEND TO BACKEND
                    // ==================================

                    const response =
                        await fetch(
                            "https://literate-fiesta-5g77jp45wr472p6v6-5000.app.github.dev/api/documents/upload",
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "Backend response:",
                        data
                    );


                    // ==================================
                    // ERROR HANDLING
                    // ==================================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to analyze prescription."
                        );

                    }


                    statusMessage.textContent =
                        "Prescription analyzed successfully!";


                    // ==================================
                    // DISPLAY RESULT
                    // ==================================

                    displayResults(data);


                } catch (error) {

                    console.error(
                        "Upload error:",
                        error
                    );


                    statusMessage.textContent =
                        "Something went wrong: " +
                        error.message;


                } finally {

                    decodeBtn.disabled = false;

                    decodeBtn.style.opacity = "1";

                }

            }
        );

    }



    // ==========================================
    // DISPLAY RESULTS
    // ==========================================

    function displayResults(data) {

        const analysis =
            data.aiAnalysis;


        if (!analysis) {

            resultContainer.innerHTML =
                "<p>No analysis was returned.</p>";

            return;
        }


        let html = `

            <div class="analysis-result">

                <h2>Prescription Analysis</h2>

                <p class="disclaimer">
                    ${analysis.disclaimer}
                </p>

        `;


        // ==========================================
        // MEDICINES
        // ==========================================

        if (
            analysis.medicines &&
            analysis.medicines.length > 0
        ) {

            html += `
                <h3>💊 Medicines</h3>
            `;


            analysis.medicines.forEach(
                function (medicine) {

                    html += `

                        <div class="medicine-card">

                            <h4>
                                ${medicine.name}
                            </h4>

                            <p>
                                <strong>Dosage:</strong>
                                ${medicine.dosage}
                            </p>

                            <p>
                                <strong>Frequency:</strong>
                                ${medicine.frequency}
                            </p>

                            <p>
                                <strong>Duration:</strong>
                                ${medicine.duration}
                            </p>

                            <p>
                                <strong>Purpose:</strong>
                                ${medicine.purpose}
                            </p>

                        </div>

                    `;

                }
            );

        } else {

            html += `

                <h3>💊 Medicines</h3>

                <p>
                    No medicines could be confidently detected.
                </p>

            `;

        }



        // ==========================================
        // INSTRUCTIONS
        // ==========================================

        if (
            analysis.instructions &&
            analysis.instructions.length > 0
        ) {

            html += `

                <h3>📋 Instructions</h3>

                <ul>
            `;


            analysis.instructions.forEach(
                function (instruction) {

                    html += `
                        <li>
                            ${instruction}
                        </li>
                    `;

                }
            );


            html += `
                </ul>
            `;

        }


        html += `

            </div>

        `;


        resultContainer.innerHTML =
            html;

    }

});