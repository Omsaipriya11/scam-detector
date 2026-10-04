const messageInput = document.getElementById("messageInput");
const charCount = document.getElementById("charCount");

const scanBtn = document.getElementById("scanBtn");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");

const resultSection = document.getElementById("resultSection");

const riskBadge = document.getElementById("riskBadge");
const riskScore = document.getElementById("riskScore");
const riskHeading = document.getElementById("riskHeading");
const riskDescription = document.getElementById("riskDescription");
const riskBar = document.getElementById("riskBar");

const warningCount = document.getElementById("warningCount");
const linkCount = document.getElementById("linkCount");
const urgencyStatus = document.getElementById("urgencyStatus");

const warningList = document.getElementById("warningList");
const recommendationText = document.getElementById("recommendationText");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

const toast = document.getElementById("toast");

const STORAGE_KEY = "scamshield_history";

let scanHistory = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || [];


const samples = {

    scam: `Congratulations! You have won ₹50,000 in our lucky draw! Claim your prize immediately. Click https://claim-prize.example.com and enter your OTP and bank details before the offer expires!`,

    bank: `URGENT: Your bank account will be blocked today due to KYC failure. Verify your account immediately by clicking https://verify-account.example.com and entering your OTP, password and card details.`,

    safe: `Hello, your appointment with the doctor is confirmed for tomorrow at 10:30 AM. Please arrive 10 minutes early. Thank you.`
};


const warningRules = [

    {
        name: "Urgency or pressure",
        description: "The message tries to make you act immediately.",
        patterns: [
            "urgent",
            "immediately",
            "act now",
            "right now",
            "hurry",
            "expires",
            "last chance",
            "today only",
            "within 24 hours",
            "quickly"
        ],
        points: 15
    },

    {
        name: "Prize or reward claim",
        description: "The message claims that you won money, a prize, or a reward.",
        patterns: [
            "you won",
            "won ₹",
            "won rs",
            "cash prize",
            "lucky draw",
            "lottery",
            "reward",
            "congratulations"
        ],
        points: 20
    },

    {
        name: "OTP or password request",
        description: "It asks for sensitive authentication information.",
        patterns: [
            "otp",
            "one time password",
            "password",
            "pin",
            "cvv",
            "verification code",
            "security code"
        ],
        points: 25
    },

    {
        name: "Banking or payment request",
        description: "The message requests financial or banking information.",
        patterns: [
            "bank account",
            "bank details",
            "card details",
            "credit card",
            "debit card",
            "account number",
            "upi",
            "payment",
            "send money",
            "transfer money"
        ],
        points: 20
    },

    {
        name: "Threat or account warning",
        description: "It uses threats such as account blocking or suspension.",
        patterns: [
            "account blocked",
            "account will be blocked",
            "account suspended",
            "legal action",
            "police",
            "fine",
            "penalty",
            "kyc failure",
            "service terminated"
        ],
        points: 15
    },

    {
        name: "Suspicious link",
        description: "The message contains a link that should be verified before opening.",
        patterns: [
            "http://",
            "https://",
            "www.",
            ".com/",
            ".xyz/",
            ".tk/"
        ],
        points: 10
    },

    {
        name: "Personal information request",
        description: "The message appears to request sensitive personal information.",
        patterns: [
            "personal details",
            "aadhar",
            "aadhaar",
            "pan card",
            "date of birth",
            "identity",
            "verify your details"
        ],
        points: 15
    },

    {
        name: "Free money or unrealistic offer",
        description: "The offer appears unusually attractive or unrealistic.",
        patterns: [
            "free money",
            "free gift",
            "guaranteed income",
            "double your money",
            "easy money",
            "100% profit",
            "cashback"
        ],
        points: 15
    }
];


messageInput.addEventListener("input", () => {

    const length = messageInput.value.length;

    charCount.textContent =
        `${length} character${length === 1 ? "" : "s"}`;
});


function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function analyzeMessage(message) {

    const text = message.toLowerCase();

    let score = 0;
    const warnings = [];

    warningRules.forEach(rule => {

        const matched = rule.patterns.some(pattern =>
            text.includes(pattern)
        );

        if (matched) {

            score += rule.points;

            warnings.push({
                name: rule.name,
                description: rule.description
            });
        }
    });


    const urlMatches =
        message.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi) || [];

    const links = urlMatches.length;


    const urgencyWords = [
        "urgent",
        "immediately",
        "act now",
        "right now",
        "hurry",
        "expires",
        "today",
        "last chance",
        "within 24 hours"
    ];

    const urgencyMatches = urgencyWords.filter(word =>
        text.includes(word)
    ).length;


    let urgency = "Low";

    if (urgencyMatches >= 3) {
        urgency = "High";
    } else if (urgencyMatches >= 1) {
        urgency = "Medium";
    }


    score = Math.min(score, 100);


    let level;
    let heading;
    let description;
    let recommendation;

    if (score >= 60) {

        level = "danger";
        heading = "High Risk";
        description =
            "Multiple warning signs suggest this message may be a scam.";

        recommendation =
            "Do not click links, send money, or share OTPs, passwords, PINs, or banking information. Verify the message through the organization's official website or phone number.";

    } else if (score >= 30) {

        level = "suspicious";
        heading = "Suspicious";
        description =
            "Some warning signs were detected. Verify the message before taking action.";

        recommendation =
            "Be careful before responding. Independently verify the sender and avoid sharing sensitive information until the message is confirmed.";

    } else {

        level = "safe";
        heading = "Low Risk";
        description =
            "Few or no common scam indicators were detected.";

        recommendation =
            "No major warning signs were detected, but always verify unexpected requests before sharing sensitive information.";
    }


    return {
        score,
        level,
        heading,
        description,
        recommendation,
        warnings,
        links,
        urgency
    };
}


function displayResult(result) {

    resultSection.classList.remove("hidden");

    riskScore.textContent = result.score;
    riskHeading.textContent = result.heading;
    riskDescription.textContent = result.description;

    warningCount.textContent = result.warnings.length;
    linkCount.textContent = result.links;
    urgencyStatus.textContent = result.urgency;

    riskBadge.textContent =
        result.level === "danger"
            ? "LIKELY SCAM"
            : result.level === "suspicious"
                ? "SUSPICIOUS"
                : "LOW RISK";

    riskBadge.className = "risk-badge";

    if (result.level === "danger") {
        riskBadge.classList.add("danger");
    }

    if (result.level === "suspicious") {
        riskBadge.classList.add("suspicious");
    }


    let barColor = "var(--success)";

    if (result.level === "suspicious") {
        barColor = "var(--warning)";
    }

    if (result.level === "danger") {
        barColor = "var(--danger)";
    }

    riskBar.style.width = `${result.score}%`;
    riskBar.style.background = barColor;


    const degrees = result.score * 3.6;

    document.querySelector(".score-circle").style.background =
        `conic-gradient(${barColor} ${degrees}deg, #e2e8f0 ${degrees}deg)`;


    if (result.warnings.length === 0) {

        warningList.innerHTML = `
            <div class="no-warning">
                ✓ No major warning indicators detected.
            </div>
        `;

    } else {

        warningList.innerHTML = result.warnings.map(warning => `
            <div class="warning-item">
                <div class="warning-dot"></div>
                <div>
                    <strong>${escapeHTML(warning.name)}</strong>
                    <p>${escapeHTML(warning.description)}</p>
                </div>
            </div>
        `).join("");
    }


    recommendationText.textContent =
        result.recommendation;


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function scanMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        showToast("Please enter a message to scan.");
        messageInput.focus();
        return;
    }

    const result = analyzeMessage(message);

    displayResult(result);

    addToHistory(message, result);

    showToast("Message analysis complete.");
}


function addToHistory(message, result) {

    const historyItem = {
        id: Date.now(),
        message: message,
        score: result.score,
        level: result.level,
        time: new Date().toLocaleString()
    };

    scanHistory.unshift(historyItem);

    scanHistory = scanHistory.slice(0, 10);

    saveHistory();
    renderHistory();
}


function saveHistory() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(scanHistory)
    );
}


function renderHistory() {

    if (scanHistory.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                No scans yet.
            </div>
        `;

        return;
    }


    historyList.innerHTML = scanHistory.map(item => {

        const label =
            item.level === "danger"
                ? "LIKELY SCAM"
                : item.level === "suspicious"
                    ? "SUSPICIOUS"
                    : "LOW RISK";

        return `
            <div class="history-item">

                <div class="history-message">
                    <strong>${escapeHTML(item.message)}</strong>
                    <small>
                        ${escapeHTML(item.time)}
                    </small>
                </div>

                <div class="history-risk ${item.level}">
                    ${label} · ${item.score}/100
                </div>

            </div>
        `;

    }).join("");
}


function clearScanner() {

    messageInput.value = "";
    charCount.textContent = "0 characters";

    resultSection.classList.add("hidden");

    messageInput.focus();

    showToast("Message cleared.");
}


function loadSample(type) {

    messageInput.value = samples[type];

    charCount.textContent =
        `${messageInput.value.length} characters`;

    messageInput.focus();

    showToast("Sample message loaded.");
}


function clearHistory() {

    if (scanHistory.length === 0) {
        showToast("History is already empty.");
        return;
    }

    const confirmed = confirm(
        "Clear all previous scan history?"
    );

    if (!confirmed) return;

    scanHistory = [];

    saveHistory();
    renderHistory();

    showToast("Scan history cleared.");
}


function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


scanBtn.addEventListener("click", scanMessage);

clearBtn.addEventListener("click", clearScanner);

sampleBtn.addEventListener("click", () => {
    loadSample("scam");
});

clearHistoryBtn.addEventListener("click", clearHistory);


document.querySelectorAll(".sample-card").forEach(card => {

    card.addEventListener("click", () => {

        const type = card.dataset.sample;

        loadSample(type);

        setTimeout(() => {
            scanMessage();
        }, 200);
    });
});


messageInput.addEventListener("keydown", event => {

    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        scanMessage();
    }
});


renderHistory();