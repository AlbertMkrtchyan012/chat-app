const API_URL = "http://localhost:5000";

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    data,
    token = localStorage.getItem("token"),
  } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    ...(data !== undefined && {
      body: JSON.stringify(data),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `Request failed: ${response.status}`
    );
  }

  return result;
}

// ==========================
// AUTHENTICATION
// ==========================

export function login(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    data: {
      username,
      password,
    },
    token: null,
  });
}

export function register(username, password, name, surname) {
  const data = {
    username,
    password,
  };

  if (name) data.name = name;
  if (surname) data.surname = surname;

  return request("/api/auth/register", {
    method: "POST",
    data,
    token: null,
  });
}

// ==========================
// FRIENDS
// ==========================

// Get all users
export function getUsers() {
  return request("/api/friends/users");
}

// Send friend request
export function sendFriendRequest(receiverId) {
  return request("/api/friends/sendFriendRequest", {
    method: "POST",
    data: {
      receiverId,
    },
  });
}

// Get incoming friend requests
export function getFriendRequests() {
  return request("/api/friends/getFriendRequests");
}

// Accept or reject friend request
export function updateFriendRequest(id, decision) {
  if (!["ACCEPTED", "REJECTED"].includes(decision)) {
    throw new Error("Invalid friend request decision.");
  }

  return request(`/api/friends/requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    data: {
      decision,
    },
  });
}

// Get friends list
export function getFriends() {
  return request("/api/friends/");
}

// ==========================
// CHATS
// ==========================

// Get all chats
export function getChats() {
  return request("/api/chats");
}

// Get messages with a specific user
export function getMessages(userId) {
  return request(
    `/api/chats/${encodeURIComponent(userId)}/messages`
  );
}
