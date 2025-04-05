// Firebase Authentication Functions
import { auth, database } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

// Register a new user
export const registerUser = async (email, password, username, gender, age, avatar) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: username,
      photoURL: avatar
    });
    
    // Save additional user data to Realtime Database
    await set(ref(database, `users/${user.uid}`), {
      username,
      email,
      gender,
      age,
      avatar,
      status: 'online',
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      friends: [],
      settings: {
        theme: 'light',
        notifications: true,
        sounds: true
      }
    });
    
    // Save username to check uniqueness
    await set(ref(database, `usernames/${username}`), user.uid);
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Check if there's a saved redirect path
    const savedRedirect = localStorage.getItem('redirectAfterLogin');
    if (savedRedirect && savedRedirect.includes('chat.html')) {
      window.location.href = savedRedirect;
      localStorage.removeItem('redirectAfterLogin');
    } else {
      window.location.href = 'chat.html';
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email or try logging in.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format. Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password with at least 6 characters.';
    }
    
    showToast(errorMessage, 'error');
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last active and status
    await set(ref(database, `users/${userCredential.user.uid}/lastActive`), new Date().toISOString());
    await set(ref(database, `users/${userCredential.user.uid}/status`), 'online');
    
    // Check if there's a saved redirect path
    const savedRedirect = localStorage.getItem('redirectAfterLogin');
    if (savedRedirect && savedRedirect.includes('chat.html')) {
      window.location.href = savedRedirect;
      localStorage.removeItem('redirectAfterLogin');
    } else {
      window.location.href = 'chat.html';
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please check your credentials and try again.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format. Please enter a valid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
    }
    
    showToast(errorMessage, 'error');
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Update status to offline before signing out
    const user = auth.currentUser;
    if (user) {
      await set(ref(database, `users/${user.uid}/status`), 'offline');
      await set(ref(database, `users/${user.uid}/lastActive`), new Date().toISOString());
    }
    
    await signOut(auth);
    console.log('User logged out successfully');
    showToast('You have been logged out successfully.', 'info');
    
    // Clear any saved redirects
    localStorage.removeItem('redirectAfterLogin');
    
    // Redirect to home page
    window.location.href = 'index.html';
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Failed to log out. Please try again.', 'error');
    return { success: false, error: error.message };
  }
};

// Check if username is already taken
export const isUsernameTaken = async (username) => {
  try {
    const snapshot = await get(ref(database, `usernames/${username}`));
    return snapshot.exists();
  } catch (error) {
    console.error('Username check error:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
};

// Get current user data
export const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const snapshot = await get(ref(database, `users/${user.uid}`));
    if (snapshot.exists()) {
      return { uid: user.uid, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

// Listen to auth state changes
export const initAuthListener = (onUserLoggedIn, onUserLoggedOut) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = await getCurrentUserData();
      onUserLoggedIn(userData);
    } else {
      onUserLoggedOut();
    }
  });
}; 