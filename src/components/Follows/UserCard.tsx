import { FollowingUser } from "@utils/types";
import Image from "next/image";
import Link from "next/link";
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
      } w-64 cursor-pointer hover:opacity-80 bg-white dark:bg-neutral-900 shadow-md border-2 border-zinc-300 dark:border-neutral-700 p-6 flex justify-between items-center gap-2`}
    >
      <div className="w-8 min-w-[32px]">
        <Image
          width={32}
          height={32}
          alt={user?.name || "Follower"}
          src={user?.image || "/static/default-profile.jpg"}
          className="rounded-full"
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
