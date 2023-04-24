import type { User } from "@utils/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ShouldRender from "./ShouldRender";
import Skeleton from "./Skeleton";

type Props = {
  user?: Pick<User, "id" | "name" | "image" | "bio">;
  loading?: boolean;
};

const UserPreview: React.FC<Props> = ({ loading, user }) => {
  return (
    <Link href={`/users/${user?.id}`} className="w-full">
      <div
        className={`${
          loading ? "pointer-events-none" : ""
        } flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg border-2 border-zinc-300 bg-white p-6 shadow-md hover:opacity-80 dark:border-neutral-700 dark:bg-zinc-800`}
      >
        <div className="h-8 w-8 min-w-[32px]">
          <Image
            width={32}
            height={32}
            alt={user?.name || "User"}
            src={user?.image || "/static/default-profile.jpg"}
            className="h-[32px] rounded-full object-cover"
          />
        </div>
        <div className="w-full">
          <ShouldRender if={loading}>
            <Skeleton lines={1} width="w-full mb-3 max-w-[250px]" />

            <Skeleton lines={2} width="w-full" />
          </ShouldRender>

          <ShouldRender if={!loading}>
            <p>{user?.name}</p>

            <p className="line-clamp-2 text-ellipsis text-sm text-neutral-600 dark:text-neutral-400">
              {user?.bio}
            </p>
          </ShouldRender>
        </div>
      </div>
    </Link>
  );
};

export default UserPreview;
