import { likeRouter } from "@server/router/like.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(likeRouter);
