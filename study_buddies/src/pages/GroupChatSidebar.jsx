import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaUsers, FaSpinner, FaTimes, FaTrash } from "react-icons/fa";
import {
  Chat,                // Main chat provider component
  ChannelList,         // Renders the list of channels
  Channel,             // Provides context for the active channel
  Window,              // Renders the content of the active channel
  ChannelHeader,       // Displays header for the active channel
  MessageList,         // Renders messages in the active channel
  MessageInput,        // Renders the input box for sending messages
  useChatContext,      // Hook to access chat client context
} from "stream-chat-react";
import "@stream-io/stream-chat-css/dist/v2/css/index.css"; // Import default Stream CSS
import { StreamChat } from "stream-chat"; // Import Stream SDK core
import { debounce } from "lodash"; // Utility for debouncing input
import "./styles/GroupChatSidebar.css"; // Your custom styles (ensure path is correct)
import { useSelector } from 'react-redux'; // Import useSelector to get token and user info

// --- Configuration ---
// It's best practice to use environment variables for API keys
const API_KEY = process.env.REACT_APP_STREAM_API_KEY || "dmfpd2h898h5"; // Replace with your actual key or env var

// --- StreamChatInstance Singleton ---
// Manages a single SDK instance and connection state to prevent issues
const StreamChatInstance = (() => {
  let instance = null;
  let currentUserId = null;
  let connectionPromise = null;
  let pendingUserId = null;

  const getInstance = () => {
    if (!instance) {
      console.log("StreamChat: Creating new SDK instance.");
      instance = StreamChat.getInstance(API_KEY);
    }
    return instance;
  };

  // Connects a user, handles switching users, and prevents race conditions
  const getClient = async (user, tokenFn) => {
    const client = getInstance();
    if (!user || !user.id) {
      console.error("StreamChatInstance: getClient called with invalid user:", user);
      throw new Error("Invalid user provided");
    }

    const requestedUserId = user.id;
    console.log(
      `StreamChatInstance: getClient check for user: ${requestedUserId}. Current SDK ID: ${client.userID}, Tracked ID: ${currentUserId}, Pending ID: ${pendingUserId}`
    );

    // Already connected as the right user
    if (client.userID === requestedUserId && currentUserId === requestedUserId) {
      console.log(`StreamChatInstance: Already connected as ${requestedUserId}.`);
      pendingUserId = null; connectionPromise = null; // Clear any stale pending state
      return client;
    }

    // Connection for the requested user is already in progress
    if (pendingUserId === requestedUserId && connectionPromise) {
      console.log(`StreamChatInstance: Connection for ${requestedUserId} in progress... returning promise.`);
      return connectionPromise;
    }

    // Need to switch user or start fresh connection
    if ( (client.userID && client.userID !== requestedUserId) || (pendingUserId && pendingUserId !== requestedUserId) ) {
      console.log(`StreamChatInstance: Switching user context. Disconnecting/Cancelling previous.`);
      pendingUserId = null; connectionPromise = null; // Cancel any different pending attempt
      if (client.userID) {
         console.log(`StreamChatInstance: Disconnecting user ${client.userID}`);
         await client.disconnectUser();
         currentUserId = null;
      }
    }

    console.log(`StreamChatInstance: Starting connection attempt for ${requestedUserId}.`);
    pendingUserId = requestedUserId;

    connectionPromise = (async () => {
      try {
        console.log(`StreamChatInstance: Fetching token for ${requestedUserId}...`);
        const token = await tokenFn(requestedUserId);
        if (!token) throw new Error(`Failed to get Stream token`);

        // Check if request was superseded while fetching token
        if (pendingUserId !== requestedUserId) {
          throw new Error(`Connection for ${requestedUserId} cancelled.`);
        }

        console.log(`StreamChatInstance: Connecting ${requestedUserId}...`);
        await client.connectUser(
          { id: requestedUserId, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User' },
          token
        );
        console.log(`StreamChatInstance: User ${requestedUserId} connected.`);
        currentUserId = requestedUserId;
        return client;

      } catch (error) {
        console.error(`StreamChatInstance: Connection failed for ${requestedUserId}:`, error);
        if (pendingUserId === requestedUserId) { // Reset only if this attempt failed
            pendingUserId = null; connectionPromise = null;
        }
        if (currentUserId === requestedUserId) currentUserId = null; // Reset tracked ID if connect failed
        throw error; // Propagate error
      }
      // No finally block needed here - state reset is handled above or on next call
    })();

    return connectionPromise;
  };

  return { getInstance, getClient };
})();
// --- End StreamChatInstance ---


// --- Custom Channel Preview Component ---
// Renders individual channels in the ChannelList
const CustomChannelPreview = (props) => {
  const { channel, setActiveChannel, latestMessage } = props;
  const { client } = useChatContext(); // Access chat client from context

  const handleDeleteChannel = async (e) => {
    e.stopPropagation(); // Prevent selecting channel on delete click
    if (window.confirm(`Are you sure you want to delete the group "${channel.data?.name || channel.id}"?`)) {
      try {
        await channel.delete(); // Soft delete
        console.log(`Channel ${channel.id} marked as deleted.`);
      } catch (error) {
        console.error(`Failed to delete channel ${channel.id}:`, error);
        alert(`Failed to delete channel: ${error.message || "Unknown error"}`);
      }
    }
  };

  // Helper to determine a display name
  const getChannelName = () => {
    if (channel.data?.name) return channel.data.name;
    const otherMembers = Object.values(channel.state.members)
      .filter((member) => member.user_id !== client.userID);
    if (otherMembers.length > 0) {
      return otherMembers.map((member) => member.user?.name || member.user_id).join(", ");
    }
    return channel.data?.id || "Unnamed Channel";
  };

  return (
    <div
      onClick={() => setActiveChannel(channel)}
      className="channel-preview__container" // Use classes for styling from CSS
    >
      <div className="channel-preview__content">
        <div className="channel-preview__title">{getChannelName()}</div>
        <div className="channel-preview__message">{latestMessage || "No messages yet"}</div>
      </div>
      <button
        onClick={handleDeleteChannel}
        className="channel-preview__delete-button" // Use class for styling
        title="Delete Channel"
        aria-label="Delete Channel"
      >
        <FaTrash />
      </button>
    </div>
  );
};
// --- End Custom Channel Preview ---


// --- Main GroupChatSidebar Component ---
const GroupChatSidebar = ({ currentUser }) => { // Expects currentUser from Redux
  const [chatClient, setChatClient] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [createError, setCreateError] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const reduxToken = useSelector((state) => state.auth.token); // Get auth token from Redux

  // --- Fetches Stream User Token from Backend ---
  const fetchUserToken = async (userId) => {
    console.log(`Workspaceing Stream token for userId: ${userId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/token?userId=${encodeURIComponent(userId)}`
      );
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Token fetch failed: ${response.status} - ${errorBody}`);
      }
      const data = await response.json();
      if (!data.token) throw new Error("Token not found in backend response");
      console.log(`Stream token fetched successfully for userId: ${userId}`);
      return data.token;
    } catch (err) {
      console.error("Stream token fetch error:", err);
      throw err; // Re-throw for initialization logic
    }
  };

  // --- Initialize Chat Client ---
  useEffect(() => {
    console.log("Chat Sidebar: useEffect triggered. currentUser ID:", currentUser?.id);
    if (!currentUser || !currentUser.id) {
      console.log("Chat Sidebar: No current user ID, skipping init.");
      setInitializing(false); setChatClient(null); setInitError("");
      return;
    }
    let isMounted = true;
    setInitializing(true); setInitError("");
    const initializeChat = async () => {
      try {
        console.log(`Chat Sidebar: Initializing Stream for user: ${currentUser.id}`);
        const client = await StreamChatInstance.getClient(currentUser, fetchUserToken);
        if (isMounted) {
          console.log("Chat Sidebar: Init successful.");
          setChatClient(client);
        }
      } catch (err) {
        console.error("Chat Sidebar: Init failed:", err);
        if (isMounted) {
          setInitError(`Failed init: ${err.message}`); setChatClient(null);
        }
      } finally {
        if (isMounted) setInitializing(false);
      }
    };
    initializeChat();
    return () => { isMounted = false; }; // Cleanup flag
  }, [currentUser]); // Re-run if currentUser changes

  // --- User Search Logic ---
  const fetchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    setIsSearchingUsers(true); setCreateError("");
    console.log(`Chat Sidebar: Searching users: "${searchTerm}"`);
    const token = reduxToken || localStorage.getItem("token"); // Prefer Redux token
    if (!token) {
      console.error("Chat Sidebar: No auth token for user search.");
      setCreateError("Authentication error."); setIsSearchingUsers(false); setSearchResults([]); return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `User search failed (${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        const filteredResults = data.filter(
          (user) => user.id !== currentUser.id && !selectedUsers.some((sel) => sel.id === user.id)
        );
        setSearchResults(filteredResults);
      } else { setSearchResults([]); }
    } catch (err) {
      console.error("Chat Sidebar: User search error:", err);
      setCreateError(err.message || "Failed to search users."); setSearchResults([]);
    } finally { setIsSearchingUsers(false); }
  };
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 350), [currentUser?.id, selectedUsers, reduxToken]);
  useEffect(() => {
    if (userSearchTerm) debouncedFetchUsers(userSearchTerm);
    else setSearchResults([]);
    return () => debouncedFetchUsers.cancel();
  }, [userSearchTerm, debouncedFetchUsers]);
  const handleUserSearchChange = (e) => setUserSearchTerm(e.target.value);
  const handleSelectUser = (user) => {
    if (!selectedUsers.some((sel) => sel.id === user.id)) setSelectedUsers([...selectedUsers, user]);
    setUserSearchTerm(""); setSearchResults([]);
  };
  const handleRemoveUser = (userId) => setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  // --- End User Search ---

  // --- Create Channel Logic ---
  const createChannel = async () => {
    setCreateError("");
    if (!newGroupName.trim()) { setCreateError("Group name cannot be empty."); return; }
    if (!chatClient) { setCreateError("Chat client not ready."); return; }
    if (!currentUser || !currentUser.id) { setCreateError("User info missing."); return; }
    if (selectedUsers.length === 0) { setCreateError("Select at least one other member."); return; }

    const memberIds = [currentUser.id, ...selectedUsers.map((user) => user.id)];
    const uniqueMemberIds = [...new Set(memberIds)];
    if (uniqueMemberIds.length < 2) { setCreateError("Cannot create group with only yourself."); return; }

    setIsCreatingChannel(true);
    try {
      console.log(`Chat Sidebar: Creating Stream channel "${newGroupName}" members:`, uniqueMemberIds);
      const channel = chatClient.channel("messaging", { name: newGroupName, members: uniqueMemberIds, created_by_id: currentUser.id });
      await channel.create();
      console.log("Chat Sidebar: Stream channel created.");
      // Reset modal form
      setShowCreateModal(false); setNewGroupName(""); setSelectedUsers([]); setUserSearchTerm(""); setSearchResults([]);
    } catch (err) {
      setCreateError(`Failed: ${err.message}`); console.error("Chat Sidebar: Create channel error:", err);
    } finally { setIsCreatingChannel(false); }
  };
  // --- End Create Channel ---

  // --- Render Logic ---
  if (initializing) return <div className="chat-loading-state"><FaSpinner className="spin" /> Loading Chat...</div>;
  if (initError) return <div className="chat-error-state">Error initializing chat: {initError}</div>;
  if (!currentUser) return <div className="chat-logged-out-state">Please log in to access group chats.</div>;
  if (!chatClient) return <div className="chat-error-state">Chat client is unavailable. Please refresh. {initError}</div>;

  // Main Chat UI
  return (
    <div className="chat-container"> {/* Use CSS class for main layout */}
      <Chat client={chatClient}>
        {/* === Left Sidebar === */}
        <div className="sidebar-column">
          <div className="sidebar-header">
            <h2><FaUsers /> Group Chats</h2>
            <button
              className="new-group-button"
              onClick={() => {
                setShowCreateModal(true); setCreateError(""); setNewGroupName("");
                setSelectedUsers([]); setUserSearchTerm(""); setSearchResults([]);
              }}
              disabled={isCreatingChannel}
              title="Create New Group"
            >
              <FaPlus /> New
            </button>
          </div>
          <div className="channel-list-container">
            <ChannelList
               filters={{ type: "messaging", members: { $in: [currentUser.id] } }}
               sort={{ last_message_at: -1 }}
               options={{ state: true, watch: true, presence: true }}
               Preview={CustomChannelPreview}
            />
          </div>

          {/* === Create Group Modal === */}
          {showCreateModal && (
            <div className="create-group-modal-backdrop">
              <div className="create-group-modal">
                <h3>Create New Group</h3>
                {/* Group Name */}
                <div className="form-group">
                   <label htmlFor="group-name-input">Group Name:</label>
                   <input id="group-name-input" type="text" placeholder="Enter group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required />
                </div>
                {/* User Search */}
                <div className="form-group">
                   <label htmlFor="user-search-input">Add Members:</label>
                   <input id="user-search-input" type="text" placeholder="Search users..." value={userSearchTerm} onChange={handleUserSearchChange} />
                   {isSearchingUsers && <FaSpinner className="spin" />}
                   {searchResults.length > 0 && (
                     <ul className="search-results-list">
                       {searchResults.map((user) => ( <li key={user.id} onClick={() => handleSelectUser(user)}>{user.name || `${user.firstName} ${user.lastName}`}</li> ))}
                     </ul>
                   )}
                   {!isSearchingUsers && userSearchTerm && searchResults.length === 0 && <p className="no-results-message">No matching users found.</p>}
                </div>
                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div className="selected-users-list">
                    <p>Selected:</p>
                    <ul>
                      {selectedUsers.map((user) => (
                        <li key={user.id}>
                          <span>{user.name || `${user.firstName} ${user.lastName}`}</span>
                          <button onClick={() => handleRemoveUser(user.id)} title="Remove User"><FaTimes /></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Errors */}
                {createError && <div className="modal-error">{createError}</div>}
                {/* Actions */}
                <div className="modal-actions">
                  <button onClick={createChannel} disabled={isCreatingChannel || !newGroupName || selectedUsers.length === 0}>
                    {isCreatingChannel ? <FaSpinner className="spin" /> : "Create"}
                  </button>
                  <button onClick={() => { setShowCreateModal(false); /* Reset other states if needed */ }} disabled={isCreatingChannel}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* === End Modal === */}
        </div>
        {/* === End Left Sidebar === */}

        {/* === Right Chat Window === */}
        <div className="chat-window-area">
          <Channel> {/* Renders active channel */}
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            {/* <Thread /> */}
          </Channel>
        </div>
        {/* === End Chat Window === */}
      </Chat>
    </div>
  );
};

export default GroupChatSidebar;