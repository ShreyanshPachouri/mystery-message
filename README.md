# Mystery Message

An anonymous messaging platform built with Next.js (App Router), MongoDB, and NextAuth. Users sign up, verify their account via a one-time email code, and get a shareable public link where anyone can send them anonymous messages.

## Features

- **Credentials-based authentication** via NextAuth, with hashed passwords (bcrypt) and JWT sessions
- **Email OTP verification** on sign-up (via [Resend](https://resend.com)) before an account can sign in
- **Anonymous message sending** — no login required to send a message to another user's public link
- **Accept/reject messages toggle** — users can turn off their public inbox at any time
- **Protected dashboard** — view, refresh, and delete received messages
- **Route protection via middleware** — signed-in users are redirected away from auth pages; signed-out users are redirected away from the dashboard

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [NextAuth.js](https://next-auth.js.org) (Credentials Provider, JWT strategy)
- [MongoDB](https://www.mongodb.com) + [Mongoose](https://mongoosejs.com)
- [Resend](https://resend.com) + [React Email](https://react.email) for verification emails
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) for schema validation
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS for UI components
- [Axios](https://axios-http.com) for client-side API calls

## Getting Started

### Prerequisites

- Node.js
- A MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Resend](https://resend.com) API key for sending verification emails

### Environment Variables

Create a `.env` file in the project root with:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret_string
RESEND_API_KEY=your_resend_api_key
```

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Application Flow

1. **Sign up** (`/sign-up`) — create an account with a username, email, and password.
2. **Verify** (`/verify/[username]`) — enter the 6-digit code emailed to you to activate the account.
3. **Sign in** (`/sign-in`) — log in with your email/username and password.
4. **Dashboard** (`/dashboard`) — view your unique public link, toggle whether you're accepting messages, and view/delete messages you've received.
5. **Public link** (`/u/[username]`) — anyone with this link (no account needed) can send you an anonymous message.

## Project Structure

```
├── components/                  # Shared UI (Navbar, MessageCard, shadcn/ui primitives)
├── emails/VerificationEmail.tsx  # React Email template for OTP emails
├── src/
│   ├── app/
│   │   ├── (app)/dashboard/     # Protected user dashboard
│   │   ├── (auth)/              # Sign-up, sign-in, verify pages
│   │   ├── u/[username]/        # Public anonymous message-sending page
│   │   └── api/
│   │       ├── auth/[...nextauth]  # NextAuth config
│   │       ├── sign-up/
│   │       ├── verify-code/
│   │       ├── check-username-unique/
│   │       ├── send-message/       # Unauthenticated — anyone can send a message
│   │       ├── get-messages/       # Authenticated — fetch own inbox
│   │       ├── accept-messages/    # Authenticated — toggle/check inbox status
│   │       └── delete-message/[messageid]/  # Authenticated — remove a message
│   ├── context/AuthProvider.tsx     # NextAuth SessionProvider wrapper
│   ├── model/user.ts                # Mongoose User + Message schemas
│   ├── schemas/                     # Zod validation schemas
│   ├── helpers/sendVerificationEmail.ts
│   ├── lib/                         # dbConnect, resend client
│   └── middleware.ts                # Route protection (auth-gated redirects)
```

## Notes on Next.js 16 Route Handlers

Dynamic API route params (e.g. `[messageid]`) are asynchronous in this Next.js version — `params` is a `Promise` and must be awaited before use:

```ts
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageid: string }> }
) {
  const { messageid } = await params
  // ...
}
```

## Known Gaps / TODO

- The **"Suggest Messages"** button on `/u/[username]` calls `/api/suggest-messages`, which is **not implemented** in this repo. This was intentionally skipped since it requires a paid OpenAI API key (no free tier) to generate message suggestions. Clicking it will currently fail — either remove that section, swap in a free-tier-friendly model/provider, or implement the route once you have API access.
- No rate-limiting on `/api/send-message` — since it's intentionally unauthenticated, consider adding basic abuse protection before any public deployment.

## Deployment

This project can be deployed on [Vercel](https://vercel.com). Set the same environment variables (`MONGODB_URI`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`) in your Vercel project settings, along with `NEXTAUTH_URL` pointing to your production domain.
