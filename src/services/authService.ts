import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { UserProfile, UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  timezone: "Asia/Ho_Chi_Minh",
  dateFormat: "DD/MM/YYYY",
  defaultReminderMinutes: 15,
  notificationEnabled: true,
  language: "vi"
};

// Helper timeout
function withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout Firestore")), ms)
    )
  ]);
}

export const authService = {
  // Lắng nghe trạng thái đăng nhập thời gian thực
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    if (typeof window === "undefined" || !auth) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Người dùng"),
        photoURL: firebaseUser.photoURL,
        createdAt: new Date().toISOString(),
        settings: DEFAULT_SETTINGS
      };

      callback(profile);

      if (db) {
        withTimeout(
          setDoc(doc(db, "users", firebaseUser.uid), {
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
            photoURL: profile.photoURL
          }, { merge: true }),
          3000
        ).catch(() => {});
      }
    });
  },

  // Đăng nhập Google qua Pop-up
  async signInWithGoogle(): Promise<UserProfile> {
    if (!auth) throw new Error("Firebase Auth chưa khởi tạo");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const u = result.user;

    const profile: UserProfile = {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || (u.email ? u.email.split("@")[0] : "Người dùng Google"),
      photoURL: u.photoURL,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS
    };

    if (db) {
      withTimeout(
        setDoc(doc(db, "users", u.uid), {
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          photoURL: profile.photoURL
        }, { merge: true }),
        3000
      ).catch(() => {});
    }

    return profile;
  },

  // Đăng nhập Google qua Chuyển hướng Redirect (chống 100% việc bị chặn Pop-up)
  async signInWithGoogleRedirect(): Promise<void> {
    if (!auth) throw new Error("Firebase Auth chưa khởi tạo");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);
  },

  // Bắt kết quả Redirect khi quay lại trang
  async checkRedirectResult(): Promise<UserProfile | null> {
    if (!auth) return null;
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const u = result.user;
        return {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || (u.email ? u.email.split("@")[0] : "Người dùng Google"),
          photoURL: u.photoURL,
          createdAt: new Date().toISOString(),
          settings: DEFAULT_SETTINGS
        };
      }
    } catch (e) {
      console.warn("Lỗi getRedirectResult:", e);
      throw e;
    }
    return null;
  },

  // Đăng nhập Email + Password
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    if (!auth) throw new Error("Firebase Auth chưa sẵn sàng");
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const u = res.user;

    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || email.split("@")[0],
      photoURL: u.photoURL,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS
    };
  },

  // Đăng ký tài khoản Email + Password
  async register(email: string, pass: string, name: string): Promise<UserProfile> {
    if (!auth) throw new Error("Firebase Auth chưa sẵn sàng");
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const u = res.user;

    const profile: UserProfile = {
      uid: u.uid,
      email: u.email,
      displayName: name,
      photoURL: null,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS
    };

    if (db) {
      withTimeout(
        setDoc(doc(db, "users", u.uid), profile),
        3000
      ).catch(() => {});
    }

    return profile;
  },

  // Đăng xuất
  async signOut(): Promise<void> {
    if (auth) {
      await firebaseSignOut(auth);
    }
  },

  // Quên mật khẩu
  async resetPassword(email: string): Promise<void> {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  },

  // Lấy Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    try {
      const snap = await withTimeout(getDoc(doc(db, "users", uid)), 3000);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch {
      //
    }
    return null;
  },

  // Cập nhật cài đặt
  async updateSettings(uid: string, newSettings: Partial<UserSettings>): Promise<void> {
    if (!db) return;
    try {
      await withTimeout(
        setDoc(doc(db, "users", uid), { settings: newSettings }, { merge: true }),
        3000
      );
    } catch {
      //
    }
  }
};
