document.addEventListener("DOMContentLoaded", function () {
     const progress = document.createElement("div");
     progress.className = "scroll-progress";
     progress.setAttribute("aria-hidden", "true");
     document.body.append(progress);

     const revealItems = document.querySelectorAll(".reveal");

     if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(function (entries) {
               entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                         entry.target.classList.add("is-visible");
                         observer.unobserve(entry.target);
                    }
               });
          }, { threshold: 0.14 });

          revealItems.forEach(function (item) {
               observer.observe(item);
          });
     } else {
          revealItems.forEach(function (item) {
               item.classList.add("is-visible");
          });
     }

     let updateScheduled = false;

     window.addEventListener("scroll", function () {
          if (updateScheduled) {
               return;
          }

          updateScheduled = true;
          window.requestAnimationFrame(function () {
               const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
               const progressValue = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
               progress.style.transform = `scaleX(${progressValue})`;
               updateScheduled = false;
          });
     }, { passive: true });
});

