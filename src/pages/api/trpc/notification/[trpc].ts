import { notificationRouter } from "@server/router/notification.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(notificationRouter);
