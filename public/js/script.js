document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("a[href^='#']");

    links.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.2,
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("opacity-100", "translate-y-0");
            }
        });
    };

    const sections = document.querySelectorAll(".animate-fadeInUp, .animate-slideInRight");
    const observer = new IntersectionObserver(animateOnScroll, observerOptions);

    sections.forEach((section) => {
        section.classList.add("opacity-0", "translate-y-10");
        observer.observe(section);
    });
});




