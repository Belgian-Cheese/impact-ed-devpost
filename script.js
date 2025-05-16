//ADD YOUR OWN PROJECT KEYS!!
var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};



// script.js (Modified with Email Verification)
function scrollToSectionAndOpenSignupModal() {
    // Scroll to the top of the page
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Wait for the scrolling to complete (adjust timeout if needed)
    setTimeout(function() {
        // Open the signup modal
        openSignupModal();
    }); // Adjust the timeout (in milliseconds)
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to extract URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function login() {
    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    // Email validation: must be all lowercase
    if (email !== email.toLowerCase()) {
        showAlertModal("Email must be in all lowercase letters.");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;

            if (!user.emailVerified) {
                showAlertModal("Please verify your email before logging in.");
                firebase.auth().signOut(); // Sign out the user to prevent usage.
                return;
            }

            db.collection('users').doc(email).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    // Check if userType exists before redirecting
                    if (userData.userType) {
                        if (userData.userType === 'For People Without Motor Abilities') {
                            window.location.href = 'para-page.html';
                        } else {
                            window.location.href = 'normal-page.html';
                        }
                    } else {
                        // Handle the case where userType is missing
                        showAlertModal("User type is not defined. Please contact support.");
                    }

                }
                else {
                    showAlertModal("User data not found");
                }
            }).catch((error) => {
                showAlertModal("Error retrieving user data");
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            showAlertModal("Invalid Credentials");
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

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Send email verification
        await user.sendEmailVerification();

        await db.collection('users').doc(email).set({
            name: name,
            language: language,
            email: email,
            userType: userType,
            mentalDisorder: mentalDisorder,
            progress: {}
        });
        showAlertModal("Signed up successfully! Please check your email to verify your account.");
        signupMode = false;
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signupLink').style.display = 'inline';
        document.getElementById('loginLink').style.display = 'none';

    } catch (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        showAlertModal(errorMessage);
    }
}

function openModal() {
    const modal = document.getElementById('authModal');
    const modalContent = modal.querySelector('.modal-content');
    modal.style.display = 'flex';
    // Add initial transform
    modalContent.style.transform = 'translateY(-20px)';
    // Force reflow
    modalContent.offsetHeight;
    // Animate to final position
    modalContent.style.transform = 'translateY(0)';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function closeModal() {
    document.getElementById('authModal').style.display = 'none';
    // Reset all
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

    lowercaseRule.style.display = 'block';
    uppercaseRule.style.display = 'block';
    numberRule.style.display = 'block';
    specialCharRule.style.display = 'block';
    lengthRule.style.display = 'block';

    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-language').value = 'English';
    document.getElementById('signup-mental-disorder').value = 'No Mental Disorder';
    document.getElementById('signup-user-type').value = 'For People Without Motor Abilities';
    document.getElementById('terms-checkbox').checked = false;
    document.getElementById('signupButton').disabled = true;

    // Reset device warning
    document.getElementById('device-warning').style.display = 'none';
}

function showSignupFields() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('signupLink').style.display = 'none';
    document.getElementById('loginLink').style.display = 'inline';
    document.getElementById('signup-password').type = 'text';
    document.getElementById('signup-confirm-password').type = 'password';

    signupMode = true;

    // Initial Display
    document.getElementById('password-rules').style.display = 'block';
    document.getElementById('lowercase-rule').style.display = 'block';
    document.getElementById('uppercase-rule').style.display = 'block';
    document.getElementById('number-rule').style.display = 'block';
    document.getElementById('special-char-rule').style.display = 'block';
    document.getElementById('length-rule').style.display = 'block';
    document.getElementById('password-match').style.display = 'none';
    validateDeviceType(); //validate when opening for the first time
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
    const passwordMatch = document.getElementById('password-match');

    // Show the warning div
    document.getElementById('password-match').style.display = 'block';

    if (password === confirmPassword && password !== '') {
        passwordMatch.classList.add('hidden');
    } else {
        passwordMatch.classList.remove('hidden');
    }
    validateTerms();
}

function showAlertModal(message) {
    document.getElementById('alertModal').style.display = 'flex';
    document.getElementById('alertMessage').textContent = message;
}

function closeAlertModal() {
    document.getElementById('alertModal').style.display = 'none';
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

                // Start counting animation
                const numberElement = entry.target.querySelector('.stat-number');
                const targetNumber = parseInt(entry.target.dataset.stat);
                animateNumber(numberElement, targetNumber);
            }
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// Observe stat cards
document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
});

// Number animation function
function animateNumber(element, target) {
    let current = 0;
    const duration = 1000; // 2 seconds
    const step = target / (duration / 16); // approximately 60 FPS

    function update() {
        current = Math.min(current + step, target);
        element.textContent = Math.round(current);

        if (current < target) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function openTermsModal() {
    document.getElementById('termsModal').style.display = 'flex';
}

function closeTermsModal() {
    document.getElementById('termsModal').style.display = 'none';
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function validateDeviceType() {
    const userType = document.getElementById('signup-user-type').value;
    const signupButton = document.getElementById('signupButton');
    const deviceWarning = document.getElementById('device-warning');
    const isMobile = isMobileDevice();
    const isSmallDesktop = window.innerWidth < 600; // Check screen width for small desktops

    if (userType === 'For People Without Motor Abilities' && (isMobile || isSmallDesktop)) {
        deviceWarning.style.display = 'block';
        deviceWarning.textContent = "⚠️ This device is not supported for your selected user type. Please use a desktop or a laptop.";
    } else {
        deviceWarning.style.display = 'none';
    }
    validateTerms();
}

// Run validation every time an option is clicked, even if it's the same option
document.addEventListener('DOMContentLoaded', function () {
    const userTypeSelect = document.getElementById('signup-user-type');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('mousedown', () => setTimeout(validateDeviceType, 0));
    }
});


function validateTerms() {
    const termsCheckbox = document.getElementById('terms-checkbox');
    const signupButton = document.getElementById('signupButton');
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const rules = {
        lowercase: { elem: document.getElementById('lowercase-rule'), test: /[a-z]/ },
        uppercase: { elem: document.getElementById('uppercase-rule'), test: /[A-Z]/ },
        number: { elem: document.getElementById('number-rule'), test: /[0-9]/ },
        special: { elem: document.getElementById('special-char-rule'), test: /[^a-zA-Z0-9]/ },
        length: { elem: document.getElementById('length-rule'), test: (p) => p.length >= 8 }
    };
    let isPasswordValid = true;
    Object.entries(rules).forEach(([key, { elem, test }]) => {
        if (test instanceof RegExp ? test.test(password) : test(password)) {
            // Valid
        } else {
            isPasswordValid = false;
        }
    });

    if (password !== confirmPassword) {
        isPasswordValid = false;
    }
    const deviceWarning = document.getElementById('device-warning');
    const isDeviceWarningVisible = deviceWarning.style.display === 'block';

    if (isDeviceWarningVisible) {
        signupButton.disabled = true;
        signupButton.style.opacity = "0.5"; // Fade out button
        signupButton.style.cursor = "not-allowed"; // Change cursor to indicate disabled state
        return;
    }

    if (termsCheckbox.checked && password !== '' && confirmPassword !== '' && isPasswordValid) {
        signupButton.disabled = false;
        signupButton.style.opacity = "1"; // Restore button opacity
        signupButton.style.cursor = "pointer"; // Restore cursor style
    } else {
        signupButton.disabled = true;
        signupButton.style.opacity = "0.5"; // Fade out button
        signupButton.style.cursor = "not-allowed"; // Change cursor to indicate disabled state
    }

}
function showResetPasswordFields() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'block';
    document.getElementById('signupLink').style.display = 'none';
    document.getElementById('loginLink').style.display = 'none';
}

function resetPassword() {
    var email = document.getElementById('reset-email').value;

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            // Password reset email sent!
            // Show a confirmation message to the user
            showAlertModal('Password reset email sent! Check your inbox.'); // Use your existing alert modal function.
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            showAlertModal(errorMessage); // Use your existing alert modal function
        });
}


document.addEventListener('DOMContentLoaded', function () {
    // Function to extract URL parameters
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Check for the 'unsupported' and 'fromParaPage' parameters in the URL
    const unsupported = getParameterByName('unsupported');
    const fromParaPage = getParameterByName('fromParaPage');
    const isRedirected = sessionStorage.getItem('unsupportedRedirect');

    if (unsupported === 'true' && fromParaPage === 'true' && isRedirected === 'true') {
        showAlertModal("This user type is not supported on mobile devices or tablets. Please use a desktop computer.");
        sessionStorage.removeItem('unsupportedRedirect'); // Clear flag immediately
    }
    validateDeviceType(); // Initial validation on page load
});


document.addEventListener("DOMContentLoaded", function () {
    const modals = document.querySelectorAll(".modal");

    modals.forEach(modal => {
        modal.addEventListener("show.bs.modal", function () {
            // Disable scrolling on the main page when modal opens
            document.body.classList.add("modal-open");
        });

        modal.addEventListener("hidden.bs.modal", function () {
            // Enable scrolling again when modal closes
            document.body.classList.remove("modal-open");
        });
    });
});
