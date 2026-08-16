import Collections from "./collections";
import FilterList from "./filter";
import { sorting } from "lib/constants";
import React from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 pt-4 text-black md:flex-row dark:text-white">
      <div className="order-first w-full flex-none md:max-w-[125px]">
        <Collections />
      </div>
      <div className="order-last min-h-screen w-full md:order-none">
        {children}
      </div>
      <div className="order-none w-full flex-none md:max-w-[125px]">
        <FilterList list={sorting} title="Sắp xếp" />
      </div>
    </div>
  );
}
