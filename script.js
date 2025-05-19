// script.js (Modified to use backend API)

const API_BASE_URL = 'https://login-server-213051243033.asia-south2.run.app'; // Replace with your deployed backend URL in production

// Function to scroll to the top and open signup modal
function scrollToSectionAndOpenSignupModal() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    setTimeout(function() {
        openSignupModal();
    }, 500); // Adjust timeout if needed
}

// Function to extract URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Adjust this function to navigate to the correct page based on the response.
function handleLoginSuccess(userData) {
    if (userData.userType) {
        if (userData.userType === 'For People Without Motor Abilities') {
            window.location.href = `para-page.html?email=${encodeURIComponent(userData.email)}`;
        } else {
            window.location.href = `normal-page.html?email=${encodeURIComponent(userData.email)}`;
        }
    } else {
        showAlertModal("User type is not defined. Please contact support.");
    }
}

function login() {
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    // Email validation: must be all lowercase (can also be handled by backend, but good for UX)
    if (email !== email.toLowerCase()) {
        showAlertModal("Email must be in all lowercase letters.");
        return;
    }

    fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Login failed'); });
        }
        return response.json();
    })
    .then(userData => {
        handleLoginSuccess(userData);
    })
    .catch(error => {
        showAlertModal(error.message || 'Invalid Credentials');
    });
}

let signupMode = false;

async function signup() {
    if (!signupMode) {
        showSignupFields();
        return;
    }

    var name = document.getElementById('signup-name').value;
    var email = document.getElementById('signup-email').value;
    var mentalDisorder = document.getElementById('signup-mental-disorder').value;
    var language = document.getElementById('signup-language').value;
    var userType = document.getElementById('signup-user-type').value;
    var password = document.getElementById('signup-password').value;
    var confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsCheckbox = document.getElementById('terms-checkbox');

    // Email validation: must be all lowercase
    if (email !== email.toLowerCase()) {
        showAlertModal("Email must be in all lowercase letters.");
        return;
    }

    if (name.length < 3){
        showAlertModal("Please input a proper name");
        return;
    }

    if (!termsCheckbox.checked) {
        showAlertModal("Please agree to the terms of use");
        return;
    }

    if (password !== confirmPassword) {
        showAlertModal("Passwords do not match");
        return;
    }
    if (password.length < 8) {
        showAlertModal("Password must be at least 8 characters long");
        return;
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        showAlertModal("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character");
        return;
    }

    fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, userType, mentalDisorder, language, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Signup failed'); });
        }
        return response.json();
    })
    .then(data => {
        showAlertModal(data.message || "Signed up successfully! Please check your email to verify your account.");
        signupMode = false;
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signupLink').style.display = 'inline';
        document.getElementById('loginLink').style.display = 'none';
        // Optionally reset form fields here
        closeModal(); // Close modal on successful signup
    })
    .catch(error => {
        showAlertModal(error.message || 'Signup failed');
    });
}

function openModal() {
    const modal = document.getElementById('authModal');
    const modalContent = modal.querySelector('.modal-content');
    modal.style.display = 'flex';
    modalContent.style.transform = 'translateY(-20px)';
    modalContent.offsetHeight; // Force reflow
    modalContent.style.transform = 'translateY(0)';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.body.classList.add("modal-open"); // Prevent body scroll
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('signupLink').style.display = 'inline';
    document.getElementById('loginLink').style.display = 'none';

    signupMode = false;
    document.getElementById('password-rules').style.display = 'none';
    document.getElementById('password-match').style.display = 'none';

    const lowercaseRule = document.getElementById('lowercase-rule');
    const uppercaseRule = document.getElementById('uppercase-rule');
    const numberRule = document.getElementById('number-rule');
    const specialCharRule = document.getElementById('special-char-rule');
    const lengthRule = document.getElementById('length-rule');

    if (lowercaseRule) lowercaseRule.classList.remove('hidden'); // Ensure it's visible by default if not hidden
    if (uppercaseRule) uppercaseRule.classList.remove('hidden');
    if (numberRule) numberRule.classList.remove('hidden');
    if (specialCharRule) specialCharRule.classList.remove('hidden');
    if (lengthRule) lengthRule.classList.remove('hidden');


    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-language').value = 'English';
    document.getElementById('signup-mental-disorder').value = 'No Mental Disorder';
    document.getElementById('signup-user-type').value = 'For People Without Motor Abilities';
    document.getElementById('terms-checkbox').checked = false;
    if (document.getElementById('signupButton')) {
        document.getElementById('signupButton').disabled = true;
         document.getElementById('signupButton').style.opacity = "0.5";
        document.getElementById('signupButton').style.cursor = "not-allowed";
    }


    if (document.getElementById('device-warning')) {
        document.getElementById('device-warning').style.display = 'none';
    }
    document.body.classList.remove("modal-open"); // Re-enable body scroll
}

function showSignupFields() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('signupLink').style.display = 'none';
    document.getElementById('loginLink').style.display = 'inline';
    document.getElementById('signup-password').type = 'text'; // Show password as text initially
    document.getElementById('signup-confirm-password').type = 'password';

    signupMode = true;

    document.getElementById('password-rules').style.display = 'block';
    document.getElementById('lowercase-rule').style.display = 'block'; // Show rule
    document.getElementById('uppercase-rule').style.display = 'block'; // Show rule
    document.getElementById('number-rule').style.display = 'block';     // Show rule
    document.getElementById('special-char-rule').style.display = 'block';// Show rule
    document.getElementById('length-rule').style.display = 'block';     // Show rule
    document.getElementById('password-match').style.display = 'none'; // Hide match initially
    validateDeviceType();
    validateTerms();
}

function openSignupModal() {
    openModal();
    showSignupFields();
}

function showLoginFields() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('signupLink').style.display = 'inline';
    document.getElementById('loginLink').style.display = 'none';
    signupMode = false;
}

function handleFeatureClick(featureName) {
    alert(`You clicked on the ${featureName} feature.`);
}

function validatePasswordRules() {
    const password = document.getElementById('signup-password').value;
    const rules = {
        lowercase: { elem: document.getElementById('lowercase-rule'), test: /[a-z]/ },
        uppercase: { elem: document.getElementById('uppercase-rule'), test: /[A-Z]/ },
        number: { elem: document.getElementById('number-rule'), test: /[0-9]/ },
        special: { elem: document.getElementById('special-char-rule'), test: /[^a-zA-Z0-9]/ },
        length: { elem: document.getElementById('length-rule'), test: (p) => p.length >= 8 }
    };

    Object.entries(rules).forEach(([key, { elem, test }]) => {
        if (!elem) return; // Guard against null elements
        if (test instanceof RegExp ? test.test(password) : test(password)) {
            if (!elem.classList.contains('hidden')) {
                elem.classList.add('hidden');
            }
        } else {
            if (elem.classList.contains('hidden')) {
                elem.classList.remove('hidden');
            }
        }
    });
    validateTerms();
}

function validateConfirmPassword() {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const passwordMatchDiv = document.getElementById('password-match');

    if (!passwordMatchDiv) return; // Guard clause

    passwordMatchDiv.style.display = 'block'; // Show the warning div

    if (password === confirmPassword && password !== '') {
        if (!passwordMatchDiv.classList.contains('hidden')) {
            passwordMatchDiv.classList.add('hidden');
        }
    } else {
        if (passwordMatchDiv.classList.contains('hidden')) {
            passwordMatchDiv.classList.remove('hidden');
        }
    }
    validateTerms();
}

function showAlertModal(message) {
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    if (alertModal && alertMessage) {
        alertMessage.textContent = message;
        alertModal.style.display = 'flex';
    }
}

function closeAlertModal() {
    const alertModal = document.getElementById('alertModal');
    if (alertModal) {
        alertModal.style.display = 'none';
    }
}

// Intersection Observer for animating feature cards and stat cards
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('feature-card')) {
                entry.target.classList.add('animate');
            } else if (entry.target.classList.contains('stat-card') && !entry.target.classList.contains('animate')) {
                entry.target.classList.add('animate');
                const numberElement = entry.target.querySelector('.stat-number');
                const targetNumber = parseInt(entry.target.dataset.stat);
                if (numberElement) {
                    animateNumber(numberElement, targetNumber);
                }
            }
            // observer.unobserve(entry.target); // Optional: unobserve after animation
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
});

function animateNumber(element, target) {
    let current = 0;
    const duration = 1000; // 1 second
    const stepTime = Math.abs(Math.floor(duration / target)); // time per step
    
    function update() {
        current += 1; // Increment by 1
        element.textContent = Math.round(current);
        if (current < target) {
            setTimeout(update, stepTime > 0 ? stepTime : 16); // Ensure stepTime is at least 1ms
        } else {
            element.textContent = target; // Ensure final value is exact
        }
    }
    if (target > 0) { // Only start if target is greater than 0
       update();
    } else {
       element.textContent = target; // Set to 0 if target is 0
    }
}

function openTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.style.display = 'flex';
        document.body.classList.add("modal-open"); // Prevent body scroll
    }
}

function closeTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.style.display = 'none';
        // Check if another modal (like authModal) is still open before removing class
        if (document.getElementById('authModal').style.display !== 'flex') {
            document.body.classList.remove("modal-open");
        }
    }
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function validateDeviceType() {
    const userTypeSelect = document.getElementById('signup-user-type');
    if (!userTypeSelect) return; // Guard clause

    const userType = userTypeSelect.value;
    const deviceWarning = document.getElementById('device-warning');
    if (!deviceWarning) return; // Guard clause

    const isMobile = isMobileDevice();
    const isSmallDesktop = window.innerWidth < 600;

    if (userType === 'For People Without Motor Abilities' && (isMobile || isSmallDesktop)) {
        deviceWarning.style.display = 'block';
        deviceWarning.textContent = "⚠️ This device is not supported for your selected user type. Please use a desktop or a laptop.";
    } else {
        deviceWarning.style.display = 'none';
    }
    validateTerms();
}

document.addEventListener('DOMContentLoaded', function () {
    const userTypeSelect = document.getElementById('signup-user-type');
    if (userTypeSelect) {
        // Using 'change' event is more standard for select elements
        userTypeSelect.addEventListener('change', validateDeviceType);
    }

    const termsCheckbox = document.getElementById('terms-checkbox');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', validateTerms);
    }

    const signupPassword = document.getElementById('signup-password');
    if (signupPassword) {
        signupPassword.addEventListener('input', validatePasswordRules);
    }

    const signupConfirmPassword = document.getElementById('signup-confirm-password');
    if (signupConfirmPassword) {
        signupConfirmPassword.addEventListener('input', validateConfirmPassword);
    }


    // Initial validation checks on page load for signup form if it's visible by default (though it's not here)
    // Or, more appropriately, when the signup form is shown.
    // This is handled by showSignupFields calling validateDeviceType and validateTerms.

    // Check for unsupported device message on page load
    const unsupported = getParameterByName('unsupported');
    const fromParaPage = getParameterByName('fromParaPage');
    const isRedirected = sessionStorage.getItem('unsupportedRedirect');

    if (unsupported === 'true' && fromParaPage === 'true' && isRedirected === 'true') {
        showAlertModal("This user type is not supported on mobile devices or tablets. Please use a desktop computer.");
        sessionStorage.removeItem('unsupportedRedirect');
    }

    // Ensure modal scroll behavior is handled
    const authModal = document.getElementById('authModal');
    if (authModal && window.getComputedStyle(authModal).display === 'flex') {
        document.body.classList.add("modal-open");
    }
    const termsModal = document.getElementById('termsModal');
     if (termsModal && window.getComputedStyle(termsModal).display === 'flex') {
        document.body.classList.add("modal-open");
    }
});


function validateTerms() {
    const termsCheckbox = document.getElementById('terms-checkbox');
    const signupButton = document.getElementById('signupButton');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');

    if (!termsCheckbox || !signupButton || !passwordInput || !confirmPasswordInput) return; // Guard clause

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const rules = {
        lowercase: /[a-z]/,
        uppercase: /[A-Z]/,
        number: /[0-9]/,
        special: /[^a-zA-Z0-9]/,
        length: (p) => p.length >= 8
    };
    let isPasswordValid = true;
    Object.values(rules).forEach(test => {
        if (typeof test === 'function') {
            if (!test(password)) isPasswordValid = false;
        } else {
            if (!test.test(password)) isPasswordValid = false;
        }
    });

    if (password !== confirmPassword) {
        isPasswordValid = false;
    }

    const deviceWarning = document.getElementById('device-warning');
    const isDeviceWarningVisible = deviceWarning && deviceWarning.style.display === 'block';

    if (isDeviceWarningVisible) {
        signupButton.disabled = true;
        signupButton.style.opacity = "0.5";
        signupButton.style.cursor = "not-allowed";
        return;
    }

    if (termsCheckbox.checked && password !== '' && confirmPassword !== '' && isPasswordValid) {
        signupButton.disabled = false;
        signupButton.style.opacity = "1";
        signupButton.style.cursor = "pointer";
    } else {
        signupButton.disabled = true;
        signupButton.style.opacity = "0.5";
        signupButton.style.cursor = "not-allowed";
    }
}

function showResetPasswordFields() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'block';
    document.getElementById('signupLink').style.display = 'none'; // Hide signup link
    document.getElementById('loginLink').style.display = 'none';  // Hide login link (already hidden)
}

function resetPassword() {
    var email = document.getElementById('reset-email').value;

    fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Reset password failed'); });
        }
        return response.json();
    })
    .then(() => {
        showAlertModal('Password reset email sent! Check your inbox.');
    })
    .catch(error => {
        showAlertModal(error.message || 'Failed to send password reset email.');
    });
}

// Ensure that when a modal is opened, body scrolling is disabled.
// And when all modals are closed, body scrolling is re-enabled.
// The openModal, closeModal, openTermsModal, closeTermsModal functions now handle this.