// Tab Functionality
function openTab(index) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(el => el.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(el => el.classList.remove('active'));
    if (contents[index]) contents[index].classList.add('active');
    if (btns[index]) btns[index].classList.add('active');
}

// --- QUIZ LOGIC ---
let currentStep = 1;

function nextStep(step) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${step}`).style.display = 'block';
    currentStep = step;
    updateProgress();
}

function prevStep(step) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${step}`).style.display = 'block';
    currentStep = step;
    updateProgress();
}

function updateProgress() {
    const percent = currentStep === 1 ? '33%' : (currentStep === 2 ? '66%' : '100%');
    document.getElementById('progress-bar').style.width = percent;
    document.getElementById('step-percent').innerText = percent;
    document.getElementById('step-label').innerText = `Шаг ${currentStep} из 3`;
}

// --- TELEGRAM SEND ---
async function submitQuiz(event) {
    event.preventDefault();

    // SETTINGS
    const botToken = 'ЗАМЕНИТЬ_НА_ВАШ_ТОКЕН';
    const chatId = 'ЗАМЕНИТЬ_НА_ВАШ_ID';

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    // Get selected options
    const niche = document.querySelector('input[name="niche"]:checked')?.value || 'Не выбрано';
    const budget = document.querySelector('input[name="budget"]:checked')?.value || 'Не выбрано';

    const statusDiv = document.getElementById('statusMessage');
    const btn = event.target.querySelector('button[type="submit"]');

    if (botToken.includes('ЗАМЕНИТЬ')) {
        alert('Ошибка! Вставьте токен бота в код.');
        return;
    }

    btn.textContent = 'Отправка...';
    btn.disabled = true;

    const text = `🔥 ЗАЯВКА (КВИЗ)\n\n👤 Имя: ${name}\n📱 Контакты: ${phone}\n\n📊 Ниша: ${niche}\n💰 Бюджет: ${budget}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            statusDiv.innerHTML = '<span style="color: var(--accent)">Успешно! Мы свяжемся с вами.</span>';
            btn.style.display = 'none';
        } else {
            statusDiv.innerText = 'Ошибка отправки.';
            btn.disabled = false;
        }
    } catch (error) {
        console.error(error);
        statusDiv.innerText = 'Ошибка сети.';
        btn.disabled = false;
    }
}

// Hero Animation (Plasma)
function initPlasmaAnimation() {
    const glow1 = document.getElementById('glow1');
    const glow2 = document.getElementById('glow2');
    if (!glow1 || !glow2) return;

    // Configuration
    const width = window.innerWidth;
    const height = window.innerHeight;

    const blobs = [
        { el: glow1, x: width * 0.2, y: height * 0.2, vx: 0.8, vy: 0.5, size: 800 },
        { el: glow2, x: width * 0.7, y: height * 0.6, vx: -0.6, vy: 0.9, size: 600 }
    ];

    let time = 0;

    function animate() {
        time += 0.005; // Slower time for breathing

        blobs.forEach((blob, i) => {
            // Update Position
            blob.x += blob.vx;
            blob.y += blob.vy;

            // Soft Boundaries (Steer back if too close to edge)
            // Margin of 10%
            const marginX = window.innerWidth * 0.1;
            const marginY = window.innerHeight * 0.1;

            if (blob.x < -marginX) blob.vx += 0.05; // Push right
            if (blob.x > window.innerWidth + marginX) blob.vx -= 0.05; // Push left
            if (blob.y < -marginY) blob.vy += 0.05; // Push down
            if (blob.y > window.innerHeight + marginY) blob.vy -= 0.05; // Push up

            // Cap Velocity to prevent speeding
            const maxSpeed = 1.5;
            blob.vx = Math.max(Math.min(blob.vx, maxSpeed), -maxSpeed);
            blob.vy = Math.max(Math.min(blob.vy, maxSpeed), -maxSpeed);

            // Breathing Effect (Sine wave)
            // Scale oscillates between 0.9 and 1.1
            const scale = 1 + Math.sin(time * 3 + i) * 0.15;
            // Opacity oscillates slightly
            const opacity = 0.5 + Math.sin(time * 2 + i) * 0.1;

            // Apply Transform
            // Using translate3d for hardware acceleration
            blob.el.style.transform = `translate3d(${blob.x - blob.size / 2}px, ${blob.y - blob.size / 2}px, 0) scale(${scale})`;
            blob.el.style.opacity = Math.max(0.2, Math.min(0.8, opacity));
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// Initialize
document.addEventListener('DOMContentLoaded', initPlasmaAnimation);

// Sticky Header Script
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- AI WIDGET LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.querySelector('.ai-bubble');
    const widget = document.querySelector('.ai-widget');

    // Low-volume pop sound base64 (very short beep)
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

    // Helper to close bubble
    const closeBubble = (e) => {
        if (e) e.stopPropagation(); // Prevent scroll if clicked on bubble
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        bubble.style.pointerEvents = 'none';
    };

    // 1. Wait 2.5s after load
    setTimeout(() => {
        // Show "Typing..."
        bubble.innerHTML = '<div class="simple-dots" style="font-size: 20px; color: var(--accent);"><span>.</span><span>.</span><span>.</span></div>';

        // Force visible
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
        bubble.style.pointerEvents = 'auto'; // Enable clicking

        // 2. Wait 2s (Typing duration)
        setTimeout(() => {
            // Update Text
            bubble.innerHTML = 'Я уже квалифицировал 3-х лидов, пока вы читали этот заголовок. Хотите так же?';

            // Add Close Button (X)
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '×';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '5px';
            closeBtn.style.right = '8px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '16px';
            closeBtn.style.color = 'var(--text-muted)';

            // Close logic
            closeBtn.onclick = closeBubble;

            bubble.appendChild(closeBtn);

            // Click on bubble itself also closes it
            bubble.onclick = closeBubble;

            // Try play sound
            audio.volume = 0.2;
            audio.play().catch(() => { }); // Catch autoplay errors

        }, 2000); // Typing time

    }, 2500); // Initial Delay

    // Click Handler for Widget -> Scroll to Footer + Close Bubble
    widget.addEventListener('click', (e) => {
        // Only scroll if we didn't click the bubble (handled by stopPropagation, but double check)
        if (e.target.closest('.ai-bubble')) return;

        closeBubble();
        document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
    });
});

// --- CALCULATOR LOGIC (UPDATED PROFIT FORMULA) ---
document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const budgetInput = document.getElementById('input-budget');
    const clientsInput = document.getElementById('input-clients');

    // Labels
    const labelBudget = document.getElementById('label-budget');
    const labelClients = document.getElementById('label-clients');

    // Result
    const totalDisplay = document.getElementById('calc-total');

    if (!budgetInput || !clientsInput) return;

    function calculate() {
        // 1. Get Values
        const budget = parseInt(budgetInput.value);
        const clients = parseInt(clientsInput.value);

        // 2. Update Labels
        labelBudget.innerText = `$${budget.toLocaleString()}`;
        labelClients.innerText = `${clients}`; // No currency for humans

        // 3. Logic: Total Benefit = (Budget * 0.3) + (Clients * 2) + Bonus
        // - Traffic Savings (30%)
        // - Processing cost saved ($2/lead)
        // - Staff Bonus: >100 clients = $1000, <=100 clients = $500
        const trafficSavings = Math.round(budget * 0.30);
        const processingSavings = clients * 2;
        const staffBonus = clients > 100 ? 1000 : 500;

        const total = trafficSavings + processingSavings + staffBonus;

        // 4. Animate/Display (Counter Effect)
        const animateValue = (start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                // Ease Out Quad
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const ease = 1 - (1 - progress) * (1 - progress);

                const current = Math.floor(progress * (end - start) + start);
                totalDisplay.innerText = `+$${current.toLocaleString()}`;

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    totalDisplay.innerText = `+$${end.toLocaleString()}`;
                }
            };
            window.requestAnimationFrame(step);
        };

        // Get current number to start animation from
        const currentText = totalDisplay.innerText.replace(/[^\d]/g, '');
        const currentVal = currentText ? parseInt(currentText) : 0;

        // Only animate if value changed
        if (currentVal !== total) {
            animateValue(currentVal, total, 300);
        } else {
            // Fallback if no animation needed (initial load)
            totalDisplay.innerText = `+$${total.toLocaleString()}`;
        }

        // 5. Update Slider Fill (Gradient) logic

        // Budget
        const minB = parseInt(budgetInput.min);
        const maxB = parseInt(budgetInput.max);
        const percentB = ((budget - minB) / (maxB - minB)) * 100;
        budgetInput.style.setProperty('--value', `${percentB}%`);

        // Clients
        const minC = parseInt(clientsInput.min);
        const maxC = parseInt(clientsInput.max);
        const percentC = ((clients - minC) / (maxC - minC)) * 100;
        clientsInput.style.setProperty('--value', `${percentC}%`);
    }

    // Events
    budgetInput.addEventListener('input', calculate);
    clientsInput.addEventListener('input', calculate);

    // Init
    calculate();
});

// --- VIDEO AUTOPLAY ON SCROLL ---
document.addEventListener('DOMContentLoaded', () => {
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.removeAttribute('data-src'); // Clean up
                    observer.unobserve(iframe); // Only trigger once
                }
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    });

    // Observe all lazy videos
    document.querySelectorAll('iframe.lazy-video').forEach(iframe => {
        videoObserver.observe(iframe);
    });
});

