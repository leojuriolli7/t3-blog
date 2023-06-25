import { scraperRouter } from "@server/router/scraper/_router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(scraperRouter);
