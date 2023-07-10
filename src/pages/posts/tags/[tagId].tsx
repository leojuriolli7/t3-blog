import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import PostCard from "@components/PostCard";
import Image from "@components/Image";
import useOnScreen from "@hooks/useOnScreen";
import ShouldRender from "@components/ShouldRender";
import MetaTags from "@components/MetaTags";
import Skeleton from "@components/Skeleton";
import useFilterContent from "@hooks/useFilterContent";
import { generateSSGHelper } from "@server/ssgHepers";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import AnimatedTabs from "@components/AnimatedTabs";
import SearchInput from "@components/SearchInput";
import EmptyMessage from "@components/EmptyMessage";
import { useSession } from "next-auth/react";
import ActionButton from "@components/ActionButton";
import UpsertTagModal from "@components/UpsertTagModal";
import { useUploadTagImagesToS3 } from "@hooks/aws/useUploadTagImagesToS3";
import { CreateTagInput } from "@schema/tag.schema";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import ConfirmationModal from "@components/ConfirmationModal";
import { parseTagPayload } from "@utils/parseTagPayload";
import Button from "@components/Button";
import { PageWrapper } from "@components/PageWrapper";

const SingleTagPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { tagId } = props;
  const [queryValue, setQueryValue] = useState("");
  const utils = trpc.useContext();
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = sessionStatus === "authenticated";
  const loggedUserIsAdmin = session?.user?.isAdmin === true;

  const { tabProps, selectedTab } = useFilterContent();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data: tag, isLoading: loadingTag } = trpc.tags.singleTag.useQuery(
    {
      tagId,
    },
    {
      onSettled(data) {
        // if tag not found, 404
        if (!data?.id) router.push("/404");
      },
    }
  );

  const numberOfSubs = tag?._count?.subscribers ?? 0;

  const { mutate: subscribe, isLoading: subscribing } =
    trpc.tags.subscribe.useMutation({
      onMutate: async ({ tagId }) => {
        await utils.tags.singleTag.cancel({ tagId });
        const prevData = utils.tags.singleTag.getData({ tagId });
        const userIsSubscribed = !!prevData!.isSubscribed;

        if (userIsSubscribed) {
          utils.tags.singleTag.setData({ tagId }, (old) => ({
            ...old!,
            isSubscribed: false,
            _count: {
              subscribers: old!._count!.subscribers - 1,
            },
          }));
        }

        if (!userIsSubscribed) {
          utils.tags.singleTag.setData({ tagId }, (old) => ({
            ...old!,
            isSubscribed: true,
            _count: {
              subscribers: old!._count!.subscribers + 1,
            },
          }));
        }

        return { prevData };
      },
      onSettled: () => {
        utils.tags.singleTag.invalidate({
          tagId,
        });

        utils.tags.subscribed.invalidate({
          limit: 6,
          query: "",
        });
      },
    });

  const onClickSubscribe = () => {
    if (!subscribing) subscribe({ tagId });
  };

  const { mutate: deleteTag, isLoading: deleting } =
    trpc.tags.delete.useMutation({
      onSuccess: () => {
        toast.success("Tag deleted successfully");
        router.push("/");
      },
    });

  const isDeleteModalOpen = useState(false);
  const [, setIsDeleteModalOpen] = isDeleteModalOpen;

  const showDeleteConfirm = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const onConfirm = useCallback(() => {
    if (loggedUserIsAdmin) {
      deleteTag({ id: tagId });
    }
  }, [deleteTag, loggedUserIsAdmin, tagId]);

  const { mutate: updateTag } = trpc.tags.update.useMutation({
    onSuccess: () => {
      // This will refetch the comments.
      utils.tags.singleTag.invalidate({
        tagId,
      });
    },
  });

  const editModalOpenState = useState(false);
  const [, setEditModalOpen] = editModalOpenState;
  const showEditModal = useCallback(() => {
    if (loggedUserIsAdmin) setEditModalOpen(true);
  }, [setEditModalOpen, loggedUserIsAdmin]);

  const { uploadTagImages } = useUploadTagImagesToS3();

  const onFinishedEditing = useCallback(
    async (values: CreateTagInput) => {
      let payload = values;

      if (values?.avatarFile || values?.backgroundImageFile) {
        const urls = await uploadTagImages(values.name, {
          avatar: values.avatarFile as File,
          banner: values.backgroundImageFile as File,
        });

        parseTagPayload(values);

        payload = {
          ...values,
          ...(urls?.avatarUrl && {
            avatar: urls?.avatarUrl,
          }),
          ...(urls?.backgroundUrl && {
            backgroundImage: urls?.backgroundUrl,
          }),
        };
      }

      updateTag(payload);
    },
    [updateTag, uploadTagImages]
  );

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.posts.all.useInfiniteQuery(
      {
        limit: 6,
        tagId,
        filter: selectedTab.id,
        query: queryValue,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const dataToShow = useMemo(
    () => data?.pages.flatMap((page) => page.posts),
    [data]
  );

  const loadingArray = Array.from<undefined>({ length: 4 });

  const noDataToShow = !!queryValue && !dataToShow?.length && !isLoading;

  useEffect(() => {
    if (reachedBottom && hasNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <MetaTags title={`${tag?.name || ""} posts`} />

      <div className="-mb-5 mt-5 w-full">
        <div className="w-full rounded-md border-2 border-zinc-200 bg-white shadow-sm dark:border-zinc-700/90 dark:bg-zinc-800/70">
          <div className="relative h-[200px] w-full">
            <Image
              src={tag?.backgroundImage}
              isLoading={loadingTag}
              className="rounded-t-md object-cover"
              alt={`${tag?.name || "Tag"} banner`}
              full
            />

            <ShouldRender if={loggedUserIsAdmin}>
              <div className="absolute -top-2 right-2 flex gap-2">
                <ActionButton action="edit" onClick={showEditModal} />
                <ActionButton action="delete" onClick={showDeleteConfirm} />
              </div>
            </ShouldRender>

            <ShouldRender if={isLoggedIn}>
              <Button
                onClick={onClickSubscribe}
                absolute
                className="bottom-2 right-2 rounded-full shadow-lg transition-opacity"
              >
                {tag?.isSubscribed ? "Unsubscribe" : "Subscribe"}
              </Button>
            </ShouldRender>
          </div>

          <div className="relative flex w-full gap-4 rounded-b-md p-2 py-4">
            <Image
              src={tag?.avatar}
              alt={`${tag?.name || "Tag"} avatar`}
              width={80}
              height={80}
              isLoading={loadingTag}
              className="h-16 w-16 flex-shrink-0 rounded-full object-cover xs:h-20 xs:w-20"
            />

            <div className="w-full">
              <ShouldRender if={!loadingTag}>
                <h1 className="text-2xl text-zinc-700 dark:text-zinc-300 xl:text-3xl">
                  {tag?.name}
                </h1>

                <p className="mt-1 leading-6 text-zinc-600 dark:text-zinc-400 -xs:text-sm">
                  {tag?.description}
                </p>
              </ShouldRender>
              <ShouldRender if={loadingTag}>
                <Skeleton
                  height="h-[32px] xl:h-[36px]"
                  lines={1}
                  width="w-40"
                />

                <Skeleton
                  lines={3}
                  width="w-full"
                  parentClass="mt-2"
                  margin="mb-2"
                />
              </ShouldRender>

              <div className="mt-1 flex gap-1 text-base text-zinc-700 dark:text-zinc-300">
                <span className="font-bold">{numberOfSubs}</span>{" "}
                <span>{`Subscriber${numberOfSubs !== 1 ? "s" : ""}`}</span>
              </div>
            </div>
          </div>
        </div>

        <ShouldRender if={loadingTag}>
          <Skeleton height="h-[32px] xl:h-[36px]" lines={1} width="w-40" />
        </ShouldRender>

        <SearchInput
          replace={false}
          className="mt-4 rounded-full"
          placeholder={`Search ${tag?.name} posts`}
          setQuery={setQueryValue}
        />

        <div className="mt-3 flex gap-3 sm:items-start">
          <AnimatedTabs {...tabProps} />
        </div>
      </div>

      {(isLoading ? loadingArray : dataToShow)?.map((post, i) => (
        <PostCard
          key={isLoading ? i : post?.id}
          post={post}
          loading={isLoading}
        />
      ))}

      <ShouldRender if={noDataToShow}>
        <EmptyMessage message="Hmm. No posts found." hideRedirect />
      </ShouldRender>

      <ShouldRender if={isFetchingNextPage}>
        <PostCard loading />
      </ShouldRender>

      <div ref={bottomRef} />

      <UpsertTagModal
        onFinish={onFinishedEditing}
        openState={editModalOpenState}
        initialTag={tag}
      />

      <ConfirmationModal
        title="Are you sure you want to delete this tag?"
        confirmationLabel="Delete tag"
        openState={isDeleteModalOpen}
        loading={deleting}
        onConfirm={onConfirm}
      />
    </>
  );
};
SingleTagPage.PageWrapper = PageWrapper;
export default SingleTagPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ tagId: string }>
) {
  const { req, res } = context;

  const ssg = await generateSSGHelper({ req, res });
  const tagId = context.params?.tagId as string;

  const postsQuery = ssg.posts.all.prefetchInfinite({
    limit: 6,
    tagId,
    filter: "newest",
  });

  const tagQuery = ssg.tags.singleTag.prefetch({
    tagId,
  });

  // fetching in parallel to reduce load times
  await Promise.all([postsQuery, tagQuery]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      tagId,
    },
  };
}
