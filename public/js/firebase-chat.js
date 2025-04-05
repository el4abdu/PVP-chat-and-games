// Firebase Chat Functions
import { database, auth, storage } from './firebase-config.js';
import { ref, set, push, get, onValue, query, orderByChild, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Create a new chat room
export const createChatRoom = async (name, isPrivate = false, members = []) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to create a chat room');
    
    // Add current user to members if not already included
    if (!members.includes(user.uid)) {
      members.push(user.uid);
    }
    
    // Create a new room in the database
    const newRoomRef = push(ref(database, 'chatRooms'));
    const roomId = newRoomRef.key;
    
    const roomData = {
      id: roomId,
      name,
      isPrivate,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      members
    };
    
    await set(newRoomRef, roomData);
    
    // Add room to each member's rooms list
    for (const memberId of members) {
      await set(ref(database, `users/${memberId}/rooms/${roomId}`), {
        joined: new Date().toISOString()
      });
    }
    
    return { success: true, roomId, roomData };
  } catch (error) {
    console.error('Create chat room error:', error);
    return { success: false, error: error.message };
  }
};

// Send a message to a chat room
export const sendMessage = async (roomId, text, attachments = []) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to send a message');
    
    // Get user data to include in the message
    const userSnapshot = await get(ref(database, `users/${user.uid}`));
    const userData = userSnapshot.val();
    
    // Process attachments if any
    const processedAttachments = [];
    for (const attachment of attachments) {
      if (attachment.file) {
        const fileRef = storageRef(storage, `chat_attachments/${roomId}/${Date.now()}_${attachment.file.name}`);
        await uploadBytes(fileRef, attachment.file);
        const fileUrl = await getDownloadURL(fileRef);
        processedAttachments.push({
          type: attachment.type,
          url: fileUrl,
          name: attachment.file.name,
          size: attachment.file.size
        });
      }
    }
    
    // Create a new message
    const newMessageRef = push(ref(database, `messages/${roomId}`));
    const messageId = newMessageRef.key;
    
    const messageData = {
      id: messageId,
      text,
      attachments: processedAttachments,
      senderId: user.uid,
      senderName: userData.username || user.displayName,
      senderAvatar: userData.avatar || user.photoURL,
      timestamp: new Date().toISOString(),
      isRead: false,
      reactions: {}
    };
    
    await set(newMessageRef, messageData);
    
    // Update room's last activity
    await update(ref(database, `chatRooms/${roomId}`), {
      lastActivity: new Date().toISOString()
    });
    
    return { success: true, messageId, messageData };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: error.message };
  }
};

// Get user's chat rooms
export const getUserChatRooms = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    callback({ success: false, error: 'User not logged in' });
    return () => {};
  }
  
  const userRoomsRef = ref(database, `users/${user.uid}/rooms`);
  
  // Listen for changes in user's rooms
  const unsubscribe = onValue(userRoomsRef, async (snapshot) => {
    if (!snapshot.exists()) {
      callback({ success: true, rooms: [] });
      return;
    }
    
    const roomIds = Object.keys(snapshot.val());
    const rooms = [];
    
    // Get details for each room
    for (const roomId of roomIds) {
      const roomSnapshot = await get(ref(database, `chatRooms/${roomId}`));
      if (roomSnapshot.exists()) {
        rooms.push(roomSnapshot.val());
      }
    }
    
    // Sort rooms by last activity
    rooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    
    callback({ success: true, rooms });
  }, (error) => {
    console.error('Get user chat rooms error:', error);
    callback({ success: false, error: error.message });
  });
  
  return unsubscribe;
};

// Listen to messages in a chat room
export const listenToMessages = (roomId, callback, limit = 50) => {
  if (!roomId) {
    callback({ success: false, error: 'Room ID is required' });
    return () => {};
  }
  
  const messagesQuery = query(
    ref(database, `messages/${roomId}`),
    orderByChild('timestamp')
  );
  
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    if (!snapshot.exists()) {
      callback({ success: true, messages: [] });
      return;
    }
    
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push(childSnapshot.val());
    });
    
    // Sort by timestamp and limit
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const limitedMessages = messages.slice(-limit);
    
    callback({ success: true, messages: limitedMessages });
  }, (error) => {
    console.error('Listen to messages error:', error);
    callback({ success: false, error: error.message });
  });
  
  return unsubscribe;
};

// Add reaction to a message
export const addReaction = async (roomId, messageId, reaction) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add a reaction');
    
    await set(ref(database, `messages/${roomId}/${messageId}/reactions/${user.uid}`), reaction);
    
    return { success: true };
  } catch (error) {
    console.error('Add reaction error:', error);
    return { success: false, error: error.message };
  }
};

// Remove reaction from a message
export const removeReaction = async (roomId, messageId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to remove a reaction');
    
    await remove(ref(database, `messages/${roomId}/${messageId}/reactions/${user.uid}`));
    
    return { success: true };
  } catch (error) {
    console.error('Remove reaction error:', error);
    return { success: false, error: error.message };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to mark messages as read');
    
    const messagesSnapshot = await get(ref(database, `messages/${roomId}`));
    if (!messagesSnapshot.exists()) return { success: true };
    
    const updates = {};
    messagesSnapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val();
      if (message.senderId !== user.uid && !message.isRead) {
        updates[`messages/${roomId}/${message.id}/isRead`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return { success: false, error: error.message };
  }
};

// Leave a chat room
export const leaveChatRoom = async (roomId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to leave a chat room');
    
    // Remove user from room members
    const roomRef = ref(database, `chatRooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    
    if (!roomSnapshot.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomSnapshot.val();
    const updatedMembers = roomData.members.filter(id => id !== user.uid);
    
    if (updatedMembers.length === 0) {
      // If no members left, delete the room
      await remove(roomRef);
      await remove(ref(database, `messages/${roomId}`));
    } else {
      // Update members list
      await update(roomRef, { members: updatedMembers });
    }
    
    // Remove room from user's rooms
    await remove(ref(database, `users/${user.uid}/rooms/${roomId}`));
    
    return { success: true };
  } catch (error) {
    console.error('Leave chat room error:', error);
    return { success: false, error: error.message };
  }
}; 