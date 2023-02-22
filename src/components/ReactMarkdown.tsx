import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type Props = {
  children: string;
  className?: string;
};

const CustomReactMarkdown: React.FC<Props> = ({ children, className }) => {
  return (
    <ReactMarkdown
      className={`${className} prose-emerald markdown__content dark:prose-invert`}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  );
};

export default CustomReactMarkdown;
