import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NoPostsAnimation from "@public/static/ghost.json";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import useOnScreen from "src/hooks/useOnScreen";
import Lottie from "react-lottie";
import PostCard from "@components/PostCard";
import Image from "next/image";
import ShouldRender from "@components/ShouldRender";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import MetaTags from "@components/MetaTags";
import useGetDate from "src/hooks/useGetDate";
import { IoMdSettings } from "react-icons/io";
import useFilterPosts from "src/hooks/useFilterPosts";
import Tab from "@components/Tab";
import Link from "next/link";
import ConfirmationModal from "@components/ConfirmationModal";
import { toast } from "react-toastify";
import getUserDisplayName from "@utils/getUserDisplayName";
import Popup from "@components/Popup";
import UserPopupContent from "@components/UserPopupContent";
import EditAccountModal from "@components/EditAccountModal";

const LOTTIE_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: NoPostsAnimation,
};

const UserPage: React.FC = () => {
  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const { data: session } = useSession();
  const router = useRouter();
  const userId = router.query.userId as string;
  const userIsProfileOwner = userId === session?.user?.id;

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data: user } = trpc.useQuery(
    [
      "users.single-user",
      {
        userId,
      },
    ],
    {
      onSuccess(data) {
        // if user not found, 404
        if (!data?.id) router.push("/404");
      },
    }
  );

  const { date, toggleDateType } = useGetDate(user?.createdAt);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          userId,
          limit: 4,
          filter: currentFilter,
        },
      ],
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page.posts),
    [data]
  );

  const noDataToShow = !isLoading && !dataToShow?.length && !hasNextPage;
  const loadingArray = Array.from<undefined>({ length: 4 });

  const isDeleteAccountModalOpen = useState(false);
  const [, setIsDeleteAccountModalOpen] = isDeleteAccountModalOpen;

  const showDeleteConfirm = useCallback(() => {
    setIsDeleteAccountModalOpen(true);
  }, [setIsDeleteAccountModalOpen]);

  const isEditAccountModalOpen = useState(false);
  const [, setIsEditAccountModalOpen] = isEditAccountModalOpen;

  const toggleEditModal = useCallback(
    (value: boolean) => () => {
      setIsEditAccountModalOpen(value);
    },
    [setIsEditAccountModalOpen]
  );

  const {
    mutate,
    error: deleteError,
    isLoading: deleting,
  } = trpc.useMutation(["users.delete-user"], {
    onSuccess: () => {
      setIsDeleteAccountModalOpen(false);
      signOut({
        redirect: false,
      });

      setTimeout(() => {
        router.push("/");
      }, 500);
    },
  });

  const onConfirm = useCallback(() => {
    if (!!session?.user?.id) {
      mutate({ userId: session.user.id });
    }
  }, [mutate, session]);

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  useEffect(() => {
    if (deleteError) toast.error(deleteError?.message);
  }, [deleteError]);

  return (
    <>
      <MetaTags
        title={getUserDisplayName(user)}
        image={user?.image || "/static/default-profile.jpg"}
      />
      <MainLayout>
        <section className="mx-auto flex flex-col items-center gap-5 mt-10">
          <div className="relative">
            <Image
              src={user?.image || "/static/default-profile.jpg"}
              width={240}
              height={240}
              className="rounded-full"
              alt={user?.name as string}
            />
            <ShouldRender if={userIsProfileOwner}>
              <button
                className="absolute bottom-0 right-10 bg-emerald-500 rounded-full flex justify-center items-center p-2 shadow-2xl"
                type="button"
              >
                <Popup
                  icon={
                    <IoMdSettings
                      size={23}
                      className="text-white  hover:opacity-80 drop-shadow-lg"
                    />
                  }
                >
                  <UserPopupContent
                    onClickDeleteAccount={showDeleteConfirm}
                    openEditAccountModal={toggleEditModal(true)}
                  />
                </Popup>
              </button>
            </ShouldRender>
          </div>
          <div className="text-center w-64">
            <ShouldRender if={!!user}>
              <p className="text-xl">
                {getUserDisplayName(user)}{" "}
                <ShouldRender if={userIsProfileOwner}>
                  <span className="text-emerald-700 dark:text-emerald-500">
                    {" "}
                    (You)
                  </span>
                </ShouldRender>
              </p>
            </ShouldRender>
            <ShouldRender if={!!user?.createdAt}>
              <p className="mt-2 text-neutral-800 dark:text-neutral-400 dark:opacity-80">
                Member since{" "}
                <span
                  onClick={toggleDateType}
                  className="cursor-pointer select-none"
                  role="button"
                  aria-label="Change date visualization type"
                  title="Change date visualization type"
                >
                  {date}
                </span>
              </p>
            </ShouldRender>
          </div>
        </section>

        <section className="w-full">
          <div className="w-full flex flex-col sm:flex-row justify-between mb-5">
            <h2 className="sm:text-3xl text-2xl">User posts</h2>

            <div className="flex justify-start sm:justify-end sm:items-start mt-3 sm:mt-1 gap-3">
              {filters.map((filter) => (
                <Tab
                  key={filter}
                  active={currentFilter === filter}
                  title={`Filter by ${filterLabels[filter]}`}
                  label={filterLabels[filter]}
                  onClick={toggleFilter(filter)}
                />
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-10">
            {(isLoading ? loadingArray : dataToShow)?.map((post, i) => (
              <PostCard
                post={post}
                key={isLoading ? i : post?.id}
                loading={isLoading}
              />
            ))}

            <ShouldRender if={isFetchingNextPage}>
              <PostCard loading />
            </ShouldRender>

            <ShouldRender if={noDataToShow}>
              <div className="flex flex-col items-center">
                <Lottie options={LOTTIE_OPTIONS} width={232} height={207} />
                <p className="text-center">
                  Hmm. It seems that this user has not created any posts yet.
                </p>
                <Link href="/" legacyBehavior>
                  <a className="text-emerald-500 text-center underline mt-2">
                    Go back to home
                  </a>
                </Link>
              </div>
            </ShouldRender>
          </div>
        </section>

        <div ref={bottomRef} />
      </MainLayout>

      <ConfirmationModal
        description="This action is permanent and cannot be undone!"
        title="Are you sure you want to delete your account?"
        confirmationLabel="Delete my account"
        openState={isDeleteAccountModalOpen}
        loading={deleting}
        onConfirm={onConfirm}
      />

      <EditAccountModal
        openState={isEditAccountModalOpen}
        onClose={toggleEditModal(false)}
        user={user}
      />
    </>
  );
};

export default UserPage;
