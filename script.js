// ============================================
// Mobile Menu Toggle
// ============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// Scroll to Rates Section
// ============================================
function scrollToRates() {
    const ratesSection = document.getElementById('rates');
    ratesSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Exchange Rates Data
// ============================================
const exchangeRates = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, CAD: 1.36, AUD: 1.52, CHF: 0.88, INR: 83.12 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50, CAD: 1.48, AUD: 1.65, CHF: 0.96, INR: 90.35 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.00, CAD: 1.72, AUD: 1.92, CHF: 1.12, INR: 105.00 },
    JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, CAD: 0.0091, AUD: 0.0102, CHF: 0.0059, INR: 0.556 },
    CAD: { USD: 0.735, EUR: 0.676, GBP: 0.581, JPY: 109.93, AUD: 1.12, CHF: 0.647, INR: 61.07 },
    AUD: { USD: 0.658, EUR: 0.606, GBP: 0.521, JPY: 98.36, CAD: 0.893, CHF: 0.578, INR: 54.56 },
    CHF: { USD: 1.136, EUR: 1.042, GBP: 0.893, JPY: 170.00, CAD: 1.544, AUD: 1.731, INR: 93.75 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.798, CAD: 0.0164, AUD: 0.0183, CHF: 0.0107 }
};

// ============================================
// Load Rates
// ============================================
function loadRates() {
    const baseCurrency = document.getElementById('baseSelect').value;
    const searchTerm = document.getElementById('searchCurrency').value.toUpperCase();
    const ratesTable = document.getElementById('ratesTable');
    
    ratesTable.innerHTML = '';
    
    const rates = exchangeRates[baseCurrency];
    
    for (const [currency, rate] of Object.entries(rates)) {
        if (searchTerm === '' || currency.includes(searchTerm)) {
            const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
            const changePercent = change.toFixed(2);
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '▲' : '▼';
            
            const card = document.createElement('div');
            card.className = 'rate-card';
            card.innerHTML = `
                <h3>${baseCurrency}/${currency}</h3>
                <div class="rate-value">${rate.toFixed(4)}</div>
                <div class="rate-change ${changeClass}">
                    ${changeSymbol} ${Math.abs(changePercent)}%
                </div>
            `;
            ratesTable.appendChild(card);
        }
    }
}

// ============================================
// Event Listeners for Rates
// ============================================
document.getElementById('baseSelect').addEventListener('change', loadRates);
document.getElementById('searchCurrency').addEventListener('input', loadRates);

// Load rates on page load
window.addEventListener('load', loadRates);

// ============================================
// Currency Converter Calculator
// ============================================
function calculateConversion() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultElement = document.getElementById('calcResult');
    const resultCurrency = document.getElementById('resultCurrency');
    
    if (amount === 0) {
        resultElement.textContent = '0.00';
        resultCurrency.textContent = toCurrency;
        return;
    }
    
    let rate = 1;
    
    if (fromCurrency === toCurrency) {
        rate = 1;
    } else if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
        rate = exchangeRates[fromCurrency][toCurrency];
    } else {
        resultElement.textContent = 'Error';
        return;
    }
    
    const result = (amount * rate).toFixed(2);
    resultElement.textContent = result;
    resultCurrency.textContent = toCurrency;
}

// Event listeners for calculator
document.getElementById('amount').addEventListener('input', calculateConversion);
document.getElementById('fromCurrency').addEventListener('change', calculateConversion);
document.getElementById('toCurrency').addEventListener('change', calculateConversion);

// Initialize calculator on page load
window.addEventListener('load', () => {
    calculateConversion();
});

// Swap currencies
document.querySelector('.calc-swap').addEventListener('click', () => {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    calculateConversion();
});

// ============================================
// Contact Form Handler
// ============================================
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        submitButton.textContent = 'Message Sent!';
        submitButton.style.background = '#00d084';
        
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
            form.reset();
        }, 2000);
    }, 1500);
}

// ============================================
// Smooth Scrolling for Navigation Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Update Rates Periodically
// ============================================
setInterval(() => {
    loadRates();
}, 5000); // Update every 5 seconds

// ============================================
// Intersection Observer for Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});
