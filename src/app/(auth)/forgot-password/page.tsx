"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const { authService } = require("@/services/authService");
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      setSubmitted(true);
      success("Đã gửi email khôi phục!", "Vui lòng kiểm tra hòm thư đến của bạn.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể gửi email khôi phục";
      error("Có lỗi xảy ra", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md shadow-blue-500/30">
            C
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quên Mật Khẩu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Hướng dẫn khôi phục mật khẩu đã được gửi đến <b>{email}</b>. Hãy kiểm tra cả hộp thư Spam nếu chưa thấy nhé!
            </p>
            <Link href="/login" className="inline-block text-xs font-bold text-blue-600 hover:underline">
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Địa chỉ Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 font-bold" isLoading={isLoading}>
              <Send className="w-4 h-4 mr-1.5" /> Gửi liên kết khôi phục
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
