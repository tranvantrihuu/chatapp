import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase-config";

// Kiểm tra trạng thái đăng nhập
export const checkUserLogin = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Đăng nhập
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Đăng nhập thành công!", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    throw error;
  }
};

// Đăng xuất
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Đã đăng xuất!");
  } catch (error) {
    console.error("Lỗi đăng xuất:", error.message);
    throw error;
  }
};
