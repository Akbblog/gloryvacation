# Glory Vacation - Property Listing Platform

A modern property listing platform built with Next.js 16, MongoDB, and TypeScript.

## Features

- 🏠 Property listings with advanced filtering
- 🔍 Search by location, amenities, price range
- 📱 Responsive design with mobile support
- 🌍 Multi-language support (English/Arabic)
- 🔐 Authentication with NextAuth.js
- 🖼️ Image gallery with drag-and-drop upload
- 📊 Admin dashboard for property management

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Vercel account (for deployment)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your values:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### 1. Environment Variables

Set these environment variables in your Vercel dashboard:

- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - A secure random string (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect Next.js and deploy
4. Set the environment variables in Vercel dashboard

### 3. Health Check

After deployment, check the health endpoint:
```
https://your-app.vercel.app/api/health
```

This will verify:
- MongoDB connection
- Property count
- Environment variables

## Troubleshooting Vercel Issues

### Common Issues:

1. **NEXTAUTH_URL not set correctly**
   - Must be your actual Vercel URL, not localhost
   - Example: `https://glory-vacation.vercel.app`

2. **MongoDB connection timeouts**
   - Check your MongoDB Atlas IP whitelist
   - Ensure connection string is correct
   - Consider using MongoDB Atlas connection string with `retryWrites=true&w=majority`

3. **Cold start issues**
   - API routes may take longer on first load
   - Check Vercel function logs for errors

4. **Environment variables**
   - Ensure all required env vars are set in Vercel dashboard
   - Don't commit sensitive data to git

### Debug Steps:

1. Check Vercel deployment logs
2. Test the `/api/health` endpoint
3. Verify environment variables are set
4. Check MongoDB connection from Vercel functions

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities and configurations
├── models/               # MongoDB models
└── types/                # TypeScript types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
