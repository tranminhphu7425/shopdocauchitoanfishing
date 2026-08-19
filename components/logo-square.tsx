import clsx from "clsx";
const avatarUrl = "/images/logo.jpg";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center overflow-hidden border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black",
        {
          "h-[50px] w-[50px] rounded-xl": !size,
          "h-[40px] w-[40px] rounded-lg": size === "sm",
        },
      )}
    >
      <img
        src={avatarUrl}
        alt="Chí Toàn Fishing Shop Logo"
        width={size === "sm" ? 40 : 50}
        height={size === "sm" ? 40 : 50}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
