import { MediaType } from "./AttachmentPreview";
import { Modal } from "./Modal";
import ShouldRender from "./ShouldRender";

type Props = {
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  media?: MediaType;
};

const PreviewMediaModal: React.FC<Props> = ({ openState, media }) => {
  return (
    <Modal openState={openState} alwaysCentered>
      <div className="overflow-hidden">
        <ShouldRender if={media?.type?.includes("image")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media?.url || "/static/default.jpg"}
            alt={media?.name}
            className="h-auto max-h-[80vh] w-auto max-w-[60vw]"
          />
        </ShouldRender>

        <ShouldRender if={media?.type?.includes("video")}>
          <video
            src={media?.url}
            className="h-auto max-h-[80vh] w-auto max-w-[60vw]"
            controls
            playsInline
            autoPlay
            muted
          />
        </ShouldRender>
      </div>
    </Modal>
  );
};

export default PreviewMediaModal;
