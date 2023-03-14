import { createRouter } from "@server/createRouter";
import _metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import metascraperInstagram from "metascraper-instagram";
import * as trpc from "@trpc/server";
import axios from "axios";
import isURL from "validator/lib/isURL";
import { scrapePageSchema } from "@schema/scraper.schema";

const formatUrl = (url: string) => {
  return !/http(?:s)?:\/\//g.test(url) ? `https://${url?.trim()}` : url;
};

export const scraperRouter = createRouter().query("scrape-link", {
  input: scrapePageSchema,
  async resolve({ input }) {
    if (!input.url) return null;

    if (!isURL(input.url)) {
      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid link",
      });
    }

    const metascraper = _metascraper([
      metascraperDescription(),
      metascraperImage(),
      metascraperPublisher(),
      metascraperTitle(),
      metascraperUrl(),
      metascraperInstagram(),
    ]);

    const getMetascraper = async (url: string) => {
      const { data } = await axios.get(url);
      return metascraper({ url, html: data });
    };

    const formattedUrl = formatUrl(input.url);
    const metadata = await getMetascraper(formattedUrl);

    return metadata;
  },
});
