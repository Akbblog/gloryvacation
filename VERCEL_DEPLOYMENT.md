Vercel deployment checklist for this project

Required environment variables (set in Vercel dashboard > Project > Settings > Environment Variables):

- `MONGODB_URI` : MongoDB connection string (use Atlas). If you prefer serverless-safe option, consider MongoDB Atlas Data API.
- `MONGODB_MAX_POOL_SIZE` : Optional. Defaults to 5. Lower it (1-5) for serverless function safety.
- `NEXTAUTH_SECRET` : Secret for NextAuth JWT/session signing.
- `NEXTAUTH_URL` : Typically https://<your-deployment-url>

Recommendations:

- Use MongoDB Atlas with a serverless tier or Data API for best results with Vercel.
- Keep `MONGODB_MAX_POOL_SIZE` low (1-5). The code uses a global cache to reuse connections across cold starts.
- Do not switch API routes to Edge runtime while using Mongoose or native modules like `bcrypt`.
- Monitor Vercel function logs for connection errors and increase pool size or move to Data API accordingly.

Testing locally:

1. Copy `.env.example` to `.env.local` and fill values.
2. Install and run:

```bash
npm install
npm run dev
```

If you want a zero-socket serverless pattern, migrate endpoints to use MongoDB Atlas Data API or Prisma Data Proxy (requires code changes).