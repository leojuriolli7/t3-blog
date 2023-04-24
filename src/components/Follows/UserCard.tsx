import type { FollowingUser } from "@utils/types";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback } from "react";
import ShouldRender from "../ShouldRender";
import Skeleton from "../Skeleton";

type Props = {
  user?: FollowingUser;
  loading: boolean;
  onClickCard?: () => void;
};

const UserCard: React.FC<Props> = ({ loading, user, onClickCard }) => {
  const router = useRouter();

  const handleClickCard = useCallback(() => {
    if (onClickCard) onClickCard();

    setTimeout(() => router.push(`/users/${user?.id}`), 200);
  }, [user, router, onClickCard]);

  return (
    <div
      onClick={handleClickCard}
      className={`${
        loading ? "pointer-events-none" : ""
      } flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border-2 border-zinc-300 bg-white p-6 shadow-md hover:opacity-80 dark:border-neutral-700 dark:bg-zinc-800 sm:w-64`}
    >
      <div className="h-8 w-8 min-w-[32px]">
        <Image
          width={32}
          height={32}
          alt={user?.name || "Follower"}
          src={user?.image || "/static/default-profile.jpg"}
          className="h-[32px] rounded-full object-cover"
        />
      </div>
      <div className="w-full">
        <ShouldRender if={!loading}>
          <p>{user?.name}</p>
        </ShouldRender>
        <ShouldRender if={loading}>
          <Skeleton lines={1} width="w-full" />
        </ShouldRender>
      </div>
    </div>
  );
};

export default UserCard;
