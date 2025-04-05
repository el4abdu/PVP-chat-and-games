import { auth, database, storage } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// DOM Elements
let authModalOverlay;
let authModal;
let loginTab;
let registerTab;
let loginForm;
let registerForm;
let authModalClose;
let avatarSelection;
let currentTab = 'login';
let selectedAvatar = '';

// Debug function to check DOM state
function debugDOMState() {
  console.log('=============== DOM STATE DEBUG ===============');
  const loginBtn = document.querySelector('.login-btn');
  const signupBtn = document.querySelector('.signup-btn');
  const authModalOverlay = document.querySelector('.auth-modal-overlay');
  
  console.log('Login button exists:', !!loginBtn);
  console.log('Sign up button exists:', !!signupBtn);
  console.log('Auth modal overlay exists:', !!authModalOverlay);
  
  if (loginBtn) {
    console.log('Login button HTML:', loginBtn.outerHTML);
  }
  
  if (signupBtn) {
    console.log('Sign up button HTML:', signupBtn.outerHTML);
  }
  
  console.log('Auth buttons parent:', document.querySelector('.auth-buttons')?.outerHTML);
  console.log('===============================================');
}

// Initialize Auth Modal
export function initAuth() {
  console.log('Initializing auth system...');
  
  // Check for existing auth modal
  let authModalOverlay = document.querySelector('.auth-modal-overlay');
  
  // If modal already exists, just setup events
  if (authModalOverlay) {
    setupAuthEvents();
    return;
  }
  
  // Create auth modal if it doesn't exist
  createAuthModal();
  setupAuthEvents();
  
  // Check if user is already logged in
  checkAuthState();
}

// Create the auth modal HTML
function createAuthModal() {
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
          <div class="auth-tab active" data-tab="login">Login</div>
          <div class="auth-tab" data-tab="register">Register</div>
        </div>
        
        <div class="auth-modal-body">
          <!-- Login Form -->
          <form id="login-form" style="display: block;">
            <div class="auth-form-group">
              <label class="auth-label" for="login-email">Email</label>
              <input type="email" id="login-email" class="auth-input" placeholder="Enter your email" required>
            </div>
            
            <div class="auth-form-group">
              <label class="auth-label" for="login-password">Password</label>
              <input type="password" id="login-password" class="auth-input" placeholder="Enter your password" required>
            </div>
            
            <button type="submit" class="auth-submit-btn">Log In</button>
            
            <div class="social-login">
              <div class="social-login-text">Or login with</div>
              <div class="social-buttons">
                <button type="button" class="social-btn google-btn">
                  <i class="fab fa-google"></i> Google
                </button>
                <button type="button" class="social-btn facebook-btn">
                  <i class="fab fa-facebook-f"></i> Facebook
                </button>
              </div>
            </div>
            
            <div class="auth-footer">
              <p>Don't have an account? <span class="auth-link" data-action="switch-to-register">Register</span></p>
            </div>
          </form>
          
          <!-- Register Form -->
          <form id="register-form" style="display: none;">
            <div class="auth-form-group">
              <label class="auth-label" for="register-email">Email</label>
              <input type="email" id="register-email" class="auth-input" placeholder="Enter your email" required>
            </div>
            
            <div class="auth-form-group">
              <label class="auth-label" for="register-password">Password</label>
              <input type="password" id="register-password" class="auth-input" placeholder="Choose a password" required>
            </div>
            
            <div class="auth-form-group">
              <label class="auth-label" for="register-username">Username</label>
              <input type="text" id="register-username" class="auth-input" placeholder="Choose a unique username" required>
            </div>
            
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
            
            <button type="submit" class="auth-submit-btn">Create Account</button>
            
            <div class="social-login">
              <div class="social-login-text">Or register with</div>
              <div class="social-buttons">
                <button type="button" class="social-btn google-btn">
                  <i class="fab fa-google"></i> Google
                </button>
                <button type="button" class="social-btn facebook-btn">
                  <i class="fab fa-facebook-f"></i> Facebook
                </button>
              </div>
            </div>
            
            <div class="auth-footer">
              <p>Already have an account? <span class="auth-link" data-action="switch-to-login">Login</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add click events for the auth links
  setTimeout(() => {
    document.querySelector('[data-action="switch-to-register"]').addEventListener('click', () => switchTab('register'));
    document.querySelector('[data-action="switch-to-login"]').addEventListener('click', () => switchTab('login'));
  }, 0);
}

// Open the auth modal
function openAuthModal(tab = 'login') {
  console.log('Opening auth modal with tab:', tab);
  
  if (!authModalOverlay) {
    console.error('Auth modal overlay not found!');
    authModalOverlay = document.querySelector('.auth-modal-overlay');
    if (!authModalOverlay) {
      console.error('Still could not find modal overlay. Creating it now.');
      createAuthModal();
      authModalOverlay = document.querySelector('.auth-modal-overlay');
      authModal = document.querySelector('.auth-modal');
      loginTab = document.querySelector('.auth-tab[data-tab="login"]');
      registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    }
  }
  
  authModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  console.log('Modal opened, switching to tab:', tab);
  switchTab(tab);
}

// Close the auth modal
function closeAuthModal() {
  authModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Switch between login and register tabs
function switchTab(tab) {
  console.log('Switching to tab:', tab);
  currentTab = tab;
  
  // Check if elements exist
  if (!loginTab || !registerTab) {
    console.error('Tab elements not found');
    loginTab = document.querySelector('.auth-tab[data-tab="login"]');
    registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    
    if (!loginTab || !registerTab) {
      console.error('Could not find tab elements even after retrying');
      return;
    }
  }
  
  if (!loginForm || !registerForm) {
    console.error('Form elements not found');
    loginForm = document.querySelector('#login-form');
    registerForm = document.querySelector('#register-form');
    
    if (!loginForm || !registerForm) {
      console.error('Could not find form elements even after retrying');
      return;
    }
  }
  
  // Update active tab
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    console.log('Switched to login tab');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    console.log('Switched to register tab');
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    closeAuthModal();
    showSuccessMessage('Login successful!');
  } catch (error) {
    showErrorMessage('Login failed: ' + getAuthErrorMessage(error));
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const username = document.getElementById('register-username').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const age = document.getElementById('register-age').value;
  const avatarValue = document.querySelector('input[name="avatar"]:checked')?.value;
  
  if (!avatarValue) {
    showErrorMessage('Please select an avatar');
    return;
  }
  
  try {
    // Check if username is unique
    const usernameSnapshot = await get(ref(database, 'usernames/' + username));
    if (usernameSnapshot.exists()) {
      showErrorMessage('Username already taken. Please choose another one.');
      return;
    }
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user profile
    await set(ref(database, 'users/' + user.uid), {
      username: username,
      gender: gender,
      age: age,
      avatar: avatarValue,
      createdAt: new Date().toISOString()
    });
    
    // Save username to check uniqueness later
    await set(ref(database, 'usernames/' + username), user.uid);
    
    closeAuthModal();
    showSuccessMessage('Registration successful!');
    showComingSoonPage(username, avatarValue);
  } catch (error) {
    showErrorMessage('Registration failed: ' + getAuthErrorMessage(error));
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in our database
    const userSnapshot = await get(ref(database, 'users/' + user.uid));
    
    if (!userSnapshot.exists()) {
      // New user, open the profile completion modal
      openProfileCompletionModal(user);
    } else {
      // Existing user
      closeAuthModal();
      showSuccessMessage('Login successful!');
      const userData = userSnapshot.val();
      showComingSoonPage(userData.username, userData.avatar);
    }
  } catch (error) {
    showErrorMessage('Google sign-in failed: ' + getAuthErrorMessage(error));
  }
}

// Sign in with Facebook
async function signInWithFacebook() {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in our database
    const userSnapshot = await get(ref(database, 'users/' + user.uid));
    
    if (!userSnapshot.exists()) {
      // New user, open the profile completion modal
      openProfileCompletionModal(user);
    } else {
      // Existing user
      closeAuthModal();
      showSuccessMessage('Login successful!');
      const userData = userSnapshot.val();
      showComingSoonPage(userData.username, userData.avatar);
    }
  } catch (error) {
    showErrorMessage('Facebook sign-in failed: ' + getAuthErrorMessage(error));
  }
}

// Open modal for completing profile after social login
function openProfileCompletionModal(user) {
  // Hide the regular auth modal content
  authModal.querySelector('.auth-tabs').style.display = 'none';
  authModal.querySelector('#login-form').style.display = 'none';
  authModal.querySelector('#register-form').style.display = 'none';
  
  // Create profile completion form
  const profileCompletionHTML = `
    <form id="profile-completion-form">
      <div class="auth-modal-header">
        <h2 class="auth-modal-title">Complete Your Profile</h2>
        <p class="auth-modal-subtitle">Just a few more details to get started</p>
      </div>
      
      <div class="auth-modal-body">
        <div class="auth-form-group">
          <label class="auth-label" for="completion-username">Username</label>
          <input type="text" id="completion-username" class="auth-input" placeholder="Choose a unique username" required>
        </div>
        
        <div class="auth-form-group">
          <label class="auth-label">Gender</label>
          <div class="gender-selection">
            <label class="gender-option">
              <input type="radio" name="completion-gender" value="male" required>
              <span class="gender-label">Male</span>
            </label>
            <label class="gender-option">
              <input type="radio" name="completion-gender" value="female">
              <span class="gender-label">Female</span>
            </label>
          </div>
        </div>
        
        <div class="auth-form-group">
          <label class="auth-label" for="completion-age">Age</label>
          <input type="number" id="completion-age" class="auth-input" min="13" max="100" placeholder="Your age" required>
        </div>
        
        <div class="avatar-selection active">
          <div class="avatar-selection-title">Choose your avatar</div>
          <div class="avatar-grid">
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  1.png" required>
              <img src="public/assets/images/avatars/avatar  1.png" alt="Avatar 1" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  2.png">
              <img src="public/assets/images/avatars/avatar  2.png" alt="Avatar 2" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  3.png">
              <img src="public/assets/images/avatars/avatar  3.png" alt="Avatar 3" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  4.png">
              <img src="public/assets/images/avatars/avatar  4.png" alt="Avatar 4" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  5.png">
              <img src="public/assets/images/avatars/avatar  5.png" alt="Avatar 5" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  6.png">
              <img src="public/assets/images/avatars/avatar  6.png" alt="Avatar 6" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  7.png">
              <img src="public/assets/images/avatars/avatar  7.png" alt="Avatar 7" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  8.png">
              <img src="public/assets/images/avatars/avatar  8.png" alt="Avatar 8" class="avatar-img">
            </label>
            <label class="avatar-option">
              <input type="radio" name="completion-avatar" value="avatar  9.png">
              <img src="public/assets/images/avatars/avatar  9.png" alt="Avatar 9" class="avatar-img">
            </label>
          </div>
        </div>
        
        <button type="submit" class="auth-submit-btn">Complete Profile</button>
      </div>
    </form>
  `;
  
  authModal.querySelector('.auth-modal-body').insertAdjacentHTML('beforeend', profileCompletionHTML);
  
  // Handle profile completion form submission
  const profileForm = document.getElementById('profile-completion-form');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('completion-username').value;
    const gender = document.querySelector('input[name="completion-gender"]:checked').value;
    const age = document.getElementById('completion-age').value;
    const avatar = document.querySelector('input[name="completion-avatar"]:checked').value;
    
    try {
      // Check if username is unique
      const usernameSnapshot = await get(ref(database, 'usernames/' + username));
      if (usernameSnapshot.exists()) {
        showErrorMessage('Username already taken. Please choose another one.');
        return;
      }
      
      // Save user profile
      await set(ref(database, 'users/' + user.uid), {
        username: username,
        gender: gender,
        age: age,
        avatar: avatar,
        email: user.email,
        createdAt: new Date().toISOString()
      });
      
      // Save username to check uniqueness later
      await set(ref(database, 'usernames/' + username), user.uid);
      
      closeAuthModal();
      showSuccessMessage('Profile completed!');
      showComingSoonPage(username, avatar);
    } catch (error) {
      showErrorMessage('Failed to complete profile: ' + error.message);
    }
  });
}

// Handle auth state changes
function handleAuthStateChange(user) {
  const authButtons = document.querySelector('.auth-buttons');
  
  if (user) {
    // User is signed in
    get(ref(database, 'users/' + user.uid)).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Update UI for signed in user
        if (authButtons) {
          authButtons.innerHTML = `
            <div class="user-profile-button">
              <img src="public/assets/images/avatars/${userData.avatar}" alt="${userData.username}" class="user-avatar">
              <span>${userData.username}</span>
              <button class="logout-btn"><i class="fas fa-sign-out-alt"></i></button>
            </div>
          `;
          
          // Add logout handler
          document.querySelector('.logout-btn').addEventListener('click', () => {
            signOut(auth).then(() => {
              showSuccessMessage('Logged out successfully');
              window.location.reload();
            });
          });
        }
      }
    });
  } else {
    // User is signed out
    if (authButtons) {
      authButtons.innerHTML = `
        <button class="login-btn">Login</button>
        <button class="signup-btn">REGISTER</button>
      `;
      
      // Re-add event listeners
      document.querySelector('.login-btn').addEventListener('click', () => openAuthModal('login'));
      document.querySelector('.signup-btn').addEventListener('click', () => openAuthModal('register'));
    }
  }
}

// Show Coming Soon page after successful login/register
function showComingSoonPage(username, avatar) {
  // Create coming soon page
  const comingSoonHTML = `
    <div class="coming-soon-container">
      <h1 class="user-welcome">Welcome, ${username}!</h1>
      <img src="public/assets/images/avatars/${avatar}" alt="${username}" class="coming-soon-image">
      <p class="coming-soon-message">The website is still in development. We are working hard to bring you the best chat & play experience. Stay tuned for exciting updates!</p>
      <button class="auth-submit-btn logout-btn">Logout</button>
    </div>
  `;
  
  // Replace page content
  document.querySelector('main') ? document.querySelector('main').innerHTML = comingSoonHTML : document.body.innerHTML = comingSoonHTML;
  
  // Add logout handler
  document.querySelector('.logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
      showSuccessMessage('Logged out successfully');
      window.location.reload();
    });
  });
}

// Helper to show error messages
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'auth-error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'background: #FEE2E2; color: #DC2626; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center;';
  
  // Find where to insert the error
  const targetForm = currentTab === 'login' ? loginForm : registerForm;
  targetForm.insertAdjacentElement('afterbegin', errorDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Helper to show success messages
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.textContent = message;
  successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #D1FAE5; color: #047857; padding: 12px 20px; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); animation: slideIn 0.3s forwards;';
  
  document.body.appendChild(successDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      successDiv.remove();
    }, 300);
  }, 3000);
  
  // Add slide out animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(20px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Get human-readable error message
function getAuthErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Email is already in use';
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/popup-closed-by-user':
      return 'Login popup was closed';
    default:
      return error.message;
  }
}

// Setup auth events
function setupAuthEvents() {
  // Auth tabs
  const authTabs = document.querySelectorAll('.auth-tab');
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Update tab active state
      authTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding form
      document.getElementById('login-form').style.display = tabName === 'login' ? 'block' : 'none';
      document.getElementById('register-form').style.display = tabName === 'register' ? 'block' : 'none';
      document.getElementById('forgot-password-form').style.display = 'none';
    });
  });
  
  // Close modal
  const closeBtn = document.querySelector('.auth-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.querySelector('.auth-modal-overlay').classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }
  
  // Forgot password link
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('forgot-password-form').style.display = 'block';
    });
  }
  
  // Back to login link
  const backToLoginLink = document.getElementById('back-to-login-link');
  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('forgot-password-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    });
  }
  
  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        // Call login function from firebase-auth.js
        const { loginUser } = await import('./firebase-auth.js');
        const result = await loginUser(email, password);
        
        if (result.success) {
          showToast('Successfully logged in!', 'success');
          
          // Hide the modal
          document.querySelector('.auth-modal-overlay').classList.remove('active');
          document.body.style.overflow = 'auto';
          
          // Update UI for logged in user
          updateAuthUI(true);
          
          // Redirect to chat page
          window.location.href = 'chat.html';
        } else {
          showToast(result.error || 'Login failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
      }
    });
  }
  
  // Register form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      const selectedAvatar = document.querySelector('.avatar-option.selected img');
      
      if (!username || !email || !password || !confirmPassword) {
        showToast('Please fill out all fields', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      if (!selectedAvatar) {
        showToast('Please select an avatar', 'error');
        return;
      }
      
      const avatar = selectedAvatar.src;
      
      try {
        // Check if username is unique
        const { isUsernameTaken, registerUser } = await import('./firebase-auth.js');
        const isTaken = await isUsernameTaken(username);
        
        if (isTaken) {
          showToast('Username is already taken', 'error');
          return;
        }
        
        // Generate random gender and age for demo purposes
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const age = Math.floor(Math.random() * 23) + 18;  // 18-40
        
        // Call register function from firebase-auth.js
        const result = await registerUser(email, password, username, gender, age, avatar);
        
        if (result.success) {
          showToast('Successfully registered! You can now login.', 'success');
          
          // Hide the modal
          document.querySelector('.auth-modal-overlay').classList.remove('active');
          document.body.style.overflow = 'auto';
          
          // Update UI for logged in user
          updateAuthUI(true);
          
          // Redirect to chat page
          window.location.href = 'chat.html';
        } else {
          showToast(result.error || 'Registration failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
      }
    });
  }
  
  // Forgot password form submission
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('reset-email').value;
      
      try {
        // Call reset password function from firebase-auth.js
        const { resetPassword } = await import('./firebase-auth.js');
        const result = await resetPassword(email);
        
        if (result.success) {
          showToast('Password reset email sent!', 'success');
          
          // Go back to login form
          document.getElementById('forgot-password-form').style.display = 'none';
          document.getElementById('login-form').style.display = 'block';
        } else {
          showToast(result.error || 'Password reset failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Password reset error:', error);
        showToast('Password reset failed. Please try again.', 'error');
      }
    });
  }
  
  // Social auth buttons
  const googleAuthBtn = document.querySelector('.google-btn');
  if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', () => {
      // Will be implemented with Firebase Auth
      showToast('Google authentication coming soon!', 'info');
    });
  }
  
  const facebookAuthBtn = document.querySelector('.facebook-btn');
  if (facebookAuthBtn) {
    facebookAuthBtn.addEventListener('click', () => {
      // Will be implemented with Firebase Auth
      showToast('Facebook authentication coming soon!', 'info');
    });
  }
}

// Load avatars for selection
function loadAvatarsForSelection() {
  const avatarOptions = document.getElementById('avatar-options');
  if (!avatarOptions) return;
  
  // Find avatar storage
  const avatarStorage = document.getElementById('avatar-storage');
  if (!avatarStorage) return;
  
  // Get all avatar images
  const avatarImages = avatarStorage.querySelectorAll('img');
  
  // Clear existing options
  avatarOptions.innerHTML = '';
  
  // Add each avatar as an option
  avatarImages.forEach(img => {
    const option = document.createElement('div');
    option.classList.add('avatar-option');
    
    const avatar = document.createElement('img');
    avatar.src = img.src;
    avatar.alt = img.alt;
    
    option.appendChild(avatar);
    avatarOptions.appendChild(option);
    
    // Add click event
    option.addEventListener('click', () => {
      // Remove selected class from all options
      document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Add selected class to clicked option
      option.classList.add('selected');
    });
  });
  
  // Select first avatar by default
  if (avatarOptions.firstChild) {
    avatarOptions.firstChild.classList.add('selected');
  }
}

// Function to show toast message
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

// Check if user is logged in
async function checkAuthState() {
  try {
    // Import auth state listener from firebase-auth
    const { initAuthListener } = await import('./firebase-auth.js');
    
    // Set up listener
    initAuthListener(
      // User logged in
      (userData) => {
        console.log('User is logged in:', userData);
        updateAuthUI(true, userData);
        
        // Redirect to chat page if on login button or get started is clicked
        const loginButton = document.querySelector('.login-btn');
        const getStartedButton = document.querySelector('.get-started-btn');
        const playNowButton = document.querySelector('.play-now-btn');
        
        if (loginButton) {
          loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'chat.html';
          });
        }
        
        if (getStartedButton) {
          getStartedButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'chat.html';
          });
        }
        
        if (playNowButton) {
          playNowButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'chat.html';
          });
        }
      },
      // User logged out
      () => {
        console.log('User is logged out');
        updateAuthUI(false);
      }
    );
  } catch (error) {
    console.error('Auth state check error:', error);
  }
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn, userData = null) {
  // Handle header auth buttons
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) {
    if (isLoggedIn && userData) {
      // Replace login/register buttons with user profile and logout
      authButtons.innerHTML = `
        <div class="user-profile-header">
          <img src="${userData.avatar}" alt="${userData.username}" class="user-avatar-small">
          <span class="user-name-small">${userData.username}</span>
        </div>
        <button class="logout-btn-header">Logout</button>
      `;
      
      // Add logout event listener
      const logoutBtn = document.querySelector('.logout-btn-header');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            // Call logout function from firebase-auth.js
            const { logoutUser } = await import('./firebase-auth.js');
            const result = await logoutUser();
            
            if (result.success) {
              showToast('Successfully logged out!', 'success');
              // Refresh page
              window.location.reload();
            } else {
              showToast(result.error || 'Logout failed. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Logout error:', error);
            showToast('Logout failed. Please try again.', 'error');
          }
        });
      }
    } else {
      // Show login/register buttons
      authButtons.innerHTML = `
        <button class="login-btn">Login</button>
        <button class="signup-btn">REGISTER</button>
      `;
      
      // Add event listeners
      const loginBtn = document.querySelector('.login-btn');
      const signupBtn = document.querySelector('.signup-btn');
      
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          const authModal = document.querySelector('.auth-modal-overlay');
          if (authModal) {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show login form
            document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
            document.querySelector('.auth-tab[data-tab="register"]').classList.remove('active');
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('register-form').style.display = 'none';
          } else {
            console.error('Auth modal not found, trying to create it');
            createAuthModal();
            setupAuthEvents();
            
            // Show modal after creation
            setTimeout(() => {
              document.querySelector('.auth-modal-overlay').classList.add('active');
              document.body.style.overflow = 'hidden';
            }, 100);
          }
        });
      }
      
      if (signupBtn) {
        signupBtn.addEventListener('click', () => {
          const authModal = document.querySelector('.auth-modal-overlay');
          if (authModal) {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show register form
            document.querySelector('.auth-tab[data-tab="login"]').classList.remove('active');
            document.querySelector('.auth-tab[data-tab="register"]').classList.add('active');
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
          } else {
            console.error('Auth modal not found, trying to create it');
            createAuthModal();
            setupAuthEvents();
            
            // Show modal after creation
            setTimeout(() => {
              document.querySelector('.auth-modal-overlay').classList.add('active');
              document.body.style.overflow = 'hidden';
              
              // Switch to register tab
              document.querySelector('.auth-tab[data-tab="login"]').classList.remove('active');
              document.querySelector('.auth-tab[data-tab="register"]').classList.add('active');
              document.getElementById('login-form').style.display = 'none';
              document.getElementById('register-form').style.display = 'block';
            }, 100);
          }
        });
      }
    }
  }
  
  // Change Get Started and Play Now buttons behavior
  const getStartedBtn = document.querySelector('.get-started-btn');
  const playNowBtn = document.querySelector('.play-now-btn');
  
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (isLoggedIn) {
        // Redirect to chat
        window.location.href = 'chat.html';
      } else {
        // Show login modal
        const authModal = document.querySelector('.auth-modal-overlay');
        if (authModal) {
          authModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        } else {
          createAuthModal();
          setupAuthEvents();
          
          // Show modal after creation
          setTimeout(() => {
            document.querySelector('.auth-modal-overlay').classList.add('active');
            document.body.style.overflow = 'hidden';
          }, 100);
        }
      }
    });
  }
  
  if (playNowBtn) {
    playNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (isLoggedIn) {
        // Redirect to chat
        window.location.href = 'chat.html';
      } else {
        // Show login modal
        const authModal = document.querySelector('.auth-modal-overlay');
        if (authModal) {
          authModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        } else {
          createAuthModal();
          setupAuthEvents();
          
          // Show modal after creation
          setTimeout(() => {
            document.querySelector('.auth-modal-overlay').classList.add('active');
            document.body.style.overflow = 'hidden';
          }, 100);
        }
      }
    });
  }
} 