import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

export default function htmlToMarkdown(html?: string) {
  // `codeBlockStyle` makes language prefixes not be removed on conversion. (eg: ```js)
  const converter = new TurndownService({ codeBlockStyle: "fenced" }).use(gfm);

  return converter.turndown(html || "");
}
