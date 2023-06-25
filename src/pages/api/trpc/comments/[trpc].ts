import { commentRouter } from "@server/router/comment/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(commentRouter);
