import PostCard from "@components/PostCard";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import Comment from "./Comment";
import EmptyMessage from "./EmptyMessage";
import ShouldRender from "./ShouldRender";
import useOnScreen from "@hooks/useOnScreen";
import useFilterContent from "@hooks/useFilterContent";
import AnimatedTabs from "./AnimatedTabs";

type Props = {
  currentTab: string;
};

const UserPageList: React.FC<Props> = ({ currentTab }) => {
  const isPostsTab = currentTab === "posts";
  const isCommentsTab = currentTab === "comments";
  const isLikedTab = currentTab === "liked";

  const { selectedTab: currentFilter, tabProps: filterTabsProps } =
    useFilterContent();

  const router = useRouter();
  const userId = router.query.userId as string;

  const bottomRef = useRef<HTMLDivElement>(null);
  const reachedBottom = useOnScreen(bottomRef);

  const loadingArray = Array.from<undefined>({ length: 4 });

  const {
    data: userComments,
    isLoading: loadingComments,
    isFetchingNextPage: fetchingMoreComments,
    hasNextPage: hasMoreComments,
    fetchNextPage: fetchMoreComments,
  } = trpc.useInfiniteQuery(
    [
      "comments.user-comments",
      {
        userId,
        limit: 4,
        filter: currentFilter.id,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: isCommentsTab,
    }
  );

  const commentsToShow = useMemo(
    () => userComments?.pages.flatMap((page) => page.comments),
    [userComments]
  );

  const noCommentsToShow =
    !loadingComments && !commentsToShow?.length && !hasMoreComments;

  const {
    data: userPosts,
    isLoading: loadingPosts,
    fetchNextPage: fetchMorePosts,
    isFetchingNextPage: isFetchingMorePosts,
    hasNextPage: hasMorePosts,
  } = trpc.useInfiniteQuery(
    [
      "posts.posts",
      {
        userId,
        limit: 4,
        filter: currentFilter.id,
      },
    ],
    {
      enabled: isPostsTab,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const postsToShow = useMemo(
    () => userPosts?.pages.flatMap((page) => page.posts),
    [userPosts]
  );

  const noPostsToShow = !loadingPosts && !postsToShow?.length && !hasMorePosts;

  const {
    data: liked,
    isLoading: loadingLiked,
    fetchNextPage: fetchMoreLiked,
    isFetchingNextPage: isFetchingMoreLiked,
    hasNextPage: hasMoreLiked,
  } = trpc.useInfiniteQuery(
    [
      "posts.get-liked-posts",
      {
        limit: 6,
        userId,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const likedToShow = useMemo(
    () => liked?.pages.flatMap((page) => page.posts),
    [liked]
  );

  const noLikedToShow = !loadingLiked && !likedToShow?.length && !hasMoreLiked;

  useEffect(() => {
    if (reachedBottom && hasMorePosts && isPostsTab) {
      fetchMorePosts();
    }

    if (reachedBottom && hasMoreComments && isCommentsTab) {
      fetchMoreComments();
    }

    if (reachedBottom && hasMoreLiked && isLikedTab) {
      fetchMoreLiked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachedBottom]);

  return (
    <>
      <ShouldRender if={!isLikedTab}>
        <div className="mx-auto mt-4 w-full">
          <AnimatedTabs {...filterTabsProps} />
        </div>
      </ShouldRender>

      <div className="mt-6 flex w-full flex-col gap-10">
        <ShouldRender if={isPostsTab}>
          {(loadingPosts ? loadingArray : postsToShow)?.map((post, i) => (
            <PostCard
              post={post}
              key={loadingPosts ? i : post?.id}
              loading={loadingPosts}
            />
          ))}

          <ShouldRender if={isFetchingMorePosts}>
            <PostCard loading />
          </ShouldRender>

          <ShouldRender if={noPostsToShow}>
            <EmptyMessage message="Hmm. It seems that this user has not created any posts yet." />
          </ShouldRender>
        </ShouldRender>

        <ShouldRender if={isLikedTab}>
          {(loadingLiked ? loadingArray : likedToShow)?.map((post, i) => (
            <PostCard
              post={post}
              key={loadingLiked ? i : post?.id}
              loading={loadingLiked}
            />
          ))}

          <ShouldRender if={isFetchingMoreLiked}>
            <PostCard loading />
          </ShouldRender>

          <ShouldRender if={noLikedToShow}>
            <EmptyMessage message="Hmm. It seems that this user has not liked any posts yet." />
          </ShouldRender>
        </ShouldRender>

        <ShouldRender if={isCommentsTab}>
          {(loadingComments ? loadingArray : commentsToShow)?.map(
            (comment, i) => (
              <Comment
                comment={comment}
                key={loadingComments ? i : comment?.id}
                loading={loadingComments}
                hideReplies
                variant="outlined"
                linkToPost
              />
            )
          )}

          <ShouldRender if={fetchingMoreComments}>
            <Comment loading linkToPost variant="outlined" />
          </ShouldRender>

          <ShouldRender if={noCommentsToShow}>
            <EmptyMessage message="Hmm. It seems that this user has not commented on any posts yet." />
          </ShouldRender>
        </ShouldRender>

        <div ref={bottomRef} />
      </div>
    </>
  );
};

export default UserPageList;
