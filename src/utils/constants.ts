import { SearchFilterTypes } from "@schema/search.schema";

const environmentUrl =
  process.env.NEXT_PUBLIC_BYPASS_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

export const baseUrl = environmentUrl
  ? `https://${environmentUrl}`
  : `http://localhost:3000`;

export const url = `${baseUrl}/api/trpc`;

export const SEARCH_FILTERS: SearchFilterTypes[] = [
  "posts",
  "comments",
  "tags",
  "users",
];
