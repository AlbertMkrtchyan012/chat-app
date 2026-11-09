import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";

import {
  getUsers,
  getFriends,
  getFriendRequests,
  getChats,
} from "../services/api";

import "../styles/ChatPage.css";

function ChatPage({ token, onLogout }) {
  const [, setUsers] = useState([]);
  const [, setFriends] = useState([]);
  const [, setFriendRequests] = useState([]);
  const [, setChats] = useState([]);
  const [, setOnlineUsers] = useState([]);

  // API-ից ստացված տվյալների թարմացում
  async function loadUsers() {
    try {
      const result = await getUsers();
      setUsers(result.users || result.data || result);
    } catch (error) {
      console.error("Users loading error:", error);
    }
  }

  async function loadFriends() {
    try {
      const result = await getFriends();
      setFriends(result.friends || result.data || result);
    } catch (error) {
      console.error("Friends loading error:", error);
    }
  }

  async function loadFriendRequests() {
    try {
      const result = await getFriendRequests();
      setFriendRequests(
        result.requests || result.data || result
      );
    } catch (error) {
      console.error("Friend requests loading error:", error);
    }
  }

  async function loadChats() {
    try {
      const result = await getChats();
      setChats(result.chats || result.data || result);
    } catch (error) {
      console.error("Chats loading error:", error);
    }
  }

  useEffect(() => {
    // Սկզբում բեռնում ենք տվյալները
    loadUsers();
    loadFriends();
    loadFriendRequests();
    loadChats();

    // Միանում ենք Socket.IO-ին
    const connection = connectSocket(token);

    // Նոր անձնական հաղորդագրություն
    connection.on("private_message", () => {
      loadChats();
    });

    // Նոր ընկերության հարցում
    connection.on("friend_request", () => {
      loadFriendRequests();
    });

    // Ընկերության հարցման փոփոխություն
    connection.on("friend_request_updated", () => {
      loadFriendRequests();
      loadFriends();
    });

    // Նոր չատ
    connection.on("chat_created", () => {
      loadChats();
    });

    // Օնլայն օգտատերեր
    connection.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      connection.disconnect();
    };
  }, [token]);

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-brand">
          <div className="brand-icon">C</div>
          <span>
            chat<span className="brand-accent">app</span>
          </span>
        </div>

        <div className="sidebar-actions">
          <button type="button" title="Add friends">
            <span>＋</span> Add friends
          </button>
          <button type="button" title="Friend requests">
            <span>♧</span> Requests
          </button>
        </div>

        <div className="friends-section">
          <p className="section-label">MESSAGES</p>
          <div className="empty-friends">
            <span>✦</span>
            <p>No conversations yet</p>
            <small>Add a friend to start chatting.</small>
          </div>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={onLogout}
        >
          <span>↪</span> Log out
        </button>
      </aside>

      <section className="chat-main">
        <div className="chat-empty-state">
          <div className="empty-chat-icon">✉</div>
          <h1>Your conversations, all in one place.</h1>
          <p>
            Choose a friend from the sidebar to start a conversation.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChatPage;