## T3 Blog

Deployed to Vercel on https://t3-blog-pi.vercel.app/

This is a fullstack blog application made with the [T3 Stack](https://create.t3.gg/).

### Features

- Login with Google, Github or discord, or with a [Magic link](https://www.beyondidentity.com/glossary/magic-links) to your e-mail.
- Create & edit posts.
- Tag your posts.
- Like or dislike posts.
- Comment on posts.
- Use [Markdown](https://www.markdownguide.org/basic-syntax/) to write down your posts & comments.
- Reply to comments on posts (**Infinitely nested comment replies** like reddit)
- Access yours or other users' profiles and see their posts.
- Search for posts using different filters and by their tags.
- Search engine optimizations through meta-tags, server-side-rendering and semantic HTML.

### The stack

- Next.js
- [Prisma](https://www.prisma.io/) for type-safe communication with the database.
- [tRPC](https://trpc.io) for a type-safe API & data-fetching.
- [Next Auth](https://next-auth.js.org/) for authorization. - Also using the [Prisma Adapter](https://next-auth.js.org/adapters/prisma) to store session info in my DB.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Headless UI](https://headlessui.com/) for unstyled components to use with Tailwind.
- [Zod](https://github.com/colinhacks/zod) for validations.
- [React Hook Form](https://react-hook-form.com) for forms.
- [React Markdown](https://github.com/remarkjs/react-markdown) for reading markdown text & [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite/) for a very quick and performant MD editor.
- [Next Themes](https://github.com/pacocoursey/next-themes) for easy dark mode support.
- [auto-animate](https://auto-animate.formkit.com/) - automatic animations, [React Icons](https://react-icons.github.io/) - icons, [React Toastify](https://fkhadra.github.io/react-toastify/) - toasts, [React popper](https://popper.js.org/) for managing popover component.

### Highlights - Improving the user experience

- Used TanStack Query (formerly React Query) to implement [optimistic updates](https://tanstack.com/query/v4/docs/react/guides/optimistic-updates), allowing the UI to update without having to wait for a backend response, making for a blazing fast experience. - You can like/dislike posts and see the feedback immediately, or edit a post and see the edits applied instantaneously.
- Implemented infinite scrolling with TanStack Query's `useInfiniteQuery`, tRPC and the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
