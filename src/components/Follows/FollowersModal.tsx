import useOnScreen from "@hooks/useOnScreen";
import { trpc } from "@utils/trpc";
import type { User } from "@utils/types";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import EmptyMessage from "../EmptyMessage";
import { Modal } from "../Modal";
import ShouldRender from "../ShouldRender";
import UserCard from "./UserCard";

type Props = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  user?: User;
};
const FollowersModal: React.FC<Props> = ({ openState, user }) => {
  const router = useRouter();
  const userId = router.query.userId as string;
  const [, toggleModal] = openState;

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "users.get-followers",
        {
          limit: 15,
          userId,
        },
      ],
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page.followers),
    [data]
  );

  const loadingArray = Array.from<undefined>({ length: 4 });
  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative max-h-[85vh] max-w-[90vw] rounded-lg bg-white p-8 dark:bg-neutral-900 sm:max-w-[352px] sm:p-12">
        <h3 className="mb-5 text-xl">{`${user?.name}'s followers`}</h3>
        <div className="flex h-[300px] w-full flex-col items-center gap-3 overflow-y-auto overflow-x-hidden pr-3 sm:w-fit">
          {(isLoading ? loadingArray : dataToShow)?.map((follower, key) => {
            const user = follower?.follower;

            return (
              <UserCard
                loading={isLoading}
                key={isLoading ? key : user?.id}
                user={user}
                onClickCard={() => toggleModal(false)}
              />
            );
          })}

          <ShouldRender if={isFetchingNextPage}>
            <UserCard loading />
          </ShouldRender>

          <ShouldRender if={noDataToShow}>
            <EmptyMessage
              message="Seems like this user has no followers yet."
              hideRedirect
              small
            />
          </ShouldRender>

          <div ref={bottomRef} />
        </div>
      </div>
    </Modal>
  );
};

export default FollowersModal;
