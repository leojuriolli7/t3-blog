import { userRouter } from "@server/router/user.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(userRouter);
