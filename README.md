# 📄 PDF Text Viewer

A clean, modern web app that lets you upload PDFs and instantly extract their text content. Built for simplicity and speed.

## ✨ What it does

Ever needed to quickly grab text from a PDF without installing clunky desktop software? This app does exactly that:

1. **Upload** any PDF file (up to 10MB)
2. **Extract** all text content automatically
3. **View** the extracted text in a clean, scrollable interface
4. **Access** your upload history anytime

All your uploads are saved to your personal history, so you can come back and view them later.

## 🛠️ Tech Stack

This project is built with some great modern tools:

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS
- **[BetterAuth](https://better-auth.com/)** - Simple, secure authentication
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database queries
- **[pdf2json](https://github.com/nicktfranklin/pdf2json)** - PDF text extraction

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Neon](https://neon.tech/) database (free tier works great)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/sahilsOfficialCode/pdf-text-viewer-app.git
cd pdf-text-viewer-app
npm install
```

### 2. Set up your environment

Create a `.env` file in the root directory:

```env
# Your Neon database connection string
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# A random secret for auth (at least 32 characters)
BETTER_AUTH_SECRET=your-super-secret-random-string-here

# Your app URL (localhost for dev)
BETTER_AUTH_URL=http://localhost:3000
```

> 💡 **Tip**: Generate a secure secret with `openssl rand -base64 32`

### 3. Set up the database

Push the schema to your Neon database:

```bash
npx drizzle-kit push
```

### 4. Start developing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to go! 🎉

## 🌐 Deploying to Vercel

Deploying is straightforward:

1. **Push your code** to GitHub
2. **Import the repo** at [vercel.com/new](https://vercel.com/new)
3. **Add environment variables** in Vercel's project settings:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `BETTER_AUTH_SECRET` | Your random secret |
   | `BETTER_AUTH_URL` | Your Vercel app URL (e.g., `https://your-app.vercel.app`) |

4. **Deploy!**

> ⚠️ **Note**: Remove `&channel_binding=require` from your DATABASE_URL if present - it can cause issues with serverless connections.

## 🧪 Running Tests

We've got tests! Run them with:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode (great for development)
npm run test:coverage # See test coverage
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/       # Auth endpoints (BetterAuth)
│   │   ├── pdf/        # PDF delete endpoint
│   │   └── upload/     # PDF upload & extraction
│   ├── login/          # Login page
│   └── page.tsx        # Main dashboard
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── history-table.tsx
│   ├── upload-component.tsx
│   └── user-nav.tsx
├── db/
│   ├── index.ts        # Database connection
│   └── schema.ts       # Drizzle schema
└── lib/
    ├── auth.ts         # BetterAuth config
    └── auth-client.ts  # Client-side auth
```

## 🔒 Features & Validations

- **Authentication** - Email/password sign up and sign in
- **PDF validation** - Only accepts PDF files (checks MIME type and extension)
- **File size limit** - Max 10MB per upload
- **Duplicate detection** - Warns if you try to upload a file with the same name
- **Secure** - Users can only view and delete their own uploads

## 🤝 Contributing

Found a bug? Have an idea? Feel free to open an issue or submit a PR!

## 📝 License

MIT - do whatever you want with it!

---

Built with ☕ and curiosity.
