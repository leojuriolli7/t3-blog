import React, { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@utils/trpc";
import { toast } from "react-toastify";
import LikeButton from "@components/LikeButton";
import ShouldRender from "@components/ShouldRender";
import Skeleton from "@components/Skeleton";
import ActionButton from "@components/ActionButton";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type { SinglePost } from "@utils/types";
import TagList from "@components/TagList";
import getUserDisplayName from "@utils/getUserDisplayName";
import AttachmentPreview from "@components/AttachmentPreview";
import FavoriteButton from "@components/FavoriteButton";
import LinkPreview from "@components/LinkPreview";
import PollView from "@components/PollView/PollView";
import HTMLBody from "@components/HTMLBody";
import { Attachment } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import MetaTags from "./MetaTags";

type ReplyData = {
  parentId: string;
  name: string;
};

export type ReplyingTo = ReplyData | undefined;

const CommentSectionSkeleton = (
  <div role="status" className="mt-2 w-full">
    <div className="h-[39px] w-full">
      <Skeleton width="w-full" parentClass="h-full" height="h-full" />
    </div>
    <div className="h-[159px] w-full border border-neutral-200  dark:border-neutral-800">
      <div className="h-full w-1/2 border-r border-r-neutral-200  dark:border-r-neutral-800"></div>
    </div>

    <div className="mt-2 h-[40px] w-full sm:w-[140px]">
      <Skeleton width="w-full" parentClass="h-full" height="h-full" />
    </div>

    <div className="mt-10 flex h-[164px] w-full flex-col gap-5 bg-slate-100 p-6 shadow-md dark:bg-zinc-800/70">
      <Skeleton lines={4} />
    </div>
  </div>
);

// By importing dynamically, we reduce the initial js.
const EditPostForm = dynamic(() => import("@components/EditPostForm"), {
  ssr: false,
  loading: () => <Skeleton heading width="w-full" lines={4} />,
});

const CommentSection = dynamic(() => import("@components/CommentSection"), {
  ssr: false,
  loading: () => CommentSectionSkeleton,
});

const ConfirmationModal = dynamic(
  () => import("@components/ConfirmationModal"),
  {
    ssr: false,
  }
);

const PreviewMediaModal = dynamic(
  () => import("@components/PreviewMediaModal"),
  {
    ssr: false,
  }
);

type Props = {
  data?: SinglePost;
  isLoading: boolean;
  postId: string;
};

export const PostDetails: React.FC<Props> = ({ data, isLoading, postId }) => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const utils = trpc.useContext();

  const isDeleteModalOpen = useState(false);
  const [, setIsDeleteModalOpen] = isDeleteModalOpen;

  const isMediaPreviewModalOpen = useState(false);
  const [, setIsMediaPreviewModalOpen] = isMediaPreviewModalOpen;
  const [currentMedia, setCurrentMedia] = useState<Attachment>();

  const onClickImage = useCallback(
    (image: Attachment) => () => {
      setCurrentMedia(image);
      setIsMediaPreviewModalOpen(true);
    },
    [setIsMediaPreviewModalOpen]
  );

  const showDeleteConfirm = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const canDeleteOrEditPost =
    session?.user?.id === data?.userId || session?.user?.isAdmin === true;

  const attachments = data?.attachments;

  const filteredAttachments = useMemo(() => {
    const isMedia = (file: Attachment) =>
      file.type.includes("image") || file.type.includes("video");

    const isAudio = (file: Attachment) => file.type.includes("audio");

    return {
      medias: attachments?.filter((file) => isMedia(file)),
      audio: attachments?.filter((file) => isAudio(file)),
      documents: attachments?.filter((file) => {
        return !isMedia(file) && !isAudio(file);
      }),
    };
  }, [attachments]);

  const { mutate: favoritePost, error: favoriteError } = trpc.useMutation(
    ["posts.favorite-post"],
    {
      async onMutate({ postId, userId }) {
        await utils.cancelQuery(["posts.single-post", { postId }]);

        const prevData = utils.getQueryData(["posts.single-post", { postId }]);

        const userHadFavorited = !!prevData!.favoritedByMe;

        // User is undoing favorite
        if (userHadFavorited) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            favoritedByMe: false,
          }));
        }

        // User is adding post to favorites
        if (!userHadFavorited) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            favoritedByMe: true,
          }));
        }

        return { prevData };
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, newData, context) => {
        utils.setQueryData(
          ["posts.single-post"],
          context?.prevData as SinglePost
        );
      },
      // Always refetch after error or success
      onSettled: () => {
        // This will refetch the single-post query.
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

  const { mutate: likePost, error: likeError } = trpc.useMutation(
    ["likes.like-post"],
    {
      onMutate: async ({ dislike, postId }) => {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await utils.cancelQuery(["posts.single-post", { postId }]);

        const prevData = utils.getQueryData(["posts.single-post", { postId }]);

        const userHadAlreadyLiked = prevData!.likedByMe;
        const userHadDisliked = prevData!.dislikedByMe;

        // User undoing dislike by clicking dislike button again.
        if (userHadDisliked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes - 1,
            dislikedByMe: false,
          }));
        }

        // User disliking post.
        if (!userHadDisliked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes + 1,
            dislikedByMe: true,
          }));
        }

        // User disliking post and undoing previous like.
        if (userHadAlreadyLiked && dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            dislikes: prevData!.dislikes + 1,
            likedByMe: false,
            dislikedByMe: true,
            likes: prevData!.likes - 1,
          }));
        }

        // User liking post.
        if (!userHadAlreadyLiked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes + 1,
            likedByMe: true,
          }));
        }

        // User liking post and undoing previous dislike.
        if (userHadDisliked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes + 1,
            likedByMe: true,
            dislikedByMe: false,
            dislikes: prevData!.dislikes - 1,
          }));
        }

        // User undoing like by clicking like button again.
        if (userHadAlreadyLiked && !dislike) {
          utils.setQueryData(["posts.single-post", { postId }], (old) => ({
            ...old!,
            likes: prevData!.likes - 1,
            likedByMe: false,
          }));
        }

        // Return the previous data so we can revert if something goes wrong
        return { prevData };
      },
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      onError: (err, newData, context) => {
        utils.setQueryData(
          ["posts.single-post"],
          context?.prevData as SinglePost
        );
      },
      // Always refetch after error or success
      onSettled: () => {
        // This will refetch the single-post query.
        utils.invalidateQueries([
          "posts.single-post",
          {
            postId,
          },
        ]);
      },
    }
  );

  const handleLikeOrDislikePost = useCallback(
    (dislike: boolean) => () => {
      if (!session?.user) {
        return toast.info("Login to like or dislike posts");
      }

      if (session?.user) {
        return likePost({
          postId,
          authorId: data?.userId as string,
          dislike: dislike,
        });
      }
    },
    [postId, likePost, session, data?.userId]
  );

  const handleFavoritePost = useCallback(() => {
    if (!session?.user) {
      return toast.info("Login to favorite posts");
    }

    if (session?.user) {
      return favoritePost({
        postId,
        authorId: data?.userId as string,
        userId: session?.user?.id,
      });
    }
  }, [postId, favoritePost, session, data?.userId]);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { mutate: deletePost, isLoading: deleting } = trpc.useMutation(
    ["posts.delete-post"],
    {
      onSuccess: () => {
        router.push("/");

        // This will refetch the home-page posts.
        utils.invalidateQueries(["posts.posts"]);
      },
    }
  );

  const onClickDeletePost = useCallback(
    () =>
      deletePost({
        postId,
      }),
    [deletePost, postId]
  );

  const toggleIsEditing = useCallback(() => setIsEditing((prev) => !prev), []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") setIsEditing(false);
  }, [sessionStatus]);

  useEffect(() => {
    if (likeError) toast.error("Could not like post, please try again");
    if (favoriteError) toast.error("Could not favorite post, please try again");
  }, [likeError, favoriteError]);

  return (
    <>
      <ShouldRender if={data}>
        <MetaTags
          title={data?.title}
          image={data?.link?.image}
          description={data?.markdownBody}
        />
      </ShouldRender>

      <main className="relative flex w-full flex-col gap-10 rounded-lg border border-zinc-200 bg-slate-100 p-8 shadow-lg dark:border-zinc-700/90 dark:bg-zinc-800/70 xs:p-12">
        <ShouldRender if={data && canDeleteOrEditPost}>
          <div className="align-center absolute -top-2 right-2 flex gap-3">
            <ActionButton
              action={isEditing ? "close" : "edit"}
              onClick={toggleIsEditing}
            />

            <ActionButton onClick={showDeleteConfirm} action="delete" />
          </div>
        </ShouldRender>

        <ShouldRender if={isEditing}>
          <EditPostForm onFinish={toggleIsEditing} post={data} />
        </ShouldRender>

        <ShouldRender if={!isEditing}>
          <ShouldRender if={!isLoading}>
            <h1 className="prose text-2xl font-bold dark:prose-invert xs:text-4xl xl:text-3xl">
              {data?.title}
            </h1>
          </ShouldRender>

          <ShouldRender if={isLoading}>
            <Skeleton heading />
          </ShouldRender>

          <div>
            <ShouldRender if={isLoading}>
              <Skeleton width="w-1/2" />
            </ShouldRender>

            <ShouldRender if={!isLoading}>
              <p className="w-fit">
                By{" "}
                <Link
                  href={`/users/${data?.user?.id}`}
                  title="Go to user's profile"
                  className="font-bold text-emerald-700 underline dark:text-emerald-500"
                  prefetch={false}
                >
                  {getUserDisplayName(data?.user)}
                </Link>
                <ShouldRender if={data?.user?.id === session?.user.id}>
                  <span className=" text-emerald-700 dark:text-emerald-500">
                    {" "}
                    (You)
                  </span>
                </ShouldRender>
                <span> {data?.createdAt}</span>
              </p>
            </ShouldRender>
          </div>

          <ShouldRender if={!!data?.poll}>
            <PollView poll={data?.poll} />
          </ShouldRender>

          <ShouldRender if={!!data?.link}>
            <div className="-mb-4 -mt-4 w-full">
              <LinkPreview loading={isLoading} data={data?.link} />

              <div className="mt-2 w-full break-words border-l-4 border-gray-300 bg-white p-4 text-black shadow dark:border-neutral-500 dark:bg-zinc-900 dark:text-neutral-300">
                <h3 className="text-lg font-bold sm:text-xl">
                  {data?.link?.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base sm:leading-7">{`"${data?.link?.description}"`}</p>
                <p className="mt-2 text-sm font-bold sm:mt-0">
                  Read more on{" "}
                  <a
                    href={data?.link?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="italic text-emerald-500 underline"
                  >
                    {data?.link?.url}
                  </a>
                </p>
              </div>
            </div>
          </ShouldRender>

          <HTMLBody
            className="prose -xl:prose-sm"
            lines={5}
            loading={isLoading}
          >
            {data?.body}
          </HTMLBody>
        </ShouldRender>

        <div className="absolute -bottom-4 left-4 flex gap-3">
          <LikeButton
            disabled={isLoading}
            label={data?.likes}
            onClick={handleLikeOrDislikePost(false)}
            likedOrDislikedByMe={data?.likedByMe}
          />

          <LikeButton
            disabled={isLoading}
            label={data?.dislikes}
            onClick={handleLikeOrDislikePost(true)}
            dislike
            likedOrDislikedByMe={data?.dislikedByMe}
          />
        </div>

        <div className="absolute -bottom-4 right-4 flex gap-3">
          <FavoriteButton
            disabled={isLoading}
            onClick={handleFavoritePost}
            favoritedByMe={data?.favoritedByMe}
          />
        </div>
      </main>

      <ShouldRender if={attachments?.length}>
        <div className="mt-3 flex w-full flex-col gap-2">
          <h2 className="mb-2 text-lg font-medium">Attachments</h2>
          {filteredAttachments?.medias?.map((media, key) => (
            <AttachmentPreview
              type="media"
              onClickImage={onClickImage(media)}
              file={media}
              key={key}
              downloadable
              optimized
            />
          ))}

          {filteredAttachments?.audio?.map((audio, key) => (
            <AttachmentPreview
              file={audio}
              type="audio"
              key={key}
              downloadable
              optimized
            />
          ))}

          {filteredAttachments?.documents?.map((attachment, key) => (
            <AttachmentPreview
              type="document"
              file={attachment}
              key={key}
              downloadable
              optimized
            />
          ))}
        </div>
      </ShouldRender>

      <ShouldRender if={data?.tags?.length || isLoading}>
        <div className="-mb-10 w-full">
          <h2 className="text-lg font-medium">Tags</h2>

          <TagList tags={data?.tags} loading={isLoading} />
        </div>
      </ShouldRender>

      <div className="mt-6 w-full">
        <h2 className="text-lg font-medium">Comments</h2>

        <CommentSection />
      </div>

      <PreviewMediaModal
        media={currentMedia}
        openState={isMediaPreviewModalOpen}
      />

      <ConfirmationModal
        title="Are you sure you want to delete this post?"
        confirmationLabel="Delete post"
        openState={isDeleteModalOpen}
        loading={deleting}
        onConfirm={onClickDeletePost}
      />
    </>
  );
};
