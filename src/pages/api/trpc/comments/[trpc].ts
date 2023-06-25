import { commentRouter } from "@server/router/comment.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(commentRouter);
