import { authOptions } from "@server/utils/auth";
import NextAuth from "next-auth";

export default NextAuth(authOptions);
