import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import MainLayout from "@components/MainLayout";
import Image from "next/future/image";
import ShouldRender from "@components/ShouldRender";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import MetaTags from "@components/MetaTags";
import useGetDate from "@hooks/useGetDate";
import { IoMdSettings } from "react-icons/io";
import useFilterPosts from "@hooks/useFilterPosts";
import Tab from "@components/Tab";
import { toast } from "react-toastify";
import getUserDisplayName from "@utils/getUserDisplayName";
import Popover from "@components/Popover";
import dynamic from "next/dynamic";
import { MdDelete, MdEditNote, MdOutlineTextSnippet } from "react-icons/md";
import { User } from "@utils/types";
import Skeleton from "@components/Skeleton";
import UserLinkPreview from "@components/EditAccountModal/UserLink/UserLinkPreview";
import Button from "@components/Button";
import clsx from "clsx";

const UserPageList = dynamic(() => import("@components/UserPageList"), {
  ssr: false,
});

const FollowersModal = dynamic(
  () => import("@components/Follows/FollowersModal"),
  {
    ssr: false,
  }
);

const FollowingModal = dynamic(
  () => import("@components/Follows/FollowingModal"),
  {
    ssr: false,
  }
);

const EditAccountModal = dynamic(() => import("@components/EditAccountModal"), {
  ssr: false,
});

const ConfirmationModal = dynamic(
  () => import("@components/ConfirmationModal"),
  {
    ssr: false,
  }
);

const UserPage: React.FC = () => {
  const { currentFilter, filterLabels, filters, toggleFilter } =
    useFilterPosts();

  const [currentTab, setCurrentTab] = useState<"posts" | "comments">("posts");

  const isPostsTab = currentTab === "posts";
  const isCommentsTab = currentTab === "comments";

  const toggleTab = (value: "posts" | "comments") => () => setCurrentTab(value);

  const { data: session } = useSession();
  const router = useRouter();
  const userId = router.query.userId as string;
  const userIsProfileOwner =
    !!session?.user?.id && userId === session?.user?.id;

  const redirectToTerms = (value: "privacy" | "conduct") => () =>
    router.push(`/terms/${value}`);

  const { data: user, isLoading: loadingUser } = trpc.useQuery(
    [
      "users.single-user",
      {
        userId,
      },
    ],
    {
      onSettled(data) {
        // if user not found, 404
        if (!data?.id) router.push("/404");
      },
    }
  );

  const { date, toggleDateType } = useGetDate(user?.createdAt);

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
    mutate: deleteUser,
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

  const utils = trpc.useContext();
  const openFollowersModalState = useState(false);
  const [, setOpenFollowersModal] = openFollowersModalState;

  const openFollowingModalState = useState(false);
  const [, setOpenFollowingModal] = openFollowingModalState;

  const { mutate: follow, error: followError } = trpc.useMutation(
    ["users.follow-user"],
    {
      async onMutate({ userId }) {
        await utils.cancelQuery(["users.single-user", { userId }]);

        const prevData = utils.getQueryData(["users.single-user", { userId }]);

        const userWasFollowing = !!prevData!.alreadyFollowing;

        // User is unfollowing
        if (userWasFollowing) {
          utils.setQueryData(["users.single-user", { userId }], (old) => ({
            ...old!,
            alreadyFollowing: false,
            _count: {
              followers: old!._count!.followers - 1,
              following: old!._count!.following,
            },
          }));
        }

        // User is following
        if (!userWasFollowing) {
          utils.setQueryData(["users.single-user", { userId }], (old) => ({
            ...old!,
            alreadyFollowing: true,
            _count: {
              followers: old!._count!.followers + 1,
              following: old!._count!.following,
            },
          }));
        }

        return { prevData };
      },

      onError: (err, newData, context) => {
        utils.setQueryData(["users.single-user"], context?.prevData as User);
      },
      onSettled: () => {
        utils.invalidateQueries([
          "users.single-user",
          {
            userId,
          },
        ]);

        utils.invalidateQueries([
          "users.get-followers",
          {
            userId,
            limit: 15,
          },
        ]);

        utils.invalidateQueries([
          "users.get-following",
          {
            userId,
            limit: 15,
          },
        ]);
      },
    }
  );

  const handleClickFollowButton = useCallback(
    () => follow({ userId }),
    [userId, follow]
  );

  const onConfirm = useCallback(() => {
    if (!!session?.user?.id) {
      deleteUser({ userId: session.user.id });
    }
  }, [deleteUser, session]);

  useEffect(() => {
    if (deleteError) toast.error("Error deleting your account.");

    if (followError) toast.error("Error on the follow/unfollow action.");
  }, [deleteError, followError]);

  return (
    <>
      <MetaTags
        title={getUserDisplayName(user) || "User"}
        image={user?.image || "/static/default-profile.jpg"}
      />
      <MainLayout>
        <section className="mx-auto xl:mt-10 mt-4 flex flex-col items-center gap-5">
          <div className="relative">
            <Image
              src={user?.image || "/static/default-profile.jpg"}
              width={240}
              height={240}
              className="rounded-full object-cover w-[240px] h-[240px]"
              alt={user?.name as string}
            />
            <ShouldRender if={!userIsProfileOwner && session?.user?.id}>
              <Button
                disabled={loadingUser}
                variant="gradient"
                onClick={handleClickFollowButton}
                absolute
                className="-bottom-3 left-1/2 -translate-x-1/2 px-3 py-2"
              >
                {user?.alreadyFollowing ? "Unfollow" : "Follow"}
              </Button>
            </ShouldRender>
            <ShouldRender if={userIsProfileOwner}>
              <div
                className={`${
                  loadingUser ? "pointer-events-none opacity-80" : ""
                } absolute bottom-0 right-10 flex items-center justify-center rounded-full bg-emerald-500 p-2 shadow-2xl`}
                role="button"
              >
                <Popover.Main
                  icon={
                    <IoMdSettings
                      size={23}
                      className="text-white  drop-shadow-lg hover:opacity-80"
                    />
                  }
                >
                  <Popover.Item
                    title="Edit account"
                    icon={<MdEditNote size={21} className="text-emerald-500" />}
                    subtitle="Change your avatar & details"
                    onClick={toggleEditModal(true)}
                  />

                  <Popover.Item
                    title="Code of conduct"
                    gap="2"
                    icon={
                      <MdOutlineTextSnippet
                        size={16}
                        className="text-emerald-500"
                      />
                    }
                    subtitle="Read our code of conduct"
                    onClick={redirectToTerms("conduct")}
                  />

                  <Popover.Item
                    title="Privacy Policy"
                    gap="2"
                    icon={
                      <MdOutlineTextSnippet
                        size={16}
                        className="text-emerald-500"
                      />
                    }
                    subtitle="Read our privacy terms"
                    onClick={redirectToTerms("privacy")}
                  />

                  <Popover.Item
                    title="Delete account"
                    gap="1"
                    icon={<MdDelete size={18} className="text-emerald-500" />}
                    subtitle="Delete your account"
                    onClick={showDeleteConfirm}
                  />
                </Popover.Main>
              </div>
            </ShouldRender>
          </div>
          <div className="w-fit text-center">
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
            <div className="my-3 flex w-full items-center justify-center gap-2">
              <button
                className="flex cursor-pointer flex-col items-center"
                onClick={() => setOpenFollowersModal(true)}
                disabled={loadingUser}
              >
                <p className="prose-base text-neutral-600 hover:underline hover:brightness-125 dark:text-neutral-400">
                  Followers
                </p>
                <ShouldRender if={!loadingUser}>
                  <p>{user?._count?.followers}</p>
                </ShouldRender>
                <ShouldRender if={loadingUser}>
                  <Skeleton width="w-6" />
                </ShouldRender>
              </button>

              <button
                disabled={loadingUser}
                className="flex cursor-pointer flex-col items-center"
                onClick={() => setOpenFollowingModal(true)}
              >
                <p className="prose-base text-neutral-600 hover:underline hover:brightness-125 dark:text-neutral-400">
                  Following
                </p>
                <ShouldRender if={!loadingUser}>
                  <p>{user?._count?.following}</p>
                </ShouldRender>

                <ShouldRender if={loadingUser}>
                  <Skeleton width="w-6" />
                </ShouldRender>
              </button>
            </div>
            <div className="xl:w-[356px] w-full">
              <ShouldRender if={!!user?.url}>
                <UserLinkPreview data={user?.url} />
              </ShouldRender>

              <ShouldRender if={!!user?.bio}>
                <blockquote className="prose mt-2 w-full border-l-4 rounded-r-md border-gray-300 bg-white p-4 text-left dark:border-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {user?.bio}
                </blockquote>
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
          </div>
        </section>

        <section className="w-full">
          <div className="mb-5 flex w-full flex-col justify-between">
            <div className="w-full flex gap-3 items-center">
              <h2
                role="button"
                onClick={toggleTab("posts")}
                className={clsx(
                  "text-2xl cursor-pointer",
                  isPostsTab ? "underline" : "opacity-50"
                )}
              >
                Posts
              </h2>
              <h2
                onClick={toggleTab("comments")}
                className={clsx(
                  "text-2xl cursor-pointer",
                  isCommentsTab ? "underline" : "opacity-50"
                )}
              >
                Comments
              </h2>
            </div>

            <div className="mt-3 flex justify-start gap-3 sm:mt-1 sm:items-start sm:justify-end">
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

          <UserPageList currentFilter={currentFilter} currentTab={currentTab} />
        </section>
      </MainLayout>

      <ConfirmationModal
        title="Are you sure you want to delete your account?"
        confirmationLabel="Delete my account"
        openState={isDeleteAccountModalOpen}
        loading={deleting}
        onConfirm={onConfirm}
      />

      <EditAccountModal openState={isEditAccountModalOpen} user={user} />

      <FollowersModal user={user} openState={openFollowersModalState} />
      <FollowingModal user={user} openState={openFollowingModalState} />
    </>
  );
};

export default UserPage;
