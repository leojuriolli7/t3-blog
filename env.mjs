import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),
    MAILER_PASSWORD: z.string(),
    MAILER_USER: z.string(),
    EMAIL_SERVER_HOST: z.string(),
    EMAIL_SERVER_PORT: z.string(),
    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_S3_ATTACHMENTS_BUCKET_NAME: z.string(),
  },
  client: {
    NEXT_PUBLIC_BYPASS_URL: z.string().optional(),
    NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME: z.string(),
    NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME: z.string(),
    NEXT_PUBLIC_AWS_REGION: z.string(),
    NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE: z.string().default("10485760"),
    NEXT_PUBLIC_UPLOADING_TIME_LIMIT: z.string().default("30"),
    NEXT_PUBLIC_UPLOAD_MAX_NUMBER_OF_FILES: z.string().default("4"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    MAILER_PASSWORD: process.env.MAILER_PASSWORD,
    MAILER_USER: process.env.MAILER_USER,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_ATTACHMENTS_BUCKET_NAME: process.env.AWS_S3_ATTACHMENTS_BUCKET_NAME,
    NEXT_PUBLIC_BYPASS_URL: process.env.NEXT_PUBLIC_BYPASS_URL,
    NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME:
      process.env.NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME,
    NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME:
      process.env.NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE:
      process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE,
    NEXT_PUBLIC_UPLOADING_TIME_LIMIT:
      process.env.NEXT_PUBLIC_UPLOADING_TIME_LIMIT,
    NEXT_PUBLIC_UPLOAD_MAX_NUMBER_OF_FILES:
      process.env.NEXT_PUBLIC_UPLOAD_MAX_NUMBER_OF_FILES,
  },
});
