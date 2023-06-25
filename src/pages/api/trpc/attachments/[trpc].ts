import { attachmentsRouter } from "@server/router/attachments.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(attachmentsRouter);
