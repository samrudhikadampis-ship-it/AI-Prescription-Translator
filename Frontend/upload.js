document.addEventListener("DOMContentLoaded", function () {

    const howItWorksBtn = document.getElementById("howItWorksBtn");
    const howItWorksModal = document.getElementById("howItWorksModal");
    const closeHowItWorks = document.getElementById("closeHowItWorks");
    const gotItBtn = document.getElementById("gotItBtn");


    // Open How It Works
    if (howItWorksBtn && howItWorksModal) {

        howItWorksBtn.addEventListener("click", function (event) {

            event.preventDefault();

            howItWorksModal.classList.add("active");

            document.body.style.overflow = "hidden";

        });

    }


    // Close using X
    if (closeHowItWorks) {

        closeHowItWorks.addEventListener("click", function () {

            howItWorksModal.classList.remove("active");

            document.body.style.overflow = "";

        });

    }


    // Close using Got It
    if (gotItBtn) {

        gotItBtn.addEventListener("click", function () {

            howItWorksModal.classList.remove("active");

            document.body.style.overflow = "";

        });

    }


    // Close by clicking outside card
    if (howItWorksModal) {

        howItWorksModal.addEventListener("click", function (event) {

            if (event.target === howItWorksModal) {

                howItWorksModal.classList.remove("active");

                document.body.style.overflow = "";

            }

        });

    }


    // Close using Escape key
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

});