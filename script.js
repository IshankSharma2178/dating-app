function moveRandom(elm) {
    elm.style.position = "absolute";
    elm.style.top = Math.floor(Math.random() * 90 + 5) + "%";
    elm.style.left = Math.floor(Math.random() * 90 + 5) + "%";
}

document.addEventListener('DOMContentLoaded', function () {
    // guard existing optional button behavior
    const moveRandomBtn = document.querySelector("#move-random");
    if (moveRandomBtn) {
        moveRandomBtn.addEventListener("mouseenter", function (e) {
            moveRandom(e.target);
        });
    }

    // show/hide color picker based on outfit radio choice
    const colorGroup = document.getElementById('color-picker-group');
    const radios = document.querySelectorAll('input[name="match_outfits"]');
    function updateColorVisibility() {
        const yesRadio = document.querySelector('input[name="match_outfits"][value="Yes, absolutely"]');
        if (!colorGroup) return;
        if (yesRadio && yesRadio.checked) {
            colorGroup.style.display = 'block';
            colorGroup.style.opacity = '1';
            colorGroup.style.transform = 'translateY(0)';
        } else {
            colorGroup.style.display = 'none';
            colorGroup.style.opacity = '0';
            colorGroup.style.transform = 'translateY(6px)';
        }
    }
    radios.forEach(r => r.addEventListener('change', updateColorVisibility));
    updateColorVisibility();

    // generate floating hearts in the background
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'hearts-container';
    document.body.appendChild(heartsContainer);

    const HEART_COUNT = 14;
    for (let i = 0; i < HEART_COUNT; i++) {
        const h = document.createElement('div');
        h.className = 'heart';
        h.textContent = '❤';
        // randomize position and animation
        h.style.left = Math.random() * 100 + '%';
        h.style.bottom = (-10 - Math.random() * 10) + '%';
        h.style.fontSize = (12 + Math.random() * 36) + 'px';
        h.style.opacity = (0.5 + Math.random() * 0.6).toString();
        h.style.animationDuration = (4 + Math.random() * 6) + 's';
        h.style.animationDelay = (Math.random() * 4) + 's';
        heartsContainer.appendChild(h);
    }
});