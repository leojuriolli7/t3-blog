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
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
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

const SingleTagPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { tagId } = props;
  const [queryValue, setQueryValue] = useState("");
  const utils = trpc.useContext();
  const router = useRouter();

  const { data: session } = useSession();
  const loggedUserIsAdmin = session?.user?.isAdmin === true;

  const { tabProps, selectedTab } = useFilterContent();

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const { data: tag, isLoading: loadingTag } = trpc.useQuery(
    [
      "tags.single-tag",
      {
        tagId,
      },
    ],
    {
      onSettled(data) {
        // if tag not found, 404
        if (!data?.id) router.push("/404");
      },
    }
  );

  const { mutate: deleteTag, isLoading: deleting } = trpc.useMutation(
    "tags.delete",
    {
      onSuccess: () => {
        toast.success("Tag deleted successfully");
        router.push("/");
      },
    }
  );

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

  const { mutate: updateTag } = trpc.useMutation("tags.update", {
    onSuccess: () => {
      // This will refetch the comments.
      utils.invalidateQueries([
        "tags.single-tag",
        {
          tagId,
        },
      ]);
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
      if (values?.avatarFile || values?.backgroundImageFile) {
        const urls = await uploadTagImages(values.name, {
          avatar: values.avatarFile as File,
          banner: values.backgroundImageFile as File,
        });

        const filteredTag = {
          ...values,
          ...(urls?.avatarUrl && {
            avatar: urls?.avatarUrl,
          }),
          ...(urls?.backgroundUrl && {
            backgroundImage: urls?.backgroundUrl,
          }),
        };

        return updateTag(filteredTag);
      }

      updateTag(values);
    },
    [updateTag, uploadTagImages]
  );

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.useInfiniteQuery(
      [
        "posts.posts",
        {
          limit: 6,
          tagId,
          filter: selectedTab.id,
          query: queryValue,
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
        <div className="w-full rounded-md border-2 border-zinc-200 shadow-sm dark:border-zinc-700/90">
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
          </div>

          <div className="relative flex w-full gap-4 rounded-b-md  bg-white p-2 py-4  dark:bg-zinc-800/70">
            <Image
              src={tag?.avatar}
              alt={`${tag?.name || "Tag"} avatar`}
              width={80}
              height={80}
              isLoading={loadingTag}
              className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
            />

            <div className="w-full">
              <ShouldRender if={!loadingTag}>
                <h1 className="text-2xl capitalize text-zinc-700 dark:text-zinc-300 xl:text-3xl">
                  {tag?.name}
                </h1>

                <p className="mt-1 leading-6 text-zinc-600 dark:text-zinc-400">
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

              {/* <div className="mt-1 flex gap-1 text-base text-zinc-700 dark:text-zinc-300">
              <span className="font-bold">290</span> <span>Subscribers</span>
            </div> */}
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

export default SingleTagPage;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ tagId: string }>
) {
  const ssg = await generateSSGHelper();
  const tagId = context.params?.tagId as string;

  const postsQuery = ssg.prefetchInfiniteQuery("posts.posts", {
    limit: 6,
    tagId,
    filter: "newest",
  });

  const tagQuery = ssg.prefetchQuery("tags.single-tag", {
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
