import React, { useMemo } from "react";
import { baseUrl } from "@utils/constants";
import Head from "next/head";

type Props = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

const MetaTags: React.FC<Props> = ({
  title,
  description,
  url = baseUrl,
  image,
}) => {
  const formattedTitle = useMemo(() => {
    if (title) {
      return `T3 Blog | ${title}`;
    }

    return title;
  }, [title]);

  const DEFAULT_DESCRIPTION = "Blog built with the T3 Stack.";
  const LOGO_PATH = `${baseUrl}/static/logo.png`;
  const favicon = `${baseUrl}/static/favicon.ico`;

  const currentDescription = description || DEFAULT_DESCRIPTION;
  const formattedDescription = currentDescription.trim().slice(0, 250);

  return (
    <Head>
      <title>{formattedTitle}</title>
      <link rel="icon" href={favicon} />
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={formattedDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={formattedDescription} />
      <meta property="og:image" content={LOGO_PATH || image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={currentDescription} />
      <meta property="twitter:image" content={LOGO_PATH || image} />
    </Head>
  );
};

export default MetaTags;
