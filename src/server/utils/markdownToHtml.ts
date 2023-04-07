import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeTruncate from "rehype-truncate";
import rehypeCode from "rehype-highlight";
import rehypeRewrite from "rehype-rewrite";
import { Root, RootContent } from "hast";

type Options = {
  /**
   * Remove any links (`<a>` will be rewritten into `<span>`) and images. (will be deleted from tree)
   */
  removeLinksAndImages?: boolean;
  /**
   * Truncate the html (Limit it to 200 characters.)
   */
  truncate?: boolean;
  /**
   * Wrap `<img>` with `<a target="_blank" rel="noopener noreferrer">`
   */
  linkifyImages?: boolean;
};

// Parse markdown to HTML. (Post/Comment body)
export async function markdownToHtml(markdown: string, options?: Options) {
  const {
    removeLinksAndImages = true,
    truncate = true,
    linkifyImages = false,
  } = options || {};

  const result = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCode)
    .use(
      // Truncate the HTML to reduce the size of the DOM and avoid
      // sending unnecessary HTML to the client.
      rehypeTruncate,
      truncate ? { maxChars: 200, ignoreTags: ["ul", "code", "pre"] } : false
    )
    .use(rehypeRewrite, {
      rewrite: (node, index, parent) => {
        // Add aria-label to `<input type='checkbox'>` for better SEO.
        if (
          node.type === "element" &&
          node.tagName === "input" &&
          node?.properties?.type === "checkbox"
        ) {
          node.properties["aria-label"] = "Checkbox from checklist";
        }

        if (removeLinksAndImages) {
          // Rewrites any `<a>` to `<span>` to avoid any hydration or
          // validate DOM nesting errors.
          if (
            node.type === "element" &&
            node.tagName === "a" &&
            removeLinksAndImages
          ) {
            node.tagName = "span";
          }

          // Delete any images.
          if (
            node.type === "element" &&
            node.tagName === "img" &&
            node.properties
          ) {
            parent?.children.splice(index as number, 1);
          }
        }

        if (linkifyImages) {
          // Rewrite any images to have a link to open them on a new tab.
          if (
            node.type === "element" &&
            node.tagName === "img" &&
            !!node.properties
          ) {
            const newElement: Root | RootContent = {
              children: [node],
              tagName: "a",
              type: "element",
              properties: {
                href: node.properties.src,
                target: "_blank",
                rel: "noopener noreferrer",
              },
            };

            parent!.children[index as number] = newElement;
          }
        }
      },
    })
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
