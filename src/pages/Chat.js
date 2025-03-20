// src/pages/Chat.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { ref, push, onValue } from "firebase/database";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/ddnryyozp/upload";
const CLOUDINARY_UPLOAD_PRESET = "chatapp_uploads";

const sanitizeEmail = (email) => email.replace(/\.|\#|\$|\[|\]/g, "_");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setSelectedChat(null);
        setMessages([]);
        setChats([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const chatsRef = ref(db, `chats/${sanitizeEmail(currentUser.email)}`);
      onValue(chatsRef, (snapshot) => {
        const data = snapshot.val();
        setChats(data ? Object.keys(data) : []);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat && currentUser) {
      const chatRef = ref(
        db,
        `chats/${sanitizeEmail(currentUser.email)}/${sanitizeEmail(selectedChat)}`
      );
      onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        setMessages(data ? Object.values(data) : []);
      });
    }
  }, [selectedChat, currentUser]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const sendMessage = async () => {
    if (!selectedChat || !currentUser || !text.trim()) return;

    const user1 = sanitizeEmail(currentUser.email);
    const user2 = sanitizeEmail(selectedChat);
    const newMessage = {
      text,
      sender: currentUser.email,
      timestamp: Date.now(),
      type: "text",
    };

    push(ref(db, `chats/${user1}/${user2}`), newMessage);
    push(ref(db, `chats/${user2}/${user1}`), newMessage);
    setText("");
  };

  const sendFile = async () => {
    if (!file || !selectedChat || !currentUser) return;
    setUploading(true);
    const url = await uploadFile(file);
    const user1 = sanitizeEmail(currentUser.email);
    const user2 = sanitizeEmail(selectedChat);
    const newMessage = {
      text: url,
      sender: currentUser.email,
      timestamp: Date.now(),
      type: "image",
    };

    push(ref(db, `chats/${user1}/${user2}`), newMessage);
    push(ref(db, `chats/${user2}/${user1}`), newMessage);
    setFile(null);
    setUploading(false);
  };

  return (
    <div style={{ display: "flex", height: "500px", border: "1px solid black" }}>
      {currentUser && (
        <div style={{ width: "30%", borderRight: "1px solid gray", padding: "10px" }}>
          <h3>Danh sách chat</h3>
          <ul>
            {chats.length > 0 ? (
              chats.map((email) => (
                <li
                  key={email}
                  onClick={() => setSelectedChat(email)}
                  style={{ cursor: "pointer", margin: "5px 0" }}
                >
                  {email}
                </li>
              ))
            ) : (
              <p>Không có tin nhắn</p>
            )}
          </ul>
        </div>
      )}

      <div style={{ flex: 1, padding: "10px" }}>
        {currentUser ? (
          selectedChat ? (
            <>
              <h3>Đang chat với: {selectedChat}</h3>
              <div
                style={{
                  height: "350px",
                  overflowY: "scroll",
                  border: "1px solid gray",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                {messages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    {msg.type === "text" ? (
                      <p>
                        <strong>{msg.sender}:</strong> {msg.text}
                      </p>
                    ) : (
                      <img src={msg.text} alt="Uploaded" style={{ maxWidth: "100%" }} />
                    )}
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={sendMessage}>Gửi tin nhắn</button>
              <br />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button onClick={sendFile} disabled={uploading}>
                {uploading ? "Đang tải..." : "Gửi file"}
              </button>
            </>
          ) : (
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          )
        ) : (
          <p>Vui lòng đăng nhập để sử dụng chức năng chat</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
