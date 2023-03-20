import useOnScreen from "@hooks/useOnScreen";
import { trpc } from "@utils/trpc";
import { User } from "@utils/types";
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
const FollowingModal: React.FC<Props> = ({ openState, user }) => {
  const router = useRouter();
  const userId = router.query.userId as string;

  const [, toggleModal] = openState;

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "users.get-following",
        {
          limit: 15,
          userId,
        },
      ],
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        ssr: false,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page.following),
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
      <div className="relative sm:max-w-[352px] max-w-[90vw] max-h-[85vh] sm:p-12 p-8 dark:bg-neutral-900 bg-white">
        <h3 className="text-xl mb-5">{`${user?.name}'s following`}</h3>
        <div className="flex w-full sm:w-fit pr-3 items-center flex-col gap-3 overflow-y-auto overflow-x-hidden h-[300px]">
          {(isLoading ? loadingArray : dataToShow)?.map((following, key) => {
            const user = following?.following;

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
              message="Seems like this user doesn't follow anyone yet."
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

export default FollowingModal;
