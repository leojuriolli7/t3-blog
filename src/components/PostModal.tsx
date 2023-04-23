import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { Modal } from "./Modal";
import { PostDetails } from "./PostDetails";

type Props = {
  returnHref: string;
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const PostModal: React.FC<Props> = ({ returnHref, openState }) => {
  const router = useRouter();
  const postId = router.query.postId as string;
  const [open] = openState;

  const { data, isLoading } = trpc.useQuery(
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
    <Modal
      openState={openState}
      alwaysCentered
      closeButton
      onClose={() => {
        router.push(returnHref, undefined, { shallow: true });
      }}
    >
      <div className="relative rounded-lg shadow-lg p-6 bg-white dark:bg-zinc-900 w-screen xl:max-w-4xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-10 w-11/12 max-w-2xl mx-auto">
          <PostDetails
            data={data}
            isLoading={isLoading || !data}
            postId={postId}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PostModal;
