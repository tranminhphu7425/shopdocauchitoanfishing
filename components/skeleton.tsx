import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 p-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="w-full animate-fadeIn">
          <SkeletonCard />
        </li>
      ))}
    </ul>
  );
}

export function SkeletonProductDetail() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 md:py-12">
      <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
        <div className="h-full w-full basis-full lg:basis-4/6">
          <Skeleton className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-2xl" />
          <ul className="my-12 flex items-center flex-wrap justify-center gap-2 overflow-auto py-1 lg:mb-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-20 w-20">
                <Skeleton className="h-full w-full rounded-xl" />
              </li>
            ))}
          </ul>
        </div>

        <div className="basis-full lg:basis-2/6 flex flex-col gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full mt-4" />
          <div className="space-y-2 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4"
          >
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="w-full">
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center p-2">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductForm() {
  return (
    <div className="mx-auto max-w-7xl p-8 space-y-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonThreeItemGrid() {
  return (
    <section className="mt-10 mx-auto max-w-screen-2xl px-4 pb-4 w-full">
      <h2 className="mb-6 text-2xl font-bold text-neutral-800 dark:text-white uppercase tracking-wider">
        Các sản phẩm nổi bật
      </h2>
      <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
        <Skeleton className="md:col-span-4 md:row-span-2 aspect-square h-full w-full rounded-2xl" />
        <Skeleton className="md:col-span-2 md:row-span-1 aspect-square h-full w-full rounded-2xl" />
        <Skeleton className="md:col-span-2 md:row-span-1 aspect-square h-full w-full rounded-2xl" />
      </div>
    </section>
  );
}

export function SkeletonCarousel() {
  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Skeleton className="h-full w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}
