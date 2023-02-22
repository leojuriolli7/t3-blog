import Link from "next/link";
import { trpc } from "@utils/trpc";
import { useUserContext } from "src/context/user.context";
import { useCallback } from "react";
import ShouldRender from "./ShouldRender";
import ThemeSwitch from "./ThemeSwitch";

const Header: React.FC = () => {
  const user = useUserContext();

  const { mutate: logout } = trpc.useMutation(["users.logout"]);

  const onClickLogout = useCallback(() => logout(), [logout]);

  return (
    <header className="w-full flex justify-between items-center">
      <nav className="flex gap-10">
        <ShouldRender if={user}>
          <Link href="/posts/new">Create post</Link>
          <button className="cursor-pointer" onClick={onClickLogout}>
            Logout
          </button>
        </ShouldRender>
        <ShouldRender if={!user}>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </ShouldRender>
      </nav>
      <ThemeSwitch />
    </header>
  );
};

export default Header;
