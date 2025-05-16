document.addEventListener('DOMContentLoaded', () => {

    // Use onAuthStateChanged to wait for Firebase Auth initialization
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in. Now check their Firestore document.
            console.log("User is signed in, checking type for:", user.email);
    
            db.collection('users').doc(user.email).get()
                .then((doc) => {
                    // This block executes when the Firestore 'get()' operation successfully completes.
                    if (doc.exists) {
                        const userData = doc.data();
                        const userType = userData.userType;
                        console.log("User type found in Firestore:", userType); // Log the actual type
    
                        // --- Strict Comparison ---
                        const requiredType = "For People with Motor Abilities";
    
                        if (userType !== requiredType) {
                            console.log(`User type "${userType}" does not match required "${requiredType}". Redirecting.`);
                            window.location.href = 'index.html';
                        } else {
                            console.log("User type is correct. Allowing access.");
                            // User type is correct, allow the page to load/continue
                            // Place your logic here to hide loading screens or show the main content
                            // Example:
                            // document.getElementById('loading-screen')?.classList.add('hidden');
                            // document.querySelector('.container')?.style.display = 'flex';
                        }
                    } else {
                        // User is authenticated, but no document found in Firestore
                        console.log("Firestore document not found for email:", user.email, ". Redirecting.");
                        window.location.href = 'index.html';
                    }
                })
                .catch((error) => {
                    // This block executes if there was an error fetching the Firestore document.
                    console.error("Error getting user document:", error);
                    // Redirect even if there's an error during the check
                    window.location.href = 'index.html';
                });
    
        } else {
            // User is signed out
            console.log("No user signed in. Redirecting.");
            window.location.href = 'index.html';
        }
    });
    
    // IMPORTANT: Do NOT define or call a separate checkUserTypeAndRedirect() function.
    // The entire logic is now handled within the onAuthStateChanged listener callback.
        
        const menu = document.querySelector('.menu');
        const menuItems = Array.from(menu.querySelectorAll('.menu-item'));
        const logoutButton = document.getElementById('logout-button');
        const contentSections = document.querySelectorAll('main.content > section');
        let currentToolbarItem = 0;
      
        menuItems[currentToolbarItem].classList.add('active');
        contentSections[currentToolbarItem].style.display = 'block';
    
    
      // --- ABORT CONTROLLER VARIABLES ---
      let currentChapterFetchAbortController = null; // To manage ongoing chapter fetch requests
      let currentAudioFetchAbortController = null; // To manage ongoing audio fetch requests
      let currentQuizFetchAbortController = null; // To manage ongoing quiz fetch requests // <<< ADDED
      // --- END ABORT CONTROLLER VARIABLES ---
    
    
        // Modify the main auth check:
        (async function() {
            const user = await waitForFirebase();
            if (!user) {
                window.location.href = 'index.html';
                return; // Stop further execution if redirected
            } else {
                 // The initial check is now done in the onAuthStateChanged listener above.
                 // You can remove or adjust this part if the onAuthStateChanged check is sufficient.
                // await checkUserTypeAndRedirect(); // Potentially redundant if handled by listener
                await fetchUserLevel();
                // ... existing code ...
                checkAndShowPlacementTest(user);
                 // Fetch user data and initialize display after auth check
                 fetchAndDisplayUserName();
                 fetchDarkModePreference();
                 calculateTotalTime();
                 startSession(); // Start session tracking
            }
        })();
      
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
        
                // Scroll to the top smoothly when any toolbar button is clicked
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        
            item.addEventListener('focus', () => {
                setActiveItem(index);
        
                // Scroll to the top smoothly when focused
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
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
    
        const toolbarContainer = document.querySelector('.toolbar-container'); // Get the toolbar container
    
        // Prevent scrolling of the main content when the mouse is over the toolbar.
        toolbarContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Optionally, allow the toolbar itself to scroll if it has overflow:
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
      
       async function updateDarkModePreference(isDarkMode) {
           try {
                const user = firebase.auth().currentUser;
               if (user) {
                   await db.collection('users').doc(user.email).update({
                        darkMode: isDarkMode,
                    });
               }
          } catch (error) {
                console.error("Error updating dark mode preference in Firestore:", error);
            }
        }
      
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        });
      
       async function fetchDarkModePreference() {
            try {
                const user = firebase.auth().currentUser;
               if (user) {
                     const doc = await db.collection('users').doc(user.email).get();
                    if (doc.exists && doc.data().darkMode) {
                        darkModeToggle.checked = doc.data().darkMode;
                          if(doc.data().darkMode)
                            enableDarkMode();
                        else
                            disableDarkMode()
                   }
               }
           } catch (error) {
                console.error("Error fetching dark mode preference from Firestore:", error);
           }
        }
      
        // Add after Firebase initialization
      async function checkAndShowPlacementTest(user) {
        const doc = await db.collection('users').doc(user.email).get();
        if (!doc.exists || !doc.data().hasTakenTest) {
            showPlacementTest();
        }
      }
      
      function showPlacementTest() {
        const modal = document.getElementById('placementTestModal');
        modal.style.display = 'block';
        translatePage(); // Ensure test uses current language
      }
      
      // Add form submission handler
      document.getElementById('placementTestForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            q1: document.querySelector('input[name="q1"]:checked')?.value,
            q2: document.querySelector('input[name="q2"]:checked')?.value,
            q3: document.querySelector('input[name="q3"]:checked')?.value,
            q4: document.querySelector('input[name="q4"]:checked')?.value,
            q5: document.querySelector('input[name="q5"]:checked')?.value,
            q6: document.querySelector('input[name="q6"]:checked')?.value,
            q7: document.querySelector('input[name="q7"]:checked')?.value,
            q8: document.querySelector('input[name="q8"]:checked')?.value,
            q9: document.querySelector('input[name="q9"]:checked')?.value,
            q10: document.querySelector('input[name="q10"]:checked')?.value,
            q11: document.querySelector('input[name="q11"]:checked')?.value,
            q12: document.querySelector('input[name="q12"]:checked')?.value,
            q13: document.querySelector('input[name="q13"]:checked')?.value,
            q14: document.querySelector('input[name="q14"]:checked')?.value,
            q15: document.querySelector('input[name="q15"]:checked')?.value,
            q16: document.querySelector('input[name="q16"]:checked')?.value,
            q17: document.querySelector('input[name="q17"]:checked')?.value,
            q18: document.querySelector('input[name="q18"]:checked')?.value,
            userId: firebase.auth().currentUser.uid
        };
      
        try {
            // Send to server
            const response = await fetch('https://test-eval-api-213051243033.asia-south2.run.app/evaluate-test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
      
            if (response.ok) {
                const data = await response.json();
    
                // Update Firestore with hasTakenTest and category
                 if (data && data.category) {
                     await db.collection('users').doc(firebase.auth().currentUser.email).update({
                       hasTakenTest: true,
                        testCategory: data.category
                     });
                      userLevel = data.category; // Update userLevel
                    localStorage.setItem('userLevel', userLevel);
    
                    const levelText = document.getElementById('user-level-text');
                    if (levelText) {
                            levelText.textContent = `${i18n[userLanguage]['level']}: 
                               ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
                    }
    
                     document.getElementById('placementTestModal').style.display = 'none';
    
                  } else {
                    await db.collection('users').doc(firebase.auth().currentUser.email).update({
                         hasTakenTest: true,
                      });
                    document.getElementById('placementTestModal').style.display = 'none';
                  }
    
            }
        } catch (error) {
            console.error('Test submission failed:', error);
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
        const pointsCard = document.querySelector('#home .last-chapter-card'); // Reusing the HTML card for points
        const totalTimeCard = document.getElementById('total-time-card');
        const welcomeMessage = document.getElementById('welcome-message');
        const profileDetails = document.getElementById('profile-details');
        const subjectTimeCard = document.getElementById('subject-time-card')
      
        let completedChapters = {};
        let totalPoints = 0;
        let totalTimeSpent = 0;
        let startTime = 0;
        let sessionStartTime = null;
        let userLanguage = 'English';
         let subjectTime = {};
         let chapterIntervalId = null; // Store the interval ID
          let currentChapterSubjectId = null; //Store current subject id of chapter
      
      
          const subjects = [
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
      
    let userLevel = null; // Default level
    
    
    async function fetchUserLevel() {
        try {
           const user = firebase.auth().currentUser;
            if (user) {
                const doc = await db.collection('users').doc(user.email).get();
                if (doc.exists) {
                    userLevel = (doc.data().testCategory || 'beginner').toLowerCase();
                   localStorage.setItem('userLevel', userLevel); //Store in local storage as well
                   // Update user level on page load
    
                 const levelText = document.getElementById('user-level-text');
                   if(levelText){
                     levelText.textContent = i18n[userLanguage]['level'] +`: ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}`;
                   }
                }
           }
        } catch (error) {
            console.error("Error fetching user level:", error);
        }
    }
    
    // Function to get the correct chapter key (including user level)
    function getChapterKey(chapterName) {
        return `${userLevel}/${chapterName}`;
    }
    
    function calculateSubjectProgress(subjectId, currentCompletedChapters) {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return 0;
    
        const levelChapters = subject.chapters[userLevel];
        if (!levelChapters) return 0;
    
        const completedCount = Object.keys(currentCompletedChapters)
            .filter(key => {
                // Safe split: find first two colons
                const firstColon = key.indexOf(':');
                const secondColon = key.indexOf(':', firstColon + 1);
                if (firstColon === -1 || secondColon === -1) return false;
    
                const storedLevel = key.substring(0, firstColon);
                const chapterName = key.substring(firstColon + 1, secondColon);
                const chapterContent = key.substring(secondColon + 1);
    
                return (
                    storedLevel.trim() === userLevel.trim() &&
                    levelChapters.some(chapter =>
                        chapter.name.trim() === chapterName.trim() &&
                        chapter.content.trim() === chapterContent.trim()
                    )
                );
            })
            .length;
    
        return levelChapters.length > 0
            ? Math.round((completedCount / levelChapters.length) * 100)
            : 0;
    }
    
    async function fetchAndDisplayUserName() {
        try {
            const user = await waitForFirebase();
             if (user) {
                 const doc = await db.collection('users').doc(user.email).get();
                  if (doc.exists) {
                      const userData = doc.data();
                     const nameElement = profileDetails.querySelector('p:first-child strong');
                      if (nameElement) {
                            const name = nameElement.parentElement.textContent.split(':')[1].trim();
                             welcomeMessage.innerHTML = `<span data-i18n="welcomeBack">Welcome back,</span> ${name}!`;
                        }
                         // Fetch completed chapters from Firestore
                         completedChapters = userData.progress || {};
                
                         // Fetch total time spent from Firestore and store it in variable totalTimeSpent
                          if (userData.totaltimespent) {
                               totalTimeSpent = userData.totaltimespent;
                          }
                          // Fetch total points from Firestore
                          if(userData.totalPoints){
                            totalPoints = userData.totalPoints;
                          }
                 
                         //Fetch time per subject from firestore
                          subjectTime = userData.subjectTime || {};
                 
                         // Set language from database
                          userLanguage = userData.language || 'en';
                         translatePage();
                         profileDetails.innerHTML = `
                              <p><strong data-i18n="name">Name:</strong> ${userData.name}</p>
                               <p><strong data-i18n="email">Email:</strong> ${userData.email}</p>
                               <p><strong data-i18n="language">Language:</strong> ${userData.language}</p>
                               <p><strong data-i18n="language">Level:</strong> ${userData.testCategory}</p>
                        `;
                 
                         //Calculate points based on completed chapters
                       //  totalPoints =  Object.keys(completedChapters).length * 10;
                 
                         updateProgressDisplay();
                             // Update user level display when the page loads
                         
                         const userLevelLS = localStorage.getItem('userLevel');
                         const levelText = document.getElementById('user-level-text');
                         if(levelText && userLevelLS) {
                            const level = userLevelLS;
                              levelText.textContent = i18n[userLanguage]['level'] +`: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
                         }
    
    
                    }
             }
        }
        catch (error) {
             console.error("Error fetching user data:", error);
         }
    }
    
    function updateProgressDisplay() {
        const pointsHeading = pointsCard.querySelector('h2');
        const courseProgressHeading = progressCard.querySelector('h2');
    
        if (pointsHeading) {
            pointsHeading.textContent = i18n[userLanguage]['totalPoints'];
        }
        if (courseProgressHeading) {
            courseProgressHeading.textContent = i18n[userLanguage]['courseProgress'];
        }
    
        progressCard.innerHTML = ``;
        let allSubjectsCompleted = true;
        subjects.forEach(subject => {
            const progressPercent = calculateSubjectProgress(subject.id, completedChapters);
            const subjectDiv = document.createElement('div');
            subjectDiv.classList.add('subject-progress');
            subjectDiv.innerHTML = `
                <div class="subject-progress-header">
                    <span class="subject-icon">${subject.icon}</span>
                    <h3 data-i18n="${subject.name}">${i18n[userLanguage][subject.name]}</h3>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-inner" style="width: ${progressPercent}%"></div>
                    <span class="percentage">${progressPercent}%</span>
                </div>
            `;
            progressCard.appendChild(subjectDiv);
    
            if (progressPercent < 100) {
                allSubjectsCompleted = false;
            }
        });
        if (allSubjectsCompleted) {
            updateUserLevelAndResetProgress(); // Call new function
        }
    
            // --- Update Total Points Card ---
            if (pointsCard) {
                pointsCard.innerHTML = `
                    <h2 data-i18n="totalPoints">${i18n[userLanguage]?.['totalPoints'] || 'Total Points'}</h2>
                    <p>${totalPoints} <span data-i18n="points">${i18n[userLanguage]?.['points'] || 'Points'}</span></p>
                     <div class="token-container">
                        <div class="token"></div>
                     </div>
              `;
                // Apply dark mode if needed
                if (body.classList.contains('dark-mode')) {
                    pointsCard.classList.add('dark-mode');
                    pointsCard.querySelector('h2')?.classList.add('dark-mode');
                    pointsCard.querySelector('p')?.classList.add('dark-mode');
                }
    
                // Add token animation logic here if desired
                const token = pointsCard.querySelector('.token');
                if (token) {
                    // Optional: Re-trigger animation if needed, e.g., by removing/adding class
                    token.style.animation = 'none'; // Reset animation
                    requestAnimationFrame(() => { // Force reflow
                        token.style.animation = ''; // Re-apply default animation
                    });
                }
               pointsCard.style.display = "block";
           } else {
                console.warn("Points card element not found.");
           }
    
           updateTotalTimeDisplay(); // Update time card
           updateSubjectTimeDisplay(); // Update subject time card
            // Ensure new elements are translated
       }
    async function updateUserLevelAndResetProgress() {
        await updateUserLevel(); // First update the level
    
        const user = firebase.auth().currentUser;
        if (user) {
            try {
                await db.collection('users').doc(user.email).update({
                    progress: {},
                });
                completedChapters = {}; // Reset completed chapters
                // totalPoints = 0; // Do not reset total points
    
                // Update the user level display after level update and progress reset
                const levelText = document.getElementById('user-level-text');
                if (levelText) {
                   const level = localStorage.getItem('userLevel')
                   if (level)
                      levelText.textContent = i18n[userLanguage]['level'] +`: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
                 }
                updateProgressDisplay(); // Refresh progress display
               log("User progress reset after level up");
            } catch (error) {
                console.error("Error resetting user progress in Firestore:", error);
            }
        }
    }
    
    async function updateProgress(topicData, subjectName) {
        const user = firebase.auth().currentUser;
        if (user) {
          try {
            const doc = await db.collection('users').doc(user.email).get();
            if (doc.exists) {
              const userData = doc.data();
              const currentProgress = userData.progress || {};
      
              console.log('Current Progress:', currentProgress); // <-- Add this
              console.log('Trying to add topicData:', topicData); // <-- Add this
              
              if (!currentProgress[topicData]) { 
                currentProgress[topicData] = subjectName;
      
                completedChapters = currentProgress;
      
                await db.collection('users').doc(user.email).update({
                  progress: currentProgress,
                });
                
                totalPoints = totalPoints + 10;
                await updatePointsInFirestore(totalPoints);
                updateProgressDisplay();
              }
            }
          } catch (error) {
            console.error("Error updating progress in Firestore:", error);
          }
        }
      }
      
    
    async function updatePointsInFirestore(totalPoints){
           const user = firebase.auth().currentUser;
           if (user) {
               try {
                    await db.collection('users').doc(user.email).update({
                          totalPoints: totalPoints
                      });
               }
               catch(error){
                  console.error("Error updating total points:", error)
               }
           }
    }
    // Call markChapterAsCompleted after content is loaded
    function markChapterAsCompleted(chapterName, subjectName) {
        // Add level to chapter name for unique tracking
        const chapterKey = getChapterKey(chapterName);

    }
    
    
    // Call fetchAndDisplayUserName after data from firebase is loaded
    (async function () {
        await fetchAndDisplayUserName()
        await fetchDarkModePreference();
        calculateTotalTime()
     })();
    
    
    
    function displayChapters(subject) {
      console.log("Displaying chapters for subject:", subject, "and userLevel:", userLevel);
      const levelHeading = document.createElement('h2');
      levelHeading.textContent = `${userLevel.toUpperCase()} LEVEL`;
      chaptersContainer.appendChild(levelHeading);
      studyMenu.style.display = 'none';
      chaptersContainer.style.display = 'block';
      chapterContentContainer.style.display = 'none';
      backButtonContainer.style.display = 'flex';
      chaptersContainer.innerHTML = '';
      document.getElementById('convert-to-audio').style.display = 'none';
    
      if (!subject || !subject.chapters) {
        console.error("Error: Subject or subject chapters are undefined:", subject);
        return;
      }
    
      const lowerCaseUserLevel = userLevel.toLowerCase(); // Convert userLevel to lowercase
      const levelChapters = subject.chapters[lowerCaseUserLevel]; // Access with lowercase key
    
      if (!levelChapters) {
        console.error(`Error: No chapters found for level: ${lowerCaseUserLevel} in subject:`, subject);
        console.log("Available levels for this subject:", Object.keys(subject.chapters)); // Log available levels
        return;
      }
    
      if (!Array.isArray(levelChapters)) {
        console.error(`Error: levelChapters is not an array: `, levelChapters);
        return;
      }
    
      levelChapters.forEach((chapter, index) => {
        const chapterButton = document.createElement('div');
        chapterButton.classList.add('chapter-button');
        chapterButton.setAttribute('tabindex', '0');
        chapterButton.innerHTML = `
          <div class="chapter-button-image">
            ${chapter.icon}
          </div>
          <div class="chapter-button-content">
            <h3 data-i18n="${chapter.name}">${i18n[userLanguage][chapter.name]}</h3>
            <p data-i18n="${chapter.content}">${i18n[userLanguage][chapter.content]}</h3>
          </div>
        `;
    
        chapterButton.addEventListener('click', () => {
            displayChapterView(chapter.name, chapter.content, subject.name);
          });
          
        chaptersContainer.appendChild(chapterButton);
      });
      chapterItems = chaptersContainer.querySelectorAll('.chapter-button');
    }
    
        function displayChapterView(chapterName, chapterContent, subjectName) {
            studyMenu.style.display = 'none';
            chaptersContainer.style.display = 'none';
            chapterContentContainer.style.display = 'block';
            backButtonContainer.style.display = 'flex';
    
             // Clear the content before loading new content
             contentTitle.textContent = ''; // Clear the title
             contentText.innerHTML = '';   // Clear the content
    
    
             loadingIndicator.style.display = 'block';
            errorMessage.style.display = 'none';
             fetchChapterContent(chapterName, chapterContent, subjectName);
             
               // Start subject timer
             let currentSubjectId = null;
             for (const subject of subjects) {
                if (subject.chapters[userLevel].some(chapter => chapter.name === chapterName)) {
                    currentSubjectId = subject.id;
                    break;
                }
             }
          startChapterTimer(currentSubjectId); // Start chapter timer on load
             localStorage.setItem('lastCompletedChapter', chapterName);
              setChapterFocus(0);
        }
    
         // --- Helper function to cancel pending chapter fetch ---
         function cancelCurrentChapterFetch() {
            if (currentChapterFetchAbortController) {
                console.log("Aborting previous chapter fetch request.");
                currentChapterFetchAbortController.abort();
                currentChapterFetchAbortController = null; // Clear the controller reference
            }
         }
         // --- End Helper function ---
    
         // --- Helper function to cancel pending audio fetch ---
         function cancelCurrentAudioFetch() {
            if (currentAudioFetchAbortController) {
                console.log("Aborting previous audio fetch request.");
                currentAudioFetchAbortController.abort();
                currentAudioFetchAbortController = null; // Clear the controller reference
                // Also reset the button state if a conversion was ongoing
                removeAndResetConvertToAudioButton();
            }
         }
              // --- Helper function to cancel pending quiz fetch --- <<< ADDED START
     function cancelCurrentQuizFetch() {
        if (currentQuizFetchAbortController) {
            console.log("Aborting previous quiz fetch request.");
            currentQuizFetchAbortController.abort();
            currentQuizFetchAbortController = null; // Clear the controller reference

            // Also remove the "Generating quiz..." message or container if it exists
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer && quizContainer.innerHTML.includes('Generating quiz...')) {
                 // Optionally, you could just clear the message:
                 // quizContainer.innerHTML = '';
                 // Or remove the container entirely if cancellation happens:
                 quizContainer.remove();
                 console.log("Removed quiz container due to cancellation.");
            }
        }
     }
         // --- End Helper function ---
    
    
        function removeAndResetConvertToAudioButton() {
          const convertButton = document.getElementById('convert-to-audio');
          const playButton = document.getElementById('play-audio');
      
          if (convertButton) {
              convertButton.disabled = false; // Enable it, in case it's disabled
              convertButton.textContent = 'Convert To Audio'; // Reset the text
              convertButton.style.display = 'none'; // Hide it from the page
          }
      
          if (playButton) {
              playButton.style.display = 'none'; // Hide the Play button
          }
      
          // Delete the received audio file
          if (window.audioUrl) {
              URL.revokeObjectURL(window.audioUrl); // Revoke the object URL to release memory
              window.audioUrl = null;
          }
      
          if (window.audio) {
              window.audio.pause(); // Stop any playing audio
              window.audio.currentTime = 0; // Reset playback position
              window.audio = null;
          }
      }
      
      // Ensure the back button triggers this function
      if (backButton) {
          backButton.addEventListener('click', () => {
              removeAndResetConvertToAudioButton();
          });
      } else {
          console.warn("Back button element not found. Ensure the global 'backButton' variable is correctly assigned.");
      }
      
    
    
      async function fetchChapterContent(chapterName, chapterContent, subjectName) {
          // --- ABORT CONTROLLER LOGIC (START) ---
          // Abort any previous chapter request if it's still pending
          cancelCurrentChapterFetch();
          // Also abort any pending audio request just in case
          cancelCurrentAudioFetch();
    
    
          // Create a new AbortController for this specific chapter request
          const controller = new AbortController();
          currentChapterFetchAbortController = controller; // Store the new controller
          const signal = controller.signal;
          // --- ABORT CONTROLLER LOGIC (END) ---
    
          try {
              const user = firebase.auth().currentUser;
              if (!user) {
                 console.error("User not authenticated.");
                 loadingIndicator.style.display = 'none';
                 errorMessage.style.display = 'block';
                 errorText.textContent = i18n[userLanguage]['errorLoading'];
                 return;
              }
    
              const doc = await db.collection('users').doc(user.email).get();
              if (!doc.exists) {
                 console.error("User document not found for:", user.email);
                 loadingIndicator.style.display = 'none';
                 errorMessage.style.display = 'block';
                 errorText.textContent = i18n[userLanguage]['errorLoading'];
                 return;
              }
    
              const userData = doc.data();
              userLanguage = userData.language || 'English';
              const mentalDisorder = userData.mentalDisorder || 'Perfectly Fine'; // Assuming default
    
              // Find the subject
              const subject = subjects.find(s => s.name === subjectName);
              if (!subject) {
                  console.error(`Subject ${subjectName} not found`);
                  loadingIndicator.style.display = 'none';
                  errorMessage.style.display = 'block';
                  errorText.textContent = i18n[userLanguage]['errorLoading'];
                  return;
              }
      
              // Find the chapter within the subject and user level
              const lowerCaseUserLevel = userLevel.toLowerCase(); //ensure level is lower case
              const levelChapters = subject.chapters[lowerCaseUserLevel];
              if (!levelChapters) {
                  console.error(`No chapters found for level: ${userLevel} in subject: ${subjectName}`);
                  loadingIndicator.style.display = 'none';
                  errorMessage.style.display = 'block';
                  errorText.textContent = i18n[userLanguage]['errorLoading'];
                  return;
              }
      
              const chapter = levelChapters.find(c => 
                c.name === chapterName && c.content === chapterContent
              );
          
              if (!chapter) {
                console.error(`Chapter not found for ${chapterName} and ${chapterContent}`);
                loadingIndicator.style.display = 'none';
                errorMessage.style.display = 'block';
                errorText.textContent = i18n[userLanguage]['errorLoading'];
                return;
              }
          
              const topicData = `${userLevel}:${chapter.name}: ${chapter.content}`; 

              const response = await fetch('https://study-gen-api-213051243033.asia-south2.run.app/generate-chapter', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      topic: topicData,  // Send the combined data
                      language: userLanguage,
                      mentalDisorder: mentalDisorder,
                  }),
                  signal: signal // --- ABORT CONTROLLER LOGIC: Pass the signal ---
              });
      
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              const data = await response.json();
              displayChapterContent(data, chapterName, subjectName);
              loadingIndicator.style.display = 'none';
               // Scroll to the top smoothly after content is displayed
              window.scrollTo({ top: 0, behavior: 'smooth' });
              updateProgress(topicData, subjectName)
    
          } catch (error) {
               // --- ABORT CONTROLLER LOGIC: Handle AbortError ---
               if (error.name === 'AbortError') {
                    console.log('Chapter fetch aborted by user navigation.');
                    // Do nothing, as the navigation has already happened
                    // Ensure loading state is cleared if aborted before completion
                    loadingIndicator.style.display = 'none';
               } else {
               // --- End ABORT CONTROLLER LOGIC ---
                   loadingIndicator.style.display = 'none';
                   errorMessage.style.display = 'block';
                   errorText.textContent = i18n[userLanguage]['errorLoading'];
                   console.error("Error in fetchChapterContent:", error);
               }
          } finally {
               // --- ABORT CONTROLLER LOGIC: Clear controller after fetch settles ---
               if (currentChapterFetchAbortController === controller) { // Only clear if this is still the current controller
                   currentChapterFetchAbortController = null;
               }
               // --- End ABORT CONTROLLER LOGIC ---
          }
      }    
    
    
    
      function handleAudioConversionSuccess() {
        const convertButton = document.getElementById('convert-to-audio');
    
        if (convertButton) {
            convertButton.textContent = 'Converted'; // Change text
            convertButton.disabled = true; // Make it unclickable
        }
    }
    
    // Modify the existing function to call handleAudioConversionSuccess() after audio is received
    window.convertToAudio = async function () {
      const convertButton = document.getElementById('convert-to-audio');
      const playButton = document.getElementById('play-audio');
    
      if (convertButton.disabled) return;
    
      // --- ABORT CONTROLLER LOGIC (START) ---
      // Abort any previous audio request if it's still pending
      cancelCurrentAudioFetch();
    
      // Create a new AbortController for this specific audio request
      const controller = new AbortController();
      currentAudioFetchAbortController = controller; // Store the new controller
      const signal = controller.signal;
      // --- ABORT CONTROLLER LOGIC (END) ---
    
    
      convertButton.disabled = true;
      convertButton.textContent = 'Converting...';
    
      let apiEndpoint = 'https://audio-api-213051243033.asia-south2.run.app/generate_audio';
    
      // Note: This language-based endpoint selection logic needs to be consistent
      // with where the actual APIs are deployed. This part wasn't changed,
      // assuming it was working correctly before adding AbortController.
      if (
        userLanguage === 'Swahili' ||
        userLanguage === 'Persian' ||
        userLanguage === 'Urdu' ||
        userLanguage === 'Croatian' ||
        userLanguage === 'Lithuanian' ||
        userLanguage === 'Estonian'
      ) {
        apiEndpoint = 'https://secondary-audio-api-213051243033.asia-south2.run.app/generate_audio'; // Replace with your alternative API URL
      }
    
      try {
          const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ essay: chapterTextContent, language: userLanguage }),
              signal: signal // --- ABORT CONTROLLER LOGIC: Pass the signal ---
          });
    
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
          const blob = await response.blob();
          window.audioUrl = URL.createObjectURL(blob);
          window.audio = new Audio(window.audioUrl);
    
          // Event listener for cleaning up audio URL after playing
          window.audio.addEventListener('ended', () => {
              URL.revokeObjectURL(window.audioUrl); // Clean up
               // Optionally reset the play button text after audio finishes
               const playBtn = document.getElementById('play-audio');
               if(playBtn) playBtn.textContent = i18n[userLanguage]?.['play'] || 'Play'; // Reset text to translated value
          });
    
          playButton.style.display = 'block';
          playButton.textContent = i18n[userLanguage]?.['play'] || 'Play'; // Ensure it says Play (translated) initially
          handleAudioConversionSuccess(); // Change convert button text and disable it
    
      } catch (error) {
           // --- ABORT CONTROLLER LOGIC: Handle AbortError ---
           if (error.name === 'AbortError') {
                console.log('Audio fetch aborted.');
                // The `removeAndResetConvertToAudioButton` called by `cancelCurrentAudioFetch`
                // already handles button reset, so nothing more needed here for AbortError.
           } else {
           // --- End ABORT CONTROLLER LOGIC ---
               console.error("Error converting text to speech:", error);
               convertButton.textContent = i18n[userLanguage]?.['conversionFailed'] || 'Conversion Failed'; // Use translated error
               setTimeout(() => {
                   convertButton.textContent = i18n[userLanguage]?.['convertToAudio'] || 'Convert To Audio'; // Reset text to translated value
                   convertButton.disabled = false;
               }, 3000);
           }
      } finally {
           // --- ABORT CONTROLLER LOGIC: Clear controller after fetch settles ---
           if (currentAudioFetchAbortController === controller) { // Only clear if this is still the current controller
               currentAudioFetchAbortController = null;
           }
           // --- End ABORT CONTROLLER LOGIC ---
      }
    };
    
    window.playAudio = function() {
      const playButton = document.getElementById('play-audio');
      if (window.audio) { // Correctly access the global audio
          if (window.audio.paused) {
              window.audio.play();
              playButton.textContent = i18n[userLanguage]?.['pause'] || 'Pause'; // Change to Pause (translated)
          } else {
              window.audio.pause();
              playButton.textContent = i18n[userLanguage]?.['play'] || 'Play'; // Change to Play (translated)
          }
      }
    };
    
    
    let chapterTextContent = ''; // IMPORTANT: Initialize it!


function displayChapterContent(data, chapterName, subjectName) {
    if (!contentTitle || !contentText) return;

    // Set title using translated chapter name
    const chapterNameKey = chapterName;
    contentTitle.dataset.i18n = chapterNameKey; // Set key for potential re-translation
    contentTitle.textContent = i18n[userLanguage]?.[chapterNameKey] || chapterName; // Use translation, fallback to original

    contentText.innerHTML = ''; // Clear just before adding new content
    chapterTextContent = ''; // Reset TTS text

    let currentSectionElement = null;
    let isList = false;

    const cleanLine = (line) => {
        const cleaned = line.replace(/^[\s*#-]+/g, '').trim();
        // Convert *word* to <strong>word</strong> for bold
        return cleaned.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    };

    if (data && data.chapter) {
        const lines = data.chapter.split('\n');

        lines.forEach(line => {
            const trimmedLine = line.trim();

            // --- Heading Detection (More specific) ---
            if (trimmedLine.startsWith('## ')) {
                appendCurrentSection(); // Finish previous section first
                currentSectionElement = createSection('chapter-section');
                const heading = document.createElement('h2');
                const cleaned = cleanLine(trimmedLine.substring(3));
                heading.innerHTML = cleaned; // Use innerHTML if markdown might be present
                currentSectionElement.appendChild(heading);
                chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n\n'; // Strip tags for TTS
                isList = false;
            } else if (trimmedLine.startsWith('### ')) {
                appendCurrentSection();
                currentSectionElement = createSection('chapter-subsection');
                const subheading = document.createElement('h3');
                const cleaned = cleanLine(trimmedLine.substring(4));
                subheading.innerHTML = cleaned;
                currentSectionElement.appendChild(subheading);
                chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n\n';
                isList = false;
            }
            // --- List Detection ---
            else if (/^\d+\.\s+/.test(trimmedLine)) { // Ordered list (e.g., "1. ")
                if (!isList || currentSectionElement?.tagName !== 'OL') {
                    appendCurrentSection();
                    currentSectionElement = document.createElement('ol');
                    if (body.classList.contains('dark-mode')) currentSectionElement.classList.add('dark-mode');
                    isList = true;
                }
                const listItem = document.createElement('li');
                const cleaned = cleanLine(trimmedLine.substring(trimmedLine.indexOf('.') + 1));
                listItem.innerHTML = cleaned;
                currentSectionElement.appendChild(listItem);
                chapterTextContent += `- ${cleaned.replace(/<[^>]+>/g, '')}\n`;
            } else if (/^[\*\-]\s+/.test(trimmedLine)) { // Unordered list (e.g., "* " or "- ")
                if (!isList || currentSectionElement?.tagName !== 'UL') {
                    appendCurrentSection();
                    currentSectionElement = document.createElement('ul');
                    if (body.classList.contains('dark-mode')) currentSectionElement.classList.add('dark-mode');
                    isList = true;
                }
                const listItem = document.createElement('li');
                const cleaned = cleanLine(trimmedLine.substring(trimmedLine.indexOf(' ') + 1));
                listItem.innerHTML = cleaned;
                currentSectionElement.appendChild(listItem);
                chapterTextContent += `- ${cleaned.replace(/<[^>]+>/g, '')}\n`;
            }
            // --- Paragraph Handling ---
            else if (trimmedLine !== '') {
                if (isList || !currentSectionElement || currentSectionElement.tagName === 'OL' || currentSectionElement.tagName === 'UL') {
                    appendCurrentSection();
                    currentSectionElement = createSection('chapter-paragraph');
                    isList = false;
                }
                const para = document.createElement('p');
                const cleaned = cleanLine(trimmedLine);
                para.innerHTML = cleaned;
                currentSectionElement.appendChild(para);
                chapterTextContent += cleaned.replace(/<[^>]+>/g, '') + '\n';
            }
            // --- Empty lines are ignored unless needed for spacing (handled by \n in TTS text) ---
            fetchUserLevel()
        });
        

        appendCurrentSection(); // Append the very last section
    } else {
        contentText.innerHTML = `<p>${i18n[userLanguage]?.['emptyChapter'] || 'Chapter content is empty.'}</p>`;
    }

    // Helper: Appends current section to DOM if it exists
    function appendCurrentSection() {
        if (currentSectionElement) {
            contentText.appendChild(currentSectionElement);
            currentSectionElement = null;
        }
    }

    // Helper: Creates a new section with a class
    function createSection(className) {
        const section = document.createElement('div');
        section.className = className;
        return section;
    }


     // Apply dark mode to newly added elements
    if (body.classList.contains('dark-mode')) {
        contentText.querySelectorAll('h2, h3, p, li, ul, ol').forEach(el => el.classList.add('dark-mode'));
    }

    // Mark chapter as completed *after* successful display
    markChapterAsCompleted(chapterName, subjectName);

   // --- Show Convert button IFF chapterContentContainer is visible ---
   const convertButton = document.getElementById('convert-to-audio');
   if (convertButton && chapterContentContainer.style.display === 'block') {
       convertButton.style.display = 'inline-flex'; // Use inline-flex or block as appropriate
       convertButton.disabled = false;
        // Translate button text
       convertButton.textContent = i18n[userLanguage]?.['convertToAudio'] || 'Convert To Audio';
   } else if (convertButton) {
       convertButton.style.display = 'none'; // Ensure it's hidden if not visible
   }
    // Ensure Play button remains hidden initially
    const playButton = document.getElementById('play-audio');
    if (playButton) playButton.style.display = 'none';

    // Helper function for creating sections
    function createSection(className) {
        const div = document.createElement('div');
        div.classList.add(className);
         if (body.classList.contains('dark-mode')) div.classList.add('dark-mode');
        return div;
    }

    // Helper function to append the current section to the main contentText area
    function appendCurrentSection() {
        if (currentSectionElement) {
            contentText.appendChild(currentSectionElement);
            // currentSectionElement = null; // Reset for the next section
        }
    }


    // ------------------- New Code: Generate Quiz  ---------------------
    generateQuiz(chapterTextContent);
}

// Add this new function to para-script.js
// Add this new function to para-script.js
async function generateQuiz(chapterTextContent) {
    // --- ABORT CONTROLLER LOGIC (START) ---                   <<< ADDED
    // Abort any previous quiz request if it's still pending
    cancelCurrentQuizFetch();

    // Create a new AbortController for this specific quiz request
    const controller = new AbortController();
    currentQuizFetchAbortController = controller; // Store the new controller
    const signal = controller.signal;
    // --- ABORT CONTROLLER LOGIC (END) ---                     <<< ADDED


    const quizContainer = document.createElement('div');
    quizContainer.id = 'quiz-container';
    contentText.appendChild(quizContainer);  // Append to content text

    quizContainer.innerHTML = '<p data-i18n="generatingQuiz">Generating quiz...</p>';
    translatePage(); // Make sure the generating message is translated if needed

    try {
        const response = await fetch('https://quiz-api-213051243033.asia-south2.run.app/generate-quiz', { // Replace with your server URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chapterText: chapterTextContent
            }),
            signal: signal // --- ABORT CONTROLLER LOGIC: Pass the signal --- <<< ADDED
        });

        if (!response.ok) {
            // Don't throw error if it was aborted by user
            if (signal.aborted) {                                    // <<< ADDED
                console.log('Quiz generation fetch aborted by user.'); // <<< ADDED
                return; // Exit function silently                 // <<< ADDED
            }                                                        // <<< ADDED
            throw new Error(`Quiz generation failed: ${response.status}`);
        }

        const data = await response.json();

        // --- ABORT CHECK before displaying ---                     <<< ADDED
        // Check if aborted *after* fetch completed but before display
        if (signal.aborted) {                                     // <<< ADDED
            console.log('Quiz generation aborted before display.'); // <<< ADDED
            return;                                               // <<< ADDED
        }                                                         // <<< ADDED
        // --- End ABORT CHECK ---                                 <<< ADDED

        displayQuiz(data.quiz);

    } catch (error) {
         // --- ABORT CONTROLLER LOGIC: Handle AbortError ---        <<< ADDED
         if (error.name === 'AbortError') {
              console.log('Quiz fetch aborted by user navigation.');
              // UI cleanup is handled by cancelCurrentQuizFetch called during navigation
         } else {
         // --- End ABORT CONTROLLER LOGIC ---                      <<< ADDED
            console.error("Error generating quiz:", error);
            // Optionally display an error in the quiz container
            if(quizContainer) { // Check if container still exists
                quizContainer.innerHTML = '<p class="error-message">Failed to generate quiz.</p>';
                 if (body.classList.contains('dark-mode')) { // Apply dark mode if needed
                    quizContainer.querySelector('.error-message')?.classList.add('dark-mode');
                }
            }
         }
    } finally {
         // --- ABORT CONTROLLER LOGIC: Clear controller after fetch settles --- <<< ADDED
         if (currentQuizFetchAbortController === controller) { // Only clear if this is *still* the current controller
             currentQuizFetchAbortController = null;
         }
         // --- End ABORT CONTROLLER LOGIC ---                            <<< ADDED
    }
}
function displayQuiz(quizData) {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) {
        console.error("Quiz container not found.");
        return;
    }

    quizContainer.innerHTML = '<h2>Quiz</h2>';
    const quizForm = document.createElement('form'); // Wrap quiz in a form for submission
    quizContainer.appendChild(quizForm);

    quizData.forEach((questionData, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('quiz-question'); // Add a class for styling and selection
        questionDiv.innerHTML = `<p>${questionData.question}</p>`;

        const optionsList = document.createElement('ul');
        optionsList.classList.add('quiz-options');

        // Iterate through options using keys from server data
        for (const optionKey in questionData.options) {
            const optionItem = document.createElement('li');
            optionItem.classList.add('quiz-option'); // Add class for styling

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `question-${index}`; // Unique name for each question's radio buttons
            radioInput.value = optionKey; // The option (A, B, C, D) is the value
            radioInput.id = `option-${index}-${optionKey}`;  // Unique ID for label association

            const label = document.createElement('label');
            label.setAttribute('for', `option-${index}-${optionKey}`);
            label.textContent = `${questionData.options[optionKey]}`;  // Use optionKey from server

            optionItem.appendChild(radioInput);
            optionItem.appendChild(label);
            optionsList.appendChild(optionItem);
        }
        questionDiv.appendChild(optionsList);
        quizForm.appendChild(questionDiv);
    });

    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit Quiz';
    submitButton.id = 'quiz-submit-button'; // Add the ID here
    quizForm.appendChild(submitButton);

    // Add event listener to process quiz submission
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        gradeQuiz(quizData); // Grade the quiz
    });
}
async function gradeQuiz(quizData) {
    const quizContainer = document.getElementById('quiz-container'); // Ensure it exists
    const quizForm = quizContainer.querySelector('form');

    let score = 0;
    const questionElements = quizForm.querySelectorAll('.quiz-question');  // Get each question element

    // Disable all quiz inputs
    const allInputs = quizForm.querySelectorAll('input');
    allInputs.forEach(input => {
        input.disabled = true;  // This will prevent selection
    });

    // Disable submit button
    const submitButton = quizForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    questionElements.forEach((questionElement, index) => {
        const selectedOption = questionElement.querySelector(`input[name="question-${index}"]:checked`); // Find selected radio

        if (selectedOption) {
            const userAnswer = selectedOption.value;
            const correctAnswer = quizData[index].answer; // Correct answer for that question

            if (userAnswer === correctAnswer) {
                score++;
                questionElement.classList.add('correct');
            } else {
                questionElement.classList.add('incorrect');
                const answerParagraph = document.createElement('p');
                answerParagraph.classList.add('correct-answer');
                answerParagraph.textContent = `Correct Answer: ${correctAnswer}`;  // Display answer
                questionElement.appendChild(answerParagraph);
            }
        } else {
            questionElement.classList.add('unanswered');  // Visual for unanswered questions
        }
    });

    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('quiz-feedback');
    feedbackDiv.textContent = `You scored ${score} out of ${quizData.length}`; // Display result
    quizContainer.appendChild(feedbackDiv);

        // Update the totalPoints here and update firebase after grading.
    totalPoints = totalPoints + (score * 2); // Score from last test plus new score
    await updatePointsInFirestore(totalPoints);

     updateProgressDisplay();
}            
                function updateTotalTimeDisplay() {
                     const percentageElement = totalTimeCard.querySelector('.percentage');
                     const progressBarInner = totalTimeCard.querySelector('.progress-bar-inner');
                      const totalHours = Math.floor(totalTimeSpent / (1000 * 60 * 60));
                     const totalMinutes = Math.floor((totalTimeSpent % (1000 * 60 * 60)) / (1000 * 60));
                      let progressPercentage = 0;
             
                     if(totalHours >= 10){
                          progressPercentage = 100;                 }
             
                          else{
                             progressPercentage = (totalHours/10) * 100;
                           }
                          progressBarInner.style.width = `${progressPercentage}%`;
     
                          // Animation Logic
                         let startValue = 0;
                         const duration = 1500;
                         const startTime = performance.now();
     
                         function updateCounter(currentTime) {
                           const elapsedTime = currentTime - startTime;
                           if (elapsedTime < duration) {
                             const progress = elapsedTime / duration;
                             const currentHours = Math.floor(totalHours * progress);
                             const currentMinutes = Math.floor((totalMinutes) * progress);
                              percentageElement.textContent = `${currentHours} hours ${currentMinutes} mins`;
                             requestAnimationFrame(updateCounter);
                         } else {
                             percentageElement.textContent = `${totalHours} hours ${totalMinutes} mins`;
                           }
                         }
     
                         requestAnimationFrame(updateCounter);
                      }
                       
            function updateSubjectTimeDisplay() {
             
                subjectTimeCard.innerHTML = '';
               subjects.forEach(subject => {
                   const subjectTotalTime = subjectTime[subject.id] || 0; // Get time for this subject or 0 if none
                    const totalHours = Math.floor(subjectTotalTime / (1000 * 60 * 60));
                    const totalMinutes = Math.floor((subjectTotalTime % (1000 * 60 * 60)) / (1000 * 60));
                   
           
                   const subjectDiv = document.createElement('div');
                   subjectDiv.classList.add('subject-time');
                    subjectDiv.innerHTML = `
                       <div class="subject-time-header">
                           <span class="subject-icon">${subject.icon}</span>
                           <h3 data-i18n="${subject.name}">${i18n[userLanguage][subject.name]}</h3>
                       </div>
                       <p class="time-spent">${totalHours} hours ${totalMinutes} mins</p>
                   `;
                   subjectTimeCard.appendChild(subjectDiv);
               });
           }
                 
                       async function calculateTotalTime() {
                 
                            const user = firebase.auth().currentUser;
                            if(user){
                                  const doc = await db.collection('users').doc(user.email).get();
                                  if(doc.exists){
                                     const userData = doc.data();
                                      if (userData.totaltimespent) {
                                           totalTimeSpent = userData.totaltimespent;
                                     }
                                     // Fetch time per subject from firestore
                                       subjectTime = userData.subjectTime || {};
                                       if(userData.totalPoints){
                                          totalPoints = userData.totalPoints;
                                       }
                                   }
                              }
                               updateTotalTimeDisplay();
                               updateSubjectTimeDisplay();
                      }
                 
                 
                       function startSession() {
                           if(sessionStartTime)
                             return;
                              console.log('starting new session')
                            sessionStartTime = Date.now();
                             
                              setInterval(updateTotalTimeAndFirestore, 60000);
                               calculateTotalTime();
                               calculateTotalTime();
                        }
                        async function updateTotalTimeAndFirestore() {
                            if (sessionStartTime) {
                                const sessionEndTime = Date.now();
                                const sessionDuration = sessionEndTime - sessionStartTime;
                                totalTimeSpent += sessionDuration;
                                sessionStartTime = Date.now();
                 
                              const userEmail = firebase.auth().currentUser.email;
                                  if (userEmail) {
                                   try{
                                        await db.collection('users').doc(userEmail).update({
                                              totaltimespent: totalTimeSpent
                                         });
                                         
                                          // Find the subject id for the currently displayed chapter
                                        let currentSubjectId = null;
                                        const lastChapter = localStorage.getItem('lastCompletedChapter');
                                        if (lastChapter) {
                                                for(const subject of subjects){
                                                    if(subject.chapters[userLevel].some(chapter => chapter.name === lastChapter)){
                                                        currentSubjectId = subject.id;
                                                        break;
                                                    }
                                                }
                                        }
    
                                          await updateSubjectTimeInFirestore(sessionDuration, currentSubjectId);
    
                                     }
                                      catch(error){
                                          console.error("Error updating total time:", error);
                                     }
                                  }
                               updateTotalTimeDisplay()
                              }
                          }
                          
    let chapterStartTime = null;
    
      async function updateSubjectTimeInFirestore(sessionDuration, currentSubjectId) {
                            const user = firebase.auth().currentUser;
                            if (user && currentSubjectId) {
                                try {
                                     const doc = await db.collection('users').doc(user.email).get();
                                    if (doc.exists) {
                                       const userData = doc.data();
                                       let subjectTimes = userData.subjectTime || {};
                                        subjectTimes[currentSubjectId] = (subjectTimes[currentSubjectId] || 0) + sessionDuration;
                                        await db.collection('users').doc(user.email).update({
                                            subjectTime: subjectTimes
                                        });
                                          subjectTime = subjectTimes;
                                       updateSubjectTimeDisplay();
                                    }
                                } catch (error) {
                                    console.error("Error updating subject time:", error);
                                }
    
                            }
                       
                      }
       async function updateTotalTimeAndFirestore() {
                            if (sessionStartTime) {
                                const sessionEndTime = Date.now();
                                const sessionDuration = sessionEndTime - sessionStartTime;
                                totalTimeSpent += sessionDuration;
                                sessionStartTime = Date.now();
                 
                              const userEmail = firebase.auth().currentUser.email;
                                  if (userEmail) {
                                   try{
                                        await db.collection('users').doc(userEmail).update({
                                              totaltimespent: totalTimeSpent
                                         });
    
                                     }
                                      catch(error){
                                          console.error("Error updating total time:", error);
                                     }
                                  }
                               updateTotalTimeDisplay()
                              }
                          }
    
    
     function startSession() {
                           if(sessionStartTime)
                             return;
                              console.log('starting new session')
                            sessionStartTime = Date.now();
                             
                              setInterval(updateTotalTimeAndFirestore, 60000);
                              calculateTotalTime();
                               calculateTotalTime();
                        }
    
    function startChapterTimer(subjectId) {
          if (!subjectId || chapterIntervalId) {
            return;
          }
        endChapterTimer(currentChapterSubjectId)
      
        console.log("Starting chapter timer for subject:", subjectId);
        currentChapterSubjectId = subjectId;
        chapterStartTime = Date.now();
    
        // Save to localStorage for potential resume  -- REMOVE
        // localStorage.setItem("chapterStartTime", chapterStartTime); -- REMOVE
        // localStorage.setItem("currentChapterSubject", subjectId);  -- REMOVE
      
        // Update immediately and every 60 seconds
        chapterIntervalId = setInterval(() => {
            if(chapterContentContainer.style.display === 'block')
               updateChapterTimeAndFirestore();
         }, 60000);
      }
      
      async function updateChapterTimeAndFirestore() {
        if (!chapterStartTime || !currentChapterSubjectId) return;
      
        const now = Date.now();
        const duration = now - chapterStartTime;
        chapterStartTime = now;
      
          try {
              await updateSubjectTimeInFirestore(duration, currentChapterSubjectId);
               console.log("Updated chapter time:", duration, "ms for", currentChapterSubjectId);
          } catch (error) {
             console.error("Error updating chapter time:", error);
         }
     }
    
    function endChapterTimer(subjectId) {
       if (!chapterStartTime || !subjectId) return;
       // Calculate final duration
        const finalDuration = Date.now() - chapterStartTime;
        
           // Clear interval first
           if (chapterIntervalId) {
               clearInterval(chapterIntervalId);
               chapterIntervalId = null;
           }
       
            // Update Firestore with remaining time
        updateSubjectTimeInFirestore(finalDuration, subjectId)
             .then(() => {
                 console.log("Final chapter time recorded:", finalDuration);
             })
             .catch((error) => {
                 console.error("Error recording final chapter time:", error);
             });
        
           // Reset tracking variables
        chapterStartTime = null;
        currentChapterSubjectId = null;
        // localStorage.removeItem('chapterStartTime'); -- REMOVE
        // localStorage.removeItem('currentChapterSubject'); -- REMOVE
     }   // Add this initialization code at the end of DOMContentLoaded
     // Resume chapter timer if page was refreshed  -- MODIFIED SECTION - REMOVED
    //  const savedStartTime = localStorage.getItem('chapterStartTime');  -- REMOVE THIS LINE
    //  const savedSubjectId = localStorage.getItem('currentChapterSubject'); -- REMOVE THIS LINE
    //  if (savedStartTime && savedSubjectId) { -- REMOVE THIS LINE
    //      chapterStartTime = parseInt(savedStartTime); -- REMOVE THIS LINE
    //      currentChapterSubjectId = savedSubjectId;  -- REMOVE THIS LINE
    //      startChapterTimer(savedSubjectId); -- REMOVE THIS LINE
    //  } -- REMOVE THIS LINE
    
     // --- Inside displayChapterView --- ADDED/MODIFIED LINES

    
    
     // --- Inside navigateToSubjects --- ADDED/MODIFIED LINES
 // --- Inside navigateToSubjects --- ADDED/MODIFIED LINES
 function navigateToSubjects() {
    cancelCurrentChapterFetch(); // Cancel pending chapter fetch when navigating back
    cancelCurrentAudioFetch(); // Cancel pending audio fetch when navigating back
    cancelCurrentQuizFetch(); // Cancel pending quiz fetch when navigating back // <<< ADDED
    removeAndResetConvertToAudioButton(); // Clear audio state


    studyMenu.style.display = 'block';
    chaptersContainer.style.display = 'none';
    chapterContentContainer.style.display = 'none';
    backButtonContainer.style.display = 'none';
     contentText.innerHTML = '';
      // Clear content text before navigating back to subjects
       contentText.innerHTML = '';

       // End subject timer
      if (currentChapterSubjectId) {
        endChapterTimer(currentChapterSubjectId); // Pass the current subject ID
      }

     // Scroll to the top when navigating back
     window.scrollTo({ top: 0, behavior: 'smooth' });

     if (studyMenu) {
        const firstItem = studyMenu.querySelector('.study-menu-item');
        if (firstItem) firstItem.focus();
     }

}
function navigateToChapters() {
    cancelCurrentChapterFetch(); // Cancel pending chapter fetch when navigating back
    cancelCurrentAudioFetch(); // Cancel pending audio fetch when navigating back
    cancelCurrentQuizFetch(); // Cancel pending quiz fetch when navigating back // <<< ADDED
    removeAndResetConvertToAudioButton(); // Clear audio state


    studyMenu.style.display = 'none';
     chaptersContainer.style.display = 'block';
    chapterContentContainer.style.display = 'none';
    backButtonContainer.style.display = 'flex';
    contentText.innerHTML = '';

       // Clear content text before navigating back to chapters
    contentText.innerHTML = '';
        // End subject timer
if (currentChapterSubjectId) {
    endChapterTimer(currentChapterSubjectId);  // Pass the current subject ID
}

 // Scroll to the top when navigating back
 window.scrollTo({ top: 0, behavior: 'smooth' });

   document.getElementById('convert-to-audio').style.display = 'none';
    if (chapterItems && chapterItems.length > 0) {
        setChapterFocus(); // Assuming setChapterFocus takes index 0 by default if none provided
    }
}                 
                     function endSession() {
                         sessionStartTime = null;
                         console.log('ending session')
                      }
                 
                 
                 
                      function handleBackButtonClick(event) {
                          if (chapterContentContainer.style.display === 'block') {
                              navigateToChapters();
                          } else if (chaptersContainer.style.display === 'block') {
                              navigateToSubjects();
                          }
                      
                          // Scroll to the top smoothly
                          window.scrollTo({
                              top: 0,
                              behavior: "smooth"
                          });
                      }
                      
                 
                     backButton.addEventListener('click', handleBackButtonClick);
                 
                   function renderSubjects() {
                          studyMenu.innerHTML = '';
                          subjects.forEach((subject) => {
                              const listItem = document.createElement('li');
                               listItem.classList.add('study-menu-item');
                              listItem.setAttribute('tabindex', '0');
                              listItem.innerHTML = `
                                  <div class="study-menu-item-image">
                                       ${subject.icon}
                                   </div>
                                   <div class="study-menu-item-content">
                                       <h3 data-i18n="${subject.name}">${i18n[userLanguage][subject.name]}</h3>
                                   </div>
                             `;
                              listItem.addEventListener('click', () => {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  displayChapters(subject);
                              });
                              studyMenu.appendChild(listItem);
                          });
                          if (studyMenu && studyMenu.children.length > 0) {
                              const firstItem = studyMenu.querySelector('.study-menu-item');
                             if (firstItem)
                                 firstItem.focus()
                          }
                      }
                 
                     studyMenu.addEventListener('wheel', (e) => {
                 
                      });
                 
                 
                      renderSubjects();
                 
                 
                      function translatePage() {
                          const elements = document.querySelectorAll('[data-i18n]');
                          elements.forEach(element => {
                              const key = element.getAttribute('data-i18n');
                              if (i18n[userLanguage] && i18n[userLanguage][key]) {                              element.textContent = i18n[userLanguage][key];
                              } else {
                                 
                              }
                          });
                      }
                 

                 
                 
                 
                        // Call fetchAndDisplayUserName after data from firebase is loaded
                        (async function () {
                            await fetchAndDisplayUserName()
                             await fetchDarkModePreference();
                              calculateTotalTime()
                        })();
                       startSession();
                        // Clean Up Session on Exit
                         window.addEventListener('beforeunload', endSession);
                         window.addEventListener('unload', endSession);
                         logoutButton.addEventListener('click', async () => {
                             try {
                                 await firebase.auth().signOut();
                                 window.location.href = 'index.html'; // Redirect to login page
                             } catch (error) {
                                 console.error("Error logging out:", error);
                             }
                         });
                              
                              
                              function markChapterAsCompleted(chapterName, subjectName) {
                                 // Add level to chapter name for unique tracking
                                 const chapterKey = `${userLevel}/${chapterName}`;

                             }
                             async function updateUserLevel() {
                                const user = firebase.auth().currentUser;
                                if (user) {
                                    let newLevel;
                                    switch (userLevel) {
                                        case 'beginner':
                                            newLevel = 'intermediate';
                                            break;
                                        case 'intermediate':
                                            newLevel = 'advanced';
                                            break;
                                        default:
                                            return; // No update for 'advanced' or any other level
                                    }
                                    try {
                                        await db.collection('users').doc(user.email).update({
                                            testCategory: newLevel, // Corrected field to testCategory
                                        });
                                        userLevel = newLevel; // Update client-side
                                         document.getElementById('user-level-text').textContent = `Level: ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)}`;
                                        localStorage.setItem('userLevel', newLevel); //Store in local storage as well
                                             // Update the level on the user level display
                                             const levelText = document.getElementById('user-level-text');
                                             if (levelText) {
                                                const level = localStorage.getItem('userLevel')
                                                if (level)
                                                   levelText.textContent = i18n[userLanguage]['level'] +`: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
                                              }
    
                                             log("User level updated to: " + newLevel);
                            
                                    } catch (error) {
                                        console.error("Error updating user level in Firestore:", error);
                                    }
                                }
                            }    
    
                            const friendSection = document.getElementById('friend');
                            const friendChat = friendSection.querySelector('#friend-chat');
                            const friendInput = friendSection.querySelector('#friend-input');
                            const friendSend = friendSection.querySelector('#friend-send');
                            
                            const counsellorSection = document.getElementById('counsellor');
                            const counsellorChat = counsellorSection.querySelector('#counsellor-chat');
                            const counsellorInput = counsellorSection.querySelector('#counsellor-input');
                            const counsellorSend = counsellorSection.querySelector('#counsellor-send');
                            
                            async function sendMessageToAI(message, chatArea, type) {
                              if (!message) return;
                              const user = firebase.auth().currentUser;
                          
                              let userEmail = "unknown@example.com";
                              let mentalDisorder = "No Mental Disorder";
                              let userLevel = "beginner";
                          
                              if (user) {
                                  userEmail = user.email;
                          
                                  try {
                                      const doc = await db.collection('users').doc(user.email).get();
                                      if (doc.exists) {
                                          const userData = doc.data();
                                          mentalDisorder = userData.mentalDisorder || "No Mental Disorder";
                                          userLevel = userData.testCategory || "beginner";
                                      }
                                  } catch (error) {
                                      console.error("Error fetching user data for chat:", error);
                                  }
                              }
                          
                              const userMessageDiv = document.createElement('div');
                              userMessageDiv.classList.add('chat-message', 'user-message');
                          
                              // Apply dark mode class based on body's class
                              if (document.body.classList.contains('dark-mode')) {
                                  userMessageDiv.classList.add('dark-mode');
                              }
                             userMessageDiv.textContent = message;
                              chatArea.appendChild(userMessageDiv);
                              chatArea.scrollTop = chatArea.scrollHeight;  //Scroll to the bottom directly after adding
                          
                              try {
                                  const response = await fetch("https://friend-api-213051243033.asia-south2.run.app/chat", {
                                      method: "POST",
                                      headers: {
                                          "Content-Type": "application/json"
                                      },
                                      body: JSON.stringify({
                                          email: userEmail,
                                          message: message,
                                          user_type: type,
                                          mentalDisorder: mentalDisorder,  // Send mentalDisorder
                                          userLevel: userLevel        // Send userLevel
                                      })
                          
                                  });
                          
                                  const data = await response.json();
                                  if (!response.ok) {
                                      throw new Error(data.error || "Failed to fetch AI response");
                                  }
                          
                                  let formattedResponse = data.response;
                          
                                  // Format headings
                                  formattedResponse = formattedResponse.replace(/### (.*)/g, '<br> $1');
                          
                                  // Format bold text
                                  formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                          
                                  //Replace newline character
                                  formattedResponse = formattedResponse.replace(/\n/g, '<br>');
                          
                                  const aiMessageDiv = document.createElement('div');
                                  aiMessageDiv.classList.add('chat-message', 'ai-message');
                                  if (document.body.classList.contains('dark-mode')) {
                                       aiMessageDiv.classList.add('dark-mode');
                                   }
                          
                                  aiMessageDiv.innerHTML = formattedResponse;
                                  chatArea.appendChild(aiMessageDiv);
                                  chatArea.scrollTop = chatArea.scrollHeight;  //Scroll to the bottom directly after adding
                          
                                  totalPoints = totalPoints + 1;
                                  updatePointsInFirestore(totalPoints);
                                  updateProgressDisplay()
                              } catch (error) {
                                  console.error("Failed to send AI Response:", error);
                                  const aiMessageDiv = document.createElement('div');
                                  aiMessageDiv.classList.add('chat-message', 'ai-message');
                                  aiMessageDiv.textContent = 'Failed to fetch response.';
                                  chatArea.appendChild(aiMessageDiv);
                                   chatArea.scrollTop = chatArea.scrollHeight;  //Scroll to the bottom directly after adding
                              } finally {
                                  chatArea.scrollTop = chatArea.scrollHeight;
                              }
                          }
                            
                            friendSend.addEventListener('click', (e) => {
                              e.preventDefault();
                              const message = friendInput.value.trim();
                              if (message) {
                                  sendMessageToAI(message, friendChat, 'friend');
                                  friendInput.value = '';
                                  friendChat.scrollTop = friendChat.scrollHeight; // Scroll friendChat after sending
                              }
                          });
                          
                          counsellorSend.addEventListener('click', (e) => {
                              e.preventDefault();
                              const message = counsellorInput.value.trim();
                              if (message) {
                                  sendMessageToAI(message, counsellorChat, 'counsellor');
                                  counsellorInput.value = '';
                                  counsellorChat.scrollTop = counsellorChat.scrollHeight; // Scroll counsellorChat after sending
                              }
                          });
                          
                          friendInput.addEventListener('keydown', (e) => {
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const message = friendInput.value.trim();
                                  if (message) {
                                      sendMessageToAI(message, friendChat, 'friend');
                                      friendInput.value = '';
                                      friendChat.scrollTop = friendChat.scrollHeight; // Scroll friendChat after Enter
                                  }
                              }
                          });
                          
                          counsellorInput.addEventListener('keydown', (e) => {
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const message = counsellorInput.value.trim();
                                  if (message) {
                                      sendMessageToAI(message, counsellorChat, 'counsellor');
                                      counsellorInput.value = '';
                                      counsellorChat.scrollTop = counsellorChat.scrollHeight; // Scroll counsellorChat after Enter
                                  }
                              }
                          });
                                    
                            
              
        const helpSection = document.getElementById('help');
        const sosButton = document.getElementById('sosButton');
        const sosOverlay = document.getElementById('sosOverlay');
        const cancelSosButton = document.getElementById('cancelSosButton');
            
            
           sosButton.addEventListener('click', () => {
              sosOverlay.style.display = 'block';
               sosOverlay.innerHTML = `<button id="cancelSosButton">Turn Off SOS</button>`
                  
           })
            sosOverlay.addEventListener('click', (event) => {
                if (event.target.id === "cancelSosButton" || event.target.id === "sosOverlay") {
                    sosOverlay.style.display = 'none';
                     sosOverlay.innerHTML = '';
    
                }
              
            });
      
           document.addEventListener('keydown', (event) => {
              if (event.key === 'Escape' && sosOverlay.style.display === 'block') {
                    sosOverlay.style.display = 'none';
                    sosOverlay.innerHTML = '';
                 }
              });
             
         const enableActionsButton = document.getElementById('enableActions');
              enableActionsButton.addEventListener('click', () => {
                enableActionsButton.textContent = i18n[userLanguage]['actionsEnabled'];
                enableActionsButton.disabled = true;
           });
            
                
                function setChapterFocus(index) {
                  if (chapterItems && chapterItems.length > 0) {
                    chapterItems.forEach(item => item.classList.remove('focused'));
                    if (typeof index === 'number' && index >= 0 && index < chapterItems.length) {
                      chapterItems[index].classList.add('focused');
                      chapterItems[index].focus();
                        chaptersContainer.scrollTo({
                           top: chapterItems[index].offsetTop - chaptersContainer.offsetTop,
                           behavior: 'smooth'
                       });
                    } else if (index === 'last') {
                           const lastItem = chapterItems[chapterItems.length - 1];
                              lastItem.classList.add('focused');
                           lastItem.focus()
                             chaptersContainer.scrollTo({
                               top: lastItem.offsetTop - chaptersContainer.offsetTop,
                               behavior: 'smooth'
                           });
                      }
                }
             }
                
            
             let chapterItems = []
    
         });