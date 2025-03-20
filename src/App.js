import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { checkUserLogin, logoutUser } from "./authService";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserLogin(setUser);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Nếu đã đăng nhập, không cho vào Login/Signup */}
        <Route path="/login" element={user ? <Navigate to="/chat" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/chat" /> : <Signup />} />

        {/* Trang chat chỉ vào được nếu đã đăng nhập */}
        <Route path="/chat" element={user ? <Chat user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

        {/* Mặc định chuyển hướng */}
        <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
