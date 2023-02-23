import Link from "next/link";
import { trpc } from "@utils/trpc";
import { useUserContext } from "src/context/user.context";
import { useCallback } from "react";
import { MdLogout, MdAddBox, MdLogin } from "react-icons/md";
import { FaAppleAlt, FaUserPlus } from "react-icons/fa";
import ShouldRender from "./ShouldRender";
import ThemeSwitch from "./ThemeSwitch";

const Header: React.FC = () => {
  const user = useUserContext();
  const { mutate: logout } = trpc.useMutation(["users.logout"]);

  const onClickLogout = useCallback(() => logout(), [logout]);

  return (
    <header className="w-full relative flex justify-center items-center">
      <nav className="absolute left-0 flex sm:gap-5 gap-3">
        <ShouldRender if={user}>
          <Link href="/posts/new" passHref>
            <a className="hidden sm:block">Create post</a>
          </Link>
          <button
            className=" hidden sm:block cursor-pointer "
            onClick={onClickLogout}
          >
            Logout
          </button>

          <MdAddBox
            size={25}
            className="sm:hidden block dark:text-emerald-500 text-emerald-700"
          />
          <MdLogout
            size={25}
            className="sm:hidden block dark:text-emerald-500 text-emerald-700"
          />
        </ShouldRender>
        <ShouldRender if={!user}>
          <Link href="/login" passHref>
            <a className="hidden sm:block">Login</a>
          </Link>
          <Link href="/register" passHref>
            <a className="hidden sm:block">Register</a>
          </Link>

          <MdLogin
            size={25}
            className="sm:hidden block dark:text-emerald-500 text-emerald-700"
          />
          <FaUserPlus
            size={25}
            className="sm:hidden block dark:text-emerald-500 text-emerald-700"
          />
        </ShouldRender>
      </nav>
      <Link href="/">
        <FaAppleAlt
          aria-label="Go back to home"
          role="button"
          size={40}
          className="dark:text-emerald-500 text-emerald-700 cursor-pointer hover:opacity-75"
        />
      </Link>

      <div className="absolute right-0">
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default Header;
