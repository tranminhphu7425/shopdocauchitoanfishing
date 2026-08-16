import { useEffect, useState } from "react";
import { getMenu } from "lib/local";
import NavbarClient from "./navbar-client";

const SITE_NAME = import.meta.env.VITE_SITE_NAME;

export function Navbar() {
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMenu("next-js-frontend-header-menu");
        setMenu(data);
      } catch (error) {
        console.error("Error loading menu:", error);
      }
    }
    loadData();
  }, []);

  return <NavbarClient menu={menu} siteName={SITE_NAME} />;
}
