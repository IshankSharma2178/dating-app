import { useEffect } from 'react';

export default function HeartsBackground() {
    useEffect(() => {
        const container = document.createElement('div');
        container.className = 'hearts-container';
        document.body.appendChild(container);

        const HEART_COUNT = 14;
        for (let i = 0; i < HEART_COUNT; i++) {
            const h = document.createElement('div');
            h.className = 'heart';
            h.textContent = '❤';
            h.style.left = Math.random() * 100 + '%';
            h.style.bottom = (-10 - Math.random() * 10) + '%';
            h.style.fontSize = (12 + Math.random() * 36) + 'px';
            h.style.opacity = (0.5 + Math.random() * 0.6).toString();
            h.style.animationDuration = (4 + Math.random() * 6) + 's';
            h.style.animationDelay = (Math.random() * 4) + 's';
            container.appendChild(h);
        }
        return () => container.remove();
    }, []);

    return null;
}
