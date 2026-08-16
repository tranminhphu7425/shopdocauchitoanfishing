import React, { useState, useEffect } from "react";
import { LockClosedIcon, KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

// Expected SHA-256 hash of "Chitoan@2026"
const TARGET_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  "7a1a7e374d4647fc718b303413faf07b0305b56c76a93855ed4eabb2a691d708";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const authStatus =
      localStorage.getItem("ctf_admin_authenticated") ||
      sessionStorage.getItem("ctf_admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setSubmitting(true);
    try {
      const inputHash = await sha256(password.trim());
      if (inputHash.toLowerCase() === TARGET_HASH.toLowerCase()) {
        localStorage.setItem("ctf_admin_authenticated", "true");
        sessionStorage.setItem("ctf_admin_authenticated", "true");
        setIsAuthenticated(true);
        toast.success("🔐 Đăng nhập Quản trị thành công!");
      } else {
        toast.error("Mật khẩu Quản trị không chính xác!");
      }
    } catch (err) {
      console.error("Lỗi mã hóa SHA256:", err);
      toast.error("Đã xảy ra lỗi khi kiểm tra mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90 text-black dark:text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-500 mb-6 shadow-inner">
            <LockClosedIcon className="h-8 w-8" />
          </div>

          <h2 className="text-center text-2xl font-black tracking-tight mb-2">
            Đăng nhập Quản trị
          </h2>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
            Hệ thống yêu cầu mật khẩu quản trị để truy cập trang Quản lý sản phẩm Chí Toàn Fishing.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold mb-2 text-neutral-700 dark:text-neutral-300">
                Mật khẩu Admin
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neutral-400">
                  <KeyIcon className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-11 py-3 text-sm focus:border-orange-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 py-3.5 text-center text-sm font-bold text-white shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? "Đang xác thực..." : "XÁC NHẬN ĐĂNG NHẬP"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
