// Tab Functionality
function openTab(index) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(el => el.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(el => el.classList.remove('active'));
    if (contents[index]) contents[index].classList.add('active');
    if (btns[index]) btns[index].classList.add('active');
}

// Stage Functionality (New Design)
function openStage(index) {
    const contents = document.querySelectorAll('.stage-content');
    contents.forEach(el => el.classList.remove('active'));
    const btns = document.querySelectorAll('.stage-btn');
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


// --- TELEGRAM UTILS ---
// Token removed for security. Using server-side proxy.

async function sendTelegramMessage(text) {
    try {
        const response = await fetch('/api/telegram.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            console.error('Telegram Server Error');
            return false;
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('TG Send Error:', error);
        return false;
    }
}

// --- QUIZ LOGIC ---
async function submitQuiz(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const niche = document.querySelector('input[name="niche"]:checked')?.value || 'Не выбрано';
    const budget = document.querySelector('input[name="budget"]:checked')?.value || 'Не выбрано';

    const statusDiv = document.getElementById('statusMessage');
    const btn = event.target.querySelector('button[type="submit"]');

    btn.textContent = 'Отправка...';
    btn.disabled = true;

    const text = `🔥 ЗАЯВКА (КВИЗ)\n\n👤 Имя: ${name}\n📱 Контакты: ${phone}\n\n📊 Ниша: ${niche}\n💰 Бюджет: ${budget}`;

    const success = await sendTelegramMessage(text);

    if (success) {
        statusDiv.innerHTML = '<span style="color: var(--accent)">Успешно! Мы свяжемся с вами.</span>';
        btn.style.display = 'none';

        // Optional: Redirect to success page
        // window.location.href = 'thank-you.html';
    } else {
        statusDiv.innerText = 'Ошибка отправки.';
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

    // Guard clause
    if (!bubble || !widget) return;

    // Low-volume pop sound base64 (very short beep)
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

    let inactivityTimer = null;
    let cleanupListeners = null;

    // Helper to close bubble
    const closeBubble = (e) => {
        if (e) e.stopPropagation(); // Prevent scroll if clicked on bubble
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px)';
        bubble.style.pointerEvents = 'none';

        if (cleanupListeners) cleanupListeners();
        if (inactivityTimer) clearTimeout(inactivityTimer);
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

            // --- AUTO CLOSE LOGIC ---
            // Always close after 3 seconds
            inactivityTimer = setTimeout(() => {
                closeBubble();
            }, 3000);

        }, 2000); // Typing time

    }, 2500); // Initial Delay

    // Click Handler for Widget -> Scroll to Footer + Close Bubble
    widget.addEventListener('click', (e) => {
        // Only scroll if we didn't click the bubble (handled by stopPropagation, but double check)
        if (e.target.closest('.ai-bubble')) return;

        closeBubble();
        const leadForm = document.getElementById('lead-form');
        if (leadForm) {
            leadForm.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback if lead form is missing (e.g. inner pages), maybe go to index?
            window.location.href = 'index.html#lead-form';
        }

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

// --- CUSTOMER JOURNEY LINES DRAWING ---
function drawJourneyLines() {
    const svg = document.querySelector('.journey-lines');
    const cards = document.querySelectorAll('.journey-card');

    if (!svg || cards.length === 0 || window.innerWidth < 960) {
        if (svg) svg.innerHTML = ''; // Clear lines on mobile
        return;
    }

    // Clear previous lines
    svg.innerHTML = '';

    // Draw lines between cards: 0->1, 1->2, 2->3, etc.
    // Or zig-zag: 0->1->2 (row 1), 3->4->5 (row 2), and connect 2->3 (down)

    // Grid is 3 cols. 
    // Row 1: 0, 1, 2
    // Row 2: 3, 4, 5

    // Connections:
    // 0 -> 1
    // 1 -> 2
    // 2 -> 5 (Down curve at end? Or 2 -> 3 diagonal? Let's do 2 -> 5 (straight down) then 5 -> 4 -> 3 ? No, flow is 1,2,3...6)
    // Flow: 0 -> 1 -> 2 -> (down-left?) -> 3 -> 4 -> 5 ?
    // Or Logical flow: 0(Traffic) -> 1(Speed) -> 2(Filter) -> 3(Warmup) -> 4(Handshake) -> 5(Order)
    // Standard Z pattern: 0->1->2, then 2->(diagonal)->3, then 3->4->5
    // Or Snake pattern: 0->1->2, then 2->5 (down), then 5->4 (left), then 4->3 (left) ??
    // The numbers are 01, 02, 03... 
    // 0(01), 1(02), 2(03)
    // 3(04), 4(05), 5(06)

    // Let's do simple connections: 
    // 0 -> 1
    // 1 -> 2
    // 2 -> 5 (Vertical connection? No, 2 is top right, 5 is bottom right)
    //  Let's check indices:
    //  0  1  2
    //  3  4  5

    // We want path: 0->1->2->3->4->5 ?
    //  0 -> 1 (Right)
    //  1 -> 2 (Right)
    //  2 -> 5 (Down) ?? No, 3 is usually next step.
    //  Snake:
    //  0 -> 1 -> 2
    //            |
    //  5 <- 4 <- 3   <-- Snake pattern.
    //  Let's try: 0->1, 1->2, 2->3(diagonal), 3->4, 4->5
    //  Or Snake: 0->1->2, 2->5(down), 5->4(left), 4->3(left)? No, order is 1..6.

    //  Let's stick to simple "Next Step" logic.
    //  0->1, 1->2 
    //  2->3 (Diagonal long line)
    //  3->4, 4->5

    const connections = [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 }, // Diagonal
        { from: 3, to: 4 },
        { from: 4, to: 5 }
    ];

    connections.forEach(conn => {
        const rect1 = cards[conn.from].getBoundingClientRect();
        const rect2 = cards[conn.to].getBoundingClientRect();
        const containerRect = svg.getBoundingClientRect();

        // Calculate centers relative to SVG container
        const x1 = rect1.left + rect1.width / 2 - containerRect.left;
        const y1 = rect1.top + rect1.height / 2 - containerRect.top;
        const x2 = rect2.left + rect2.width / 2 - containerRect.left;
        const y2 = rect2.top + rect2.height / 2 - containerRect.top;

        // Create Path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Curved line? Bezier?
        // Simple Line: M x1 y1 L x2 y2
        // Let's add slight curve for diagonal (2->3)

        let d = `M ${x1} ${y1} L ${x2} ${y2}`;

        // If row change (2->3), maybe a generic curve?
        // Let's keep it straight dotted glowing line for now.

        path.setAttribute("d", d);
        path.setAttribute("stroke", "rgba(250, 193, 77, 0.2)"); // Base color
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.classList.add('j-line-path'); // Adds animation

        // Dashed?
        // path.setAttribute("stroke-dasharray", "5,5");

        svg.appendChild(path);
    });
}

// Redraw on resize
window.addEventListener('resize', () => {
    // Debounce?
    drawJourneyLines();
});

// Init after load (wait for layout)
window.addEventListener('load', () => {
    setTimeout(drawJourneyLines, 500); // Small delay to ensure AOS or layout settled
});

// --- AI CHAT DEMO LOGIC ---
// --- AI CHAT LOGIC (Real Backend + Streaming) ---
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    if (!chatForm) return;

    let chatHistory = []; // Stores {role, content}

    // 1. Load History from LocalStorage
    const savedHistory = localStorage.getItem('loops_chat_history');
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
            // Clear default welcome message if history exists, or append history
            messagesContainer.innerHTML = '';
            chatHistory.forEach(msg => addMessageToUI(msg.content, msg.role === 'user', false));
        } catch (e) { console.error('History Error', e); }
    } else {
        // Initial Message if no history
        chatHistory.push({ role: 'assistant', content: 'Привет! 👋 Я ИИ-консультант Loops. Готов ответить на ваши вопросы о нашей системе.' });
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format Markdown (Bold, List) with XSS protection
    function formatMessage(text) {
        let html = escapeHtml(text)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n/g, '<br>'); // Newlines
        return html;
    }

    function addMessageToUI(text, isUser = false, animate = true) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(isUser ? 'user-msg' : 'ai-msg');
        if (animate) msgDiv.style.animation = 'fadeInUp 0.3s ease';

        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble');
        bubble.innerHTML = formatMessage(text); // Apply formatting

        const time = document.createElement('div');
        time.classList.add('msg-time');
        const now = new Date();
        time.innerText = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        msgDiv.appendChild(bubble);
        msgDiv.appendChild(time);
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();

        return bubble; // Return for streaming updates
    }

    // Save state
    function saveHistory() {
        localStorage.setItem('loops_chat_history', JSON.stringify(chatHistory));
    }

    // Check for Lead (Phone Number)
    function checkForLead(text) {
        // Regex for phone: +998... or 9 digits, simplified visual check
        const phoneRegex = /(\+?\d{9,15})|(998\d{9})|(\d{2}\s\d{3}\s\d{2}\s\d{2})/;
        if (phoneRegex.test(text)) {
            sendTelegramMessage(`🔥 ЗАЯВКА (ИИ-ЧАТ)\n📱 Сообщение: "${text}"`);
        }
    }

    window.handleChatSubmit = async function (e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Update UI & History
        addMessageToUI(text, true);
        chatHistory.push({ role: 'user', content: text });
        saveHistory();
        checkForLead(text);

        chatInput.value = '';
        typingIndicator.style.display = 'flex';
        scrollToBottom();

        try {
            // 2. Call Backend API
            const response = await fetch('/api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory })
            });

            if (!response.ok) throw new Error('Network error');

            // 3. Handle Streaming
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            typingIndicator.style.display = 'none';

            // Create empty AI bubble
            let aiText = '';
            const aiBubble = addMessageToUI('', false);

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode chunk and append to buffer
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process buffer looking for double newlines
                let boundary = buffer.indexOf('\n\n');

                while (boundary !== -1) {
                    const eventData = buffer.slice(0, boundary).trim();
                    // Remove processed part from buffer, +2 for \n\n
                    buffer = buffer.slice(boundary + 2);

                    if (eventData.startsWith('data: ')) {
                        const jsonStr = eventData.slice(6);
                        if (jsonStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(jsonStr);
                            const content = data.choices?.[0]?.delta?.content || '';
                            if (content) {
                                aiText += content;
                                aiBubble.innerHTML = formatMessage(aiText);
                                scrollToBottom();
                            }
                        } catch (e) {
                            console.warn('Dropped Frame:', jsonStr);
                        }
                    }

                    // Look for next boundary
                    boundary = buffer.indexOf('\n\n');
                }
            }

            // 4. Update History with full AI response
            chatHistory.push({ role: 'assistant', content: aiText });
            saveHistory();

        } catch (error) {
            console.error(error);
            typingIndicator.style.display = 'none';
            addMessageToUI('Извините, произошла ошибка. Попробуйте позже.', false);
        }
    };
});


// --- ARTICLE DISCOVERY (READ MORE) ---
// --- ARTICLE DISCOVERY (READ MORE) ---
window.initReadMore = function (currentId) {
    const grid = document.getElementById('readMoreGrid');
    if (!grid || !window.articlesData) return;

    // Filter out current article and take last 3
    const others = window.articlesData
        .filter(item => item.id !== currentId)
        .slice(-3);

    const getImagePath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Absolute logic: path already starts with / or is http
        return path;
    };

    grid.innerHTML = others.map(item => `
        <a href="${item.url}" class="case-archive-card" style="display: block;">
            <div class="archive-img">
                <img src="${getImagePath(item.image)}" alt="${item.title}" loading="lazy">
            </div>
            <div class="archive-content">
                <h3 class="archive-title">${item.title}</h3>
                <p class="archive-desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.desc}</p>
            </div>
        </a>
    `).join('');
};
