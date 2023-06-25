import { attachmentsRouter } from "@server/router/attachments/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(attachmentsRouter);
