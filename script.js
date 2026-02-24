document.addEventListener('DOMContentLoaded', () => {
    const showcase = document.getElementById('showcase');
    const tiltElements = document.querySelectorAll('.tilt-element');

    // 3D Parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 1024) return; // Disable on small screens

        const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 50;

        tiltElements.forEach(el => {
            let speed = 2;
            let parentFloat = null;

            if (el.parentElement.classList.contains('card-float')) {
                speed = el.parentElement.getAttribute('data-speed') || 2;
                parentFloat = el.parentElement;
            } else if (el.classList.contains('card-float')) {
                speed = el.getAttribute('data-speed') || 2;
            }

            const xOffset = xAxis * speed;
            const yOffset = yAxis * speed;

            // Apply slight rotation and translation
            el.style.transform = `rotateY(${-xAxis}deg) rotateX(${yAxis}deg) translateZ(50px)`;

            if (parentFloat) {
                if (parentFloat.classList.contains('center-card')) {
                    parentFloat.style.transform = `translateX(-50%) translate(${xOffset}px, ${yOffset}px)`;
                } else {
                    parentFloat.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                }
            } else {
                // For new elements, apply translation directly to the tilting element
                el.style.transform = `translate(${xOffset}px, ${yOffset}px) rotateY(${-xAxis}deg) rotateX(${yAxis}deg) translateZ(50px)`;
            }
        });
    });

    // Reset when mouse leaves
    document.addEventListener('mouseleave', () => {
        tiltElements.forEach(el => {
            el.style.transform = `rotateY(0deg) rotateX(0deg) translateZ(0px)`;

            if (el.parentElement.classList.contains('card-float')) {
                if (el.parentElement.classList.contains('center-card')) {
                    el.parentElement.style.transform = `translateX(-50%)`;
                } else {
                    el.parentElement.style.transform = `translate(0px, 0px)`;
                }
            }
        });
    });
});
