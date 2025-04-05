// Chat functionality with Firebase
import { auth, database, storage } from './firebase-config.js';
import { ref, onValue, push, set, get, query, orderByChild } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

// DOM elements
const userProfile = document.querySelector('.user-profile');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const chatList = document.getElementById('chat-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const attachBtn = document.getElementById('attach-btn');
const currentRoomName = document.getElementById('current-room-name');
const currentRoomParticipants = document.getElementById('current-room-participants');
const logoutBtn = document.getElementById('logout-btn');

// Variables to store current state
let currentUser = null;
let currentRoom = null;
let rooms = [];
let unsubscribeRooms = null;
let unsubscribeMessages = null;

// Initialize chat
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat page loaded');
    
    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.uid);
            
            // Get user data from database
            try {
                const userSnapshot = await get(ref(database, `users/${user.uid}`));
                if (userSnapshot.exists()) {
                    currentUser = {
                        uid: user.uid,
                        ...userSnapshot.val()
                    };
                    
                    // Update UI with user data
                    updateUserProfile(currentUser);
                    
                    // Load chat rooms
                    loadChatRooms();
                    
                    // Enable chat functionality
                    enableChat();
                } else {
                    console.error('User data not found in database');
                    showToast('User data not found. Please try logging in again.', 'error');
                    redirectToLogin();
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                showToast('Failed to load user data. Please try again.', 'error');
            }
        } else {
            // User is signed out
            console.log('User is signed out');
            redirectToLogin();
        }
    });
    
    // Setup event listeners
    setupEventListeners();
});

// Update user profile in sidebar
function updateUserProfile(user) {
    if (!userProfile) return;
    
    // Update avatar and name
    if (userAvatar) userAvatar.src = user.avatar;
    if (userName) userName.textContent = user.username;
    
    // Update online status
    const userStatus = userProfile.querySelector('.user-status');
    if (userStatus) {
        userStatus.className = 'user-status online';
    }
}

// Load chat rooms from Firebase
function loadChatRooms() {
    // Clean up previous listener if exists
    if (unsubscribeRooms) unsubscribeRooms();
    
    // Reference to user's rooms
    const userRoomsRef = ref(database, `users/${currentUser.uid}/rooms`);
    
    // Listen for changes
    unsubscribeRooms = onValue(userRoomsRef, async (snapshot) => {
        if (!snapshot.exists()) {
            // No rooms, create a default room
            createDefaultRoom();
            return;
        }
        
        const roomsData = snapshot.val();
        const roomIds = Object.keys(roomsData);
        rooms = [];
        
        // Get details for each room
        for (const roomId of roomIds) {
            try {
                const roomSnapshot = await get(ref(database, `chatRooms/${roomId}`));
                if (roomSnapshot.exists()) {
                    rooms.push({
                        id: roomId,
                        ...roomSnapshot.val()
                    });
                }
            } catch (error) {
                console.error('Error fetching room details:', error);
            }
        }
        
        // Sort rooms by last activity
        rooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        
        // Update UI
        updateRoomsList(rooms);
        
        // If no room is selected, select the first one
        if (!currentRoom && rooms.length > 0) {
            selectRoom(rooms[0]);
        }
    });
}

// Create a default public room if user has no rooms
async function createDefaultRoom() {
    try {
        // Create "General" room
        const newRoomRef = push(ref(database, 'chatRooms'));
        const roomId = newRoomRef.key;
        
        const roomData = {
            id: roomId,
            name: 'General',
            isPrivate: false,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            members: [currentUser.uid]
        };
        
        await set(newRoomRef, roomData);
        
        // Add room to user's rooms
        await set(ref(database, `users/${currentUser.uid}/rooms/${roomId}`), {
            joined: new Date().toISOString()
        });
        
        // Create a welcome message
        const welcomeMessage = {
            text: `Welcome to the General chat room, ${currentUser.username}! This is where all users can chat together.`,
            senderId: 'system',
            senderName: 'System',
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        
        const newMessageRef = push(ref(database, `messages/${roomId}`));
        await set(newMessageRef, welcomeMessage);
        
        console.log('Default room created');
    } catch (error) {
        console.error('Error creating default room:', error);
        showToast('Failed to create default chat room', 'error');
    }
}

// Update the rooms list in the sidebar
function updateRoomsList(rooms) {
    if (!chatList) return;
    
    // Clear loading state
    chatList.innerHTML = '';
    
    if (rooms.length === 0) {
        chatList.innerHTML = `
            <li class="chat-item no-rooms">
                <p>No chat rooms found</p>
                <button id="create-first-room-btn" class="create-room-btn">Create Room</button>
            </li>
        `;
        
        document.getElementById('create-first-room-btn').addEventListener('click', showNewRoomModal);
        return;
    }
    
    // Add each room to the list
    rooms.forEach(room => {
        const isActive = currentRoom && currentRoom.id === room.id;
        const lastMessage = room.lastMessage || { text: 'No messages yet', timestamp: room.createdAt };
        const messageTime = formatTime(lastMessage.timestamp);
        
        const roomItem = document.createElement('li');
        roomItem.className = `chat-item ${isActive ? 'active' : ''}`;
        roomItem.dataset.roomId = room.id;
        
        roomItem.innerHTML = `
            <div class="user-avatar-container">
                <img src="${room.isPrivate ? 'public/assets/images/private-room.png' : 'public/assets/images/public-room.png'}" class="user-avatar" alt="${room.name}">
                <span class="user-status ${room.isPrivate ? 'online' : 'away'}"></span>
            </div>
            <div class="chat-item-info">
                <div class="chat-item-header">
                    <h3 class="chat-item-name">${room.name}</h3>
                    <span class="chat-item-time">${messageTime}</span>
                </div>
                <div class="chat-item-preview">
                    <p class="chat-item-last-msg">${lastMessage.text}</p>
                    ${room.unreadCount ? `<span class="chat-item-badge">${room.unreadCount}</span>` : ''}
                </div>
            </div>
        `;
        
        // Add click event to select room
        roomItem.addEventListener('click', () => selectRoom(room));
        
        chatList.appendChild(roomItem);
    });
}

// Select a chat room and load its messages
function selectRoom(room) {
    // Update current room
    currentRoom = room;
    
    // Update UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.roomId === room.id) {
            item.classList.add('active');
        }
    });
    
    // Update room header
    if (currentRoomName) currentRoomName.textContent = room.name;
    
    // Enable message input
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = `Type a message in ${room.name}...`;
    }
    if (sendMessageBtn) sendMessageBtn.disabled = false;
    
    // Load messages
    loadMessages(room.id);
    
    // Update participants count
    updateParticipantsCount(room);
}

// Load messages for a room
function loadMessages(roomId) {
    // Clean up previous listener
    if (unsubscribeMessages) unsubscribeMessages();
    
    // Clear messages area
    chatMessages.innerHTML = '';
    
    // Add loading indicator
    chatMessages.innerHTML = `
        <div class="messages-loading">
            <div class="loading-spinner"></div>
            <p>Loading messages...</p>
        </div>
    `;
    
    // Listen for messages
    const messagesRef = query(
        ref(database, `messages/${roomId}`),
        orderByChild('timestamp')
    );
    
    unsubscribeMessages = onValue(messagesRef, (snapshot) => {
        // Clear the loading indicator
        chatMessages.innerHTML = '';
        
        if (!snapshot.exists()) {
            // No messages
            chatMessages.innerHTML = `
                <div class="no-messages">
                    <p>No messages yet. Be the first one to say hello!</p>
                </div>
            `;
            return;
        }
        
        // Process messages
        const messages = [];
        snapshot.forEach(child => {
            messages.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Group messages by date
        const groupedMessages = groupMessagesByDate(messages);
        
        // Clear messages area
        chatMessages.innerHTML = '';
        
        // Render grouped messages
        groupedMessages.forEach(group => {
            // Add date separator
            const dateSeparator = document.createElement('div');
            dateSeparator.className = 'message-date-separator';
            dateSeparator.innerHTML = `<span class="message-date">${group.date}</span>`;
            chatMessages.appendChild(dateSeparator);
            
            // Render each message in the group
            group.messages.forEach(message => {
                renderMessage(message);
            });
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Group messages by date for display
function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    
    messages.forEach(message => {
        const messageDate = new Date(message.timestamp);
        const formattedDate = formatDate(messageDate);
        
        if (formattedDate !== currentDate) {
            currentDate = formattedDate;
            currentGroup = {
                date: formattedDate,
                messages: []
            };
            groups.push(currentGroup);
        }
        
        currentGroup.messages.push(message);
    });
    
    return groups;
}

// Render a single message
function renderMessage(message) {
    const isCurrentUser = message.senderId === currentUser.uid;
    const isSystem = message.isSystem;
    
    if (isSystem) {
        // System message (different styling)
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = message.text;
        chatMessages.appendChild(systemMessage);
        return;
    }
    
    // Regular user message
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isCurrentUser ? 'outgoing' : 'incoming'}`;
    
    // Format message time
    const messageTime = formatMessageTime(message.timestamp);
    
    // Check if we have attachments
    let attachmentsHTML = '';
    if (message.attachments && message.attachments.length > 0) {
        attachmentsHTML = '<div class="message-attachments">';
        message.attachments.forEach(attachment => {
            if (attachment.type.startsWith('image/')) {
                attachmentsHTML += `<img src="${attachment.url}" alt="Image attachment" class="message-image">`;
            } else if (attachment.type.startsWith('video/')) {
                attachmentsHTML += `
                    <video controls class="message-video">
                        <source src="${attachment.url}" type="${attachment.type}">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else {
                attachmentsHTML += `
                    <a href="${attachment.url}" target="_blank" class="message-file">
                        <i class="fas fa-file"></i>${attachment.name}
                    </a>
                `;
            }
        });
        attachmentsHTML += '</div>';
    }
    
    // Build message HTML
    messageEl.innerHTML = `
        <img src="${message.senderAvatar}" alt="${message.senderName}" class="message-avatar">
        <div class="message-content">
            <div class="message-bubble">
                ${!isCurrentUser ? `<div class="message-sender">${message.senderName}</div>` : ''}
                <div class="message-text">${message.text}</div>
                ${attachmentsHTML}
            </div>
            <div class="message-info">
                <span class="message-time">${messageTime}</span>
                ${isCurrentUser ? `
                    <span class="message-status">
                        <i class="fas fa-check-double"></i>
                    </span>
                ` : ''}
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageEl);
}

// Send a message
async function sendMessage() {
    if (!currentRoom) {
        showToast('Please select a chat room first', 'warning');
        return;
    }
    
    const text = messageInput.value.trim();
    if (!text) return;
    
    try {
        // Create a new message reference
        const newMessageRef = push(ref(database, `messages/${currentRoom.id}`));
        
        // Message data
        const messageData = {
            id: newMessageRef.key,
            text,
            senderId: currentUser.uid,
            senderName: currentUser.username,
            senderAvatar: currentUser.avatar,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        // Save message
        await set(newMessageRef, messageData);
        
        // Update room's last activity and message
        await set(ref(database, `chatRooms/${currentRoom.id}/lastActivity`), new Date().toISOString());
        await set(ref(database, `chatRooms/${currentRoom.id}/lastMessage`), {
            text: text.length > 50 ? text.substring(0, 50) + '...' : text,
            timestamp: new Date().toISOString()
        });
        
        // Clear input
        messageInput.value = '';
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message. Please try again.', 'error');
    }
}

// Update participants count
async function updateParticipantsCount(room) {
    if (!currentRoomParticipants) return;
    
    try {
        // Get members from the database
        const membersSnapshot = await get(ref(database, `chatRooms/${room.id}/members`));
        if (membersSnapshot.exists()) {
            const members = membersSnapshot.val();
            const count = Array.isArray(members) ? members.length : Object.keys(members).length;
            currentRoomParticipants.innerHTML = `<i class="fas fa-user"></i> ${count} participants`;
        } else {
            currentRoomParticipants.innerHTML = `<i class="fas fa-user"></i> 0 participants`;
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
        currentRoomParticipants.innerHTML = `<i class="fas fa-user"></i> Unknown participants`;
    }
}

// Show new room modal
function showNewRoomModal() {
    const newRoomModal = document.getElementById('new-room-modal');
    if (newRoomModal) {
        newRoomModal.classList.add('active');
    }
}

// Create a new room
async function createNewRoom(event) {
    event.preventDefault();
    
    const roomName = document.getElementById('room-name').value.trim();
    const isPrivate = document.getElementById('room-private').checked;
    
    if (!roomName) {
        showToast('Please enter a room name', 'warning');
        return;
    }
    
    try {
        // Create a new room reference
        const newRoomRef = push(ref(database, 'chatRooms'));
        const roomId = newRoomRef.key;
        
        // Room data
        const roomData = {
            id: roomId,
            name: roomName,
            isPrivate,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            members: [currentUser.uid]
        };
        
        // Save room
        await set(newRoomRef, roomData);
        
        // Add room to user's rooms
        await set(ref(database, `users/${currentUser.uid}/rooms/${roomId}`), {
            joined: new Date().toISOString()
        });
        
        // Create a welcome message
        const welcomeMessage = {
            text: `Welcome to ${roomName}! This room was created by ${currentUser.username}.`,
            senderId: 'system',
            senderName: 'System',
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        
        const newMessageRef = push(ref(database, `messages/${roomId}`));
        await set(newMessageRef, welcomeMessage);
        
        // Close modal
        document.getElementById('new-room-modal').classList.remove('active');
        
        // Reset form
        document.getElementById('new-room-form').reset();
        
        showToast(`Room "${roomName}" created successfully`, 'success');
        
    } catch (error) {
        console.error('Error creating room:', error);
        showToast('Failed to create room. Please try again.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Send message button
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter (but new line on Shift+Enter)
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // New chat button
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', showNewRoomModal);
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            document.getElementById(modalId).classList.remove('active');
        });
    });
    
    // New room form
    const newRoomForm = document.getElementById('new-room-form');
    if (newRoomForm) {
        newRoomForm.addEventListener('submit', createNewRoom);
    }
    
    // Cancel buttons in modals
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            document.getElementById(modalId).classList.remove('active');
        });
    });
    
    // Room info button
    const roomInfoBtn = document.getElementById('room-info-btn');
    if (roomInfoBtn) {
        roomInfoBtn.addEventListener('click', toggleRoomSidebar);
    }
    
    // Close room sidebar button
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleRoomSidebar);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Private room checkbox (to show/hide invite members)
    const roomPrivateCheckbox = document.getElementById('room-private');
    if (roomPrivateCheckbox) {
        roomPrivateCheckbox.addEventListener('change', () => {
            const inviteMembersGroup = document.getElementById('invite-members-group');
            if (inviteMembersGroup) {
                inviteMembersGroup.style.display = roomPrivateCheckbox.checked ? 'block' : 'none';
            }
        });
    }
}

// Toggle room sidebar
function toggleRoomSidebar() {
    const roomSidebar = document.getElementById('room-sidebar');
    if (roomSidebar) {
        roomSidebar.classList.toggle('active');
        
        // Update room info if visible
        if (roomSidebar.classList.contains('active') && currentRoom) {
            updateRoomInfo(currentRoom);
        }
    }
}

// Update room info in sidebar
async function updateRoomInfo(room) {
    const roomDescription = document.getElementById('room-description');
    const roomCreatedAt = document.getElementById('room-created-at');
    const participantsList = document.getElementById('participants-list');
    
    if (!roomDescription || !roomCreatedAt || !participantsList) return;
    
    // Update room description
    roomDescription.textContent = `${room.isPrivate ? 'Private' : 'Public'} room created by ${room.createdBy === currentUser.uid ? 'you' : 'another user'}.`;
    
    // Update created date
    roomCreatedAt.textContent = `Created: ${formatDate(new Date(room.createdAt))}`;
    
    // Update participants list
    participantsList.innerHTML = '<li class="participant loading">Loading participants...</li>';
    
    try {
        // Get members
        const membersSnapshot = await get(ref(database, `chatRooms/${room.id}/members`));
        if (membersSnapshot.exists()) {
            const members = membersSnapshot.val();
            const memberIds = Array.isArray(members) ? members : Object.keys(members);
            
            participantsList.innerHTML = '';
            
            // Load each member's data
            for (const memberId of memberIds) {
                try {
                    const memberSnapshot = await get(ref(database, `users/${memberId}`));
                    if (memberSnapshot.exists()) {
                        const member = memberSnapshot.val();
                        
                        const participantItem = document.createElement('li');
                        participantItem.className = 'participant';
                        participantItem.innerHTML = `
                            <img src="${member.avatar}" alt="${member.username}" class="participant-avatar">
                            <div class="participant-info">
                                <h4>${member.username} ${memberId === currentUser.uid ? '(You)' : ''}</h4>
                                <p class="participant-status">
                                    <span class="status-indicator ${member.status || 'offline'}"></span>
                                    ${member.status || 'Offline'}
                                </p>
                            </div>
                        `;
                        
                        participantsList.appendChild(participantItem);
                    }
                } catch (error) {
                    console.error('Error fetching member data:', error);
                }
            }
            
            // If no participants found
            if (participantsList.children.length === 0) {
                participantsList.innerHTML = '<li class="participant none">No participants found</li>';
            }
        } else {
            participantsList.innerHTML = '<li class="participant none">No participants found</li>';
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
        participantsList.innerHTML = '<li class="participant error">Failed to load participants</li>';
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Import the logoutUser function
        const { logoutUser } = await import('./firebase-auth.js');
        const result = await logoutUser();
        
        if (result.success) {
            showToast('Successfully logged out!', 'success');
            // Redirect to home page
            window.location.href = 'index.html';
        } else {
            showToast(result.error || 'Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

// Enable chat functionality
function enableChat() {
    // Enable inputs
    if (messageInput) messageInput.disabled = false;
    if (sendMessageBtn) sendMessageBtn.disabled = false;
    if (attachBtn) attachBtn.disabled = false;
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Utility: Format date for display
function formatDate(date) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Utility: Format time for chat list
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Utility: Format time for messages
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Utility: Show toast message
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