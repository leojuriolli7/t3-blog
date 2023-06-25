#  <img src="https://user-images.githubusercontent.com/100495707/230788216-88669c63-b0ef-4679-8d10-ed7555f29403.png" width="110" height="50" /> - T3 Blog



### Deployed to Vercel on https://t3-blog-pi.vercel.app/

This is a fullstack blog application made with the [T3 Stack](https://create.t3.gg/). 

Aditionally, I used [AWS S3](https://aws.amazon.com/s3/) Buckets for file uploads, with presigned urls for securely accessing the stored files, ensuring they are safe and private.

## Features

- Login with Google, Github or discord, or with a [Magic link](https://www.beyondidentity.com/glossary/magic-links) to your e-mail.
- Create & edit posts.
- Receive notifications for new posts, replies, comments on your posts, new followers, and more.
- Tag your posts.
- Intercepted routes like reddit and instagram (Read a post with a modal, without having to go to a new page)
- Upload files to your posts as attachments: You can upload videos, images, audio or documents (.pdf, .msword, etc.)
- Upload images to your posts' body by dragging and dropping (or file system) like on Github!
- Every file uploaded can be interacted - You can listen to the audios using a custom-built audio-player, watch the videos, download any of the files, etc.)
- **Like or dislike posts**.
- **Create a poll on your post** and let users vote on it.
- **Add a link to your post with link scraping** using [metascraper.](https://metascraper.js.org/) 
- Comment on posts.
- Use [Markdown](https://www.markdownguide.org/basic-syntax/) to write your posts & comments.
- Reply to comments on posts (**Infinitely nested comment replies** like reddit)
- **Favorite posts** and browse through all your favorited posts.
- **Follow users and be followed by other users**, see their and your followers/following.
- See a **personalized "Following" timeline** with posts from your following.
- Search posts, tags, users & comments with **full-text search**.
- Access yours or other users' profiles and see their posts.
- Personalize your profile - Upload an avatar, change your username, add a bio and a profile link.
- Search for posts using different filters and by their tags.
- Role-based API with users and admins.
- Search engine optimizations through meta-tags, server-side-rendering and semantic HTML.

## The stack

- Next.js
- [Prisma](https://www.prisma.io/) for type-safe communication with the database.
- [tRPC](https://trpc.io) for a type-safe API & data-fetching.
- [Next Auth](https://next-auth.js.org/) for authorization. - Also using the [Prisma Adapter](https://next-auth.js.org/adapters/prisma) to store session info in my DB.
- [Tailwind CSS](https://tailwindcss.com/) for styling & [Headless UI](https://headlessui.com/) for unstyled primitives to use with Tailwind.
- [AWS S3](https://aws.amazon.com/s3/) for storing file uploads: This is done with [presigned urls](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html), which guarantees the files uploaded are safe and private.
- [Zod](https://github.com/colinhacks/zod) for validations.
- [React Hook Form](https://react-hook-form.com) for forms.
- [Keen Slider](https://keen-slider.io/) for a carousel component.
- [rehype](https://github.com/rehypejs/rehype) & [remark](https://github.com/remarkjs/remark/) to parse the markdown on the server-side, and convert it to HTML before sending it to the client. 
- [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite/) for a very quick and performant MD editor.
- [Metascraper](https://metascraper.js.org/) for scraping links.
- [auto-animate](https://auto-animate.formkit.com/) - automatic animations, [Next Themes](https://github.com/pacocoursey/next-themes) - easy dark mode support, [React Icons](https://react-icons.github.io/) - icons, [React Toastify](https://fkhadra.github.io/react-toastify/) - toasts, [React popper](https://popper.js.org/) for a custom popover component, [React dropzone](https://react-dropzone.js.org/) for a dropzone component.

## Improving the user experience

- I used [TanStack Query](https://tanstack.com/query/latest) (formerly React Query) to implement [optimistic updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates), allowing the UI to update without having to wait for a backend response, making for a blazing fast experience. - You can like/dislike posts and see the feedback immediately, or edit a post and see the changes applied instantaneously.
- Implemented infinite scrolling on multiple screens with TanStack Query's `useInfiniteQuery`, tRPC and the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
- I used [Lodash debounce](https://lodash.com/docs/#debounce) to debounce search results and improve the search input performance while keeping a good UX. (Typing and automatically receiving results) 

## Performance increases

Various performance optimizations were implemented on this website, such as code splitting, data-fetching in parallel, optimizing fonts, dynamic importing, reducing the first load JS and leveraging the Next.JS server-side for expensive calculations instead of doing them on the client-side. 

By data fetching in parallel, all requests go out at the same time and we await them together. If we await each one individually, each request will only fire when the previous one has been resolved, causing potentially huge performance hits.

By dynamic importing and code-splitting, the initial JS loaded on page-load was drastically reduced on every page. For instance, instead of loading the JS for the edit post form on the post page load, it is loaded on-demand when the user clicks to edit a post.



I also leveraged the Next.JS node server for processsing markdown and formatting all dates on the server-side, instead of doing it on the client. I also truncate the HTML (Limit it to 250 characters) on the server to reduce the size of the DOM tree and avoid sending unnecessary HTML to the client. It is also parsed before being sent to the client, adjusting for Search Engine Optimizations. [Read more here.](https://github.com/leojuriolli7/t3-blog/commit/2ce73b4df034c05180211aac07c70a4323a7cf1e#diff-1ee892b507c8886a683fe2e7011d58a1eb69dd233ceb47fc65ad62d8e97e1f9eR30-R56)


### Processing markdown on the server

Another important UX improvement was when I switched from converting markdown to HTML on the client-side with [React Markdown](https://github.com/remarkjs/react-markdown) to converting MD to HTML on the server-side, and returning simple HTML to the client.

I could notice whenever I first loaded the site, or scrolled down to load new posts, the page would slow down/crash for a bit, presumably to process & convert the markdown text it was receiving. This poor UX was fixed with this change.  **This contributed to a huge boost in the performance scores of the website:**

#### The pull request: [Refactor: Process markdown on the server](https://github.com/leojuriolli7/t3-blog/pull/21)

| Parsing markdown on the client | After parsing markdown on the server |
|--------|--------|
| ![Screenshot from 2023-03-29 23-46-02](https://user-images.githubusercontent.com/100495707/228715389-f1206b83-ae93-4e1f-b5af-d18bb1356e5d.png) | ![Screenshot from 2023-03-29 23-47-33](https://user-images.githubusercontent.com/100495707/228715384-b8cee082-a162-4d9e-a0f6-1a1f791242a1.png)  | 

## Overcoming T3 Stack limitations

### Cold starts

This project is deployed on Vercel with Serverless Functions. This means every time someone opens the website, there is a waiting period while the function is initialized.

As the website grew, and so did the amount of tRPC routers and dependencies, the cold-starts got to 7-10 seconds. To solve this, I split all the tRPC routers into their own serverless functions, meaning they could load up individually and on-demand (and in parallel), instead of loading everything at once.

[Here is the Pull Request.](https://github.com/leojuriolli7/t3-blog/pull/40)

| Before                                                                                                                             | After                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ![Screenshot from 2023-06-24 21-43-30](https://github.com/leojuriolli7/t3-blog/assets/100495707/09eae191-624f-4572-bb9c-0123d7744f01) | ![Screenshot from 2023-06-24 21-42-57](https://github.com/leojuriolli7/t3-blog/assets/100495707/55178e5b-9f65-4169-abba-c762c79f12d6) |


### File uploads
tRPC [does not support `multipart/form-data`](https://github.com/trpc/trpc/discussions/658#discussioncomment-998746), so file uploads could not be done reliably inside the tRPC router. For that reason, I decided to use the AWS SDK, S3 buckets and presigned URLs, a very safe and reliable method of uploading files. 

In this case, the tRPC router is only responsible with creating presigned URLs for uploads on the client and getting/parsing the AWS objects before sending the JSON to the client on any queries. 

### Image caching
Next.js has a very effective and powerful image caching when using their `next/image` component. However, this can be an issue when updating an image without changing its url, like for example, updating a user's profile picture, the url is the same, but the content has changed. Next.js is not able to identify the change. 

To counteract this, every time an image is updated, a timestamp is appended to its url, to ensure the path will be different and the cache will be invalidated immediately. Eg: `bucket-url/user-id/avatar?1231903109` 

[See more on the commit.](https://github.com/leojuriolli7/t3-blog/commit/67145e0c2e8ee7c0d531d392a8d4191df31b293e)

## Run the project
### Environment variables:
  - `DATABASE_URL`: Planetscale MySQL database URL.
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Required for [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2). Can be generated on [Google API Console.](https://console.developers.google.com/)
  - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`: Required for [Discord OAuth 2.0.](https://discord.com/developers/docs/topics/oauth2) 
  - `GITHUB_ID`, `GITHUB_SECRET`: Required for [Github OAuth 2.0.](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
  - **E-mail sign-in variables:**
  
      > Read more: https://next-auth.js.org/providers/email
      ```
      MAILER_PASSWORD=
      MAILER_USER=
      EMAIL_SERVER_HOST=
      EMAIL_SERVER_PORT=
      ```
  - Next Auth variables:
  
    > Read more: https://next-auth.js.org/configuration/options#environment-variables
    ```
    NEXTAUTH_URL=http://localhost:3000/api/auth
    NEXTAUTH_SECRET=
    ```
  - AWS attachments and profile avatar buckets' variables:
    ```
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_S3_BUCKET_NAME=
    AWS_S3_AVATARS_BUCKET_NAME=
    NEXT_PUBLIC_AWS_S3_AVATARS_BUCKET_NAME=
    NEXT_PUBLIC_AWS_S3_POST_BODY_BUCKET_NAME=
    AWS_REGION=
    ```
### Commands
1. Install all dependencies with `yarn`
2. Init prisma with `npx prisma init` 
3. Push prisma schema to database with `npx prisma db push`
4. Start the application with `yarn dev`

