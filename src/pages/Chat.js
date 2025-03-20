// src/pages/chat.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Chỉnh sửa đường dẫn theo cấu trúc thư mục của bạn
import { ref, push, onValue } from "firebase/database";
import { logoutUser } from "../authService";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/ddnryyozp/upload";
const CLOUDINARY_UPLOAD_PRESET = "chatapp_uploads";

const sanitizeEmail = (email) => email.replace(/\.|\#|\$|\[|\]/g, "_");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newChatEmail, setNewChatEmail] = useState("");
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

  const sendMessage = async () => {
    if (!text.trim() || !selectedChat || !currentUser) return;
    const chatRef = ref(
      db,
      `chats/${sanitizeEmail(currentUser.email)}/${sanitizeEmail(selectedChat)}`
    );
    const messageData = {
      sender: currentUser.email,
      text: text,
      type: "text",
      timestamp: Date.now(),
    };
    await push(chatRef, messageData);
    setText("");
  };

  const sendFile = async () => {
    if (!file || !selectedChat || !currentUser) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const chatRef = ref(
        db,
        `chats/${sanitizeEmail(currentUser.email)}/${sanitizeEmail(selectedChat)}`
      );
      const messageData = {
        sender: currentUser.email,
        type: "file",
        fileUrl: data.secure_url,
        fileName: file.name,
        timestamp: Date.now(),
      };
      await push(chatRef, messageData);
      setFile(null);
    } catch (error) {
      console.error("File upload error:", error);
    }
    setUploading(false);
  };

  return (
    <div style={{ display: "flex", height: "500px", border: "1px solid black" }}>
      <div style={{ width: "30%", borderRight: "1px solid gray", padding: "10px" }}>
        <h3>Danh sách chat</h3>
        {currentUser && (
          <>
            <input
              type="text"
              placeholder="Nhập email"
              value={newChatEmail}
              onChange={(e) => setNewChatEmail(e.target.value)}
            />
            <button onClick={() => setSelectedChat(newChatEmail)}>Bắt đầu</button>
            <ul>
              {chats.map((email) => (
                <li key={email} onClick={() => setSelectedChat(email)}>
                  {email}
                </li>
              ))}
            </ul>
            <button onClick={logoutUser} style={{ background: "red", color: "white" }}>
              Đăng xuất
            </button>
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: "10px" }}>
        {currentUser ? (
          selectedChat ? (
            <>
              <h3>Đang chat với: {selectedChat}</h3>
              <div style={{ height: "350px", overflowY: "scroll" }}>
                {messages.map((msg, index) => {
                  const isImage =
                    msg.fileName &&
                    (msg.fileName.endsWith(".jpg") ||
                      msg.fileName.endsWith(".jpeg") ||
                      msg.fileName.endsWith(".png") ||
                      msg.fileName.endsWith(".gif"));
                  const isCurrentUser = msg.sender === currentUser.email;
                  const containerStyle = {
                    textAlign: isCurrentUser ? "right" : "left",
                    marginBottom: "10px",
                  };
                  return (
                    <div key={index} style={containerStyle}>
                      {msg.type === "text" ? (
                        <p
                          style={{
                            backgroundColor: isCurrentUser ? "#ADD8E6" : "#EAEAEA",
                            color: "#000",
                            padding: "10px",
                            borderRadius: "10px",
                            display: "inline-block",
                            maxWidth: "70%",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.text}
                        </p>
                      ) : (
                        <p>
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                            {isImage ? (
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName}
                                style={{ maxWidth: "100px", maxHeight: "100px" }}
                              />
                            ) : (
                              <>📂 {msg.fileName}</>
                            )}
                          </a>
                        </p>
                      )}
                    </div>
                  );
                })}
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
              <button onClick={sendFile} disabled={uploading || !file}>
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
