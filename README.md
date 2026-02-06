# Developer Portfolio - Hybrid Interface

A modern, hybrid developer portfolio featuring both a clean minimal website and an interactive terminal interface. Built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

- **Dual Interface**: Switch between a professional GUI and an interactive terminal
- **Minimal Design**: Clean, fast-loading interface optimized for recruiters
- **Terminal Mode**: Technical exploration for engineers and developers
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Static Client-Side**: No backend required - perfect for GitHub Pages
- **Accessibility First**: WCAG compliant with keyboard navigation support

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The application will be available at `http://localhost:5173/`

## 📁 Project Structure

```
Portfolio/
├── client/
│   ├── public/
│   │   ├── assets/
│   │   │   └── resume.pdf          # Your resume PDF
│   │   └── images/                 # Project images
│   └── src/
│       ├── components/
│       │   ├── GuiView.tsx         # Minimal website view
│       │   ├── TerminalView.tsx    # Interactive terminal
│       │   ├── ModeToggle.tsx      # Toggle button component
│       │   └── ui/                 # Reusable UI components
│       ├── hooks/
│       │   └── use-portfolio.ts    # Static portfolio data
│       ├── pages/
│       │   └── Home.tsx            # Main page component
│       ├── App.tsx                 # App entry point
│       └── index.css               # Global styles
├── package.json
└── vite.config.ts
```

## 🎨 Customization

### Update Your Information

1. **Personal Information** - Edit `client/src/components/GuiView.tsx`:
   - Replace "Your Name" with your actual name
   - Update professional summary
   - Update contact links (email, GitHub, LinkedIn)

2. **Projects, Skills, Experience** - Edit `client/src/hooks/use-portfolio.ts`:
   - Add your projects to `staticProjects` array
   - Update skills in `staticSkills` array
   - Add work experience to `staticExperience` array

3. **Resume** - Replace `client/public/assets/resume.pdf` with your actual resume

4. **Terminal Information** - Edit `client/src/components/TerminalView.tsx`:
   - Update the `about` command response
   - Update contact information in the `contact` command

### Styling

The portfolio uses Tailwind CSS with custom variables defined in `client/src/index.css`:
- GUI theme colors can be adjusted in the `:root` section
- Terminal theme uses Tokyo Night color scheme (customizable via `--term-*` variables)
- Fonts: Inter (GUI) and Fira Code (Terminal)

## 🎮 Terminal Commands

When in terminal mode, try these commands:

- `help` - Show all available commands
- `about` - Display biographical information
- `projects` - List featured projects
- `skills` - Show technical skills
- `experience` - View work history
- `contact` - Display contact information
- `clear` - Clear terminal screen
- `exit` or `gui` - Return to GUI mode

## 🔄 Mode Switching

- Click the floating button (bottom-right) to toggle between modes
- Keyboard shortcut: `Ctrl+K` (or `Cmd+K` on Mac)
- Type `gui` or `exit` in terminal to return to GUI mode

## 📦 Deployment

### GitHub Pages

1. Update `vite.config.ts` to set the base path:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy the dist/public folder to GitHub Pages
   ```

### Netlify / Vercel

Simply connect your repository and these platforms will auto-detect the Vite configuration.

Build command: `npm run build`
Output directory: `dist/public`

## 🎯 Design Philosophy

This portfolio follows these principles from the PRD:

1. **Clarity over decoration** - Clean, minimal design without clutter
2. **Terminal is optional** - Full functionality available in both modes
3. **Professional first impression** - Optimized for recruiters and hiring managers
4. **Fast and accessible** - Loads quickly, works without JavaScript-heavy features
5. **Static and simple** - No backend required, easy to deploy

## 📄 Documentation

Additional documentation available:
- [PRD.md](PRD.md) - Product requirements and goals
- [Design.md](Design.md) - Design philosophy and guidelines
- [TECH_RULES.md](TECH_RULES.md) - Original technical constraints (archived)
- [todo.md](todo.md) - Development checklist

## 🛠️ Technologies

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod

## 📝 License

MIT License - feel free to use this as a template for your own portfolio!

## 🤝 Contributing

This is a personal portfolio template, but suggestions and improvements are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 💬 Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ by developers, for developers**
