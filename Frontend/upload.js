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

    const enhancedRecognitionInput =
        document.getElementById("enhancedRecognition");

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

    const uploadArea = document.querySelector(".upload-area");
    const uploadTitle = document.getElementById("uploadTitle");
    const selectedFile = document.getElementById("selectedFile");
    let previewUrl = "";

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

                showSelectedFile(file);

                setStatus(
                    `Selected: ${file.name}`,
                    "info"
                );

            }
        );

    }

    function showSelectedFile(file) {
        if (!selectedFile) {
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = "";
        }

        selectedFile.replaceChildren();

        if (file.type.startsWith("image/")) {
            const preview = document.createElement("img");
            preview.className = "file-preview";
            preview.alt = "Selected prescription preview";
            previewUrl = URL.createObjectURL(file);
            preview.src = previewUrl;
            selectedFile.append(preview);
        } else {
            const fileType = document.createElement("span");
            fileType.className = "file-type-icon";
            fileType.textContent = "PDF";
            selectedFile.append(fileType);
        }

        const fileName = document.createElement("span");
        fileName.textContent = file.name;
        selectedFile.append(fileName);

        if (uploadTitle) {
            uploadTitle.textContent = "Prescription ready to decode";
        }
    }

    if (uploadArea && prescriptionInput) {
        ["dragenter", "dragover"].forEach(function (eventName) {
            uploadArea.addEventListener(eventName, function (event) {
                event.preventDefault();
                uploadArea.classList.add("is-dragging");
            });
        });

        ["dragleave", "drop"].forEach(function (eventName) {
            uploadArea.addEventListener(eventName, function (event) {
                event.preventDefault();
                uploadArea.classList.remove("is-dragging");
            });
        });

        uploadArea.addEventListener("drop", function (event) {
            const [file] = event.dataTransfer.files;
            if (!file) {
                return;
            }

            prescriptionInput.files = event.dataTransfer.files;
            prescriptionInput.dispatchEvent(new Event("change"));
        });
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


                // Allowed prescription formats
                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "application/pdf"
                ];


                if (!allowedTypes.includes(file.type)) {

                    setStatus(
                        "Please upload a JPG, PNG or PDF file.",
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

                formData.append(
                    "enhancedRecognition",
                    String(Boolean(enhancedRecognitionInput?.checked))
                );


                // ======================================
                // UI LOADING
                // ======================================

                decodeBtn.disabled = true;

                decodeBtn.style.opacity = "0.6";

                setStatus(
                    enhancedRecognitionInput?.checked
                        ? "Transcribing with enhanced handwriting recognition..."
                        : "Reading your prescription locally...",
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
                        "Transcription complete. Verify every medicine and dose before use.",
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


        const medicines = Array.isArray(analysis.medicines)
            ? analysis.medicines
            : [];
        const instructions = Array.isArray(analysis.instructions)
            ? analysis.instructions
            : [];
        const medicineCards = medicines.length
            ? medicines.map(function (medicine) {
                return `
                    <article class="medicine-card">
                        <div class="medicine-card-heading">
                            <span class="medicine-card-icon">✦</span>
                            <h4>${escapeHtml(medicine.name)}</h4>
                        </div>
                        <dl>
                            <div><dt>Dosage</dt><dd>${escapeHtml(medicine.dosage)}</dd></div>
                            <div><dt>Frequency</dt><dd>${escapeHtml(medicine.frequency)}</dd></div>
                            <div><dt>Duration</dt><dd>${escapeHtml(medicine.duration)}</dd></div>
                            <div><dt>Purpose</dt><dd>${escapeHtml(medicine.purpose)}</dd></div>
                        </dl>
                    </article>
                `;
            }).join("")
            : `<p class="empty-state">No medicines could be confidently detected. Check the extracted text before relying on this result.</p>`;
        const instructionList = instructions.length
            ? `<ul class="instruction-list">${instructions.map(function (instruction) {
                return `<li>${escapeHtml(instruction)}</li>`;
            }).join("")}</ul>`
            : `<p class="empty-state">No specific instructions were detected.</p>`;
        const extractedText = data.extractedText || analysis.originalText || "";
        const recognition = data.recognition || {};
        const recognitionLabel = recognition.mode === "enhanced"
            ? "Enhanced AI transcription"
            : "Local OCR";
        const fallbackWarning = recognition.warning
            ? `<p class="recognition-fallback">${escapeHtml(recognition.warning)}</p>`
            : "";

        resultContainer.innerHTML = `
            <section class="analysis-result">
                <div class="results-heading">
                    <div>
                        <p class="results-eyebrow">✦ YOUR PRESCRIPTION</p>
                        <h2>Decoded, at a glance.</h2>
                        <p class="recognition-label">${recognitionLabel}</p>
                    </div>
                    <span class="medicine-count">${medicines.length} ${medicines.length === 1 ? "medicine" : "medicines"}</span>
                </div>
                <div class="result-tabs" role="tablist" aria-label="Prescription results">
                    <button class="result-tab is-active" id="tab-summary" role="tab" aria-selected="true" aria-controls="panel-summary" data-result-tab="summary">Summary</button>
                    <button class="result-tab" id="tab-medicines" role="tab" aria-selected="false" aria-controls="panel-medicines" data-result-tab="medicines" tabindex="-1">Medicines <span>${medicines.length}</span></button>
                    <button class="result-tab" id="tab-text" role="tab" aria-selected="false" aria-controls="panel-text" data-result-tab="text" tabindex="-1">Extracted text</button>
                </div>
                <div class="result-panel" id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" data-result-panel="summary">
                    <div class="verification-note">
                        <strong>Verify before use</strong>
                        <p>Handwriting recognition is not guaranteed to be correct. Check every medicine name, strength, dose, timing, and duration against the original with your pharmacist or prescriber.</p>
                    </div>
                    ${fallbackWarning}
                    <h3>Instructions</h3>
                    ${instructionList}
                    <p class="disclaimer">${escapeHtml(analysis.disclaimer)}</p>
                </div>
                <div class="result-panel" id="panel-medicines" role="tabpanel" aria-labelledby="tab-medicines" data-result-panel="medicines" hidden>
                    <div class="medicine-grid">${medicineCards}</div>
                </div>
                <div class="result-panel" id="panel-text" role="tabpanel" aria-labelledby="tab-text" data-result-panel="text" hidden>
                    <pre class="extracted-text">${escapeHtml(extractedText || "No text could be read from this file.")}</pre>
                </div>
            </section>
        `;

        const tabs = Array.from(resultContainer.querySelectorAll("[data-result-tab]"));

        function selectTab(tabName) {
            tabs.forEach(function (tab) {
                const isSelected = tab.dataset.resultTab === tabName;
                tab.classList.toggle("is-active", isSelected);
                tab.setAttribute("aria-selected", String(isSelected));
                tab.tabIndex = isSelected ? 0 : -1;
            });

            resultContainer.querySelectorAll("[data-result-panel]").forEach(function (panel) {
                panel.hidden = panel.dataset.resultPanel !== tabName;
            });
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener("click", function () {
                selectTab(tab.dataset.resultTab);
            });
            tab.addEventListener("keydown", function (event) {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                    return;
                }

                event.preventDefault();
                const direction = event.key === "ArrowRight" ? 1 : -1;
                const nextIndex = (index + direction + tabs.length) % tabs.length;
                tabs[nextIndex].focus();
                selectTab(tabs[nextIndex].dataset.resultTab);
            });
        });

        resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });


    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[character];
        });
    }
    }

});