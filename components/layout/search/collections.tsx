"use client";

import { useEffect, useState } from "react";
import { getCollections } from "lib/local";
import FilterList from "./filter";
import type { Collection } from "lib/local/types";

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCollections();
        setCollections(data);
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
        <div className="mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-800" />
        <div className="mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-800" />
        <div className="mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-neutral-300 dark:bg-neutral-700" />
        <div className="mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-neutral-300 dark:bg-neutral-700" />
      </div>
    );
  }

  return <FilterList list={collections} title="Danh mục" />;
}
