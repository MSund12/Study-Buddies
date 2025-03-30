import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaUsers, FaSpinner, FaTimes, FaTrash } from "react-icons/fa";
import {
  Chat,
  ChannelList,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  useChatContext,
} from "stream-chat-react";
import "@stream-io/stream-chat-css/dist/v2/css/index.css";
import { StreamChat } from "stream-chat";
import { debounce } from "lodash";
import "./styles/GroupChatSidebar.css";

const API_KEY = "dmfpd2h898h5";

// --- StreamChatInstance Singleton (Keep As Is) ---
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
        console.log(`Already connected...`);
        pendingUserId = null;
        connectionPromise = null;
        return client;
      }
      if (pendingUserId === requestedUserId && connectionPromise) {
        console.log(`Connection attempt already in progress...`);
        return connectionPromise;
      }
      if (
        (client.userID && client.userID !== requestedUserId) ||
        (pendingUserId && pendingUserId !== requestedUserId)
      ) {
        console.log(`Switching user. Disconnecting previous...`);
        pendingUserId = null;
        connectionPromise = null;
        if (client.userID) {
          await client.disconnectUser();
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
          ); // Fixed typo
          const token = await tokenFn(requestedUserId);
          if (!token) {
            throw new Error(`Failed to get token for user ${requestedUserId}`);
          }
          if (pendingUserId !== requestedUserId) {
            throw new Error(
              `Connection attempt for ${requestedUserId} was cancelled.`
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

// --- Custom Channel Preview Component (Keep As Is) ---
const CustomChannelPreview = (props) => {
  const { channel, setActiveChannel, latestMessage } = props;
  const { client } = useChatContext();

  const handleDeleteChannel = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete group "${channel.data?.name || channel.id}"?`)) {
      try {
        console.log(`Deleting channel: ${channel.id}`);
        await channel.delete(); // Soft delete by default
        console.log(`Channel ${channel.id} deleted.`);
      } catch (error) {
        console.error(`Failed to delete channel ${channel.id}:`, error);
        alert(`Failed to delete channel: ${error.message || "Unknown error"}`);
      }
    }
  };

  const channelName =
    channel.data?.name ||
    channel.data?.id ||
    Object.values(channel.state.members)
      .filter((member) => member.user_id !== client.userID)
      .map((member) => member.user?.name || member.user_id)
      .join(", ") ||
    "Unnamed Channel";

  return (
    <div
      onClick={() => setActiveChannel(channel)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
      className="channel-preview__container"
    >
      <div className="channel-preview__content">
        <div
          className="channel-preview__title"
          style={{ fontWeight: "bold", marginBottom: "3px" }}
        >
          {" "}
          {channelName}{" "}
        </div>
        <div
          className="channel-preview__message"
          style={{ fontSize: "0.85em", color: "#555" }}
        >
          {" "}
          {latestMessage || "No messages yet"}{" "}
        </div>
      </div>
      <button
        onClick={handleDeleteChannel}
        style={{
          background: "none",
          border: "none",
          color: "#aaa",
          cursor: "pointer",
          padding: "5px",
        }}
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
const GroupChatSidebar = ({ currentUser }) => {
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

  // --- fetchUserToken (Keep As Is) ---
  const fetchUserToken = async (userId) => {
    console.log(`Workspaceing token for userId: ${userId}`); // Fixed typo
    try {
      const response = await fetch(
        `http://localhost:5000/token?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`);
      }
      const data = await response.json();
      if (!data.token) {
        throw new Error("Token not found in response");
      }
      console.log(`Token fetched successfully for userId: ${userId}`);
      return data.token;
    } catch (err) {
      console.error("Token fetch error:", err);
      throw err;
    }
  };
  // --- End fetchUserToken ---

  // --- useEffect for Initialization (Keep As Is) ---
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
          setInitError(`Failed init chat: ${err.message}`);
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
  // --- End useEffect ---

  // --- User Search Logic (Keep As Is) ---
  const fetchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearchingUsers(true);
    setCreateError("");
    console.log(`Searching users with term: ${searchTerm}`);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found...");
      setCreateError("Auth error.");
      setIsSearchingUsers(false);
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?query=${encodeURIComponent(
          searchTerm
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setCreateError("Auth failed.");
        } else {
          throw new Error(`User search failed: ${response.status}`);
        }
        setSearchResults([]);
      } else {
        const data = await response.json();
        if (Array.isArray(data)) {
          const filteredResults = data.filter(
            (user) =>
              user.id !== currentUser.id &&
              !selectedUsers.some((selected) => selected.id === user.id)
          );
          setSearchResults(filteredResults);
        } else {
          console.error("User search API bad data:", data);
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error("User search fetch error:", err);
      if (!createError) {
        setCreateError("Failed to search users.");
      }
      setSearchResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };
  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), [
    currentUser,
    selectedUsers,
  ]);
  useEffect(() => {
    debouncedFetchUsers(userSearchTerm);
    return () => debouncedFetchUsers.cancel();
  }, [userSearchTerm, debouncedFetchUsers]);
  const handleUserSearchChange = (e) => {
    setUserSearchTerm(e.target.value);
  };
  const handleSelectUser = (user) => {
    if (!selectedUsers.some((selected) => selected.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchTerm("");
    setSearchResults([]);
  };
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };
  // --- End User Search Logic ---

  // --- Create Channel Logic (Keep As Is) ---
  const createChannel = async () => {
    setCreateError("");
    if (!newGroupName.trim()) {
      setCreateError("Group name empty.");
      return;
    }
    if (!chatClient) {
      setCreateError("Chat client unavailable.");
      return;
    }
    if (!currentUser || !currentUser.id) {
      setCreateError("Current user unavailable.");
      return;
    }
    if (selectedUsers.length === 0) {
      setCreateError("Select members.");
      return;
    }
    const memberIds = [currentUser.id, ...selectedUsers.map((user) => user.id)];
    const uniqueMemberIds = [...new Set(memberIds)];
    if (uniqueMemberIds.length < 2) {
      setCreateError("Cannot create group with self.");
      return;
    }
    setIsCreatingChannel(true);
    try {
      console.log(
        `Creating channel "${newGroupName}" members:`,
        uniqueMemberIds
      );
      const channel = chatClient.channel("messaging", {
        name: newGroupName,
        members: uniqueMemberIds,
        created_by_id: currentUser.id,
      });
      await channel.create();
      console.log("Channel created.");
      setNewGroupName("");
      setShowCreateModal(false);
      setSelectedUsers([]);
      setUserSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      setCreateError(`Failed: ${err.message}`);
      console.error("Create channel error:", err);
    } finally {
      setIsCreatingChannel(false);
    }
  };
  // --- End Create Channel Logic ---

  // --- Render Logic ---
  if (initializing) {
    return (
      <div style={{ padding: "20px" }}>
        {" "}
        <FaSpinner className="spin" /> Loading Chat...{" "}
      </div>
    );
  }
  if (initError) {
    return (
      <div style={{ padding: "20px", color: "red" }}>Error: {initError}</div>
    );
  }
  if (!currentUser) {
    return <div style={{ padding: "20px" }}>Please log in.</div>;
  }
  if (!chatClient) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        {" "}
        Chat client unavailable. {initError}{" "}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>
      <Chat client={chatClient}>
        {/* === Left Sidebar Section === */}
        <div
          className="group-chat-sidebar-column"
          style={{
            width: "320px",
            borderRight: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="sidebar-header"
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.1em" }}>
              {" "}
              <FaUsers style={{ marginRight: "8px" }} /> Group Chats{" "}
            </h2>
            <button
              style={{ padding: "5px 10px" }}
              onClick={() => {
                setShowCreateModal(true);
                setCreateError("");
                setSelectedUsers([]);
                setUserSearchTerm("");
                setSearchResults([]);
              }}
              disabled={isCreatingChannel}
            >
              <FaPlus /> New
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChannelList
              filters={{
                type: "messaging",
                members: { $in: [currentUser.id] },
              }}
              sort={{ last_message_at: -1 }}
              options={{ state: true, watch: true, presence: true }}
              Preview={CustomChannelPreview}
            />
          </div>

          {/* === Create Group Modal === */}
          {showCreateModal && (
            <div
              className="create-group-modal-backdrop"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                className="create-group-modal"
                style={{
                  background: "white",
                  color: "black",
                  padding: "20px",
                  borderRadius: "8px",
                  minWidth: "400px",
                  maxWidth: "90%",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3>Create New Group</h3>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  aria-label="Group name"
                  style={{
                    display: "block",
                    width: "calc(100% - 16px)",
                    padding: "8px",
                    marginBottom: "15px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search users to add..."
                  value={userSearchTerm}
                  onChange={handleUserSearchChange}
                  aria-label="Search users"
                  style={{
                    display: "block",
                    width: "calc(100% - 16px)",
                    padding: "8px",
                    marginBottom: "5px",
                  }}
                />
                {isSearchingUsers && (
                  <FaSpinner className="spin" style={{ margin: "5px 0" }} />
                )}
                {searchResults.length > 0 && (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: "0",
                      margin: "5px 0 15px 0",
                      maxHeight: "150px",
                      overflowY: "auto",
                      border: "1px solid #ccc",
                    }}
                  >
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        style={{
                          padding: "5px 10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {/* --- REVERTED LINE - ID REMOVED --- */}
                        {user.name || `${user.firstName} ${user.lastName}`}
                        {/* --- END REVERTED LINE --- */}
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearchingUsers &&
                  userSearchTerm &&
                  searchResults.length === 0 && (
                    <p
                      style={{
                        fontSize: "0.8em",
                        color: "grey",
                        margin: "5px 0 15px 0",
                      }}
                    >
                      No matching users found.
                    </p>
                  )}
                {selectedUsers.length > 0 && (
                  <div
                    style={{
                      marginBottom: "15px",
                      border: "1px solid #ccc",
                      padding: "5px",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 5px 0",
                        fontSize: "0.9em",
                        fontWeight: "bold",
                      }}
                    >
                      Selected:
                    </p>
                    <ul
                      style={{ listStyle: "none", padding: "0", margin: "0" }}
                    >
                      {selectedUsers.map((user) => (
                        <li
                          key={user.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.85em",
                            padding: "2px 5px",
                            background: "#eee",
                            marginBottom: "3px",
                            borderRadius: "3px",
                          }}
                        >
                          {" "}
                          {user.name ||
                            `${user.firstName} ${user.lastName}`}{" "}
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "red",
                              cursor: "pointer",
                              padding: "0 5px",
                            }}
                          >
                            {" "}
                            <FaTimes />{" "}
                          </button>{" "}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {createError && (
                  <div
                    className="modal-error"
                    style={{ color: "red", marginBottom: "10px" }}
                  >
                    {" "}
                    {createError}{" "}
                  </div>
                )}
                <div
                  className="modal-actions"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "auto",
                  }}
                >
                  <button
                    onClick={createChannel}
                    disabled={isCreatingChannel}
                    style={{ padding: "8px 15px" }}
                  >
                    {" "}
                    {isCreatingChannel ? (
                      <FaSpinner className="spin" />
                    ) : (
                      "Create"
                    )}{" "}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedUsers([]);
                      setUserSearchTerm("");
                      setSearchResults([]);
                    }}
                    disabled={isCreatingChannel}
                    style={{ padding: "8px 15px" }}
                  >
                    {" "}
                    Cancel{" "}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* === End Create Group Modal === */}
        </div>{" "}
        {/* === End Left Sidebar Section === */}
        {/* === Right Chat Window Section (Keep As Is) === */}
        <div
          className="chat-window-area"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Channel>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            {/* <Thread /> */}
          </Channel>
        </div>{" "}
        {/* === End Right Chat Window Section === */}
      </Chat>
    </div> // --- End Flexbox Layout Wrapper ---
  );
};

export default GroupChatSidebar;
