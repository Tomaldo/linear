# Linear Issue Tracker

A modern issue tracking application built with Next.js and Linear API. This application allows you to view and create Linear issues with a beautiful and responsive UI.

## Features

- View Linear issues with their states
- Create new issues with title and description
- Modern UI with Material-UI components
- Proper loading states and error handling
- Server and client component separation
- TypeScript for type safety

## Prerequisites

Before running this application, you'll need:

1. A Linear account and API key
2. Node.js 18+ installed
3. npm or yarn package manager

## Environment Setup

Create a `.env.local` file in the root directory with your Linear API key:

```bash
NEXT_PUBLIC_LINEAR_API_KEY=your_linear_api_key_here
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── common/          # Shared components
│   ├── features/
│   │   └── issues/          # Issue-related components
│   ├── utils/               # Utility functions
│   ├── theme.ts            # MUI theme configuration
│   ├── providers.tsx       # App providers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
```

## Technologies Used

- [Next.js](https://nextjs.org) - React framework
- [Material-UI](https://mui.com) - UI components
- [Linear SDK](https://developers.linear.app) - Linear API integration
- [React Hook Form](https://react-hook-form.com) - Form handling
- TypeScript - Type safety

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
