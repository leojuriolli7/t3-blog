import { User } from "@utils/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";

type Props = {
  user?: Omit<User, "alreadyFollowing" | "url">;
  loading?: boolean;
};

const UserPreview: React.FC<Props> = ({ loading, user }) => {
  return (
    <Link href={`/users/${user?.id}`} className="w-full">
      <div
        className={`${
          loading ? "pointer-events-none" : ""
        } w-full cursor-pointer rounded-lg hover:opacity-80 bg-white dark:bg-zinc-800 shadow-md border-2 border-zinc-300 dark:border-neutral-700 p-6 flex justify-between items-start gap-2`}
      >
        <div className="w-8 min-w-[32px] h-8">
          <Image
            width={32}
            height={32}
            alt={user?.name || "User"}
            src={user?.image || "/static/default-profile.jpg"}
            className="rounded-full object-cover h-[32px]"
          />
        </div>
        <div className="w-full">
          <ShouldRender if={loading}>
            <Skeleton lines={1} width="w-full mb-3 max-w-[250px]" />

            <Skeleton lines={2} width="w-full" />
          </ShouldRender>

          <ShouldRender if={!loading}>
            <p>{user?.name}</p>

            <p className="text-sm text-ellipsis line-clamp-2 text-neutral-600 dark:text-neutral-400">
              {user?.bio}
            </p>
          </ShouldRender>
        </div>
      </div>
    </Link>
  );
};

export default UserPreview;
