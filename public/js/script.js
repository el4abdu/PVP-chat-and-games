// Main JavaScript File for PVP Chat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script.js loaded and DOM ready');
    
    // Directly add event listeners to auth buttons
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (loginBtn) {
        console.log('Adding click handler to login button from script.js');
        loginBtn.addEventListener('click', function() {
            console.log('Login button clicked from script.js handler');
            const event = new CustomEvent('loginButtonClicked');
            document.dispatchEvent(event);
            
            // Try to open modal directly
            const modal = document.querySelector('.auth-modal-overlay');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Switch to login tab if tabs exist
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
                const loginForm = document.querySelector('#login-form');
                const registerForm = document.querySelector('#register-form');
                
                if (loginTab && registerTab && loginForm && registerForm) {
                    loginTab.classList.add('active');
                    registerTab.classList.remove('active');
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                }
            } else {
                console.log('Modal not found, creating it directly from script.js');
                createAuthModalFallback('login');
            }
        });
    }
    
    if (signupBtn) {
        console.log('Adding click handler to signup button from script.js');
        signupBtn.addEventListener('click', function() {
            console.log('Signup button clicked from script.js handler');
            const event = new CustomEvent('signupButtonClicked');
            document.dispatchEvent(event);
            
            // Try to open modal directly
            const modal = document.querySelector('.auth-modal-overlay');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Switch to register tab if tabs exist
                const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
                const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
                const loginForm = document.querySelector('#login-form');
                const registerForm = document.querySelector('#register-form');
                
                if (loginTab && registerTab && loginForm && registerForm) {
                    loginTab.classList.remove('active');
                    registerTab.classList.add('active');
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            } else {
                console.log('Modal not found, creating it directly from script.js');
                createAuthModalFallback('register');
            }
        });
    }
    
    // Initialize features
    initTabSwitching();
    initLeaderboard('global');
    addScrollAnimation();
    
    // Get Started button event
    const getStartedBtn = document.querySelector('.get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleActionButtonClick();
        });
    }
    
    // Play Now button event
    const playNowBtn = document.querySelector('.play-now-btn');
    if (playNowBtn) {
        playNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleActionButtonClick();
        });
    }
    
    // Contact form submission
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            alert('Thank you for your interest in PVP Chat! Our team will be in touch soon to answer all your questions about our chat & play platform.');
        });
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newspaper form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert(`Thank you for subscribing to PVP Chat with ${emailInput.value}! You'll receive updates about our chat & play features soon.`);
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address to receive updates about our chat & play platform.');
            }
        });
    }
    
    // Add floating chat button demonstration
    addChatPlayDemo();
    
    // Check if user is logged in to personalize UI
    checkUserLoggedIn();
});

/**
 * Add a floating demo button to showcase the chat & play feature
 */
function addChatPlayDemo() {
    const demoButton = document.createElement('div');
    demoButton.className = 'chat-play-demo';
    demoButton.innerHTML = `
        <div class="demo-label">TRY CHAT & PLAY</div>
        <div class="demo-icon">
            <i class="fas fa-gamepad"></i>
            <i class="fas fa-comment"></i>
        </div>
    `;
    
    document.body.appendChild(demoButton);
    
    demoButton.addEventListener('click', function() {
        alert('PVP Chat Demo: This feature would allow you to open our split-screen interface where you can play games while chatting with friends simultaneously!');
    });
    
    // Add the styles for the demo button
    const style = document.createElement('style');
    style.textContent = `
        .chat-play-demo {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #FFD700, #FFE967);
            color: #2A2D45;
            padding: 15px;
            border-radius: 60px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
            cursor: pointer;
            z-index: 100;
            transition: all 0.3s ease;
        }
        
        .chat-play-demo:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
        }
        
        .demo-label {
            margin-right: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 14px;
        }
        
        .demo-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .demo-icon i {
            font-size: 18px;
            margin: 0 5px;
        }
        
        @media screen and (max-width: 768px) {
            .chat-play-demo {
                padding: 10px;
            }
            
            .demo-label {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize the tab switching functionality for leaderboard
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (!tabButtons.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the region from the data attribute
            const region = this.getAttribute('data-region');
            
            // Update leaderboard based on region
            initLeaderboard(region);
        });
    });
}

/**
 * Initialize the leaderboard with player data
 * @param {string} region - The region to display (global, europe, america, asia)
 */
function initLeaderboard(region = 'global') {
    // Sample player data for different regions
    const playerData = {
        global: [
            { rank: 1, name: 'ChatMaster', avatar: 'avatar-1.png', score: 9850, change: '+12', type: 'Chat & Play', games: 145 },
            { rank: 2, name: 'DualGamer', avatar: 'avatar-2.png', score: 9720, change: '+8', type: 'Strategy', games: 132 },
            { rank: 3, name: 'SocialPlayer', avatar: 'avatar-3.png', score: 9650, change: '+15', type: 'Puzzle', games: 128 },
            { rank: 4, name: 'TalkNPlay', avatar: 'avatar-4.png', score: 9520, change: '-2', type: 'Action', games: 156 },
            { rank: 5, name: 'GameChatter', avatar: 'avatar-5.png', score: 9480, change: '+5', type: 'Chat & Play', games: 118 }
        ],
        europe: [
            { rank: 1, name: 'EuroChatPro', avatar: 'avatar-6.png', score: 9750, change: '+10', type: 'Chat & Play', games: 138 },
            { rank: 2, name: 'BerlinTalker', avatar: 'avatar-7.png', score: 9620, change: '+7', type: 'Puzzle', games: 125 },
            { rank: 3, name: 'LondonChat', avatar: 'avatar-8.png', score: 9580, change: '+13', type: 'Action', games: 142 },
            { rank: 4, name: 'ParisPlayer', avatar: 'avatar-9.png', score: 9510, change: '-4', type: 'Chat & Play', games: 131 },
            { rank: 5, name: 'MadridDual', avatar: 'avatar-10.png', score: 9470, change: '+6', type: 'Strategy', games: 119 }
        ],
        america: [
            { rank: 1, name: 'NYChatKing', avatar: 'avatar-11.png', score: 9780, change: '+14', type: 'Chat & Play', games: 149 },
            { rank: 2, name: 'LATalkPlay', avatar: 'avatar-12.png', score: 9690, change: '+9', type: 'Strategy', games: 135 },
            { rank: 3, name: 'TexasDual', avatar: 'avatar-13.png', score: 9630, change: '+11', type: 'Puzzle', games: 127 },
            { rank: 4, name: 'ChicagoChat', avatar: 'avatar-14.png', score: 9550, change: '-1', type: 'Chat & Play', games: 144 },
            { rank: 5, name: 'TorontoPVP', avatar: 'avatar-15.png', score: 9490, change: '+8', type: 'Action', games: 121 }
        ],
        asia: [
            { rank: 1, name: 'TokyoTalkPlay', avatar: 'avatar-16.png', score: 9820, change: '+16', type: 'Chat & Play', games: 152 },
            { rank: 2, name: 'SeoulDual', avatar: 'avatar-17.png', score: 9730, change: '+12', type: 'Puzzle', games: 139 },
            { rank: 3, name: 'ShanghaiChat', avatar: 'avatar-18.png', score: 9670, change: '+9', type: 'Action', games: 133 },
            { rank: 4, name: 'DelhiPlayer', avatar: 'avatar-19.png', score: 9540, change: '-3', type: 'Chat & Play', games: 147 },
            { rank: 5, name: 'SingaporePVP', avatar: 'avatar-20.png', score: 9500, change: '+7', type: 'Strategy', games: 124 }
        ]
    };
    
    // Get the leaderboard rows container
    const tableRows = document.querySelector('.table-rows');
    if (!tableRows) return;
    
    // Clear current rows
    tableRows.innerHTML = '';
    
    // Check if we have data for the requested region
    const players = playerData[region] || playerData.global;
    
    // Add player rows to the leaderboard
    players.forEach(player => {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        // Highlight Chat & Play type players
        const isChatPlayType = player.type === 'Chat & Play';
        
        // Create HTML for the row
        row.innerHTML = `
            <div class="rank">${player.rank}</div>
            <div class="player">
                <div class="player-info">
                    <img src="public/assets/images/${player.avatar}" alt="${player.name}" class="player-avatar">
                    <span>${player.name}</span>
                </div>
            </div>
            <div class="score">${player.score}</div>
            <div class="change ${player.change.startsWith('+') ? 'positive-change' : 'negative-change'}">${player.change}</div>
            <div class="type ${isChatPlayType ? 'highlight-type' : ''}">${player.type}</div>
            <div class="games">${player.games}</div>
        `;
        
        // Add row to the table
        tableRows.appendChild(row);
    });
    
    // Add style for highlighted type
    if (!document.querySelector('#highlight-style')) {
        const highlightStyle = document.createElement('style');
        highlightStyle.id = 'highlight-style';
        highlightStyle.textContent = `
            .highlight-type {
                color: #FFD700;
                font-weight: 700;
            }
        `;
        document.head.appendChild(highlightStyle);
    }
}

/**
 * Add scroll animation to elements
 */
function addScrollAnimation() {
    const elements = document.querySelectorAll('.feature-card, .learning-game, .contact-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        // Add initial hidden class
        element.classList.add('fade-in');
        // Observe element
        observer.observe(element);
    });
}

// Add styles for animation
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animated {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

/**
 * Fallback function to create auth modal if it doesn't exist
 * @param {string} activeTab - Which tab should be active ('login' or 'register')
 */
function createAuthModalFallback(activeTab = 'login') {
    console.log('Creating auth modal fallback with active tab:', activeTab);
    
    // Create modal HTML
    const modalHTML = `
        <div class="auth-modal-overlay">
            <div class="auth-modal">
                <div class="auth-modal-header">
                    <h2 class="auth-modal-title">PVP Chat</h2>
                    <p class="auth-modal-subtitle">Chat & Play Simultaneously</p>
                    <button class="auth-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="auth-tabs">
                    <div class="auth-tab ${activeTab === 'login' ? 'active' : ''}" data-tab="login">Login</div>
                    <div class="auth-tab ${activeTab === 'register' ? 'active' : ''}" data-tab="register">Register</div>
                </div>
                
                <div class="auth-modal-body">
                    <!-- Login Form -->
                    <form id="login-form" style="display: ${activeTab === 'login' ? 'block' : 'none'};">
                        <div class="auth-form-group">
                            <label class="auth-label" for="login-email">Email</label>
                            <input type="email" id="login-email" class="auth-input" placeholder="Enter your email" required>
                        </div>
                        
                        <div class="auth-form-group">
                            <label class="auth-label" for="login-password">Password</label>
                            <input type="password" id="login-password" class="auth-input" placeholder="Enter your password" required>
                        </div>
                        
                        <button type="submit" class="auth-submit-btn">Log In</button>
                        
                        <div class="auth-footer">
                            <p>Don't have an account? <span class="auth-link" data-action="switch-to-register">Register</span></p>
                        </div>
                    </form>
                    
                    <!-- Register Form -->
                    <form id="register-form" style="display: ${activeTab === 'register' ? 'block' : 'none'};">
                        <!-- Step 1: Email & Password -->
                        <div class="register-step step-1" style="display: block;">
                            <div class="auth-form-group">
                                <label class="auth-label" for="register-email">Email</label>
                                <input type="email" id="register-email" class="auth-input" placeholder="Enter your email" required>
                            </div>
                            
                            <div class="auth-form-group">
                                <label class="auth-label" for="register-password">Password</label>
                                <input type="password" id="register-password" class="auth-input" placeholder="Choose a password" required>
                            </div>
                            
                            <button type="button" class="auth-submit-btn continue-btn-step1">Continue</button>
                        </div>
                        
                        <!-- Step 2: Username -->
                        <div class="register-step step-2" style="display: none;">
                            <div class="auth-form-group">
                                <label class="auth-label" for="register-username">Username</label>
                                <input type="text" id="register-username" class="auth-input" placeholder="Choose a unique username" required>
                            </div>
                            
                            <button type="button" class="auth-submit-btn continue-btn-step2">Continue</button>
                            <button type="button" class="auth-back-btn back-btn-step2">Back</button>
                        </div>
                        
                        <!-- Step 3: Gender & Age -->
                        <div class="register-step step-3" style="display: none;">
                            <div class="auth-form-group">
                                <label class="auth-label">Gender</label>
                                <div class="gender-selection">
                                    <label class="gender-option">
                                        <input type="radio" name="gender" value="male" required>
                                        <span class="gender-label">Male</span>
                                    </label>
                                    <label class="gender-option">
                                        <input type="radio" name="gender" value="female">
                                        <span class="gender-label">Female</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="auth-form-group">
                                <label class="auth-label" for="register-age">Age</label>
                                <input type="number" id="register-age" class="auth-input" min="13" max="100" placeholder="Your age" required>
                            </div>
                            
                            <button type="button" class="auth-submit-btn continue-btn-step3">Continue</button>
                            <button type="button" class="auth-back-btn back-btn-step3">Back</button>
                        </div>
                        
                        <!-- Step 4: Avatar Selection -->
                        <div class="register-step step-4" style="display: none;">
                            <div class="avatar-selection">
                                <div class="avatar-selection-title">Choose your avatar</div>
                                <div class="avatar-grid">
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  1.png" required>
                                        <img src="public/assets/images/avatars/avatar  1.png" alt="Avatar 1" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  2.png">
                                        <img src="public/assets/images/avatars/avatar  2.png" alt="Avatar 2" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  3.png">
                                        <img src="public/assets/images/avatars/avatar  3.png" alt="Avatar 3" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  4.png">
                                        <img src="public/assets/images/avatars/avatar  4.png" alt="Avatar 4" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  5.png">
                                        <img src="public/assets/images/avatars/avatar  5.png" alt="Avatar 5" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  6.png">
                                        <img src="public/assets/images/avatars/avatar  6.png" alt="Avatar 6" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  7.png">
                                        <img src="public/assets/images/avatars/avatar  7.png" alt="Avatar 7" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  8.png">
                                        <img src="public/assets/images/avatars/avatar  8.png" alt="Avatar 8" class="avatar-img">
                                    </label>
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="avatar  9.png">
                                        <img src="public/assets/images/avatars/avatar  9.png" alt="Avatar 9" class="avatar-img">
                                    </label>
                                </div>
                            </div>
                            
                            <button type="button" class="auth-submit-btn finish-btn">Create Account</button>
                            <button type="button" class="auth-back-btn back-btn-step4">Back</button>
                        </div>
                        
                        <div class="auth-footer">
                            <p>Already have an account? <span class="auth-link" data-action="switch-to-login">Login</span></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get references to modal elements
    const authModalOverlay = document.querySelector('.auth-modal-overlay');
    const authModalClose = document.querySelector('.auth-modal-close');
    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
    const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');
    const switchToRegister = document.querySelector('[data-action="switch-to-register"]');
    const switchToLogin = document.querySelector('[data-action="switch-to-login"]');
    
    // Add event listeners for modal
    authModalClose.addEventListener('click', () => {
        authModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    authModalOverlay.addEventListener('click', (e) => {
        if (e.target === authModalOverlay) {
            authModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Tab switching
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        // Reset registration steps
        document.querySelectorAll('.register-step').forEach(step => {
            step.style.display = 'none';
        });
        document.querySelector('.step-1').style.display = 'block';
    });
    
    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });
    
    switchToRegister.addEventListener('click', () => {
        registerTab.click();
    });
    
    switchToLogin.addEventListener('click', () => {
        loginTab.click();
    });
    
    // Add step navigation handlers
    const goToStep = (stepNumber) => {
        document.querySelectorAll('.register-step').forEach(step => {
            step.style.display = 'none';
        });
        document.querySelector(`.step-${stepNumber}`).style.display = 'block';
    };
    
    // Step 1 continue button
    document.querySelector('.continue-btn-step1').addEventListener('click', () => {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Store data in sessionStorage
        sessionStorage.setItem('register_email', email);
        sessionStorage.setItem('register_password', password);
        
        goToStep(2);
    });
    
    // Step 2 continue button
    document.querySelector('.continue-btn-step2').addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        
        if (!username) {
            showError('Please enter a username');
            return;
        }
        
        // Here you would typically check if username is unique
        // For now, just store it
        sessionStorage.setItem('register_username', username);
        
        goToStep(3);
    });
    
    // Step 3 continue button
    document.querySelector('.continue-btn-step3').addEventListener('click', () => {
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const age = document.getElementById('register-age').value;
        
        if (!gender || !age) {
            showError('Please fill in all fields');
            return;
        }
        
        sessionStorage.setItem('register_gender', gender);
        sessionStorage.setItem('register_age', age);
        
        goToStep(4);
    });
    
    // Back buttons
    document.querySelector('.back-btn-step2').addEventListener('click', () => goToStep(1));
    document.querySelector('.back-btn-step3').addEventListener('click', () => goToStep(2));
    document.querySelector('.back-btn-step4').addEventListener('click', () => goToStep(3));
    
    // Finish registration button
    document.querySelector('.finish-btn').addEventListener('click', () => {
        const avatar = document.querySelector('input[name="avatar"]:checked')?.value;
        
        if (!avatar) {
            showError('Please select an avatar');
            return;
        }
        
        sessionStorage.setItem('register_avatar', avatar);
        
        // At this point, you would typically save the user data and create account
        // For now, show a success message and redirect to coming soon
        
        const username = sessionStorage.getItem('register_username');
        
        // Create a coming soon page
        const comingSoonHTML = `
            <div class="coming-soon-container">
                <div class="particles"></div>
                <h1 class="user-welcome">Welcome, ${username}!</h1>
                <img src="public/assets/images/avatars/${avatar}" alt="${username}" class="coming-soon-avatar">
                <p class="coming-soon-message">The website is still in development. We are working hard to bring you the best chat & play experience. Stay tuned for exciting updates!</p>
                <div class="coming-soon-features">
                    <div class="feature-preview">
                        <i class="fas fa-gamepad"></i>
                        <h3>Multi-Player Games</h3>
                        <p>Coming Soon</p>
                    </div>
                    <div class="feature-preview">
                        <i class="fas fa-comments"></i>
                        <h3>Real-Time Chat</h3>
                        <p>Coming Soon</p>
                    </div>
                    <div class="feature-preview">
                        <i class="fas fa-users"></i>
                        <h3>Global Community</h3>
                        <p>Coming Soon</p>
                    </div>
                </div>
                <button class="auth-submit-btn logout-btn">Logout</button>
            </div>
        `;
        
        document.body.innerHTML = comingSoonHTML;
        
        // Create particles
        createParticles();
        
        // Add hover effect for feature icons
        addFeatureIconsEffect();
        
        // Add style for coming soon page
        const style = document.createElement('style');
        style.textContent = `
            .coming-soon-container {
                max-width: 1100px;
                margin: 50px auto;
                padding: 60px 40px;
                text-align: center;
                background: linear-gradient(135deg, #1F2142, #2A2D45);
                border-radius: 30px;
                color: #fff;
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
                z-index: 1;
            }
            
            .coming-soon-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                  radial-gradient(circle at 20% 30%, rgba(88, 101, 242, 0.15) 0%, transparent 20%),
                  radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.1) 0%, transparent 20%);
                z-index: -1;
            }
            
            .coming-soon-container::after {
                content: '';
                position: absolute;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(88, 101, 242, 0.4), rgba(71, 82, 196, 0.1));
                filter: blur(50px);
                top: -50px;
                right: -50px;
                z-index: -1;
                animation: orbit 15s infinite linear;
            }
            
            @keyframes orbit {
                0% {
                    transform: rotate(0deg) translateX(50px) rotate(0deg);
                }
                100% {
                    transform: rotate(360deg) translateX(50px) rotate(-360deg);
                }
            }
            
            .user-welcome {
                font-size: 46px;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #5865F2, #FFD700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 800;
                text-shadow: 0 5px 15px rgba(88, 101, 242, 0.2);
                animation: gradientShift 8s ease infinite;
                background-size: 200% 200%;
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            .coming-soon-avatar {
                width: 160px;
                height: 160px;
                border-radius: 50%;
                object-fit: cover;
                border: 5px solid transparent;
                background: linear-gradient(white, white) padding-box,
                            linear-gradient(135deg, #5865F2, #FFD700) border-box;
                margin-bottom: 30px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                animation: float 6s ease-in-out infinite;
                transition: transform 0.3s ease;
            }
            
            .coming-soon-avatar:hover {
                transform: scale(1.05) rotate(5deg);
            }
            
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
                100% { transform: translateY(0px); }
            }
            
            .coming-soon-message {
                font-size: 18px;
                margin-bottom: 50px;
                line-height: 1.7;
                color: #B8C7FF;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
                position: relative;
            }
            
            .coming-soon-message::after {
                content: '';
                position: absolute;
                width: 100px;
                height: 4px;
                background: linear-gradient(90deg, transparent, #5865F2, transparent);
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 4px;
            }
            
            .coming-soon-features {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                margin: 60px 0;
                gap: 30px;
            }
            
            .feature-preview {
                padding: 30px;
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                width: 28%;
                min-width: 250px;
                margin-bottom: 20px;
                transition: all 0.4s ease;
                border: 1px solid rgba(255,255,255,0.1);
                position: relative;
                overflow: hidden;
                z-index: 1;
            }
            
            .feature-preview::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(88, 101, 242, 0.2), transparent);
                top: 0;
                left: 0;
                z-index: -1;
                opacity: 0;
                transition: opacity 0.4s ease;
            }
            
            .feature-preview:hover {
                transform: translateY(-15px);
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.2);
                box-shadow: 0 15px 30px rgba(0,0,0,0.2);
            }
            
            .feature-preview:hover::before {
                opacity: 1;
            }
            
            .feature-preview i {
                font-size: 46px;
                color: #FFD700;
                margin-bottom: 20px;
                transition: all 0.3s ease;
            }
            
            .feature-preview:hover i {
                transform: translateY(-8px) scale(1.1);
                color: #5865F2;
            }
            
            .feature-preview h3 {
                font-size: 24px;
                margin-bottom: 15px;
                color: #fff;
                position: relative;
                display: inline-block;
            }
            
            .feature-preview h3::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 0;
                width: 0;
                height: 2px;
                background: linear-gradient(90deg, #5865F2, #FFD700);
                transition: width 0.3s ease;
            }
            
            .feature-preview:hover h3::after {
                width: 100%;
            }
            
            .feature-preview p {
                color: #B8C7FF;
                font-weight: 600;
                font-size: 16px;
                background: linear-gradient(135deg, #5865F2 30%, #FFD700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 1px;
            }
            
            .logout-btn {
                background: linear-gradient(135deg, #5865F2, #4752C4);
                color: white;
                border: none;
                padding: 16px 40px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
                position: relative;
                overflow: hidden;
                z-index: 1;
                box-shadow: 0 10px 25px rgba(88, 101, 242, 0.3);
                letter-spacing: 1px;
            }
            
            .logout-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #4752C4, #3b44a0);
                z-index: -1;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .logout-btn:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(88, 101, 242, 0.4);
            }
            
            .logout-btn:hover::before {
                opacity: 1;
            }
            
            .particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
            }
            
            .particle {
                position: absolute;
                background: white;
                border-radius: 50%;
                opacity: 0.3;
                animation: particleFloat 15s infinite linear;
            }
            
            @keyframes particleFloat {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .coming-soon-container {
                    padding: 40px 20px;
                    margin: 20px;
                }
                
                .user-welcome {
                    font-size: 36px;
                }
                
                .coming-soon-avatar {
                    width: 120px;
                    height: 120px;
                }
                
                .coming-soon-features {
                    flex-direction: column;
                    align-items: center;
                }
                
                .feature-preview {
                    width: 90%;
                    margin-bottom: 15px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Logout button
        document.querySelector('.logout-btn').addEventListener('click', () => {
            // Clear session storage
            sessionStorage.clear();
            window.location.reload();
        });
    });
    
    // Helper function to show error messages
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'background: #FEE2E2; color: #DC2626; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center;';
        
        // Find where to insert the error
        const currentStep = document.querySelector('.register-step[style*="block"]') || loginForm;
        currentStep.insertAdjacentElement('afterbegin', errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Return the modal
    return authModalOverlay;
}

// Create particles for the coming soon page
function createParticles() {
    const particles = document.querySelector('.particles');
    if (!particles) return;
    
    // Create 50 particles with random properties
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 3px and 8px
        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration between 15-30s
        const duration = Math.random() * 15 + 15;
        particle.style.animationDuration = `${duration}s`;
        
        // Random delay
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        particles.appendChild(particle);
    }
}

// Add 3D hover effect to feature icons
function addFeatureIconsEffect() {
    const features = document.querySelectorAll('.feature-preview');
    
    features.forEach(feature => {
        feature.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            // Calculate rotation based on mouse position
            const xRotation = ((y - rect.height / 2) / 10) * -1;
            const yRotation = (x - rect.width / 2) / 10;
            
            // Apply the rotation and other transforms
            this.style.transform = `
                perspective(1000px)
                translateY(-15px)
                rotateX(${xRotation}deg)
                rotateY(${yRotation}deg)
                scale3d(1.05, 1.05, 1.05)
            `;
            
            // Move the icon based on mouse position
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = `
                    translateX(${yRotation}px)
                    translateY(${xRotation * -1}px)
                `;
            }
        });
        
        feature.addEventListener('mouseleave', function() {
            // Reset the transform on mouse leave
            this.style.transform = '';
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = '';
            }
            
            // Add a transition for smoother reset
            this.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                this.style.transition = '';
            }, 500);
        });
    });
}

/**
 * Handle click for action buttons ("Get Started" and "Play Now")
 * Redirects to chat if logged in, or shows auth modal if not
 */
function handleActionButtonClick() {
    console.log('Action button clicked');
    
    // Check if user is logged in
    const user = firebase.auth.currentUser;
    
    if (user) {
        // User is logged in, redirect to chat
        console.log('User is logged in, redirecting to chat');
        window.location.href = 'chat.html';
    } else {
        // User is not logged in, show auth modal
        console.log('User is not logged in, showing auth modal');
        const authModalOverlay = document.querySelector('.auth-modal-overlay');
        
        if (authModalOverlay) {
            authModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Switch to register tab if exists (to encourage new users to register)
            const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
            const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
            const loginForm = document.querySelector('#login-form');
            const registerForm = document.querySelector('#register-form');
            
            if (loginTab && registerTab && loginForm && registerForm) {
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        } else {
            // Create auth modal if it doesn't exist
            createAuthModalFallback('register');
        }
        
        // Show a toast message
        showToast('Please login or register to access the chat', 'info');
    }
}

/**
 * Check if user is logged in and update UI accordingly
 */
function checkUserLoggedIn() {
    console.log('Checking if user is logged in');
    
    // Listen for auth state changes
    firebase.auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User is logged in:', user);
            
            // Fetch user data from Firebase
            const userRef = firebase.database.ref(`users/${user.uid}`);
            userRef.once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        console.log('User data retrieved:', userData);
                        updateUIForLoggedInUser(userData);
                    } else {
                        console.log('No user data found in database');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        } else {
            console.log('User is not logged in');
            updateUIForLoggedOutUser();
        }
    });
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser(userData) {
    console.log('Updating UI for logged in user');
    
    // Get auth buttons container
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    // Hide login and signup buttons
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    
    // Create user profile header
    const userProfileHTML = `
        <div class="user-profile-header">
            <div class="user-profile-info">
                <img src="public/assets/images/avatars/${userData.avatar}" alt="${userData.username}" class="user-avatar">
                <span class="user-name">${userData.username}</span>
            </div>
            <button class="logout-btn" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    `;
    
    authButtons.innerHTML = userProfileHTML;
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Update call-to-action buttons
    const getStartedBtn = document.querySelector('.get-started-btn');
    const playNowBtn = document.querySelector('.play-now-btn');
    
    if (getStartedBtn) getStartedBtn.textContent = 'Open Chat';
    if (playNowBtn) playNowBtn.textContent = 'Play Now';
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
    console.log('Updating UI for logged out user');
    
    // Get auth buttons container
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    // Show default login and signup buttons
    const defaultButtonsHTML = `
        <button class="login-btn">Login</button>
        <button class="signup-btn">REGISTER</button>
    `;
    
    authButtons.innerHTML = defaultButtonsHTML;
    
    // Add event listeners to new buttons
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openAuthModal('login');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            openAuthModal('register');
        });
    }
    
    // Update call-to-action buttons
    const getStartedBtn = document.querySelector('.get-started-btn');
    const playNowBtn = document.querySelector('.play-now-btn');
    
    if (getStartedBtn) getStartedBtn.textContent = 'Get Started';
    if (playNowBtn) playNowBtn.textContent = 'Play Now';
}

// Handle logout
async function handleLogout() {
    try {
        const { logoutUser } = await import('./firebase-auth.js');
        const result = await logoutUser();
        
        if (result.success) {
            console.log('Logout successful');
            // Refresh the page to show logged out state
            window.location.reload();
        } else {
            console.error('Logout failed:', result.error);
            showToast('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

// Open auth modal
function openAuthModal(tab = 'login') {
    const authModal = document.querySelector('.auth-modal-overlay');
    
    if (authModal) {
        // Show the modal
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set active tab
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    } else {
        console.error('Auth modal not found');
        // Try to initialize auth system
        import('./auth.js').then(auth => {
            auth.initAuth();
            setTimeout(() => {
                openAuthModal(tab);
            }, 100);
        });
    }
}

// Show toast message
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    
    // Create container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container');
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Add active class after a small delay for animation
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('active');
        
        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
} 