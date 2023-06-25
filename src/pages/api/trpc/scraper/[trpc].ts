import { scraperRouter } from "@server/router/scraper.router";
import { createNextApiHandler } from "@utils/createNextApiHandler";

export default createNextApiHandler(scraperRouter);
