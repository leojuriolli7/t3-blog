import { searchRouter } from "@server/router/search/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(searchRouter);
