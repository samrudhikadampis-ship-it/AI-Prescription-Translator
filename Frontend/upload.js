function getApiBaseUrl() {
    const { hostname, origin, port } = window.location;

    if (hostname.endsWith("github.dev")) {
        return origin.replace(/-\d+(?=\.app\.github\.dev)/, "-5000");
    }

    if (port === "5000") {
        return "";
    }

    return "http://127.0.0.1:5000";
}

const API_BASE_URL = getApiBaseUrl();

document.addEventListener("DOMContentLoaded", function () {

    fetch(API_BASE_URL + "/api/health")
        .then(function (response) {
            return response.json().then(function (data) {
                console.log("Backend health:", response.status, data);
            });
        })
        .catch(function (error) {
            console.error(
                "Backend is not reachable at " +
                (API_BASE_URL || window.location.origin) +
                ". Start it with: npm start (in Backend)",
                error
            );
        });


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

    const statusMessage =
        document.getElementById("statusMessage");

    const resultContainer =
        document.getElementById("resultContainer");

    function setStatus(message, type) {
        if (!statusMessage) {
            return;
        }

        statusMessage.textContent = message;
        statusMessage.className = "status-message" +
            (type ? " is-" + type : "");
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

                setStatus(
                    `Selected: ${file.name}`,
                    "info"
                );

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

                    setStatus(
                        "Please select a prescription image first.",
                        "error"
                    );

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

                    setStatus(
                        "Please upload a JPG or PNG image.",
                        "error"
                    );

                    return;
                }


                // Check size
                if (file.size > 10 * 1024 * 1024) {

                    setStatus(
                        "File size must be less than 10 MB.",
                        "error"
                    );

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

                setStatus(
                    "Reading your prescription...",
                    "loading"
                );

                resultContainer.innerHTML = "";


                try {


                    // ==================================
                    // SEND TO BACKEND
                    // ==================================

                    const response =
                        await fetch(
                            API_BASE_URL + "/api/documents/upload",
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


                    setStatus(
                        "Prescription analyzed successfully.",
                        "success"
                    );


                    // ==================================
                    // DISPLAY RESULT
                    // ==================================

                    displayResults(data);


                } catch (error) {

                    console.error(
                        "Upload error:",
                        error
                    );


                    setStatus(
                        "Something went wrong: " +
                        error.message,
                        "error"
                    );


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