import { useEffect, useState } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { Modal } from "./Modal";
import { PostDetails } from "./PostDetails";
import { useContextualRouting } from "next-use-contextual-routing";

/**
 * This modal will intercept the route change and be rendered instead of
 * redirecting the user to the [postId] page.
 */
const PostModal: React.FC = () => {
  const { returnHref } = useContextualRouting();
  const router = useRouter();
  const postId = router.query.postId as string;

  const isPostPage = router.pathname.includes("posts/[postId]");

  // The modal cannot render on the post's actual page.
  const canOpenModal = !!postId && !isPostPage;

  const openState = useState(false);
  const [open, setOpen] = openState;

  const onCloseModal = () => {
    // the timeout ensures the modal close animation is finished before
    // resetting the `postId` and going back to the loading state.
    setTimeout(() => {
      router.push(returnHref, undefined, { shallow: true });
    }, 300);
  };

  const { data: post, isLoading } = trpc.useQuery(
    [
      "posts.single-post",
      {
        postId,
      },
    ],
    {
      enabled: canOpenModal && open,
    }
  );

  // Modal will open and intercept whenever there is a
  // `postId` router query and it is outside a post's actual page.
  useEffect(() => {
    setOpen(canOpenModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <Modal openState={openState} alwaysCentered onClose={onCloseModal}>
      <div className="grey-scrollbar relative h-[90vh] w-screen max-w-[90vw] overflow-y-auto rounded-lg bg-white p-6 shadow-lg backdrop-blur-2xl scrollbar-thumb-rounded dark:bg-zinc-900/80 xl:max-w-4xl -2sm:p-0 -2sm:pb-6 -2sm:pt-12">
        <div className="mx-auto flex w-11/12 max-w-2xl flex-col items-center gap-10">
          <PostDetails
            data={post}
            isLoading={isLoading || !post}
            postId={postId}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PostModal;
