import { tagRouter } from "@server/router/tag/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(tagRouter);
