import { searchRouter } from "@server/router/search.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(searchRouter);
