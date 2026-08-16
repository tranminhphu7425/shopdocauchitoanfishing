"use client";

import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import ThemeToggle from "components/theme-toggle";
import { Menu } from "lib/local/types";
import { Link, useLocation } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import MobileMenu from "./mobile-menu";
import NavbarLinks from "./navbar-links";
import Search, { SearchSkeleton } from "./search";
import AdminMobileMenu from "./admin-mobile-menu";

export default function NavbarClient({
  menu,
  siteName,
}: {
  menu: Menu[];
  siteName?: string;
}) {
  const pathname = useLocation().pathname;
  const isAdmin = pathname?.startsWith("/admin");
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth =
        localStorage.getItem("ctf_admin_authenticated") === "true" ||
        sessionStorage.getItem("ctf_admin_authenticated") === "true";
      setIsAdminAuth(isAuth);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("ctf_admin_authenticated");
    sessionStorage.removeItem("ctf_admin_authenticated");
    setIsAdminAuth(false);
    toast.info("Đã đăng xuất tài khoản Quản trị");
    window.location.reload();
  };

  if (isAdmin) {
    return (
      <nav className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="block flex-none md:hidden">
            <AdminMobileMenu />
          </div>
          <div className="flex w-full items-center justify-between gap-4 md:gap-6">
            {/* Logo & Admin Badge */}
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="flex items-center justify-center transition-transform hover:scale-102"
              >
                <LogoSquare />
                <div className="ml-2.5 hidden text-sm font-bold uppercase tracking-wider text-black dark:text-white sm:block">
                  {siteName}
                </div>
              </Link>
              <span className="rounded-md bg-orange-600/10 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-600/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 whitespace-nowrap">
                TRANG QUẢN TRỊ
              </span>
            </div>

            {/* Admin Links */}
            <ul className="hidden gap-6 text-sm font-medium md:flex md:items-center whitespace-nowrap">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${pathname === "/admin"
                    ? "bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/30 dark:text-orange-500"
                    : "text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/products/new"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${pathname === "/admin/products/new"
                    ? "bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/30 dark:text-orange-500"
                    : "text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Thêm sản phẩm mới
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  Ghé cửa hàng
                </Link>
              </li>
            </ul>

            {/* Admin Actions */}
            <div className="flex items-center justify-end gap-2">
              <ThemeToggle />
              {isAdminAuth && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-3 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 transition-all shadow-sm active:scale-95"
                  title="Đăng xuất khỏi tài khoản Quản trị"
                >
                  Đăng xuất
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Customer Storefront Navbar
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <div className="flex w-full items-center justify-between gap-4 md:gap-6">
          <div className="flex w-full md:w-1/3">
            <Link
              to="/"
              className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6 transition-transform hover:scale-102"
            >
              <LogoSquare />
              <div className="ml-2.5 flex-none text-sm font-bold uppercase tracking-wider text-black dark:text-white md:hidden lg:block">
                {siteName}
              </div>
            </Link>
            {menu.length ? <NavbarLinks menu={menu} /> : null}
          </div>
          <div className="hidden justify-center md:flex md:w-1/3">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <div className="flex items-center justify-end gap-2 md:w-1/3">

            {isAdminAuth && (
              <Link
                to="/admin"
                title="Về trang quản trị"
                className="flex p-3 justify-center items-center gap-2 text-center text-sm font-semibold rounded-md border border-neutral-200 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-neutral-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.524a1.125 1.125 0 0 1 1.48.175l.772.772a1.125 1.125 0 0 1 .175 1.48l-.524.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.385-.93.78-.165.398-.143.854.107 1.204l.524.738a1.125 1.125 0 0 1-.175 1.479l-.772.772a1.125 1.125 0 0 1-1.48.175l-.738-.524c-.35-.25-.805-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.783-.93-.398-.164-.854-.142-1.204.108l-.738.524a1.125 1.125 0 0 1-1.479-.175l-.772-.772a1.125 1.125 0 0 1-.175-1.48l.524-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.385.93-.78.165-.398.143-.854-.108-1.204l-.524-.738a1.125 1.125 0 0 1 .175-1.479l.772-.772a1.125 1.125 0 0 1 1.48-.175l.737.524c.35.25.806.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span className="hidden sm:inline">Về trang quản trị</span>
              </Link>
            )}
            <ThemeToggle />
            <CartModal />
          </div>
        </div>
      </div>
    </nav>
  );
}
