import Button from "@components/Button";
import { trpc } from "@utils/trpc";
import type { User } from "@utils/types";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useMemo } from "react";
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

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "users.get-followers",
        {
          limit: 10,
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
  const loadMore = () => fetchNextPage();

  return (
    <Modal openState={openState} alwaysCentered>
      <div className="relative max-h-[85vh] max-w-[90vw] rounded-lg bg-white p-8 backdrop-blur-sm dark:bg-zinc-900/80 sm:max-w-[352px] sm:p-12">
        <h3 className="mb-5 text-xl">{`${user?.name}'s followers`}</h3>
        <div className="grey-scrollbar flex h-[400px] w-full flex-col items-center gap-3 overflow-y-auto overflow-x-hidden pr-2 sm:w-fit">
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

          <ShouldRender if={!!dataToShow && hasNextPage}>
            <div className="flex w-full justify-center border-t border-neutral-300 p-3 dark:border-zinc-800">
              <Button
                loading={isFetchingNextPage}
                onClick={loadMore}
                className="flex w-full justify-center rounded-full"
                variant="primary"
                size="sm"
              >
                Load more
              </Button>
            </div>
          </ShouldRender>

          <ShouldRender if={noDataToShow}>
            <EmptyMessage
              message="Seems like this user has no followers yet."
              hideRedirect
              small
            />
          </ShouldRender>
        </div>
      </div>
    </Modal>
  );
};

export default FollowersModal;
