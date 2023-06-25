import { likeRouter } from "@server/router/like/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(likeRouter);
