# GitHub Pages Deployment Guide

Your portfolio is now configured as a fully static site and ready for GitHub Pages!

## 🚀 Quick Setup

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/shritej-koneru/portfolio
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. The site will automatically deploy on every push to `main` branch

### Step 2: Access Your Site

After the first successful deployment, your portfolio will be available at:

**https://shritej-koneru.github.io/portfolio/**

## 📝 Important Notes

### Base Path Configuration

The site is configured with base path `/portfolio/`. If you want to use:

1. **Custom domain** (e.g., `yourdomain.com`):
   - Update `vite.config.ts`: Change `base: "/portfolio/"` to `base: "/"`
   - Add a `CNAME` file in `client/public/` with your domain
   - Configure DNS settings with your domain provider

2. **Root GitHub Pages** (e.g., `username.github.io`):
   - Rename repository to `shritej-koneru.github.io`
   - Update `vite.config.ts`: Change `base: "/portfolio/"` to `base: "/"`

### Deployment Status

Check deployment status:
1. Go to **Actions** tab in your repository
2. View the latest workflow run
3. Each push to `main` triggers automatic deployment

### Manual Deployment (Alternative)

If you prefer manual deployment instead of automatic:

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

This creates a `gh-pages` branch with your built files.

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production (output to dist/)
npm run build

# Preview production build locally
npm run preview
```

## ✅ What Was Changed

- ✅ Removed Express server and backend code
- ✅ Removed database integration (Drizzle ORM)
- ✅ Simplified Vite config for static builds
- ✅ Added GitHub Actions workflow for automatic deployment
- ✅ All data now loaded from JSON files
- ✅ Added `gh-pages` deployment option
- ✅ Configured for GitHub Pages with base path

## 📦 Build Output

The build creates optimized static files in the `dist/` folder:
- Minified JavaScript and CSS
- Optimized images and assets
- Production-ready HTML

Your site is now 100% static and ready for GitHub Pages! 🎉
