import { postRouter } from "@server/router/post/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(postRouter);
