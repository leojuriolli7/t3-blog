import { postRouter } from "@server/router/post.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(postRouter);
