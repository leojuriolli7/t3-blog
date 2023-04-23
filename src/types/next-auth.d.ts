import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      isAdmin: boolean;
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "user" | "admin" | null;
  }
}
