import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

export default function htmlToMarkdown(html?: string) {
  const converter = new TurndownService().use(gfm);

  return converter.turndown(html || "");
}
