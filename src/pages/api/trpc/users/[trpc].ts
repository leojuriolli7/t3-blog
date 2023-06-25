import { userRouter } from "@server/router/user/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(userRouter);
