# PDF Text Viewer

A Next.js application to upload PDFs, extract text, and store history.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + TailwindCSS
- **Auth**: BetterAuth
- **Database**: Neon PostgreSQL + Drizzle ORM
- **PDF Processing**: pdfjs-dist

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/sahilsOfficialCode/pdf-text-viewer-app.git
cd pdf-text-viewer-app
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Setup Database

```bash
npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

### 1. Push to GitHub

Your code should be in a GitHub repository.

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository

### 3. Configure Environment Variables

Add these in Vercel's project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | A random secret (min 32 chars) |
| `BETTER_AUTH_URL` | Your Vercel app URL (e.g., `https://your-app.vercel.app`) |

> **Note**: Remove `&channel_binding=require` from DATABASE_URL for Vercel compatibility.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run tests |
