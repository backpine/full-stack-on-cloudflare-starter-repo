# TanStack React + tRPC + Cloudflare Worker Template

This template provides a fully integrated setup of TanStack React Router, tRPC, and Cloudflare Workers, allowing you to build full-stack applications that run on the edge.

## Features

- [TanStack Router](https://tanstack.com/router) for type-safe, powerful routing
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [tRPC](https://trpc.io/) for end-to-end typesafe APIs
- [Cloudflare Workers](https://workers.cloudflare.com/) for edge computing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type safety

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v7 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers development

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

This will start the local development server at http://localhost:3000.

## Cloudflare Worker Configuration

### Service Bindings and TypeScript

This template includes type definitions for Cloudflare Worker bindings. When adding service bindings or other Cloudflare resources, you should:

1. Generate TypeScript types for your bindings:

```bash
npm run cf-typegen
```

This will create or update typings for your Cloudflare Worker environment.

2. Update the `Service Bindings` interface in `service-bindings.d.ts`:

```typescript
interface ServiceBindings extends Env {
  // You can add Additional typesame bindings here
}
```

3. Use the typed bindings in your tRPC context and procedures:

```typescript
// In context.ts
export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: ServiceBindings; // This will include your typed bindings
  workerCtx: ExecutionContext;
}) {
  return {
    req,
    env,
    workerCtx,
  };
}

// In your tRPC procedures
export const myProcedure = t.procedure
  .query(({ ctx }) => {
    // Access typed bindings
    const value = await ctx.env.MY_KV.get('some-key');
    return { value };
  });
```

## Deployment

To deploy your application to Cloudflare Workers:

1. Build the application:

```bash
npm run build
```

2. Deploy to Cloudflare:

```bash
npm run deploy
```


This will deploy your application to your Cloudflare Workers account. Make sure you have configured Wrangler with your Cloudflare account credentials.

### Configuration

You can customize your Cloudflare Worker deployment by editing the `wrangler.toml` file. Key configurations include:

- `name`: The name of your worker
- `compatibility_date`: The Cloudflare Workers compatibility date
- `routes`: URL pattern matching for your worker
- `site`: Configuration for serving static assets

## Project Structure

```
├── src/                  # Frontend React application
│   ├── routes/           # TanStack router routes
│   ├── trpcClient.ts     # tRPC client setup
│   └── main.tsx          # Application entry point
│
├── worker/               # Cloudflare Worker backend
│   ├── index.ts          # Worker entry point
│   └── trpc/             # tRPC router and procedures
│       ├── context.ts    # tRPC context creation
│       ├── router.ts     # Main tRPC router
│       └── routers/      # Individual tRPC route handlers
│
├── public/               # Static assets
└── wrangler.toml         # Cloudflare Worker configuration
```

## Additional Resources

- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/overview)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [tRPC Documentation](https://trpc.io/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
