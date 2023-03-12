## T3 Blog

Deployed to Vercel on https://t3-blog-pi.vercel.app/

This is a fullstack blog application made with the [T3 Stack](https://create.t3.gg/). 

Aditionally, I used [AWS S3](https://aws.amazon.com/s3/) Buckets for file uploads, with presigned urls for securely accessing the stored files, ensuring they are safe and private.

### Features

- Login with Google, Github or discord, or with a [Magic link](https://www.beyondidentity.com/glossary/magic-links) to your e-mail.
- Create & edit posts.
- Tag your posts.
- Upload files to your posts as attachments: You can upload videos, images, audio or documents (.pdf, .msword, etc.)
- Every file uploaded can be interacted - You can listen to the audios using a custom-built audio-player, watch the videos, download any of the files, etc.)
- **Like or dislike posts**.
- Comment on posts.
- Use [Markdown](https://www.markdownguide.org/basic-syntax/) to write your posts & comments.
- Reply to comments on posts (**Infinitely nested comment replies** like reddit)
- **Favorite posts** and browse through all your favorited posts.
- **Follow users and be followed by other users**, see their and your followers/following.
- See a **personalized "Following" timeline** with posts from your following.
- Search posts with **full-text search**.
- Access yours or other users' profiles and see their posts.
- Search for posts using different filters and by their tags.
- Search engine optimizations through meta-tags, server-side-rendering and semantic HTML.

### The stack

- Next.js
- [Prisma](https://www.prisma.io/) for type-safe communication with the database.
- [tRPC](https://trpc.io) for a type-safe API & data-fetching.
- [Next Auth](https://next-auth.js.org/) for authorization. - Also using the [Prisma Adapter](https://next-auth.js.org/adapters/prisma) to store session info in my DB.
- [Tailwind CSS](https://tailwindcss.com/) for styling & [Headless UI](https://headlessui.com/) for unstyled primitives to use with Tailwind.
- [AWS S3](https://aws.amazon.com/s3/) for storing file uploads: This is done with [presigned urls](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html), which guarantees the files uploaded are safe and private.
- [Zod](https://github.com/colinhacks/zod) for validations.
- [React Hook Form](https://react-hook-form.com) for forms.
- [Keen Slider](https://keen-slider.io/) for a carousel component.
- [React Markdown](https://github.com/remarkjs/react-markdown) for reading markdown text & [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite/) for a very quick and performant MD editor.
- [Next Themes](https://github.com/pacocoursey/next-themes) for easy dark mode support.
- [auto-animate](https://auto-animate.formkit.com/) - automatic animations, [React Icons](https://react-icons.github.io/) - icons, [React Toastify](https://fkhadra.github.io/react-toastify/) - toasts, [React popper](https://popper.js.org/) for a custom popover component, [React dropzone](https://react-dropzone.js.org/) for a dropzone component.

### Improving the user experience

- I used [TanStack Query](https://tanstack.com/query/latest) (formerly React Query) to implement [optimistic updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates), allowing the UI to update without having to wait for a backend response, making for a blazing fast experience. - You can like/dislike posts and see the feedback immediately, or edit a post and see the changes applied instantaneously.
- Implemented infinite scrolling on multiple screens with TanStack Query's `useInfiniteQuery`, tRPC and the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
