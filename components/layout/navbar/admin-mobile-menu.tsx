"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";

import ThemeToggle from "components/theme-toggle";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminMobileMenu() {
  const pathname = useLocation().pathname;
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const adminLinks = [
    {
      title: "Quản lý sản phẩm",
      path: "/admin",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      ),
    },
    {
      title: "Thêm sản phẩm mới",
      path: "/admin/products/new",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      ),
    },
    {
      title: "Ghé cửa hàng",
      path: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <button
        onClick={openMobileMenu}
        aria-label="Mở menu quản trị"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors md:hidden dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-sm"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-sm"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div
              className="fixed inset-0 bg-neutral-900/40"
              aria-hidden="true"
            />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 top-0 z-50 flex h-full w-[310px] max-w-[85vw] flex-col bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg border-r border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 overflow-y-auto">
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    onClick={closeMobileMenu}
                    aria-label="Đóng menu"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                      Trang Quản Trị
                    </span>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <ul className="flex w-full flex-col gap-2">
                {adminLinks.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                          isActive
                            ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-500 font-bold border-l-4 border-orange-600 pl-3 shadow-sm"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                  <button
                    onClick={() => {
                      localStorage.removeItem("ctf_admin_authenticated");
                      sessionStorage.removeItem("ctf_admin_authenticated");
                      closeMobileMenu();
                      window.location.reload();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-xl transition-all"
                  >
                    <span>🔒 Đăng xuất Quản trị</span>
                  </button>
                </li>
              </ul>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
