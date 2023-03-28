import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import ShouldRender from "./ShouldRender";
import Skeleton, { SkeletonProps } from "./Skeleton";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";

type MarkdownProps = Pick<
  ReactMarkdownOptions,
  "disallowedElements" | "unwrapDisallowed"
>;

type Props = SkeletonProps &
  MarkdownProps & {
    children?: string;
    className?: string;
    loading?: boolean;
  };

const CustomReactMarkdown: React.FC<Props> = ({
  children,
  className,
  loading,
  disallowedElements,
  unwrapDisallowed,
  ...props
}) => {
  return (
    <>
      <ShouldRender if={loading}>
        <Skeleton {...props} />
      </ShouldRender>

      <ShouldRender if={!loading}>
        <ReactMarkdown
          disallowedElements={disallowedElements}
          unwrapDisallowed={unwrapDisallowed}
          className={`${className} prose-emerald markdown__content dark:prose-invert break-words dark:prose-hr:border-neutral-700`}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={darcula}
                  language={match[1]}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className}>{children}</code>
              );
            },
          }}
        >
          {children || ""}
        </ReactMarkdown>
      </ShouldRender>
    </>
  );
};

export default CustomReactMarkdown;
