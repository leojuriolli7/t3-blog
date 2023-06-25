import { notificationRouter } from "@server/router/notification/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(notificationRouter);
