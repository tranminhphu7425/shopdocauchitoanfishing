import { useState, useEffect } from "react";

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth =
        typeof window !== "undefined" &&
        (localStorage.getItem("ctf_admin_authenticated") === "true" ||
          sessionStorage.getItem("ctf_admin_authenticated") === "true");
      setIsAdmin(Boolean(isAuth));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return isAdmin;
}
