import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import {
  FaPlus,
  FaUsers,
  FaSpinner,
  FaTimes,
  FaTrash,
  // FaLink, // Removed
  FaUserPlus,
  // FaEllipsisV, // Removed
  FaUserFriends,
} from "react-icons/fa";
import {
  Chat,
  ChannelList,
  Channel,
  Window,
  MessageList,
  MessageInput,
  useChatContext,
  useChannelStateContext,
} from "stream-chat-react";
import "@stream-io/stream-chat-css/dist/v2/css/index.css";
import { StreamChat } from "stream-chat";
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";

// Import styles
import "./styles/GroupChatSidebar.css"; // Make sure this CSS file is updated

const API_KEY = "dmfpd2h898h5"; // Replace with your API key

// --- StreamChatInstance Singleton (No changes needed) ---
const StreamChatInstance = (() => {
  let instance = null;
  let currentUserId = null;
  let connectionPromise = null;
  let pendingUserId = null;
  return {
    getInstance: () => {
      if (!instance) {
        console.log("Creating new StreamChat SDK instance");
        instance = StreamChat.getInstance(API_KEY);
      }
      return instance;
    },
    getClient: async (user, tokenFn) => {
      const client = StreamChatInstance.getInstance();
      if (!user || !user.id) {
        console.error("getClient called with invalid user:", user);
        throw new Error("Invalid user provided to getClient");
      }
      const requestedUserId = user.id;
      console.log(
        `getClient called for user: ${requestedUserId}, SDK user ID: ${client.userID}, tracked ID: ${currentUserId}, pending ID: ${pendingUserId}`
      );
      if (
        client.userID === requestedUserId &&
        currentUserId === requestedUserId
      ) {
        console.log(`Already connected as ${requestedUserId}.`);
        pendingUserId = null;
        connectionPromise = null;
        return client;
      }
      if (pendingUserId === requestedUserId && connectionPromise) {
        console.log(
          `Connection attempt for ${requestedUserId} already in progress.`
        );
        return connectionPromise;
      }
      if (
        (client.userID && client.userID !== requestedUserId) ||
        (pendingUserId && pendingUserId !== requestedUserId)
      ) {
        console.log(
          `Switching user. Disconnecting previous: ${
            client.userID || pendingUserId
          }`
        );
        pendingUserId = null;
        connectionPromise = null;
        if (client.userID) {
          try {
            await client.disconnectUser();
          } catch (disconnectError) {
            console.warn("Error during disconnect:", disconnectError);
          }
          currentUserId = null;
        }
      }
      console.log(
        `Starting new connection attempt for user ${requestedUserId}...`
      );
      pendingUserId = requestedUserId;
      connectionPromise = (async () => {
        try {
          console.log(
            `Workspaceing token for pending user ${requestedUserId}...`
          );
          const token = await tokenFn(requestedUserId);
          if (!token) {
            throw new Error(`Failed to get token for user ${requestedUserId}`);
          }
          if (pendingUserId !== requestedUserId) {
            throw new Error(
              `Connection attempt for ${requestedUserId} was cancelled by a new request.`
            );
          }
          console.log(
            `Connecting pending user ${requestedUserId}... (Calling connectUser)`
          );
          await client.connectUser(
            { id: requestedUserId, name: `${user.firstName} ${user.lastName}` },
            token
          );
          console.log(`Successfully connected user ${requestedUserId}`);
          currentUserId = requestedUserId;
          return client;
        } catch (error) {
          console.error(
            `Connection failed for user ${requestedUserId}:`,
            error
          );
          throw error;
        } finally {
          if (pendingUserId === requestedUserId) {
            pendingUserId = null;
            connectionPromise = null;
          }
        }
      })();
      return connectionPromise;
    },
  };
})();
// --- End StreamChatInstance ---

// --- Helper Function for Avatar Placeholder ---
const UserAvatar = ({ name, size = 32 }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const intToRGB = (i) => {
    const c = (i & 0x00ffffff).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };
  const bgColor = `#${intToRGB(hashCode(name || ""))}`;

  return (
    <div
      className="avatar-placeholder"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${size * 0.45}px`,
      }}
    >
      {getInitials(name)}
    </div>
  );
};

// --- Custom Channel Preview Component ---
const CustomChannelPreview = (props) => {
  const { channel, setActiveChannel, latestMessage } = props;
  const { client } = useChatContext();

  const handleDeleteChannel = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete group "${channel.data?.name || channel.id}"?`)) {
      try {
        await channel.delete();
        console.log(`Channel ${channel.id} deleted.`);
      } catch (error) {
        console.error(`Failed to delete channel ${channel.id}:`, error);
        alert(`Failed: ${error.message || "Check permissions"}`);
      }
    }
  };

  const channelName =
    channel.data?.name ||
    Object.values(channel.state.members)
      .filter((m) => m.user_id !== client.userID)
      .map((m) => m.user?.name || m.user_id)
      .join(", ") ||
    channel.id ||
    "Unnamed Channel";

  const lastMessageText =
    latestMessage?.text ||
    channel.state.messages?.[channel.state.messages.length - 1]?.text ||
    "No messages yet";
  const truncatedMessage =
    lastMessageText.length > 40
      ? `${lastMessageText.substring(0, 40)}...`
      : lastMessageText;

  return (
    <div
      onClick={() => setActiveChannel(channel)}
      className="channel-preview__container str-chat__channel-preview-messenger"
    >
      <div className="channel-preview__content">
        <div className="channel-preview__title">{channelName}</div>
        <div className="channel-preview__message">{truncatedMessage}</div>
      </div>
      <button
        className="channel-preview-delete-button"
        onClick={handleDeleteChannel}
        title={`Delete Channel "${channelName}"`}
        aria-label={`Delete Channel "${channelName}"`}
      >
        <FaTrash size="0.9em" />
      </button>
    </div>
  );
};
// --- End Custom Channel Preview ---

// --- Custom Channel Header with Inline Actions ---
const CustomChannelHeader = ({ onOpenViewMembers, onOpenAddMembers }) => {
  const { channel } = useChannelStateContext();
  const [showExtraActions, setShowExtraActions] = useState(false);

  const channelName = channel?.data?.name || channel?.id || "Channel";
  const memberCount = Object.keys(channel?.state?.members || {}).length;

  if (!channel) {
    return (
      <div className="custom-channel-header str-chat__channel-header">
        <div className="custom-channel-header-info">
          <div className="str-chat__channel-header--title">Loading...</div>
        </div>
      </div>
    );
  }

  const handleToggleActions = (e) => {
    e.stopPropagation();
    setShowExtraActions((prev) => !prev);
  };

  const handleActionClick = (actionCallback) => {
    actionCallback(channel);
    setShowExtraActions(false);
  };

  return (
    <div className="custom-channel-header str-chat__channel-header">
      <div className="custom-channel-header-info">
        <div className="str-chat__channel-header--title">
          {channelName}
          {memberCount > 0 && (
            <span className="custom-channel-header-member-count">
              ({memberCount} {memberCount === 1 ? "member" : "members"})
            </span>
          )}
        </div>
      </div>
      <div className="custom-channel-header-actions-wrapper">
        <button
          onClick={handleToggleActions}
          className="more-actions-btn"
          aria-label="More channel actions"
          title="More actions"
          aria-expanded={showExtraActions}
        >
          More
        </button>
        {showExtraActions && (
          <div className="revealed-actions-container">
            <button
              onClick={() => handleActionClick(onOpenViewMembers)}
              title="View group members"
            >
              <FaUserFriends /> View Members
            </button>
            <button
              onClick={() => handleActionClick(onOpenAddMembers)}
              title="Add members to this group"
            >
              <FaUserPlus /> Add Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// --- End Custom Channel Header ---

// --- Main GroupChatSidebar Component ---
const GroupChatSidebar = ({ currentUser }) => {
  const navigate = useNavigate(); // <-- Add hook for navigation
  const [chatClient, setChatClient] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState("");
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [modalChannel, setModalChannel] = useState(null);
  // Modal Input States
  const [newGroupName, setNewGroupName] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // Loading/Error States for Modals
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [createError, setCreateError] = useState("");
  const [addMembersError, setAddMembersError] = useState("");
  // Ref for modal content
  const modalRef = useRef(null);

  // --- Navigation Handler ---
  const handleGoHome = () => {
    navigate("/"); // Navigate to the root route (adjust if your home route is different)
  };

  // --- fetchUserToken ---
  const fetchUserToken = async (userId) => {
    console.log(`Workspaceing token for userId: ${userId}`);
    try {
      const response = await fetch(
        `http://localhost:5000/token?userId=${userId}` // Ensure your backend endpoint is correct
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token fetch failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }
      const data = await response.json();
      if (!data.token) {
        throw new Error("Token not found in response");
      }
      console.log(`Token fetched successfully for userId: ${userId}`);
      return data.token;
    } catch (err) {
      console.error("Token fetch error:", err);
      setInitError(`Token Error: ${err.message}`);
      throw err;
    }
  };

  // --- useEffect for Initialization ---
  useEffect(() => {
    console.log(
      "GroupChatSidebar useEffect triggered. currentUser:",
      currentUser?.id
    );
    if (!currentUser || !currentUser.id) {
      console.log("No current user...");
      setInitializing(false);
      setChatClient(null);
      setInitError("");
      return;
    }
    let isMounted = true;
    setInitializing(true);
    setInitError("");
    const initializeChat = async () => {
      try {
        console.log(`Attempting initialize chat for user: ${currentUser.id}`);
        const client = await StreamChatInstance.getClient(
          currentUser,
          fetchUserToken
        );
        if (isMounted) {
          console.log("Chat initialization successful.");
          setChatClient(client);
        }
      } catch (err) {
        console.error("Chat initialization error:", err);
        if (isMounted) {
          setInitError(initError || `Failed init chat: ${err.message}`);
          setChatClient(null);
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };
    initializeChat();
    return () => {
      console.log("GroupChatSidebar cleanup:", currentUser?.id);
      isMounted = false;
    };
  }, [currentUser]);

  // --- User Search Logic (Using Stream client - CORRECTED) ---
  const fetchUsersStream = async (searchTerm, channelContext = null) => {
    if (!chatClient || !currentUser || !currentUser.id) {
      console.warn("User search skipped: client or user not ready.");
      return;
    }
    if (!searchTerm || searchTerm.trim().length < 1) {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    setIsSearchingUsers(true);
    setCreateError("");
    setAddMembersError("");

    try {
      // Build conditions using $and
      const andConditions = [];

      // 1. Exclude self
      andConditions.push({ id: { $ne: currentUser.id } });

      // 2. Exclude selected users and existing members (if applicable)
      const selectedUserIds = selectedUsers.map((u) => u.id);
      let existingMemberIds = [];
      if (channelContext) {
        existingMemberIds = Object.keys(channelContext.state.members);
      }
      const combinedExcludedIds = [
        ...new Set([...selectedUserIds, ...existingMemberIds]),
      ];
      if (combinedExcludedIds.length > 0) {
        andConditions.push({ id: { $nin: combinedExcludedIds } });
      }

      // 3. Filter by name autocomplete
      andConditions.push({ name: { $autocomplete: searchTerm } });

      // Final filter object
      const filters = { $and: andConditions };

      console.log("Querying users with filters:", JSON.stringify(filters));

      const response = await chatClient.queryUsers(
        filters,
        { name: 1 }, // Sort by name
        { limit: 10, presence: false }
      );

      console.log(`Found ${response.users.length} users via Stream.`);
      setSearchResults(response.users);
    } catch (err) {
      console.error("Stream User search error:", err);
      if (err.response) {
        console.error("Stream API Error Response:", err.response);
      }
      const errorMessage = `User search failed: ${
        err.message || "Unknown error"
      }`;
      setSearchResults([]);
      if (showCreateModal) setCreateError(errorMessage);
      if (showAddMembersModal) setAddMembersError(errorMessage);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Debounced search function
  const debouncedFetchUsers = useCallback(debounce(fetchUsersStream, 350), [
    chatClient,
    currentUser,
    selectedUsers,
    modalChannel,
    showAddMembersModal,
  ]);

  // Effect to trigger search
  useEffect(() => {
    const currentChannelContext = showAddMembersModal ? modalChannel : null;
    if ((showCreateModal || showAddMembersModal) && userSearchTerm.trim()) {
      debouncedFetchUsers(userSearchTerm, currentChannelContext);
    } else {
      setSearchResults([]);
    }
    return () => debouncedFetchUsers.cancel();
  }, [
    userSearchTerm,
    showCreateModal,
    showAddMembersModal,
    debouncedFetchUsers,
  ]);

  const handleUserSearchChange = (e) => {
    setUserSearchTerm(e.target.value);
  };

  const handleSelectUser = (userToAdd) => {
    if (!selectedUsers.some((user) => user.id === userToAdd.id)) {
      setSelectedUsers([...selectedUsers, userToAdd]);
    }
  };

  const handleRemoveUser = (userIdToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((user) => user.id !== userIdToRemove)
    );
  };
  // --- End User Search Logic ---

  // --- Channel Action Handlers ---
  const createChannel = async () => {
    setCreateError("");
    if (!chatClient) {
      setCreateError("Chat client not initialized.");
      return;
    }
    if (!newGroupName.trim()) {
      setCreateError("Group name cannot be empty.");
      return;
    }
    if (selectedUsers.length === 0) {
      setCreateError("Please select at least one member.");
      return;
    }

    const memberIds = [currentUser.id, ...selectedUsers.map((user) => user.id)];
    const uniqueMemberIds = [...new Set(memberIds)];
    setIsCreatingChannel(true);

    try {
      const newChannelId = uuidv4();
      console.log(
        `Creating channel "${newGroupName}" (ID: ${newChannelId}) members:`,
        uniqueMemberIds
      );
      const channel = chatClient.channel("messaging", newChannelId, {
        name: newGroupName.trim(),
        members: uniqueMemberIds,
        created_by_id: currentUser.id,
        isGroupChat: true,
      });
      await channel.create();
      console.log("Channel created successfully:", channel.cid);
      closeModal();
    } catch (err) {
      setCreateError(`Failed to create group: ${err.message}`);
      console.error("Create channel error:", err);
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleAddMembers = async () => {
    if (!modalChannel) {
      setAddMembersError("Channel context lost.");
      return;
    }
    if (selectedUsers.length === 0) {
      setAddMembersError("No users selected to add.");
      return;
    }

    const memberIdsToAdd = selectedUsers.map((user) => user.id);
    setAddMembersError("");
    setIsAddingMembers(true);

    try {
      console.log(
        `Adding members [${memberIdsToAdd.join(", ")}] to channel ${
          modalChannel.id
        }`
      );

      // --- Construct actor's name reliably (FIXED) ---
      const actorName =
        currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser.name || currentUser.id;

      const response = await modalChannel.addMembers(memberIdsToAdd, {
        text: `${actorName} added ${selectedUsers
          .map((u) => u.name || u.id)
          .join(", ")}.`, // Use corrected actorName
      });
      console.log("Members added successfully.", response);
      closeModal();
    } catch (error) {
      console.error(`Failed add members to ${modalChannel.id}:`, error);
      setAddMembersError(`Failed: ${error.message}. Check permissions.`);
    } finally {
      setIsAddingMembers(false);
    }
  };
  // --- End Channel Action Handlers ---

  // --- Modal Trigger Functions & Close ---
  const resetModalFields = () => {
    setNewGroupName("");
    setCreateError("");
    setAddMembersError("");
    setUserSearchTerm("");
    setSelectedUsers([]);
    setSearchResults([]);
    setIsCreatingChannel(false);
    setIsAddingMembers(false);
    setIsSearchingUsers(false);
  };

  const openCreateModal = () => {
    resetModalFields();
    setModalChannel(null);
    setShowCreateModal(true);
  };

  const openAddMembersModal = (channel) => {
    if (!channel) return;
    resetModalFields();
    setModalChannel(channel);
    setShowAddMembersModal(true);
  };

  const openViewMembersModal = (channel) => {
    if (!channel) return;
    setModalChannel(channel);
    setShowViewMembersModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowAddMembersModal(false);
    setShowViewMembersModal(false);
    resetModalFields(); // Reset fields on any close
    setModalChannel(null);
  };

  // Optional: Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    if (showCreateModal || showAddMembersModal || showViewMembersModal) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateModal, showAddMembersModal, showViewMembersModal]);

  // --- Render Logic ---
  if (initializing) {
    return (
      <div className="loading-overlay">
        <FaSpinner className="spin" size="2em" />
        <span>Loading Chat...</span>
      </div>
    );
  }
  if (initError) {
    return (
      <div className="error-container">
        <h3>Chat Initialization Error</h3>
        <p>Could not connect to the chat service.</p>
        <p className="error-details">Details: {initError}</p>
        <p>Please check your internet connection or try again later.</p>
      </div>
    );
  }
  if (!currentUser) {
    return <div className="info-container">Please log in to access chat.</div>;
  }
  if (!chatClient) {
    return (
      <div className="warning-container">
        Chat client is not available. Please refresh the page. {initError}
      </div>
    );
  }

  // --- Main component render ---
  return (
    <div className="chat-layout-wrapper">
      <Chat client={chatClient} theme="str-chat__theme-light">
        {/* === Left Sidebar Section === */}
        <div className="group-chat-sidebar-column">
          <div className="sidebar-header">
            {/* Make the h2 clickable to go home */}
            <h2
              onClick={handleGoHome}
              style={{ cursor: "pointer" }}
              title="Go to Home"
            >
              <FaUsers style={{ color: "red" }} /> Group Study Finder
            </h2>
            <button
              onClick={openCreateModal}
              title="Create New Group"
              disabled={isCreatingChannel}
              className="create-group-btn"
            >
              <FaPlus />
            </button>
          </div>
          <div className="channel-list-container">
            <ChannelList
              filters={{
                type: "messaging",
                members: { $in: [currentUser.id] },
              }}
              sort={{ last_message_at: -1 }}
              options={{ state: true, watch: true, presence: true, limit: 20 }}
              Preview={CustomChannelPreview}
            />
          </div>
        </div>

        {/* === Right Chat Window Section === */}
        <div className="chat-window-area">
          <Channel>
            <Window>
              <CustomChannelHeader
                onOpenViewMembers={openViewMembersModal}
                onOpenAddMembers={openAddMembersModal}
              />
              <MessageList />
              <MessageInput focus />
            </Window>
          </Channel>
        </div>

        {/* === Modals Section === */}
        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="modal-backdrop">
            <div
              className="modal-content create-group-modal"
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Create New Group</h3>
              <label htmlFor="group-name-input">Group Name:</label>
              <input
                id="group-name-input"
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                aria-label="Group name"
                required
              />
              <label htmlFor="user-search-input-create">Add Members:</label>
              <input
                id="user-search-input-create"
                type="text"
                placeholder="Search users to add..."
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                aria-label="Search users"
              />
              {selectedUsers.length > 0 && (
                <div className="selected-users-display">
                  <ul className="selected-users-pills">
                    {selectedUsers.map((user) => (
                      <li key={user.id} className="user-pill">
                        <UserAvatar name={user.name || user.id} size={20} />
                        <span className="pill-name">
                          {user.name || user.id}
                        </span>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          title="Remove user"
                          className="remove-pill-btn"
                        >
                          <FaTimes size="0.8em" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="user-search-results">
                {isSearchingUsers && (
                  <div className="loading-indicator">
                    <FaSpinner className="spin" /> Searching...
                  </div>
                )}
                {!isSearchingUsers && searchResults.length > 0 && (
                  <ul className="user-results-list">
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        className="user-result-item"
                        onClick={() => handleSelectUser(user)}
                        role="button"
                        tabIndex={0}
                      >
                        <UserAvatar name={user.name || user.id} size={30} />
                        <div className="user-info">
                          {" "}
                          <span className="user-name">
                            {user.name || user.id}
                          </span>{" "}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearchingUsers &&
                  userSearchTerm.trim() &&
                  searchResults.length === 0 && (
                    <p className="modal-info-text">No matching users found.</p>
                  )}
              </div>
              {createError && (
                <div className="modal-error"> {createError} </div>
              )}
              <div className="modal-actions">
                <button
                  className="button-secondary"
                  onClick={closeModal}
                  disabled={isCreatingChannel}
                >
                  Cancel
                </button>
                <button
                  className="button-primary"
                  onClick={createChannel}
                  disabled={
                    isCreatingChannel ||
                    !newGroupName.trim() ||
                    selectedUsers.length === 0
                  }
                >
                  {isCreatingChannel ? (
                    <>
                      <FaSpinner className="spin" /> Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Members Modal */}
        {showAddMembersModal && modalChannel && (
          <div className="modal-backdrop">
            <div
              className="modal-content add-members-modal"
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {" "}
                Add Members to "{modalChannel.data?.name ||
                  modalChannel.id}"{" "}
              </h3>
              <label htmlFor="user-search-input-add">Find Users:</label>
              <input
                id="user-search-input-add"
                type="text"
                placeholder="Search users to add..."
                value={userSearchTerm}
                onChange={handleUserSearchChange}
                aria-label="Search users"
              />
              {selectedUsers.length > 0 && (
                <div className="selected-users-display">
                  <ul className="selected-users-pills">
                    {selectedUsers.map((user) => (
                      <li key={user.id} className="user-pill">
                        <UserAvatar name={user.name || user.id} size={20} />
                        <span className="pill-name">
                          {user.name || user.id}
                        </span>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          title="Remove selection"
                          className="remove-pill-btn"
                        >
                          <FaTimes size="0.8em" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="user-search-results">
                {isSearchingUsers && (
                  <div className="loading-indicator">
                    <FaSpinner className="spin" /> Searching...
                  </div>
                )}
                {!isSearchingUsers && searchResults.length > 0 && (
                  <ul className="user-results-list">
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        className="user-result-item"
                        onClick={() => handleSelectUser(user)}
                        role="button"
                        tabIndex={0}
                      >
                        <UserAvatar name={user.name || user.id} size={30} />
                        <div className="user-info">
                          {" "}
                          <span className="user-name">
                            {user.name || user.id}
                          </span>{" "}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearchingUsers &&
                  userSearchTerm.trim() &&
                  searchResults.length === 0 && (
                    <p className="modal-info-text">
                      No matching users found (or already members).
                    </p>
                  )}
              </div>
              {addMembersError && (
                <div className="modal-error"> {addMembersError} </div>
              )}
              <div className="modal-actions">
                <button
                  className="button-secondary"
                  onClick={closeModal}
                  disabled={isAddingMembers}
                >
                  Cancel
                </button>
                <button
                  className="button-primary"
                  onClick={handleAddMembers}
                  disabled={isAddingMembers || selectedUsers.length === 0}
                >
                  {isAddingMembers ? (
                    <>
                      <FaSpinner className="spin" /> Adding...
                    </>
                  ) : (
                    "Add Selected"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Members Modal */}
        {showViewMembersModal && modalChannel && (
          <div className="modal-backdrop">
            <div
              className="modal-content view-members-modal"
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Members in "{modalChannel.data?.name || modalChannel.id}"</h3>
              <ul className="members-list-view">
                {Object.values(modalChannel.state.members)
                  .sort((a, b) =>
                    (a.user?.name || a.user_id).localeCompare(
                      b.user?.name || b.user_id
                    )
                  )
                  .map((member) => (
                    <li key={member.user_id} className="member-list-item-view">
                      <UserAvatar
                        name={member.user?.name || member.user_id}
                        size={32}
                      />
                      <span className="member-name">
                        {member.user?.name || member.user_id}
                      </span>
                      {member.user_id === currentUser.id && (
                        <span className="you-tag">(You)</span>
                      )}
                    </li>
                  ))}
              </ul>
              <div className="modal-actions">
                <button className="button-primary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* === End Modals Section === */}
      </Chat>
    </div>
  );
};

export default GroupChatSidebar;
