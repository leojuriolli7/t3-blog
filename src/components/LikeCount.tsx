import { AiFillDislike, AiFillLike } from "react-icons/ai";
import ShouldRender from "./ShouldRender";

type Props = {
  dislike?: boolean;
  label?: number;
  vertical?: boolean;
};

const LikeCount: React.FC<Props> = (props) => {
  const { label, dislike, vertical = true } = props;

  return (
    <div
      className={`flex gap-2 ${
        vertical ? "flex-col" : ""
      } items-center rounded-md border border-emerald-500/20 bg-teal-100 p-1 shadow-md dark:bg-teal-900`}
    >
      <ShouldRender if={dislike}>
        <AiFillDislike size={22} className="text-emerald-500" />
      </ShouldRender>

      <ShouldRender if={!dislike}>
        <AiFillLike size={22} className="text-emerald-500" />
      </ShouldRender>

      <p className="text-emerald-500">{label}</p>
    </div>
  );
};

export default LikeCount;
