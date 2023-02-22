## T3 Blog

Deployed to Vercel on https://t3-blog-pi.vercel.app/


This is a fullstack blog application made with the [T3 Stack](https://create.t3.gg/). It uses a *one-time password* sent as a link to your e-mail for logging in. 
(eg: `https//example.com/login#token=...`) 

### The Stack
- Next.js 
- [Prisma](https://www.prisma.io/) for type-safe communication with the database.
- [tRPC](https://trpc.io) for a type-safe API & data-fetching.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Zod](https://github.com/colinhacks/zod) for validations.
- [React Hook Form](https://react-hook-form.com) for forms.
- [Nodemailer](https://nodemailer.com/) for mailing the one-time password link.

### Features
- Create posts.
- Use [Markdown](https://www.markdownguide.org/basic-syntax/) to write down your posts.
- Login with a [Magic link](https://www.beyondidentity.com/glossary/magic-linkshttps://www.beyondidentity.com/glossary/magic-links) to your e-mail.
- Comment on posts.
- Reply to comments on posts (**Nested comment replies** like reddit)
- Use Markdown on your comments.

