import { tagRouter } from "@server/router/tag.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(tagRouter);
