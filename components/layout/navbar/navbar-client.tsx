"use client";

import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import ThemeToggle from "components/theme-toggle";
import { GitHubStatusButton, ReturnToAdminButton } from "components/admin/github-config-modal";
import { Menu } from "lib/local/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
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
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

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
                href="/admin"
                prefetch={true}
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
                  href="/admin"
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin"
                      ? "bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/30 dark:text-orange-500"
                      : "text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products/new"
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/admin/products/new"
                      ? "bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/30 dark:text-orange-500"
                      : "text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Thêm sản phẩm mới
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  prefetch={true}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Ghé cửa hàng
                </Link>
              </li>
            </ul>

            {/* Admin Actions */}
            <div className="flex items-center justify-end gap-2">
              <GitHubStatusButton />
              <ThemeToggle />
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
              href="/"
              prefetch={true}
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
            <ReturnToAdminButton />
            <GitHubStatusButton />
            <ThemeToggle />
            <CartModal />
          </div>
        </div>
      </div>
    </nav>
  );
}
