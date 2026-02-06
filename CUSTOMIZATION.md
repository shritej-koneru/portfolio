# Quick Customization Guide

Follow these steps to personalize your portfolio:

## Step 1: Update Your Personal Information

### File: `client/src/components/GuiView.tsx`

Find and replace:

```tsx
// Line ~60: Update your name
<h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
  Your Name  // ← Change this
</h1>

// Line ~63: Update your role
<p className="text-2xl md:text-3xl text-muted-foreground mb-4">
  Full Stack Developer  // ← Change this
</p>

// Line ~67: Update your bio
<p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
  I build modern web applications...  // ← Change this
</p>

// Line ~130: Update your email
<a href="mailto:your.email@example.com"  // ← Change this

// Line ~139: Update GitHub URL
<a href="https://github.com/yourusername"  // ← Change this

// Line ~148: Update LinkedIn URL
<a href="https://linkedin.com/in/yourusername"  // ← Change this
```

## Step 2: Add Your Projects, Skills, and Experience

### File: `client/src/hooks/use-portfolio.ts`

### Projects
```typescript
const staticProjects: Project[] = [
  {
    id: 1,
    title: "Your Project Name",
    description: "What does your project do?",
    techStack: ["React", "Node.js", "PostgreSQL"],
    githubUrl: "https://github.com/yourusername/project",
    liveUrl: "https://yourproject.com"  // Optional
  },
  // Add more projects...
];
```

### Skills
```typescript
const staticSkills: Skill[] = [
  { id: 1, category: "Languages", name: "JavaScript", level: "Advanced" },
  { id: 2, category: "Frontend", name: "React", level: "Advanced" },
  { id: 3, category: "Backend", name: "Node.js", level: "Intermediate" },
  // Add more skills...
];
```

### Experience
```typescript
const staticExperience: Experience[] = [
  {
    id: 1,
    company: "Your Company",
    position: "Your Position",
    duration: "2023 - Present",
    description: "What did you do? What did you achieve?",
    startDate: "2023-01-01"
  },
  // Add more experience...
];
```

## Step 3: Update Terminal "About" Section

### File: `client/src/components/TerminalView.tsx`

Find the `about` command (around line 132):

```tsx
case "about":
  response = (
    <div className="max-w-2xl mt-2 leading-relaxed">
      <p>
        I am a <span className="text-[var(--term-green)]">Full Stack Engineer</span>...
        // ← Update this section
      </p>
      <p className="mt-2">
        Based in the cloud, working worldwide.  // ← Update this
      </p>
    </div>
  );
  break;
```

Find the `contact` command (around line 153):

```tsx
case "contact":
  response = (
    <div className="mt-2">
      <p>You can reach me at:</p>
      <div className="grid grid-cols-[100px_1fr] gap-2 mt-2">
        <span className="text-[var(--term-blue)]">Email:</span>
        <a href="mailto:hello@example.com">hello@example.com</a>  // ← Update
        
        <span className="text-[var(--term-blue)]">GitHub:</span>
        <a href="https://github.com">github.com/developer</a>  // ← Update
      </div>
    </div>
  );
  break;
```

## Step 4: Add Your Resume

Replace the placeholder file:

1. Place your actual resume PDF at:
   ```
   client/public/assets/resume.pdf
   ```

2. Make sure it's named exactly `resume.pdf` or update the link in `GuiView.tsx`

## Step 5: (Optional) Add Project Images

1. Add images to `client/public/images/`
2. Reference them in your projects:
   ```typescript
   {
     id: 1,
     title: "My Project",
     // ... other fields
     liveUrl: "/images/project-screenshot.png"  // Will display in terminal
   }
   ```

## Step 6: Test Your Changes

1. Save all files
2. The dev server will auto-reload
3. Visit `http://localhost:5173/`
4. Test both GUI and Terminal modes
5. Check all links work correctly

## Step 7: (Optional) Customize Colors

### File: `client/src/index.css`

```css
:root {
  /* Adjust these colors to match your brand */
  --primary: 220.9 39.3% 11%;           /* Main accent color */
  --primary-foreground: 210 20% 98%;   /* Text on primary */
  
  /* Terminal colors (Tokyo Night theme) */
  --term-bg: #1a1b26;      /* Background */
  --term-fg: #c0caf5;      /* Text */
  --term-green: #9ece6a;   /* Success/highlights */
  --term-cyan: #7dcfff;    /* Commands */
  --term-blue: #7aa2f7;    /* Links */
  --term-red: #f7768e;     /* Errors */
  --term-purple: #bb9af7;  /* Special */
}
```

## Testing Checklist

- [ ] Name and role display correctly
- [ ] Bio/summary is accurate
- [ ] All contact links work (email, GitHub, LinkedIn)
- [ ] Projects show with correct info and links
- [ ] Skills are categorized correctly
- [ ] Experience displays in order
- [ ] Resume downloads correctly
- [ ] Terminal `about` command shows correct info
- [ ] Terminal `contact` command has correct links
- [ ] All terminal commands work
- [ ] Mode toggle button works
- [ ] Keyboard shortcut (Ctrl+K) works
- [ ] Responsive on mobile devices

## Common Issues

### Links not opening?
- Make sure URLs include `https://`
- Check for typos in email addresses

### Projects not showing?
- Verify the data structure in `use-portfolio.ts`
- Check browser console for errors

### Terminal colors look wrong?
- Clear browser cache
- Check CSS variables in `index.css`

### Resume not downloading?
- Ensure file is at `client/public/assets/resume.pdf`
- File name is case-sensitive

## Need Help?

See [README.md](README.md) for detailed documentation or [CHANGES.md](CHANGES.md) for technical details about the implementation.
