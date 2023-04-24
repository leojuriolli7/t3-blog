import React, { useMemo } from "react";
import { baseUrl } from "@utils/constants";
import Head from "next/head";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";

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
  const session = useSession();
  const user = session?.data?.user;

  const { data: totalUnreads } = trpc.useQuery(["notification.total-unreads"], {
    enabled: !!user?.id,
  });

  const formattedTitle = useMemo(() => {
    const defaultTitle = `${totalUnreads ? `(${totalUnreads})` : ""} T3 Blog`;

    if (title) {
      return `${defaultTitle} | ${title}`;
    }

    return defaultTitle;
  }, [title, totalUnreads]);

  const DEFAULT_DESCRIPTION = "Blog built with the T3 Stack.";
  const LOGO_PATH = `${baseUrl}/static/square-logo.png`;
  const favicon = `${baseUrl}/static/favicon.ico`;

  const currentDescription = description || DEFAULT_DESCRIPTION;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <link rel="icon" href={favicon} />
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={currentDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:image" content={image || LOGO_PATH} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={currentDescription} />
      <meta property="twitter:image" content={image || LOGO_PATH} />
    </Head>
  );
};

export default MetaTags;
