const API_BASE_URL = 'https://impact-ed-server-213051243033.asia-south2.run.app'; 
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
document.addEventListener('DOMContentLoaded', () => {
    currentUserEmail = getParameterByName('email'); // Store the authenticated user's email

    function checkUserType() {
        // NOTE: This is synchronous (does not use await).
            fetch(`${API_BASE_URL}/getUserType`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUserEmail }),
            })
            .then(response => {
            if (!response.ok) {
                window.location.href = 'index.html';
                throw new Error(`HTTP error! Status: ${response.status}`);
                
            }
            return response.json();
            })
            .then(data => {
                userData.mentalDisorder = data.userType || "Perfectly Fine"; //set mentalDisorder.
                if (data.userType !== 'For People with Motor Abilities') {
                window.location.href = 'index.html'; // Redirect if not authorized
                }
            })
            .catch(error => {
            console.error("Error fetching or processing user type:", error);
            });
        initializeApp();
        hideLoadingScreenAndShowContent();
      }
      
    checkUserType();

    function hideLoadingScreenAndShowContent() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.querySelector('.container');

        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            console.log("Loading screen hidden.");
        } else {
            console.warn("Loading screen element not found.");
        }

        if (mainContainer) {
            // The .container class in your CSS has "display: flex;"
            mainContainer.style.display = 'flex';
            console.log("Main content container shown.");
        } else {
            console.warn("Main container element not found.");
        }
    }

    const menu = document.querySelector('.menu');
    const menuItems = Array.from(menu.querySelectorAll('.menu-item'));
    const logoutButton = document.getElementById('logout-button');
    const contentSections = document.querySelectorAll('main.content > section');
    let currentToolbarItem = 0;

    menuItems[currentToolbarItem].classList.add('active');
    contentSections[currentToolbarItem].style.display = 'block';

    // --- ABORT CONTROLLER VARIABLES ---
    let currentChapterFetchAbortController = null;
    let currentAudioFetchAbortController = null;
    let currentQuizFetchAbortController = null;

    async function initializeApp() {

        //  currentUserEmail = user.email;
        await fetchInitialUserData();      // Loads user data and sets up state

        checkAndShowPlacementTest();
        fetchAndDisplayUserNameUI();
        applyDarkModePreference();
        calculateTotalTime();
        startSession();
    }

    


    function setActiveItem(index) {
        menuItems[currentToolbarItem].classList.remove('active');
        contentSections[currentToolbarItem].style.display = "none";
        currentToolbarItem = index;
        menuItems[currentToolbarItem].classList.add('active');
        contentSections[currentToolbarItem].style.display = "block";
        menu.scrollTo({
            top: menuItems[currentToolbarItem].offsetTop - menu.offsetTop,
            behavior: 'smooth'
        });
    }

    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            setActiveItem(index);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        item.addEventListener('focus', () => {
            setActiveItem(index);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar-inner');
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 1000);
        });
    }
    animateProgressBars();

    const toolbarContainer = document.querySelector('.toolbar-container');
    toolbarContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        toolbarContainer.scrollTop += e.deltaY;
    });

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    function enableDarkMode() {
        body.classList.add('dark-mode');
        document.querySelectorAll('.toolbar').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.logo').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.icon').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.logo-container').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.welcome-banner').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.card').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.progress-bar').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.circle-progress').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('#user-level-container').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('#study .study-menu-item').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.chapter-button').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('#study .chapter-content-container').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.back-button').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.chat-box').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('#study .content-text').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.chapter-button').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.ai-message').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.subject-progress .percentage').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.pace-display').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.subject-time .time-spent').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.chapter-button-content p').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.#profile p').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.menu-item:hover').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('.ai-message').forEach(el => el.classList.add('dark-mode'));
        document.querySelectorAll('#study h2').forEach(el => el.classList.add('dark-mode'));
    
        //New addition
        const quizElements = document.querySelectorAll('.quiz-question, .quiz-options li, .quiz-option label, .quiz-feedback, #quiz-submit-button');
        quizElements.forEach(el => el.classList.add('dark-mode'));
         document.querySelectorAll('.quiz-question').forEach(el => el.classList.add('dark-mode'));
                document.querySelectorAll('.quiz-options li').forEach(el => el.classList.add('dark-mode'));
                document.querySelectorAll('.quiz-option label').forEach(el => el.classList.add('dark-mode'));
                document.querySelectorAll('.quiz-feedback').forEach(el => el.classList.add('dark-mode'));
                document.querySelectorAll('#quiz-submit-button').forEach(el => el.classList.add('dark-mode'));
               document.querySelectorAll('.subject-progress .progress-bar-inner').forEach(el => el.classList.add('dark-mode'));
                document.querySelectorAll('.progress-bar-inner').forEach(el => el.classList.add('dark-mode'));
        
        updateDarkModePreference(true);
    
    
    }
    
    function disableDarkMode() {
        body.classList.remove('dark-mode');
        document.querySelectorAll('.toolbar').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.logo').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.icon').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.welcome-banner').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.card').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.progress-bar').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.logo-container').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('#user-level-container').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.circle-progress').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('#study .study-menu-item').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.chapter-button').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('#study .chapter-content-container').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.back-button').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.chat-box').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('#study .content-text').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.chapter-button').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.ai-message').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.subject-progress .percentage').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.pace-display').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.subject-time .time-spent').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.chapter-button-content p').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.#profile p').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.menu-item:hover').forEach(el => el.classList.remove('dark-mode'));
        document.querySelectorAll('.ai-message').forEach(el => el.classList.remove('dark-mode'));
    
        //New addition
        const quizElements = document.querySelectorAll('.quiz-question, .quiz-options li, .quiz-option label, .quiz-feedback, #quiz-submit-button');
         quizElements.forEach(el => el.classList.remove('dark-mode'));
          document.querySelectorAll('.quiz-question').forEach(el => el.classList.remove('dark-mode'));
                document.querySelectorAll('.quiz-options li').forEach(el => el.classList.remove('dark-mode'));
                document.querySelectorAll('.quiz-option label').forEach(el => el.classList.remove('dark-mode'));
                document.querySelectorAll('.quiz-feedback').forEach(el => el.classList.remove('dark-mode'));
                document.querySelectorAll('#quiz-submit-button').forEach(el => el.classList.remove('dark-mode'));
               document.querySelectorAll('.subject-progress .progress-bar-inner').forEach(el => el.classList.remove('dark-mode'));
               document.querySelectorAll('.progress-bar-inner').forEach(el => el.classList.remove('dark-mode'));
    
        updateDarkModePreference(false);
    }

    async function updateDarkModePreferenceOnServer(isDarkMode) {
        if (!currentUserEmail) return;
        try {
            await fetch(`${API_BASE_URL}/updateDarkModePreference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, isDarkMode: isDarkMode })
            });
        } catch (error) {
            console.error("Error updating dark mode preference on server:", error);
        }
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            enableDarkMode();
            updateDarkModePreferenceOnServer(true);
        } else {
            disableDarkMode();
            updateDarkModePreferenceOnServer(false);
        }
    });

    // This function will be called after fetchInitialUserData
    function applyDarkModePreference() {
        // userData.darkMode is populated by fetchInitialUserData
        if (userData && userData.darkMode) {
            darkModeToggle.checked = true;
            enableDarkMode();
        } else {
            darkModeToggle.checked = false;
            disableDarkMode();
        }
    }


    // Global state for user data fetched from server
    let userData = {
        name: '',
        email: '',
        language: 'English', // Default
        testCategory: 'beginner', // Default (userLevel)
        hasTakenTest: false,
        progress: {}, // completedChapters
        totaltimespent: 0,
        totalPoints: 0,
        subjectTime: {},
        darkMode: false,
        mentalDisorder: 'Perfectly Fine'
    };
    let userLevel = 'beginner'; // Will be updated by fetchInitialUserData

    async function fetchInitialUserData() {
        if (!currentUserEmail) {
            console.error("Cannot fetch initial user data, user not authenticated.");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/fetchUserData`, { // NEW SERVER ENDPOINT
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch user data: ${response.status}`);
            }
            const fetchedData = await response.json();

            // Update global userData object
            userData.name = fetchedData.name || 'User';
            userData.email = fetchedData.email || currentUserEmail;
            userData.language = fetchedData.language || 'English';
            userData.testCategory = (fetchedData.testCategory || 'beginner').toLowerCase();
            userData.hasTakenTest = fetchedData.hasTakenTest || false;
            userData.progress = fetchedData.progress || {};
            userData.totaltimespent = fetchedData.totaltimespent || 0;
            userData.totalPoints = fetchedData.totalPoints || 0;
            userData.subjectTime = fetchedData.subjectTime || {};
            userData.darkMode = fetchedData.darkMode || false;
            userData.mentalDisorder = fetchedData.mentalDisorder || 'Perfectly Fine';


            // Update specific global variables that are widely used
            userLevel = userData.testCategory;
            userLanguage = userData.language; // Assuming userLanguage is a global var from i18n setup
            completedChapters = userData.progress;
            totalTimeSpent = userData.totaltimespent;
            totalPoints = userData.totalPoints;
            subjectTime = userData.subjectTime;


            localStorage.setItem('userLevel', userLevel); // Keep this for convenience if other scripts use it

            console.log("Initial user data fetched and processed:", userData);
            translatePage(); // Translate after language is known

        } catch (error) {
            console.error("Error fetching initial user data from server:", error);
            // Handle critical error, maybe redirect or show error message
        }
        startSession();
    }


    function checkAndShowPlacementTest() {
        // Uses userData.hasTakenTest and userData.testCategory populated by fetchInitialUserData
        if (!userData.hasTakenTest) {
            showPlacementTest();
        }
        // Update UI for user level
        const levelText = document.getElementById('user-level-text');
        if (levelText) {
            levelText.textContent = `${i18n[userLanguage]?.['level'] || 'Level'}: ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
        }
    }

    function showPlacementTest() {
        const modal = document.getElementById('placementTestModal');
        modal.style.display = 'block';
        translatePage();
    }

    document.getElementById('placementTestForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserEmail) return;

        const formAnswers = {
            q1: document.querySelector('input[name="q1"]:checked')?.value, q2: document.querySelector('input[name="q2"]:checked')?.value,
            q3: document.querySelector('input[name="q3"]:checked')?.value, q4: document.querySelector('input[name="q4"]:checked')?.value,
            q5: document.querySelector('input[name="q5"]:checked')?.value, q6: document.querySelector('input[name="q6"]:checked')?.value,
            q7: document.querySelector('input[name="q7"]:checked')?.value, q8: document.querySelector('input[name="q8"]:checked')?.value,
            q9: document.querySelector('input[name="q9"]:checked')?.value, q10: document.querySelector('input[name="q10"]:checked')?.value,
            q11: document.querySelector('input[name="q11"]:checked')?.value, q12: document.querySelector('input[name="q12"]:checked')?.value,
            q13: document.querySelector('input[name="q13"]:checked')?.value, q14: document.querySelector('input[name="q14"]:checked')?.value,
            q15: document.querySelector('input[name="q15"]:checked')?.value, q16: document.querySelector('input[name="q16"]:checked')?.value,
            q17: document.querySelector('input[name="q17"]:checked')?.value, q18: document.querySelector('input[name="q18"]:checked')?.value,
            // userId: firebase.auth().currentUser.uid // Not needed if server uses email
        };

        try {
            // 1. Send to external evaluation API
            const evalResponse = await fetch('https://test-eval-api-213051243033.asia-south2.run.app/evaluate-test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ...formAnswers, userId: currentUserEmail }) // eval API might still need UID
            });

            if (!evalResponse.ok) throw new Error('Test evaluation failed');
            const evalData = await evalResponse.json();
            const determinedCategory = (evalData && evalData.category) ? evalData.category.toLowerCase() : userLevel; // Fallback to current userLevel

            // 2. Update our server with the test results
            const serverUpdateResponse = await fetch(`${API_BASE_URL}/submitPlacementTest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUserEmail,
                    testCategory: determinedCategory,
                    hasTakenTest: true
                })
            });

            if (!serverUpdateResponse.ok) throw new Error('Failed to update test status on server');

            userLevel = determinedCategory;
            localStorage.setItem('userLevel', userLevel);

            const levelText = document.getElementById('user-level-text');
            if (levelText) {
                levelText.textContent = `${i18n[userLanguage]?.['level'] || 'Level'}: ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
            }
            document.getElementById('placementTestModal').style.display = 'none';

        } catch (error) {
            console.error('Test submission process failed:', error);
        }
    });


    const studySection = document.getElementById('study');
    const studyMenu = studySection.querySelector('.study-menu');
    const studyContent = studySection.querySelector('.study-content');
    const chaptersContainer = studySection.querySelector('.chapters-container');
    const backButton = studySection.querySelector('.back-button');
    const chapterContentContainer = studySection.querySelector('.chapter-content-container');
    const contentTitle = studySection.querySelector('.chapter-title');
    const contentText = studySection.querySelector('.content-text');
    const loadingIndicator = studySection.querySelector('.loading-indicator');
    const errorMessage = studySection.querySelector('.error-message');
    const errorText = studySection.querySelector('.error-text');
    const backButtonContainer = studySection.querySelector('.back-button-container');

    const progressCard = document.querySelector('#home .course-progress-card');
    const pointsCard = document.querySelector('#home .last-chapter-card');
    const totalTimeCard = document.getElementById('total-time-card');
    const welcomeMessage = document.getElementById('welcome-message');
    const profileDetails = document.getElementById('profile-details');
    const subjectTimeCard = document.getElementById('subject-time-card');

    let completedChapters = {}; // Populated by fetchInitialUserData
    let totalPoints = 0;       // Populated by fetchInitialUserData
    let totalTimeSpent = 0;    // Populated by fetchInitialUserData
    let sessionStartTime = null;
    let userLanguage = 'English'; // Populated by fetchInitialUserData
    let subjectTime = {};      // Populated by fetchInitialUserData
    let chapterIntervalId = null;
    let currentChapterSubjectId = null;

    const subjects = [ /* ... Your subjects array remains unchanged ... */
        {
              "id": "physics",
              "name": "Physics",
              "icon": "⚛️",
              "chapters": {
                "beginner": [
                  { "name": "Introduction to Measurement", "content": "Length, Mass, and Time", "icon": "📏" },
                  { "name": "Motion Basics", "content": "Types, Speed, and Distance", "icon": "🚗" },
                  { "name": "Light", "content": "Sources, Shadows, and Reflection", "icon": "💡" },
                  { "name": "Sound", "content": "Properties of Sound", "icon": "🎵" },
                  { "name": "Friction", "content": "Factors Affecting Friction", "icon": "🧱" },
                  { "name": "Magnetism", "content": "Properties and Uses of Magnets", "icon": "🧲" },
                  { "name": "The Atmosphere", "content": "Basic Properties and Wind Formation", "icon": "☁️" },
                  { "name": "Water", "content": "States, Properties, and Cycle", "icon": "💧" },
                  { "name": "Motion", "content": "Concepts of Rest and Motion", "icon": "🚀" },
                  { "name": "Light", "content": "Rectilinear Propagation and Reflection at Plane Surfaces", "icon": "✨" }
                ],
                "intermediate": [
                  { "name": "Electricity", "content": "Simple Circuits and Components", "icon": "⚡" },
                  { "name": "Motion", "content": "Velocity, Displacement and Acceleration", "icon": "📈" },
                  { "name": "Work and Energy", "content": "What is Work and Energy", "icon": "💪" },
                  { "name": "Sound", "content": "Nature of Sound and Propagation", "icon": "🔊" },
                  { "name": "Motion", "content": "Types of Motion and related quantities", "icon": "⚙️" },
                  { "name": "Heat", "content": "Transfer of Heat", "icon": "🔥" },
                  { "name": "Motion", "content": "Distance and Displacement", "icon": "📐" },
                  { "name": "Force", "content": "Introduction to Force and its Effects", "icon": "💥" },
                  { "name": "Motion", "content": "Uniform and Non-Uniform Motion", "icon": "🔄" },
                  { "name": "Sound", "content": "Characteristics of Sound Waves", "icon": "📡" }
                ],
                "advanced": [
                  { "name": "Light", "content": "Reflection of Light", "icon": "🔆" },
                  { "name": "Work and Energy", "content": "Concepts and Forms of Energy", "icon": "💡" },
                  { "name": "Force", "content": "Pressure", "icon": "💨" },
                  { "name": "Light", "content": "Refraction of Light", "icon": "🌈" },
                  { "name": "Electric Current and its Effects", "content": "Heating and Magnetic Effects", "icon": "🔌" },
                  { "name": "Force", "content": "Pressure in Fluids", "icon": "💧" },
                  { "name": "Light", "content": "Spherical Mirrors and Lenses", "icon": "🔭" },
                  { "name": "Gravitation", "content": "Universal Law of Gravitation", "icon": "🌍" },
                  { "name": "Force and Motion", "content": "Newton's Laws of Motion", "icon": "🍎" },
                  { "name": "Work and Energy", "content": "Power and Conservation of Energy", "icon": "⚡" }
                ]
              }
            },
            {
              "id": "chemistry",
              "name": "Chemistry",
              "icon": "🧪",
              "chapters": {
                "beginner": [
                  { "name": "Introduction to Matter", "content": "States of Matter", "icon": "⚗️" },
                  { "name": "Materials", "content": "Classification and Properties", "icon": "🧱" },
                  { "name": "Water", "content": "Importance and Properties", "icon": "💧" },
                  { "name": "Air", "content": "Composition and Importance", "icon": "💨" },
                  { "name": "Changes Around Us", "content": "Reversible and Irreversible Changes", "icon": "🔄" },
                  { "name": "Separation of Mixtures", "content": "Common Techniques", "icon": "⚗️" },
                  { "name": "Acids, Bases, and Salts", "content": "Introduction and Properties", "icon": "🧪" },
                  { "name": "Fibers", "content": "Natural and Synthetic", "icon": "🧶" },
                  { "name": "Introduction to Elements and Compounds", "content": "Introduction to Elements and Compounds", "icon": "⚛️" },
                  { "name": "Chemical Symbols and Simple Formulas", "content": "Chemical Symbols and Simple Formulas", "icon": "🧮" }
                ],
                "intermediate": [
                    { "name": "Atoms and Molecules", "content": "Building Blocks of Matter", "icon": "🔵" },
                    { "name": "Metals and Non-Metals", "content": "Physical Properties", "icon": "🔨" },
                    { "name": "Metals and Non-Metals", "content": "Chemical Properties", "icon": "🔥" },
                    { "name": "Representing Chemical Reactions", "content": "Word Equations", "icon": "📝" },
                    { "name": "Chemical Reactions", "content": "Introduction and Types", "icon": "💥" },
                    { "name": "Water Pollution", "content": "Sources and Effects", "icon": "⚠️" },
                    { "name": "Air Pollution", "content": "Sources and Effects", "icon": "🏭" },
                    { "name": "The Structure of the Atom", "content": "Electrons, Protons, and Neutrons", "icon": "🌐" },
                    { "name": "Valency", "content": "Combining Capacity of Elements", "icon": "🤝" },
                    { "name": "Chemical Formulas", "content": "Writing and Understanding", "icon": "📝" }
                ],
                "advanced": [
                  { "name": "Chemical Reactions", "content": "Types and Examples", "icon": "💫" },
                  { "name": "Acids, Bases, and Salts", "content": "Strength and pH Scale", "icon": "🍋" },
                  { "name": "Carbon and its Compounds", "content": "Introduction", "icon": "🔗" },
                  { "name": "Calculating Formula Mass", "content": "Using Atomic Masses", "icon": "⚖️" },
                  { "name": "Chemical Reactions", "content": "Balancing Chemical Equations", "icon": "📝" },
                  { "name": "The Periodic Table", "content": "Organization and Trends", "icon": "🗓️" },
                  { "name": "Fuels", "content": "Types, Properties, and Combustion", "icon": "⛽" },
                  { "name": "Chemical Bonding", "content": "Ionic and Covalent Bonds", "icon": "🔗" },
                  { "name": "Some Important Chemical Compounds", "content": "Preparation and Uses", "icon": "✨" },
                  { "name": "Environmental Chemistry", "content": "Pollution and Remediation", "icon": "🌱" }
                ]
              }
            },
            {
              "id": "biology",
              "name": "Biology",
               "icon": "🌿",
              "chapters": {
                "beginner": [
                  { "name": "Living and Non-Living Things", "content": "Basic Characteristics", "icon": "🌱" },
                  { "name": "Plant Life", "content": "Parts of a Plant", "icon": "🌿" },
                  { "name": "Animal Life", "content": "Basic Needs of Animals", "icon": "🐾" },
                  { "name": "Food Sources", "content": "Plants, Animals, and Dietary Habits", "icon": "🍎" },
                  { "name": "Components of Food", "content": "Nutrients", "icon": "🥕" },
                  { "name": "Food and Health", "content": "Balanced Diet", "icon": "🥗" },
                  { "name": "Habitats", "content": "Types of Habitats", "icon": "🏡" },
                  { "name": "Adaptations", "content": "Adaptations in Plants", "icon": "🌵" },
                  { "name": "Adaptations", "content": "Adaptations in Animals", "icon": "🦁" },
                  { "name": "Classification of Living Organisms", "content": "Basic Groups", "icon": "🌳" }
                ],
                "intermediate": [
                    { "name": "The Cell", "content": "The Basic Unit of Life", "icon": "🔬" },
                    { "name": "Plant Tissues", "content": "Types and Functions", "icon": "🎋" },
                    { "name": "Animal Tissues", "content": "Types and Functions", "icon": "🧬" },
                    { "name": "Microorganisms", "content": "Beneficial and Harmful Microbes", "icon": "🦠" },
                    { "name": "Respiration", "content": "Breathing and Exchange of Gases", "icon": "💨" },
                    { "name": "Transportation in Plants", "content": "Water and Minerals", "icon": "🚚" },
                    { "name": "Transportation in Animals", "content": "Blood and Circulation", "icon": "🩸" },
                    { "name": "Excretion", "content": "Waste Disposal in Organisms", "icon": "🚽" },
                    { "name": "Control and Coordination", "content": "Nervous System", "icon": "🧠" },
                    { "name": "Reproduction in Plants", "content": "Asexual Reproduction", "icon": "🌷" }
                  ],
                "advanced": [
                  { "name": "Reproduction in Plants", "content": "Sexual Reproduction", "icon": "🌺" },
                  { "name": "Reproduction in Animals", "content": "Sexual Reproduction", "icon": "🐣" },
                  { "name": "Heredity and Evolution", "content": "Basic Concepts", "icon": "🧬" },
                  { "name": "Ecosystems", "content": "Components and Interactions", "icon": "🌍" },
                  { "name": "Natural Resources", "content": "Conservation and Management", "icon": "🌲" },
                  { "name": "Crop Production and Management", "content": "Agricultural Practices", "icon": "🌾" },
                  { "name": "Improvement in Food Resources", "content": "Animal Husbandry", "icon": "🐄" },
                  { "name": "Human Health and Diseases", "content": "Causes and Prevention", "icon": "🦠" },
                  { "name": "Biodiversity", "content": "Importance and Conservation", "icon": "🐾" },
                  { "name": "Biotechnology", "content": "Basic Applications", "icon": "🧪" }
                ]
              }
            },
            {
              "id": "mathematics",
              "name": "Mathematics",
               "icon": "🧮",
              "chapters": {
                "beginner": [
                    { "name": "Numbers", "content": "Introduction to Whole Numbers", "icon": "1️⃣" },
                    { "name": "Playing with Numbers", "content": "Factors and Multiples", "icon": "🔢" },
                    { "name": "Integers", "content": "Introduction to Negative Numbers", "icon": "🧮" },
                    { "name": "Fractions", "content": "Basic Concepts and Operations", "icon": "🍕" },
                    { "name": "Decimals", "content": "Introduction and Basic Operations", "icon": "0️⃣" },
                    { "name": "Data Handling", "content": "Pictographs and Bar Graphs", "icon": "📊" },
                    { "name": "Mensuration", "content": "Perimeter and Area of Simple Shapes", "icon": "📐" },
                    { "name": "Algebra", "content": "Introduction to Variables and Expressions", "icon": "🧮" },
                    { "name": "Ratio and Proportion", "content": "Comparing Quantities", "icon": "⚖️" },
                    { "name": "Rational Numbers", "content": "Introduction and Properties", "icon": "🔢" }
                ],
                "intermediate": [
                    { "name": "Simple Equations", "content": "Solving for Unknowns", "icon": "❓" },
                    { "name": "Exponents and Powers", "content": "Introduction to Exponents", "icon": "⏫" },
                    { "name": "Comparing Quantities", "content": "Percentage and its Applications", "icon": "💯" },
                    { "name": "Area of Squares and Rectangles", "content": "Formula and Applications", "icon": "⬛" },
                    { "name": "Algebraic Expressions", "content": "Addition, Subtraction, and Multiplication", "icon": "➕" },
                    { "name": "Square and Square Roots", "content": "Finding Square Roots", "icon": "√" },
                    { "name": "Cubes and Cube Roots", "content": "Finding Cube Roots", "icon": "🧊" },
                    { "name": "Data Handling", "content": "Probability", "icon": "🎲" },
                    { "name": "Direct and Inverse Proportions", "content": "Applications", "icon": "⚖️" },
                    { "name": "Linear Equations in One Variable", "content": "Word Problems", "icon": "📖" }
                  ],
                  "advanced": [
                    { "name": "Understanding Polynomials", "content": "Basic Concepts", "icon": "📈" },
                    { "name": "Operations on Polynomials", "content": "Addition and Subtraction", "icon": "➕" },
                    { "name": "Exponents and Powers", "content": "Advanced Applications", "icon": "⏫" },
                    { "name": "Profit and Loss", "content": "Basic Concepts and Calculations", "icon": "💰" },
                    { "name": "Simple Interest", "content": "Calculation and Applications", "icon": "🏦" },
                    { "name": "Compound Interest", "content": "Calculation and Applications", "icon": "📈" },
                    { "name": "Data Handling", "content": "Measures of Central Tendency", "icon": "📊" },
                    { "name": "Ratio and Proportion", "content": "Applications in Real Life", "icon": "⚖️" },
                    { "name": "Percentage", "content": "Applications in Discounts and Taxes", "icon": "💯" },
                    { "name": "Factorisation", "content": "Introduction to Factorisation", "icon": "🧩" }
                  ]
              }
            },
            {
              "id": "economics",
              "name": "Economics",
               "icon": "💰",
              "chapters": {
                "beginner": [
                  { "name": "Introduction to Economics", "content": "Basic Concepts", "icon": "🏦" },
                  { "name": "Goods and Services", "content": "What We Consume", "icon": "🛍️" },
                  { "name": "Human Wants", "content": "Unlimited and Varying", "icon": "🤔" },
                  { "name": "Resources", "content": "Natural, Human, and Capital", "icon": "🌳" },
                  { "name": "Production", "content": "Combining Resources to Create Goods and Services", "icon": "🏭" },
                  { "name": "Consumption", "content": "Using Goods and Services to Satisfy Wants", "icon": "💸" },
                  { "name": "Saving", "content": "Setting Aside Resources for the Future", "icon": "🌱" },
                  { "name": "Money", "content": "Its Functions and Importance", "icon": "💰" },
                  { "name": "Markets", "content": "Where Buyers and Sellers Meet", "icon": "🏪" },
                  { "name": "Demand", "content": "Consumer Desire for Goods and Services", "icon": "📈" }
                ],
                "intermediate": [
                  { "name": "Supply", "content": "Producer Willingness to Offer Goods and Services", "icon": "📦" },
                  { "name": "Price Determination", "content": "How Supply and Demand Interact", "icon": "💲" },
                  { "name": "Economic Systems", "content": "Traditional, Command, and Market", "icon": "🌐" },
                  { "name": "The Role of Government in the Economy", "content": "Basic Functions", "icon": "🏛️" },
                  { "name": "Labor and Employment", "content": "Earning a Living", "icon": "👷" },
                  { "name": "Voluntary Exchange", "content": "The Benefits of Trade and Specialization", "icon": "🤝" },
                  { "name": "International Trade", "content": "Buying and Selling Across Borders", "icon": "🚢" },
                  { "name": "Money and Banking", "content": "Basic Concepts", "icon": "🏦" },
                  { "name": "Inflation", "content": "Rising Prices", "icon": "🔥" },
                  { "name": "Economic Growth", "content": "Increasing Production and Living Standards", "icon": "🚀" }
                ],
                "advanced": [
                  { "name": "Poverty", "content": "Understanding and Addressing the Challenge", "icon": "💔" },
                  { "name": "Sustainable Development", "content": "Balancing Economic Growth and Environmental Protection", "icon": "♻️" },
                  { "name": "The Circular Flow of Income", "content": "Basic Model", "icon": "🔄" },
                  { "name": "Gross Domestic Product (GDP)", "content": "Measuring Economic Activity", "icon": "📊" },
                  { "name": "Budgeting", "content": "Managing Your Personal Finances", "icon": "🧾" },
                  { "name": "Investment", "content": "Putting Money to Work", "icon": "📈" },
                  { "name": "Entrepreneurship", "content": "Starting Your Own Business", "icon": "💡" },
                  { "name": "Financial Literacy", "content": "Making Informed Financial Decisions", "icon": "🧠" },
                  { "name": "Economic Development", "content": "Improving Quality of Life", "icon": "🌟" },
                  { "name": "Globalization", "content": "Interconnectedness of Economies", "icon": "🌍" }
                ]
              }
            },
            {
              "id": "history",
              "name": "History",
               "icon": "🏛️",
              "chapters": {
                "beginner": [
                    { "name": "Introduction to History", "content": "What is History and Why Study It?", "icon": "📜" },
                    { "name": "The Stone Age", "content": "Early Human Societies", "icon": "🗿" },
                    { "name": "The Agricultural Revolution", "content": "The Dawn of Farming", "icon": "🌾" },
                    { "name": "The First Civilizations", "content": "Mesopotamia and Egypt", "icon": "🏛️" },
                    { "name": "Ancient India", "content": "The Indus Valley Civilization", "icon": "🛕" },
                    { "name": "Ancient Greece", "content": "Democracy and Philosophy", "icon": "🏺" },
                    { "name": "Ancient Rome", "content": "Republic to Empire", "icon": "🏛️" },
                    { "name": "The Rise of Empires in Asia", "content": "The Mauryan and Han Dynasties", "icon": "🌏" },
                    { "name": "Major World Religions", "content": "Origins and Spread", "icon": "☮️" },
                    { "name": "The Middle Ages", "content": "Europe After Rome", "icon": "🏰" }
                ],
                "intermediate": [
                    { "name": "The Islamic World", "content": "Golden Age and Contributions", "icon": "☪️" },
                    { "name": "The Renaissance", "content": "Rebirth of Art and Learning", "icon": "🎨" },
                    { "name": "The Age of Exploration", "content": "European Voyages and Discoveries", "icon": "🧭" },
                    { "name": "The Reformation", "content": "Religious Changes in Europe", "icon": "📖" },
                    { "name": "The Scientific Revolution", "content": "New Ways of Thinking", "icon": "🧪" },
                    { "name": "The Enlightenment", "content": "Reason and Individual Rights", "icon": "💡" },
                    { "name": "The Atlantic Slave Trade", "content": "Its Impact and Consequences", "icon": "⛓️" },
                    { "name": "The American Revolution", "content": "Birth of a Nation", "icon": "🗽" },
                    { "name": "The French Revolution", "content": "Liberty, Equality, Fraternity", "icon": "⚔️" },
                    { "name": "The Industrial Revolution", "content": "Transforming Society", "icon": "🏭" }
                  ],
                "advanced": [
                  { "name": "Imperialism", "content": "European Domination of the World", "icon": "👑" },
                  { "name": "World War I", "content": "Causes and Consequences", "icon": "💣" },
                  { "name": "The Russian Revolution", "content": "Rise of Communism", "icon": "🚩" },
                  { "name": "The Interwar Period", "content": "Economic Depression and Rise of Fascism", "icon": "📉" },
                  { "name": "World War II", "content": "Global Conflict", "icon": "⚔️" },
                  { "name": "The Cold War", "content": "A Divided World", "icon": "❄️" },
                  { "name": "Decolonization", "content": "Independence Movements in Asia and Africa", "icon": "🌍" },
                  { "name": "The Civil Rights Movement", "content": "Struggle for Equality", "icon": "✊🏿" },
                  { "name": "The Fall of the Soviet Union", "content": "End of the Cold War", "icon": "🚩" },
                  { "name": "Globalization and the 21st Century", "content": "Challenges and Opportunities", "icon": "🌐" }
                ]
              }
            },
            {
              "id": "computer",
              "name": "Computer Science and Technology",
               "icon": "💻",
              "chapters": {
                "beginner": [
                  { "name": "Introduction to Computers", "content": "What is a Computer?", "icon": "💻" },
                  { "name": "Computer Hardware", "content": "Input and Output Devices", "icon": "🖱️" },
                  { "name": "Computer Software", "content": "Operating Systems and Applications", "icon": "💾" },
                  { "name": "Using the Internet", "content": "Basic Concepts", "icon": "🌐" },
                  { "name": "Searching the Web", "content": "Effective Search Strategies", "icon": "🔍" },
                  { "name": "Digital Citizenship", "content": "Online Safety and Etiquette", "icon": "🔒" },
                  { "name": "Digital Literacy", "content": "Evaluating Online Information", "icon": "📚" },
                  { "name": "Spreadsheets", "content": "Organizing and Analyzing Data", "icon": "📊" },
                  { "name": "Presentation Software", "content": "Creating Visual Aids", "icon": "🎬" },
                  { "name": "Computer Networks", "content": "Connecting Devices", "icon": "📶" }
                ],
                "intermediate": [
                  { "name": "Data Storage", "content": "Understanding Different Storage Devices", "icon": "🗄️" },
                  { "name": "Computer Security", "content": "Protecting Your Data", "icon": "🛡️" },
                  { "name": "Introduction to Programming", "content": "Basic Concepts", "icon": "👨‍💻" },
                  { "name": "Digital Communication", "content": "Email and Instant Messaging", "icon": "📧" },
                  { "name": "Digital Privacy", "content": "Understanding Your Rights Online", "icon": "👤" },
                  { "name": "Introduction to Databases", "content": "Organizing Information", "icon": "💽" },
                  { "name": "Creating Simple Websites", "content": "Introduction to HTML", "icon": "🌐" },
                  { "name": "Social Media", "content": "Using Social Media Responsibly", "icon": "📱" },
                  { "name": "Computer Ethics", "content": "Ethical Issues in Computing", "icon": "⚖️" },
                  { "name": "The History of Computers", "content": "From Abacus to Modern Devices", "icon": "🕰️" }
                ],
                "advanced": [
                  { "name": "The Impact of Computers on Society", "content": "Positive and Negative Effects", "icon": "💡" },
                  { "name": "Introduction to Artificial Intelligence", "content": "Basic Concepts", "icon": "🤖" },
                  { "name": "Robotics", "content": "Understanding Robots and Their Uses", "icon": "🦾" },
                  { "name": "Data Analysis", "content": "Making Sense of Data", "icon": "📈" },
                  { "name": "Algorithms", "content": "Understanding Step-by-Step Instructions", "icon": "📝" },
                  { "name": "Conditional Logic", "content": "Making Decisions in Code", "icon": "🤔" },
                  { "name": "3D Printing", "content": "Introduction to 3D Printing Technology", "icon": "🖨️" },
                  { "name": "Cloud Computing", "content": "Understanding Cloud Services", "icon": "☁️" },
                  { "name": "The Future of Technology", "content": "Emerging Trends", "icon": "🔮" },
                  { "name": "Problem Solving with Technology", "content": "Real-World Applications", "icon": "🧩" }
                ]
              }
            }
    ];


    // Called by the main IIFE after fetchInitialUserData
    function fetchAndDisplayUserNameUI() {
        // Uses global `userData` which is populated by `fetchInitialUserData`
        if (welcomeMessage && userData.name) {
            welcomeMessage.innerHTML = `<span data-i18n="welcomeBack">Welcome back,</span> ${userData.name}!`;
        }
        if (profileDetails) {
            profileDetails.innerHTML = `
                <p><strong data-i18n="name">Name:</strong> ${userData.name}</p>
                <p><strong data-i18n="email">Email:</strong> ${userData.email}</p>
                <p><strong data-i18n="language">Language:</strong> ${userData.language}</p>
                <p><strong data-i18n="level">Level:</strong> ${userData.testCategory}</p>
            `;
        }
        updateProgressDisplay(); // This uses global completedChapters, totalPoints
        translatePage(); // Ensure new elements are translated
    }


    function updateProgressDisplay() {
        // Uses global completedChapters, totalPoints, userLanguage
        const pointsHeading = pointsCard.querySelector('h2');
        const courseProgressHeading = progressCard.querySelector('h2');

        if (pointsHeading) pointsHeading.textContent = i18n[userLanguage]?.['totalPoints'] || 'Total Points';
        if (courseProgressHeading) courseProgressHeading.textContent = i18n[userLanguage]?.['courseProgress'] || 'Course Progress';

        progressCard.innerHTML = ``; // Clear previous
        let allSubjectsCompleted = true;
        subjects.forEach(subject => {
            const progressPercent = calculateSubjectProgress(subject.id, completedChapters);
            const subjectDiv = document.createElement('div');
            subjectDiv.classList.add('subject-progress');
            subjectDiv.innerHTML = `
                <div class="subject-progress-header">
                    <span class="subject-icon">${subject.icon}</span>
                    <h3 data-i18n="${subject.name}">${i18n[userLanguage]?.[subject.name] || subject.name}</h3>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-inner" style="width: ${progressPercent}%"></div>
                    <span class="percentage">${progressPercent}%</span>
                </div>`;
            progressCard.appendChild(subjectDiv);
            if (progressPercent < 100) allSubjectsCompleted = false;
        });

        if (allSubjectsCompleted && userLevel !== 'advanced') { // Only level up if not already advanced
            updateUserLevelAndResetProgressOnServer();
        }

        if (pointsCard) {
            pointsCard.innerHTML = `
                <h2 data-i18n="totalPoints">${i18n[userLanguage]?.['totalPoints'] || 'Total Points'}</h2>
                <p>${totalPoints} <span data-i18n="points">${i18n[userLanguage]?.['points'] || 'Points'}</span></p>
                <div class="token-container"><div class="token"></div></div>`;
            if (body.classList.contains('dark-mode')) {
                pointsCard.classList.add('dark-mode');
                pointsCard.querySelector('h2')?.classList.add('dark-mode');
                pointsCard.querySelector('p')?.classList.add('dark-mode');
            }
            const token = pointsCard.querySelector('.token');
            if (token) {
                token.style.animation = 'none';
                requestAnimationFrame(() => { token.style.animation = ''; });
            }
            pointsCard.style.display = "block";
        }
        updateTotalTimeDisplay();
        updateSubjectTimeDisplay();
        translatePage();
    }

    async function updateUserLevelAndResetProgressOnServer() {
        if (!currentUserEmail || userLevel === 'advanced') return;

        let newLevel;
        switch (userLevel) {
            case 'beginner': newLevel = 'intermediate'; break;
            case 'intermediate': newLevel = 'advanced'; break;
            default: return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/updateUserLevelAndResetProgress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, newLevel: newLevel })
            });
            if (!response.ok) throw new Error('Failed to update level and reset progress on server');

            console.log("User level updated to:", newLevel, "and progress reset on server.");
            userLevel = newLevel;
            userData.testCategory = newLevel;
            completedChapters = {}; // Reset client-side
            userData.progress = {};

            localStorage.setItem('userLevel', userLevel);
            const levelText = document.getElementById('user-level-text');
            if (levelText) {
                levelText.textContent = `${i18n[userLanguage]?.['level'] || 'Level'}: ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
            }
            updateProgressDisplay(); // Refresh UI
            renderSubjects(); // Re-render subjects for the new level

        } catch (error) {
            console.error("Error in updateUserLevelAndResetProgressOnServer:", error);
        }
    }


    async function updateProgressOnServer(topicData, subjectName) {
        if (!currentUserEmail) return;

        // Check if chapter already completed to prevent duplicate server calls for points
        if (completedChapters[topicData]) {
            console.log("Chapter already marked as complete:", topicData);
            return; // Already processed
        }

        try {
            const response = await fetch(`${API_BASE_URL}/updateProgress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUserEmail,
                    topicData: topicData,
                    subjectName: subjectName
                })
            });
            if (!response.ok) throw new Error('Failed to update progress on server');

            const result = await response.json();
            if (result.pointsAwarded) { // Server should indicate if points were newly awarded
                 totalPoints += 10; // Update client-side points
                 userData.totalPoints = totalPoints;
            }

            completedChapters[topicData] = subjectName; // Update client-side progress
            userData.progress = completedChapters;

            console.log('Progress updated on server for:', topicData);
            updateProgressDisplay(); // Refresh UI

        } catch (error) {
            console.error("Error updating progress on server:", error);
        }
    }

    async function updatePointsOnServer(points) { // More generic function
        if (!currentUserEmail) return;
        try {
            await fetch(`${API_BASE_URL}/updatePointsInFirestore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, totalPoints: points })
            });
            totalPoints = points; // Update global
            userData.totalPoints = points;
            console.log("Total points updated on server to:", points);
            // updateProgressDisplay(); // Usually called by the function that awarded points
        } catch (error) {
            console.error("Error updating total points on server:", error);
        }
    }


    // markChapterAsCompleted is now effectively handled by updateProgressOnServer
    function markChapterAsCompleted(chapterName, subjectName) {
        const chapterKey = getChapterKey(chapterName); // Uses global userLevel
        // The actual server update happens in updateProgressOnServer called from fetchChapterContent
    }

    function getChapterKey(chapterName) {
        return `${userLevel}/${chapterName}`;
    }

    function calculateSubjectProgress(subjectId, currentCompletedChapters) {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return 0;
        const levelChapters = subject.chapters[userLevel]; // Uses global userLevel
        if (!levelChapters) return 0;

        const completedCount = Object.keys(currentCompletedChapters)
            .filter(key => {
                const parts = key.split(':'); // topicData format: "level:chapterName: chapterContent"
                if (parts.length < 2) return false;
                const storedLevel = parts[0].trim();
                const chapterFullName = parts.slice(1).join(':').trim(); // Rejoin content part

                // Match based on level and if the chapter name is in this subject's level chapters
                return (
                    storedLevel === userLevel &&
                    levelChapters.some(chapter => `${chapter.name}: ${chapter.content}` === chapterFullName)
                );
            }).length;
        return levelChapters.length > 0 ? Math.round((completedCount / levelChapters.length) * 100) : 0;
    }


    // displayChapters, displayChapterView, fetchChapterContent (and its API calls) remain largely the same,
    // but fetchChapterContent will use global `userLanguage`, `userData.mentalDisorder`

    function displayChapters(subject) {
      console.log("Displaying chapters for subject:", subject, "and userLevel:", userLevel);
      studyMenu.style.display = 'none';
      chaptersContainer.style.display = 'block';
      chapterContentContainer.style.display = 'none';
      backButtonContainer.style.display = 'flex';
      chaptersContainer.innerHTML = ''; // Clear previous
      document.getElementById('convert-to-audio').style.display = 'none';

      if (!subject || !subject.chapters) {
        console.error("Error: Subject or subject chapters are undefined:", subject);
        chaptersContainer.innerHTML = `<p class="error-message">${i18n[userLanguage]?.['errorLoading'] || 'Error loading chapters.'}</p>`;
        return;
      }
      const lowerCaseUserLevel = userLevel.toLowerCase();
      const levelChapters = subject.chapters[lowerCaseUserLevel];

      if (!levelChapters || !Array.isArray(levelChapters)) {
        console.error(`Error: No chapters found for level: ${lowerCaseUserLevel} in subject:`, subject.name);
        chaptersContainer.innerHTML = `<p class="error-message">${i18n[userLanguage]?.['errorNoChaptersLevel'] || 'No chapters available for this level.'}</p>`;
        return;
      }




      levelChapters.forEach((chapter, index) => {
        const chapterButton = document.createElement('div');
        chapterButton.classList.add('chapter-button');
        chapterButton.setAttribute('tabindex', '0');
        chapterButton.innerHTML = `
          <div class="chapter-button-image">${chapter.icon}</div>
          <div class="chapter-button-content">
            <h3 data-i18n="${chapter.name}">${i18n[userLanguage]?.[chapter.name] || chapter.name}</h3>
            <p data-i18n="${chapter.content}">${i18n[userLanguage]?.[chapter.content] || chapter.content}</p>
          </div>`;
        chapterButton.addEventListener('click', () => displayChapterView(chapter.name, chapter.content, subject.name));
        chaptersContainer.appendChild(chapterButton);
      });
      chapterItems = chaptersContainer.querySelectorAll('.chapter-button');
      if (body.classList.contains('dark-mode')) {
        chaptersContainer.querySelectorAll('.chapter-button, h2, h3, p').forEach(el => el.classList.add('dark-mode'));
      }
      translatePage();
    }

    function displayChapterView(chapterName, chapterContent, subjectName) {
        studyMenu.style.display = 'none';
        chaptersContainer.style.display = 'none';
        chapterContentContainer.style.display = 'block';
        backButtonContainer.style.display = 'flex';
        contentTitle.textContent = '';
        contentText.innerHTML = '';
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';

        fetchChapterContent(chapterName, chapterContent, subjectName);

        let currentSubjectId = null;
        const subject = subjects.find(s => s.name === subjectName);
        if (subject) currentSubjectId = subject.id;

        startChapterTimer(currentSubjectId);
        localStorage.setItem('lastCompletedChapter', chapterName); // Still useful for UI state
        setChapterFocus(0);
    }

    function cancelCurrentChapterFetch() { /* ... unchanged ... */
        if (currentChapterFetchAbortController) {
            currentChapterFetchAbortController.abort();
            currentChapterFetchAbortController = null;
        }
    }
    function cancelCurrentAudioFetch() { /* ... unchanged ... */
        if (currentAudioFetchAbortController) {
            currentAudioFetchAbortController.abort();
            currentAudioFetchAbortController = null;
            removeAndResetConvertToAudioButton();
        }
    }
    function cancelCurrentQuizFetch() { /* ... unchanged ... */
        if (currentQuizFetchAbortController) {
            currentQuizFetchAbortController.abort();
            currentQuizFetchAbortController = null;
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer && quizContainer.innerHTML.includes('Generating quiz...')) {
                 quizContainer.innerHTML = ''; // Clear generating message
            }
        }
    }
    function removeAndResetConvertToAudioButton() { /* ... unchanged ... */
        const convertButton = document.getElementById('convert-to-audio');
        const playButton = document.getElementById('play-audio');
        if (convertButton) {
            convertButton.disabled = false;
            convertButton.textContent = i18n[userLanguage]?.['convertToAudio'] || 'Convert To Audio';
            convertButton.style.display = 'none';
        }
        if (playButton) playButton.style.display = 'none';
        if (window.audioUrl) {
            URL.revokeObjectURL(window.audioUrl);
            window.audioUrl = null;
        }
        if (window.audio) {
            window.audio.pause();
            window.audio.currentTime = 0;
            window.audio = null;
        }
    }
    if (backButton) {
        backButton.addEventListener('click', () => {
            // removeAndResetConvertToAudioButton(); // This is handled by navigateToSubjects/Chapters
        });
    }

    async function fetchChapterContent(chapterName, chapterContent, subjectName) {
        cancelCurrentChapterFetch();
        cancelCurrentAudioFetch();
        cancelCurrentQuizFetch(); // Cancel quiz too

        const controller = new AbortController();
        currentChapterFetchAbortController = controller;
        const signal = controller.signal;

        try {
            // userLanguage and userData.mentalDisorder are now global from fetchInitialUserData
            const topicData = `${userLevel}:${chapterName}: ${chapterContent}`;

            const response = await fetch('https://study-gen-api-213051243033.asia-south2.run.app/generate-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topicData,
                    language: userLanguage,
                    mentalDisorder: userData.mentalDisorder,
                }),
                signal: signal
            });

            if (!response.ok) throw new Error('Network response was not ok for chapter content');
            const data = await response.json();
            displayChapterContent(data, chapterName, subjectName); // subjectName is passed for context
            loadingIndicator.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Update progress on our server AFTER content is successfully fetched and displayed
            await updateProgressOnServer(topicData, subjectName);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Chapter fetch aborted.');
            } else {
                loadingIndicator.style.display = 'none';
                errorMessage.style.display = 'block';
                errorText.textContent = i18n[userLanguage]?.['errorLoading'] || 'Error loading content.';
                console.error("Error in fetchChapterContent:", error);
            }
        } finally {
            if (currentChapterFetchAbortController === controller) {
                currentChapterFetchAbortController = null;
            }
        }
    }

    // handleAudioConversionSuccess, window.convertToAudio, window.playAudio remain largely the same
    // as they interact with external audio APIs, not our Firestore backend directly.
    // convertToAudio uses global `chapterTextContent` and `userLanguage`.
    function handleAudioConversionSuccess() { /* ... unchanged ... */
        const convertButton = document.getElementById('convert-to-audio');
        if (convertButton) {
            convertButton.textContent = i18n[userLanguage]?.['converted'] || 'Converted';
            convertButton.disabled = true;
        }
    }
    window.convertToAudio = async function () { /* ... unchanged, ensure userLanguage is correctly set globally ... */
        const convertButton = document.getElementById('convert-to-audio');
        const playButton = document.getElementById('play-audio');
        if (convertButton.disabled) return;

        cancelCurrentAudioFetch();
        const controller = new AbortController();
        currentAudioFetchAbortController = controller;
        const signal = controller.signal;

        convertButton.disabled = true;
        convertButton.textContent = i18n[userLanguage]?.['converting'] || 'Converting...';
        let apiEndpoint = 'https://audio-api-213051243033.asia-south2.run.app/generate_audio';
        if (['Swahili', 'Persian', 'Urdu', 'Croatian', 'Lithuanian', 'Estonian'].includes(userLanguage)) {
            apiEndpoint = 'https://secondary-audio-api-213051243033.asia-south2.run.app/generate_audio';
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ essay: chapterTextContent, language: userLanguage }),
                signal: signal
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            window.audioUrl = URL.createObjectURL(blob);
            window.audio = new Audio(window.audioUrl);
            window.audio.addEventListener('ended', () => {
                URL.revokeObjectURL(window.audioUrl);
                if(playButton) playButton.textContent = i18n[userLanguage]?.['play'] || 'Play';
            });
            playButton.style.display = 'block';
            playButton.textContent = i18n[userLanguage]?.['play'] || 'Play';
            handleAudioConversionSuccess();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Audio fetch aborted.');
            } else {
                console.error("Error converting text to speech:", error);
                convertButton.textContent = i18n[userLanguage]?.['conversionFailed'] || 'Conversion Failed';
                setTimeout(() => {
                    convertButton.textContent = i18n[userLanguage]?.['convertToAudio'] || 'Convert To Audio';
                    convertButton.disabled = false;
                }, 3000);
            }
        } finally {
            if (currentAudioFetchAbortController === controller) {
                currentAudioFetchAbortController = null;
            }
        }
    };
    window.playAudio = function() { /* ... unchanged, ensure i18n works ... */
        const playButton = document.getElementById('play-audio');
        if (window.audio) {
            if (window.audio.paused) {
                window.audio.play();
                playButton.textContent = i18n[userLanguage]?.['pause'] || 'Pause';
            } else {
                window.audio.pause();
                playButton.textContent = i18n[userLanguage]?.['play'] || 'Play';
            }
        }
    };

    let chapterTextContent = '';
    function displayChapterContent(data, chapterName, subjectName) { /* ... parsing logic unchanged ... */
        if (!contentTitle || !contentText) return;
        const chapterNameKey = chapterName; // Assuming chapterName is a direct key or needs mapping
        contentTitle.dataset.i18n = chapterNameKey;
        contentTitle.textContent = i18n[userLanguage]?.[chapterNameKey] || chapterName;
        contentText.innerHTML = '';
        chapterTextContent = '';
        let currentSectionElement = null;
        let isList = false;
        const cleanLine = (line) => line.replace(/^[\s*#-]+/g, '').trim().replace(/\*(.*?)\*/g, '<strong>$1</strong>');

        if (data && data.chapter) {
            const lines = data.chapter.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('## ')) {
                    appendCurrentSection(); currentSectionElement = createSection('chapter-section');
                    const heading = document.createElement('h2'); const cleaned = cleanLine(trimmedLine.substring(3));
                    heading.innerHTML = cleaned; currentSectionElement.appendChild(heading);
                    chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n\n'; isList = false;
                } else if (trimmedLine.startsWith('### ')) {
                    appendCurrentSection(); currentSectionElement = createSection('chapter-subsection');
                    const subheading = document.createElement('h3'); const cleaned = cleanLine(trimmedLine.substring(4));
                    subheading.innerHTML = cleaned; currentSectionElement.appendChild(subheading);
                    chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n\n'; isList = false;
                } else if (/^\d+\.\s+/.test(trimmedLine)) {
                    if (!isList || currentSectionElement?.tagName !== 'OL') { appendCurrentSection(); currentSectionElement = document.createElement('ol'); if (body.classList.contains('dark-mode')) currentSectionElement.classList.add('dark-mode'); isList = true; }
                    const listItem = document.createElement('li'); const cleaned = cleanLine(trimmedLine.substring(trimmedLine.indexOf('.') + 1));
                    listItem.innerHTML = cleaned; currentSectionElement.appendChild(listItem); chapterTextContent += `- ${cleaned.replace(/<[^>]+>/g, '')}\n`;
                } else if (/^[\*\-]\s+/.test(trimmedLine)) {
                    if (!isList || currentSectionElement?.tagName !== 'UL') { appendCurrentSection(); currentSectionElement = document.createElement('ul'); if (body.classList.contains('dark-mode')) currentSectionElement.classList.add('dark-mode'); isList = true; }
                    const listItem = document.createElement('li'); const cleaned = cleanLine(trimmedLine.substring(trimmedLine.indexOf(' ') + 1));
                    listItem.innerHTML = cleaned; currentSectionElement.appendChild(listItem); chapterTextContent += `- ${cleaned.replace(/<[^>]+>/g, '')}\n`;
                } else if (trimmedLine !== '') {
                    if (isList || !currentSectionElement || currentSectionElement.tagName === 'OL' || currentSectionElement.tagName === 'UL') { appendCurrentSection(); currentSectionElement = createSection('chapter-paragraph'); isList = false; }
                    const para = document.createElement('p'); const cleaned = cleanLine(trimmedLine);
                    para.innerHTML = cleaned; currentSectionElement.appendChild(para); chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n';
                }
            });
            appendCurrentSection();
        } else {
            contentText.innerHTML = `<p>${i18n[userLanguage]?.['emptyChapter'] || 'Chapter content is empty.'}</p>`;
        }
        function appendCurrentSection() { if (currentSectionElement) { contentText.appendChild(currentSectionElement); currentSectionElement = null; } }
        function createSection(className) { const section = document.createElement('div'); section.className = className; return section; }

        if (body.classList.contains('dark-mode')) {
            contentText.querySelectorAll('h2, h3, p, li, ul, ol').forEach(el => el.classList.add('dark-mode'));
        }
        // markChapterAsCompleted(chapterName, subjectName); // This is now implicitly handled by updateProgressOnServer

        const convertButton = document.getElementById('convert-to-audio');
        if (convertButton && chapterContentContainer.style.display === 'block') {
            convertButton.style.display = 'inline-flex'; convertButton.disabled = false;
            convertButton.textContent = i18n[userLanguage]?.['convertToAudio'] || 'Convert To Audio';
        } else if (convertButton) {
            convertButton.style.display = 'none';
        }
        const playButton = document.getElementById('play-audio');
        if (playButton) playButton.style.display = 'none';

        generateQuiz(chapterTextContent);
    }

    // generateQuiz, displayQuiz, gradeQuiz interact with external Quiz API and update points via our server
    async function generateQuiz(chapterTextContent) { /* ... unchanged, but ensure AbortController for quiz fetch works ... */
        cancelCurrentQuizFetch();
        const controller = new AbortController();
        currentQuizFetchAbortController = controller;
        const signal = controller.signal;

        const quizContainer = document.createElement('div');
        quizContainer.id = 'quiz-container';
        contentText.appendChild(quizContainer);
        quizContainer.innerHTML = `<p data-i18n="generatingQuiz">${i18n[userLanguage]?.['generatingQuiz'] || 'Generating quiz...'}</p>`;
        translatePage();

        try {
            const response = await fetch('https://quiz-api-213051243033.asia-south2.run.app/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterText: chapterTextContent }),
                signal: signal
            });
            if (!response.ok) {
                if (signal.aborted) { console.log('Quiz generation aborted by user.'); return; }
                throw new Error(`Quiz generation failed: ${response.status}`);
            }
            const data = await response.json();
            if (signal.aborted) { console.log('Quiz generation aborted before display.'); return; }
            displayQuiz(data.quiz);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Quiz fetch aborted.');
            } else {
                console.error("Error generating quiz:", error);
                if(quizContainer) quizContainer.innerHTML = `<p class="error-message">${i18n[userLanguage]?.['quizFail'] || 'Failed to generate quiz.'}</p>`;
                if (body.classList.contains('dark-mode') && quizContainer) {
                    quizContainer.querySelector('.error-message')?.classList.add('dark-mode');
                }
            }
        } finally {
            if (currentQuizFetchAbortController === controller) {
                currentQuizFetchAbortController = null;
            }
        }
    }
    function displayQuiz(quizData) { /* ... unchanged ... */
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;
        quizContainer.innerHTML = `<h2>${i18n[userLanguage]?.['quizTitle'] || 'Quiz'}</h2>`;
        const quizForm = document.createElement('form');
        quizContainer.appendChild(quizForm);
        quizData.forEach((questionData, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('quiz-question');
            questionDiv.innerHTML = `<p>${questionData.question}</p>`;
            const optionsList = document.createElement('ul');
            optionsList.classList.add('quiz-options');
            for (const optionKey in questionData.options) {
                const optionItem = document.createElement('li');
                optionItem.classList.add('quiz-option');
                const radioInput = document.createElement('input');
                radioInput.type = 'radio'; radioInput.name = `question-${index}`;
                radioInput.value = optionKey; radioInput.id = `option-${index}-${optionKey}`;
                const label = document.createElement('label');
                label.setAttribute('for', `option-${index}-${optionKey}`);
                label.textContent = `${questionData.options[optionKey]}`;
                optionItem.appendChild(radioInput); optionItem.appendChild(label);
                optionsList.appendChild(optionItem);
            }
            questionDiv.appendChild(optionsList);
            quizForm.appendChild(questionDiv);
        });
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = i18n[userLanguage]?.['submitQuiz'] || 'Submit Quiz';
        submitButton.id = 'quiz-submit-button';
        quizForm.appendChild(submitButton);
        quizForm.addEventListener('submit', (event) => {
            event.preventDefault();
            gradeQuiz(quizData);
        });
        if (body.classList.contains('dark-mode')) {
            quizContainer.querySelectorAll('h2, .quiz-question p, .quiz-options li, .quiz-option label, #quiz-submit-button')
                .forEach(el => el.classList.add('dark-mode'));
        }
    }
    async function gradeQuiz(quizData) { /* ... unchanged, but calls updatePointsOnServer ... */
        const quizContainer = document.getElementById('quiz-container');
        if (!quizContainer) return;
        const quizForm = quizContainer.querySelector('form');
        let score = 0;
        const questionElements = quizForm.querySelectorAll('.quiz-question');
        quizForm.querySelectorAll('input').forEach(input => input.disabled = true);
        quizForm.querySelector('button[type="submit"]').disabled = true;

        questionElements.forEach((questionElement, index) => {
            const selectedOption = questionElement.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption) {
                const userAnswer = selectedOption.value;
                const correctAnswer = quizData[index].answer;
                if (userAnswer === correctAnswer) {
                    score++; questionElement.classList.add('correct');
                } else {
                    questionElement.classList.add('incorrect');
                    const answerP = document.createElement('p');
                    answerP.classList.add('correct-answer');
                    answerP.textContent = `${i18n[userLanguage]?.['correctAnswer'] || 'Correct Answer'}: ${correctAnswer}`;
                    questionElement.appendChild(answerP);
                }
            } else {
                questionElement.classList.add('unanswered');
            }
        });
        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('quiz-feedback');
        feedbackDiv.textContent = `${i18n[userLanguage]?.['youScored'] || 'You scored'} ${score} / ${quizData.length}`;
        quizContainer.appendChild(feedbackDiv);
        if (body.classList.contains('dark-mode')) {
            feedbackDiv.classList.add('dark-mode');
            quizContainer.querySelectorAll('.correct-answer').forEach(el => el.classList.add('dark-mode'));
        }

        const newTotalPoints = totalPoints + (score * 2); // Award 2 points per correct answer
        await updatePointsOnServer(newTotalPoints); // Update server
        updateProgressDisplay(); // Update UI
    }


    // Time tracking
    function updateTotalTimeDisplay() { /* ... unchanged, uses global totalTimeSpent ... */
        const percentageElement = totalTimeCard.querySelector('.percentage');
        const progressBarInner = totalTimeCard.querySelector('.progress-bar-inner');
        const totalHours = Math.floor(totalTimeSpent / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalTimeSpent % (1000 * 60 * 60)) / (1000 * 60));
        let progressPercentage = Math.min(100, (totalHours / 10) * 100); // Cap at 100%
        if(progressBarInner) progressBarInner.style.width = `${progressPercentage}%`;

        if (percentageElement) {
            // Animation (optional, ensure it handles 0 values gracefully)
            let startValueH = 0, startValueM = 0;
            const duration = 1500;
            let animStartTime = performance.now();
            function updateCounter(currentTime) {
                const elapsedTime = currentTime - animStartTime;
                if (elapsedTime < duration) {
                    const progress = elapsedTime / duration;
                    const currentHours = Math.floor(totalHours * progress);
                    const currentMinutes = Math.floor(totalMinutes * progress);
                    percentageElement.textContent = `${currentHours} ${i18n[userLanguage]?.['hours'] || 'hours'} ${currentMinutes} ${i18n[userLanguage]?.['mins'] || 'mins'}`;
                    requestAnimationFrame(updateCounter);
                } else {
                    percentageElement.textContent = `${totalHours} ${i18n[userLanguage]?.['hours'] || 'hours'} ${totalMinutes} ${i18n[userLanguage]?.['mins'] || 'mins'}`;
                }
            }
            requestAnimationFrame(updateCounter);
        }
    }
    function updateSubjectTimeDisplay() { /* ... unchanged, uses global subjectTime ... */
        subjectTimeCard.innerHTML = '';
        subjects.forEach(subject => {
            const subjectTotalTimeMs = subjectTime[subject.id] || 0;
            const totalHours = Math.floor(subjectTotalTimeMs / (1000 * 60 * 60));
            const totalMinutes = Math.floor((subjectTotalTimeMs % (1000 * 60 * 60)) / (1000 * 60));
            const subjectDiv = document.createElement('div');
            subjectDiv.classList.add('subject-time');
            subjectDiv.innerHTML = `
                <div class="subject-time-header">
                    <span class="subject-icon">${subject.icon}</span>
                    <h3 data-i18n="${subject.name}">${i18n[userLanguage]?.[subject.name] || subject.name}</h3>
                </div>
                <p class="time-spent">${totalHours} ${i18n[userLanguage]?.['hours'] || 'hours'} ${totalMinutes} ${i18n[userLanguage]?.['mins'] || 'mins'}</p>`;
            subjectTimeCard.appendChild(subjectDiv);
        });
        if (body.classList.contains('dark-mode')) {
            subjectTimeCard.querySelectorAll('h3, .time-spent').forEach(el => el.classList.add('dark-mode'));
        }
    }

    // calculateTotalTime is called initially by main IIFE using global totalTimeSpent
    function calculateTotalTime() {
        updateTotalTimeDisplay();
        updateSubjectTimeDisplay();
    }

    async function syncTotalTimeWithServer() {
        if (!currentUserEmail) {
            console.error("syncTotalTimeWithServer: currentUserEmail is null.  Aborting loop.");
            return; //  Crucial: Stop looping if no user.
        }
    
        const currentTime = new Date();
        console.log(`syncTotalTimeWithServer: Running at ${currentTime.toLocaleTimeString()}`);
    
        try {
            // Your existing code for calculating and sending the time
            const sessionEndTime = Date.now();
            const sessionDuration = sessionEndTime - sessionStartTime;
            totalTimeSpent += sessionDuration;
    
            const response = await fetch(`${API_BASE_URL}/updateTotalTime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, totalTimeSpent: totalTimeSpent })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("syncTotalTimeWithServer: Error updating server. Status:", response.status, "Text:", errorText);
            } else {
                console.log("syncTotalTimeWithServer: Total time synced with server.");
            }
            updateTotalTimeDisplay();
            calculateTotalTime(); // Update UI
    
        } catch (error) {
            console.error("syncTotalTimeWithServer: Error in time synchronization:", error);
        } finally {
            sessionStartTime = Date.now(); // Reset session start time
            console.log("syncTotalTimeWithServer: sessionStartTime Reset at:", sessionStartTime);
        }
    
        // Schedule the next execution using setTimeout
        setTimeout(async () => {
            await syncTotalTimeWithServer();  // Recursive call
        }, 60000); // 60 seconds (1 minute)
    }
    let chapterStartTime = null;
    async function syncSubjectTimeWithServer(duration, subjectId) {
        if (!currentUserEmail || !subjectId || duration <=0) return;
        try {
            const response = await fetch(`${API_BASE_URL}/updateSubjectTime`, { // NEW SERVER ENDPOINT
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, subjectId: subjectId, duration: duration })
            });
            if (!response.ok) throw new Error("Failed to update subject time on server");

            // Update client-side subjectTime
            subjectTime[subjectId] = (subjectTime[subjectId] || 0) + duration;
            userData.subjectTime = subjectTime; // Keep global userData in sync
            console.log("Subject time synced for", subjectId);
            updateSubjectTimeDisplay(); // Update UI

        } catch (error) {
            console.error("Error syncing subject time with server:", error);
        }
    }

    function startSession() {
        if (sessionStartTime) return;
        console.log('Starting new session');
        sessionStartTime = Date.now();
        setInterval(syncTotalTimeWithServer, 60000); // Sync total time every minute
    }

    function startChapterTimer(subjectId) {
        if (!subjectId || chapterIntervalId) return;
        endChapterTimer(currentChapterSubjectId); // End previous if any

        console.log("Starting chapter timer for subject:", subjectId);
        currentChapterSubjectId = subjectId;
        chapterStartTime = Date.now();

        chapterIntervalId = setInterval(() => {
            if (chapterContentContainer.style.display === 'block' && chapterStartTime && currentChapterSubjectId) {
                const now = Date.now();
                const duration = now - chapterStartTime;
                chapterStartTime = now; // Reset for next interval
                if (duration > 0) {
                    syncSubjectTimeWithServer(duration, currentChapterSubjectId);
                }
            }
        }, 60000); // Sync chapter's subject time every minute
    }

    function endChapterTimer(subjectIdToEnd) {
        if (chapterIntervalId) {
            clearInterval(chapterIntervalId);
            chapterIntervalId = null;
        }
        if (chapterStartTime && subjectIdToEnd) {
            const finalDuration = Date.now() - chapterStartTime;
            if (finalDuration > 0) {
                syncSubjectTimeWithServer(finalDuration, subjectIdToEnd);
            }
        }
        chapterStartTime = null;
        // currentChapterSubjectId is reset when a new chapter starts or navigating away
    }


    function navigateToSubjects() {
        cancelCurrentChapterFetch(); cancelCurrentAudioFetch(); cancelCurrentQuizFetch();
        removeAndResetConvertToAudioButton();
        studyMenu.style.display = 'block';
        chaptersContainer.style.display = 'none';
        chapterContentContainer.style.display = 'none';
        backButtonContainer.style.display = 'none';
        contentText.innerHTML = '';
        if (currentChapterSubjectId) {
            endChapterTimer(currentChapterSubjectId);
            currentChapterSubjectId = null; // Clear it as we are leaving chapter context
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (studyMenu) {
            const firstItem = studyMenu.querySelector('.study-menu-item');
            if (firstItem) firstItem.focus();
        }
    }

    function navigateToChapters() {
        cancelCurrentChapterFetch(); cancelCurrentAudioFetch(); cancelCurrentQuizFetch();
        removeAndResetConvertToAudioButton();
        studyMenu.style.display = 'none';
        chaptersContainer.style.display = 'block';
        chapterContentContainer.style.display = 'none';
        backButtonContainer.style.display = 'flex';
        contentText.innerHTML = '';
        if (currentChapterSubjectId) {
            endChapterTimer(currentChapterSubjectId);
            // Don't nullify currentChapterSubjectId here, as we are still in "chapters of a subject" view
            // It will be ended/changed if a new chapter is selected or if navigating back to subjects.
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('convert-to-audio').style.display = 'none';
        if (chapterItems && chapterItems.length > 0) setChapterFocus(0);
    }

    function endSession() {
        if (sessionStartTime) { // If a session was active, sync one last time
            syncTotalTimeWithServer();
        }
        if (currentChapterSubjectId) { // If a chapter was active
            endChapterTimer(currentChapterSubjectId);
        }
        sessionStartTime = null;
        console.log('Ending session');
    }

    function handleBackButtonClick(event) {
        if (chapterContentContainer.style.display === 'block') {
            navigateToChapters();
        } else if (chaptersContainer.style.display === 'block') {
            navigateToSubjects();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    backButton.addEventListener('click', handleBackButtonClick);

    function renderSubjects() {
        studyMenu.innerHTML = '';
        subjects.forEach((subject) => {
            const listItem = document.createElement('li');
            listItem.classList.add('study-menu-item');
            listItem.setAttribute('tabindex', '0');
            listItem.innerHTML = `
                <div class="study-menu-item-image">${subject.icon}</div>
                <div class="study-menu-item-content">
                    <h3 data-i18n="${subject.name}">${i18n[userLanguage]?.[subject.name] || subject.name}</h3>
                </div>`;
            listItem.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                displayChapters(subject);
            });
            studyMenu.appendChild(listItem);
        });
        if (body.classList.contains('dark-mode')) {
            studyMenu.querySelectorAll('.study-menu-item, h3').forEach(el => el.classList.add('dark-mode'));
        }
        if (studyMenu && studyMenu.children.length > 0) {
            const firstItem = studyMenu.querySelector('.study-menu-item');
            if (firstItem) firstItem.focus();
        }
        translatePage();
    }
    renderSubjects(); // Initial render

    // translatePage function (assuming i18n object is globally available)
    function translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (i18n[userLanguage] && i18n[userLanguage][key]) {
                element.textContent = i18n[userLanguage][key];
            } else {
                // console.warn(`Translation key "${key}" not found for language "${userLanguage}"`);
            }
        });
        // Also re-translate dynamic parts if needed
        const levelText = document.getElementById('user-level-text');
        if (levelText && userLevel) {
            levelText.textContent = `${i18n[userLanguage]?.['level'] || 'Level'}: ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
        }
        const welcomeMsgSpan = welcomeMessage?.querySelector('span[data-i18n="welcomeBack"]');
        if (welcomeMsgSpan) welcomeMsgSpan.textContent = i18n[userLanguage]?.['welcomeBack'] || 'Welcome back,';

    }

    window.addEventListener('beforeunload', endSession);
    // window.addEventListener('unload', endSession); // 'unload' is less reliable

    logoutButton.addEventListener('click', async () => {
        endSession(); // Sync time before logging out

          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete('email'); //remove email parameter
          const newUrl = currentUrl.toString();
    
          // Replace the current URL in history without reloading the page
          window.history.replaceState({}, document.title, newUrl);
    
          // RELOAD THE SITE *AFTER* URL update
          window.location.reload();
    
          // 2. Navigate back in history
          window.history.back();
    
        
    
    });


    const friendSection = document.getElementById('friend');
    const friendChat = friendSection.querySelector('#friend-chat');
    const friendInput = friendSection.querySelector('#friend-input');
    const friendSend = friendSection.querySelector('#friend-send');
    const counsellorSection = document.getElementById('counsellor');
    const counsellorChat = counsellorSection.querySelector('#counsellor-chat');
    const counsellorInput = counsellorSection.querySelector('#counsellor-input');
    const counsellorSend = counsellorSection.querySelector('#counsellor-send');

    async function sendMessageToAI(message, chatArea, type) {
        if (!message || !currentUserEmail) return;

        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('chat-message', 'user-message');
        if (body.classList.contains('dark-mode')) userMessageDiv.classList.add('dark-mode');
        userMessageDiv.textContent = message;
        chatArea.appendChild(userMessageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;

        try {
            // The external friend-api should ideally fetch mentalDisorder and userLevel
            // server-side using Firebase Admin SDK if it needs them, based on the provided email.
            // Or, pass them from the global `userData` object if that API expects them.
            const response = await fetch("https://friend-api-213051243033.asia-south2.run.app/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: currentUserEmail,
                    message: message,
                    user_type: type,
                    mentalDisorder: userData.mentalDisorder, // from global userData
                    userLevel: userLevel // from global userLevel
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch AI response");

            let formattedResponse = data.response.replace(/### (.*)/g, '<br> $1').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.classList.add('chat-message', 'ai-message');
            if (body.classList.contains('dark-mode')) aiMessageDiv.classList.add('dark-mode');
            aiMessageDiv.innerHTML = formattedResponse;
            chatArea.appendChild(aiMessageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;

            const newTotalPoints = totalPoints + 1;
            await updatePointsOnServer(newTotalPoints); // Update points via our server
            updateProgressDisplay(); // Refresh UI

        } catch (error) {
            console.error("Failed to send AI Response:", error);
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.classList.add('chat-message', 'ai-message', 'error-message');
            if (body.classList.contains('dark-mode')) aiMessageDiv.classList.add('dark-mode');
            aiMessageDiv.textContent = i18n[userLanguage]?.['aiFail'] || 'Failed to fetch response.';
            chatArea.appendChild(aiMessageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    }

    friendSend.addEventListener('click', (e) => { /* ... unchanged ... */
        e.preventDefault(); const message = friendInput.value.trim();
        if (message) { sendMessageToAI(message, friendChat, 'friend'); friendInput.value = ''; }
    });
    counsellorSend.addEventListener('click', (e) => { /* ... unchanged ... */
        e.preventDefault(); const message = counsellorInput.value.trim();
        if (message) { sendMessageToAI(message, counsellorChat, 'counsellor'); counsellorInput.value = ''; }
    });
    friendInput.addEventListener('keydown', (e) => { /* ... unchanged ... */
        if (e.key === 'Enter') { e.preventDefault(); const message = friendInput.value.trim();
            if (message) { sendMessageToAI(message, friendChat, 'friend'); friendInput.value = ''; }
        }
    });
    counsellorInput.addEventListener('keydown', (e) => { /* ... unchanged ... */
        if (e.key === 'Enter') { e.preventDefault(); const message = counsellorInput.value.trim();
            if (message) { sendMessageToAI(message, counsellorChat, 'counsellor'); counsellorInput.value = ''; }
        }
    });

    const helpSection = document.getElementById('help');
    const sosButton = document.getElementById('sosButton');
    const sosOverlay = document.getElementById('sosOverlay');
    // const cancelSosButton = document.getElementById('cancelSosButton'); // This is created dynamically

    sosButton.addEventListener('click', () => {
        sosOverlay.style.display = 'block';
        sosOverlay.innerHTML = `<button id="cancelSosButton" data-i18n="turnOffSos">${i18n[userLanguage]?.['turnOffSos'] || 'Turn Off SOS'}</button>`;
        if (body.classList.contains('dark-mode')) {
            sosOverlay.querySelector('#cancelSosButton')?.classList.add('dark-mode');
        }
    });
    sosOverlay.addEventListener('click', (event) => {
        if (event.target.id === "cancelSosButton" || event.target.id === "sosOverlay") {
            sosOverlay.style.display = 'none'; sosOverlay.innerHTML = '';
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sosOverlay.style.display === 'block') {
            sosOverlay.style.display = 'none'; sosOverlay.innerHTML = '';
        }
    });

    const enableActionsButton = document.getElementById('enableActions');
    enableActionsButton.addEventListener('click', () => {
        enableActionsButton.textContent = i18n[userLanguage]?.['actionsEnabled'] || 'Actions Enabled';
        enableActionsButton.disabled = true;
    });

    function setChapterFocus(index) { /* ... unchanged ... */
        if (chapterItems && chapterItems.length > 0) {
            chapterItems.forEach(item => item.classList.remove('focused'));
            let itemToFocus;
            if (typeof index === 'number' && index >= 0 && index < chapterItems.length) {
                itemToFocus = chapterItems[index];
            } else if (index === 'last') {
                itemToFocus = chapterItems[chapterItems.length - 1];
            }
            if (itemToFocus) {
                itemToFocus.classList.add('focused'); itemToFocus.focus();
                chaptersContainer.scrollTo({ top: itemToFocus.offsetTop - chaptersContainer.offsetTop, behavior: 'smooth' });
            }
        }
    }
    let chapterItems = []; // Initialized when chapters are displayed
});
