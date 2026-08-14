import { getMenu } from "lib/local";
import NavbarClient from "./navbar-client";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return <NavbarClient menu={menu} siteName={SITE_NAME} />;
}
