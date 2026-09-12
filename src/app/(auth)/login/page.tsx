"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ArrowRight, AlertTriangle, ExternalLink, RefreshCw, Sun, Moon } from "lucide-react";
import { getFirebaseErrorMessage } from "@/utils/firebaseErrors";

export default function LoginPage() {
  const router = useRouter();
  const { actualTheme, setTheme } = useTheme();
  const { signInWithEmail, signInWithGoogle, signInWithGoogleRedirect } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmail(email, password);
      success("Đăng nhập thành công!", "Chào mừng bạn quay trở lại!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = getFirebaseErrorMessage(err);
      setErrorMessage(msg);
      error("Đăng nhập thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      success("Đăng nhập Google thành công!");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Lỗi Google Sign In:", err);
      const errObj = err as { code?: string };
      const msg = getFirebaseErrorMessage(err);
      setErrorMessage(msg);

      if (errObj.code === "auth/popup-blocked") {
        info("Trình duyệt đã chặn cửa sổ pop-up. Đang tự động chuyển hướng đăng nhập...");
        handleGoogleRedirectLogin();
        return;
      }

      error("Đăng nhập Google thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setIsRedirecting(true);
    setErrorMessage(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err: unknown) {
      const msg = getFirebaseErrorMessage(err);
      setErrorMessage(msg);
      error("Lỗi chuyển hướng", msg);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition cursor-pointer"
        >
          {actualTheme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Giao diện Sáng</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Giao diện Tối</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-md bg-white/90 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-9 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl shadow-blue-500/5 space-y-6 relative overflow-hidden">
        {/* Glow ambient inside card */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-blue-500/30">
            C
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Đăng Nhập
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Hệ thống Quản lý Công việc & Lịch học thông minh
          </p>
        </div>

        {/* Thông báo lỗi chi tiết nếu có */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs space-y-2 relative z-10">
            <div className="flex items-start gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {errorMessage.includes("Firebase Console") && (
              <a
                href="https://console.firebase.google.com/project/qttb-76e62/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
              >
                Mở Firebase Console để bật Google Sign-in <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Google Sign In Options */}
        <div className="space-y-2.5 relative z-10">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full py-3 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/60 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs rounded-2xl"
            disabled={isLoading || isRedirecting}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Đăng nhập bằng tài khoản Google
          </Button>

          <button
            type="button"
            onClick={handleGoogleRedirectLogin}
            disabled={isRedirecting || isLoading}
            className="w-full text-center text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-1 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Nếu cửa sổ Google không mở, bấm vào đây để chuyển trang
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center relative z-10">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#0c0c0e] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
            hoặc email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" /> Mật khẩu
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 rounded-2xl"
            isLoading={isLoading}
          >
            Đăng nhập <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 relative z-10 font-medium">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}
