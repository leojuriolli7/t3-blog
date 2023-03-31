import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeTruncate from "rehype-truncate";
import rehypeCode from "rehype-highlight";
import rehypeRewrite from "rehype-rewrite";

// Parse markdown to HTML. (Post/Comment body)
export async function markdownToHtml(
  markdown: string,
  rewriteLinks = true,
  truncate = true
) {
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
      rewrite: (node) => {
        if (rewriteLinks) {
          // Rewrites any `<a>` to `<p>` to avoid any hydration or
          // validate DOM nesting errors.
          if (node.type === "element" && node.tagName === "a" && rewriteLinks) {
            node.tagName = "p";
          }

          // Hide any images.
          if (
            node.type === "element" &&
            node.tagName === "img" &&
            node.properties
          ) {
            node.properties["width"] = "0";
            node.properties["height"] = "0";
            node.properties["style"] = "display: none; visibility: hidden;";
          }
        }

        // Add aria-label to `<input type='checkbox'>` for better SEO.
        if (
          node.type === "element" &&
          node.tagName === "input" &&
          node?.properties?.type === "checkbox"
        ) {
          node.properties["aria-label"] = "Checkbox from checklist";
        }
      },
    })
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
