"use client";

import clsx from "clsx";
import { Menu } from "lib/local/types";
import { Link } from "react-router-dom";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function FooterMenuItem({ item }: { item: Menu }) {
  const pathname = (useLocation().pathname);
  const [active, setActive] = useState(pathname === item.path);

  useEffect(() => {
    setActive(pathname === item.path);
  }, [pathname, item.path]);

  return (
    <li>
      <Link
        to={item.path}
        className={clsx(
          "block py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200",
          {
            "text-orange-600 dark:text-orange-500 font-semibold": active,
          },
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}

export default function FooterMenu({ menu }: { menu: Menu[] }) {
  if (!menu.length) return null;

  return (
    <nav>
      <ul className="flex flex-col gap-1.5">
        {menu.map((item: Menu) => {
          return <FooterMenuItem key={item.title} item={item} />;
        })}
      </ul>
    </nav>
  );
}
