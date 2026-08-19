import { ReadonlyURLSearchParams } from "next/navigation";

export const baseUrl =
  typeof process !== "undefined" && process.env?.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : import.meta.env?.VITE_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${import.meta.env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000";

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith)
    ? stringToCheck
    : `${startsWith}${stringToCheck}`;
