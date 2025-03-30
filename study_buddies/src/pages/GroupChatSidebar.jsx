import React, { useState, useEffect } from "react";
import { FaPlus, FaUsers, FaSpinner } from "react-icons/fa";
import {
  Chat,
  ChannelList,
  // --- Import necessary components ---
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  // Thread, // Optional: Import if you want thread support
  // LoadingIndicator, // Optional: Import if you want custom loading indicators
} from "stream-chat-react";
import "@stream-io/stream-chat-css/dist/v2/css/index.css"; // Ensure CSS is imported
import { StreamChat } from "stream-chat";

const API_KEY = "dmfpd2h898h5"; // Public API key - Ensure this is intended to be public

// Create a singleton instance manager for StreamChat
// This ensures we have only one client instance across the app
const StreamChatInstance = (() => {
  let instance = null;
  let currentUserId = null; // Track the ID of the fully connected user

  // --- Track connection in progress ---
  let connectionPromise = null;
  let pendingUserId = null; // Track the ID for which connection is in progress

  return {
    getInstance: () => {
      // Get or create the single StreamChat SDK instance
      if (!instance) {
        console.log("Creating new StreamChat SDK instance");
        instance = StreamChat.getInstance(API_KEY);
      }
      return instance;
    },

    getClient: async (user, tokenFn) => {
      // Get the singleton SDK instance
      const client = StreamChatInstance.getInstance();
      const requestedUserId = user.id; // Store requested ID for clarity

      console.log(
        `getClient called for user: ${requestedUserId}, current SDK user ID: ${client.userID}, manager's tracked connected user ID: ${currentUserId}, pending user ID: ${pendingUserId}`
      );

      // --- Check 1: Already connected as the requested user? ---
      if (
        client.userID === requestedUserId &&
        currentUserId === requestedUserId
      ) {
        console.log(
          `Already fully connected as user ${requestedUserId}. Returning existing client.`
        );
        // Ensure we clear any stale pending state if somehow it exists
        pendingUserId = null;
        connectionPromise = null;
        return client;
      }

      // --- Check 2: Connection already IN PROGRESS for the requested user? ---
      if (pendingUserId === requestedUserId && connectionPromise) {
        console.log(
          `Connection attempt already in progress for user ${requestedUserId}. Returning existing promise.`
        );
        // Return the promise of the ongoing connection attempt
        return connectionPromise;
      }

      // --- Check 3: User Switching - Is a different user connected? ---
      // Disconnect ONLY if a different user is fully connected OR if a connection for a different user is pending
      if (
        (client.userID && client.userID !== requestedUserId) ||
        (pendingUserId && pendingUserId !== requestedUserId)
      ) {
        console.log(
          `Switching user. Disconnecting previous user/cancelling pending connection for ${
            client.userID || pendingUserId
          }.`
        );
        // If a connection was pending for someone else, we effectively cancel it here
        // by replacing the promise below. We still need to disconnect the client if it connected.
        pendingUserId = null;
        connectionPromise = null; // Clear previous pending state
        if (client.userID) {
          await client.disconnectUser(); // Disconnect the currently connected user
          currentUserId = null; // Clear tracked connected user ID
        }
      }

      // --- Start New Connection Attempt ---
      console.log(
        `Starting new connection attempt for user ${requestedUserId}...`
      );
      pendingUserId = requestedUserId; // Mark this user as having a connection attempt pending

      // Create the promise for this connection attempt.
      // Use an IIFE (Immediately Invoked Function Expression) to manage the async logic
      // and ensure the promise is stored immediately.
      connectionPromise = (async () => {
        try {
          // --- FIXED TYPO HERE ---
          console.log(
            `Workspaceing token for pending user ${requestedUserId}...`
          );
          const token = await tokenFn(requestedUserId);
          if (!token) {
            throw new Error(`Failed to get token for user ${requestedUserId}`);
          }

          // Make sure we are still trying to connect the user we started with.
          // If pendingUserId changed while fetching token (e.g., another request for a different user came in), abort.
          if (pendingUserId !== requestedUserId) {
            throw new Error(
              `Connection attempt for ${requestedUserId} was cancelled by a newer request.`
            );
          }

          console.log(
            `Connecting pending user ${requestedUserId}... (Calling connectUser)`
          );
          await client.connectUser(
            {
              id: requestedUserId,
              name: `${user.firstName} ${user.lastName}`, // Ensure currentUser prop has these!
            },
            token
          );
          console.log(`Successfully connected user ${requestedUserId}`);

          // --- Success ---
          currentUserId = requestedUserId; // Update the fully connected user ID
          return client; // Resolve the promise with the client
        } catch (error) {
          console.error(
            `Connection failed for user ${requestedUserId}:`,
            error
          );
          throw error; // Re-throw the error so the caller knows it failed
        } finally {
          // --- Cleanup for this attempt ---
          // Clear the pending status *only if* this specific user's attempt is the one finishing
          // and hasn't been superseded by another request.
          if (pendingUserId === requestedUserId) {
            pendingUserId = null;
            connectionPromise = null;
          }
        }
      })(); // End of IIFE

      return connectionPromise; // Return the promise of the connection attempt
    },
  };
})();
// --- End StreamChatInstance ---

// --- React Component ---
const GroupChatSidebar = ({ currentUser }) => {
  const [chatClient, setChatClient] = useState(null);
  // Renamed initialization state variables
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState("");
  // State for create group modal and form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  // Specific state for create channel action
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [createError, setCreateError] = useState("");

  // Function to fetch token from your backend
  const fetchUserToken = async (userId) => {
    // --- FIXED TYPO HERE ---
    console.log(`Workspaceing token for userId: ${userId}`);
    try {
      // Make sure your backend URL is correct and accessible
      const response = await fetch(
        `http://localhost:5000/token?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error(`Token fetch failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.token) {
        throw new Error("Token not found in backend response");
      }
      console.log(`Token fetched successfully for userId: ${userId}`);
      return data.token;
    } catch (err) {
      console.error("Token fetch error:", err);
      throw err; // Let the calling function handle the error state
    }
  };

  // Initialize Stream Chat when currentUser changes
  useEffect(() => {
    console.log(
      "GroupChatSidebar useEffect triggered. currentUser:",
      currentUser?.id
    );

    // If no user is provided, reset state and don't attempt connection
    if (!currentUser || !currentUser.id) {
      console.log("No current user, skipping chat initialization.");
      setInitializing(false); // Use renamed state
      setChatClient(null); // Ensure client is cleared if user logs out
      setInitError(""); // Use renamed state
      return;
    }

    // Flag to prevent state updates if the component unmounts during async operations
    let isMounted = true;
    setInitializing(true); // Use renamed state
    setInitError(""); // Use renamed state & Clear previous errors

    const initializeChat = async () => {
      try {
        console.log(
          `Attempting to initialize chat for user: ${currentUser.id}`
        );
        // Use the singleton manager to get/configure the client
        const client = await StreamChatInstance.getClient(
          currentUser,
          fetchUserToken // Pass the token fetching function
        );

        // Only update state if the component is still mounted
        if (isMounted) {
          console.log("Chat initialization successful, setting client state.");
          setChatClient(client);
        }
      } catch (err) {
        console.error("Chat initialization error:", err);
        if (isMounted) {
          setInitError(`Failed to initialize chat: ${err.message}`); // Use renamed state
          setChatClient(null); // Ensure client is null on error
        }
      } finally {
        // Ensure loading state is turned off even if unmounted
        if (isMounted) {
          setInitializing(false); // Use renamed state
        }
      }
    };

    initializeChat();

    // Cleanup function: runs when component unmounts or BEFORE effect re-runs
    return () => {
      console.log(
        "GroupChatSidebar cleanup function running for user:",
        currentUser?.id
      );
      isMounted = false;
      // Note: Singleton manages disconnects based on user changes, so no disconnect here.
    };
  }, [currentUser]); // Dependency array is correct

  // Create new channel (group)
  const createChannel = async () => {
    setCreateError(""); // Clear previous create errors

    if (!newGroupName.trim()) {
      setCreateError("Group name cannot be empty.");
      return;
    }
    if (!chatClient) {
      setCreateError("Chat client is not available.");
      return;
    }
    if (!currentUser || !currentUser.id) {
      setCreateError("Current user is not available.");
      return;
    }

    // ** IMPORTANT: Replace 'userB_real_id' with the actual ID of your second test user **
    const otherTestUserId = "userB_real_id"; // <-- PUT THE *OTHER* VALID, EXISTING USER'S ID HERE

    if (currentUser.id === otherTestUserId) {
      setCreateError(
        "Cannot create a group with only yourself. Check the hardcoded otherTestUserId."
      );
      console.error(
        "Attempting to create channel where currentUser.id is the same as the hardcoded otherTestUserId"
      );
      return;
    }
    const members = [currentUser.id, otherTestUserId];
    // ** -------------------------------------------------------------------------------- **

    setIsCreatingChannel(true); // Set specific loading state for creation
    setCreateError("");

    try {
      console.log(`Creating channel "${newGroupName}" with members:`, members);
      const channel = chatClient.channel(
        "messaging",
        /* You can provide a specific channel ID here if you want */
        {
          name: newGroupName,
          members: members,
          // created_by_id: currentUser.id // Optional: track creator
        }
      );

      // Create the channel
      await channel.create();
      // await channel.watch(); // Watch is usually handled implicitly by Channel/ChannelList

      console.log("Channel created successfully.");
      setNewGroupName(""); // Clear input
      setShowCreateModal(false); // Close modal
    } catch (err) {
      setCreateError(`Failed to create group: ${err.message}`); // Set specific error state
      console.error("Create channel error:", err);
    } finally {
      setIsCreatingChannel(false); // Clear specific loading state
    }
  };

  // --- Render Logic ---

  if (initializing) {
    return (
      <div className="sidebar-loading" style={{ padding: "20px" }}>
        {" "}
        {/* Added basic style */}
        <FaSpinner className="spin" aria-hidden="true" /> Loading Chat...
      </div>
    );
  }

  if (initError) {
    return (
      <div className="sidebar-error" style={{ padding: "20px", color: "red" }}>
        Error: {initError}
      </div>
    ); // Added basic style
  }

  // If no user is logged in (currentUser is null/undefined after check in useEffect)
  if (!currentUser) {
    // This case might be handled by routing in App.jsx, but added as safety
    return (
      <div className="sidebar-info" style={{ padding: "20px" }}>
        Please log in to use chat.
      </div>
    );
  }

  // If user is logged in but client failed to initialize for some reason
  if (!chatClient) {
    return (
      <div className="sidebar-error" style={{ padding: "20px", color: "red" }}>
        Chat client unavailable. Check logs. {initError}
      </div>
    );
  }

  // --- Render Main Chat UI ---
  return (
    // Wrapper div for Flexbox layout
    <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>
      {" "}
      {/* Adjust height as needed */}
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
          {" "}
          {/* Example Width & Style */}
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
              <FaUsers aria-hidden="true" style={{ marginRight: "8px" }} />{" "}
              Group Chats
            </h2>
            <button
              style={{ padding: "5px 10px" }} // Basic style
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(""); // Clear create errors when opening modal
              }}
              disabled={isCreatingChannel}
            >
              <FaPlus aria-hidden="true" /> New
            </button>
          </div>
          {/* Channel List takes remaining space in sidebar */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChannelList
              filters={{
                type: "messaging",
                members: { $in: [currentUser.id] },
              }}
              sort={{ last_message_at: -1 }}
              options={{ state: true, watch: true, presence: true }}
            />
          </div>
          {/* Modal for creating a new group */}
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
                  padding: "20px",
                  borderRadius: "8px",
                  minWidth: "300px",
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
                    marginBottom: "10px",
                  }} // Basic style
                />
                <p
                  style={{
                    fontSize: "0.8em",
                    color: "grey",
                    marginTop: 0,
                    marginBottom: "15px",
                  }}
                >
                  Note: Adds one predefined test member.
                </p>

                {/* Display create errors */}
                {createError && (
                  <div
                    className="modal-error"
                    style={{ color: "red", marginBottom: "10px" }}
                  >
                    {createError}
                  </div>
                )}

                <div
                  className="modal-actions"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={createChannel}
                    disabled={isCreatingChannel}
                    style={{ padding: "8px 15px" }}
                  >
                    {isCreatingChannel ? (
                      <FaSpinner className="spin" />
                    ) : (
                      "Create"
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreatingChannel}
                    style={{ padding: "8px 15px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {/* === End Left Sidebar Section === */}
        {/* === Right Chat Window Section === */}
        <div
          className="chat-window-area"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Channel>
            {" "}
            {/* This component renders its children when a channel is active */}
            <Window>
              {" "}
              {/* Provides context for the components below */}
              <ChannelHeader /> {/* Displays header for the active channel */}
              {/* MessageList takes available space */}
              <MessageList />
              <MessageInput />{" "}
              {/* Displays the input box for the active channel */}
            </Window>
            {/* <Thread /> */}{" "}
            {/* Optional: Uncomment to add thread functionality */}
          </Channel>
        </div>{" "}
        {/* === End Right Chat Window Section === */}
      </Chat>
    </div> // --- End Flexbox Layout Wrapper ---
  );
};

export default GroupChatSidebar;
