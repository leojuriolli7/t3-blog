import { createRouter } from "@server/createRouter";
import _metascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import metascraperAmazon from "metascraper-amazon";
import metascraperTwitter from "metascraper-twitter";
import metascraperInstagram from "metascraper-instagram";
import metascraperFavicon from "metascraper-logo-favicon";
import * as trpc from "@trpc/server";
import axios from "axios";
import isURL from "validator/lib/isURL";
import { scrapePageSchema } from "@schema/scraper.schema";
import { baseUrl } from "@utils/constants";

/**
 * Check if a url contains a valid image by sending a HEAD request.
 */
async function isImgUrl(url: string) {
  return fetch(url, { method: "HEAD" })
    .then((res) => {
      return res.headers.get("Content-Type")?.startsWith("image");
    })
    .catch(() => false);
}

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
      metascraperFavicon(),
      metascraperTitle(),
      metascraperUrl(),
      metascraperAmazon(),
      metascraperTwitter(),
      metascraperInstagram(),
    ]);

    const getMetascraper = async (url: string) => {
      const { data } = await axios({
        method: "get",
        url,
        timeout: 10000, // 10 seconds,
        timeoutErrorMessage: "Timed out after 10 seconds.",
      });

      return metascraper({ url, html: data });
    };

    const formattedUrl = formatUrl(input.url);
    const metadata = await getMetascraper(formattedUrl);

    const isValidImage = await isImgUrl(metadata.image);

    // If image is invalid, as to not break the client-side layouts, we
    // replace the url with a default image.
    if (!isValidImage) metadata.image = `${baseUrl}/static/default.jpg`;

    return metadata;
  },
});
