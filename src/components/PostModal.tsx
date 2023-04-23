import { Dispatch, SetStateAction } from "react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { Modal } from "./Modal";
import { PostDetails } from "./PostDetails";

type Props = {
  returnHref: string;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
};

/**
 * This modal will intercept the route change and be rendered instead of
 * redirecting the user to the [postId] page.
 */
const PostModal: React.FC<Props> = ({ returnHref, openState }) => {
  const router = useRouter();
  const postId = router.query.postId as string;
  const [open] = openState;

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
      enabled: !!postId && open,
    }
  );

  return (
    <Modal openState={openState} alwaysCentered onClose={onCloseModal}>
      <div className="relative rounded-lg shadow-lg p-6 -2sm:p-0 -2sm:pt-12 -2sm:pb-6 bg-white dark:bg-zinc-900 w-screen xl:max-w-4xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-10 w-11/12 max-w-2xl mx-auto">
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
