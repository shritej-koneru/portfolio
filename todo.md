# Hybrid Portfolio – Todo List

> Scope Guard:
> This project is a modern React portfolio application with GUI/Terminal dual-mode interface.
> Built with React, TypeScript, Vite, TailwindCSS, and Framer Motion.

## Phase 1: Project Setup
- [x] Create folder structure (React project structure with client/, server/, shared/)
- [x] Initialize index.html with basic structure
- [x] Set up React with TypeScript and Vite
- [x] Configure TailwindCSS and component library
- [x] Set up routing with wouter
- [x] Configure development environment
- [x] Set up CSS variables for colors and fonts (via TailwindCSS theme)
- [ ] Add resume.pdf to assets folder

## Phase 2: GUI Website View (GuiView.tsx)
### Header & Hero
- [x] Build navigation menu with logo/name
- [x] Add profile picture to navigation (top right)
- [x] Create navigation links (About, Skills, Experience, Projects, Contact)
- [x] Add social media links (GitHub, LinkedIn) to navigation
- [x] Add resume download button to navigation
- [x] Implement smooth scroll navigation
- [x] Create responsive mobile menu with hamburger icon
- [x] Add sticky navigation with backdrop blur effect
- [x] Create hero section with professional summary
- [x] Style header and hero section with animations
- [x] Add "Available for hire" badge

### Projects Section
- [x] Create projects showcase with card layout
- [x] Add project titles, descriptions, and tech stacks
- [x] Add GitHub repository links for each project
- [x] Add live demo links where applicable
- [x] Style projects section with hover effects
- [x] Integrate with data hooks (useProjects)
- [x] Add loading states

### Additional Sections
- [x] Create Skills section with category grouping
- [x] Create Experience section with timeline design
- [x] Add Photo Gallery section
- [x] Create Contact form with state management

### CTAs & Footer
- [x] Add "Get in touch" CTA button
- [x] Add "View Work" navigation button
- [x] Add Mode Toggle component for switching views
- [x] Create footer with copyright information
- [x] Ensure all buttons have hover states

### Responsive Design
- [x] Make header responsive (mobile-first)
- [x] Make hero section responsive
- [x] Make projects section responsive (grid/stack on mobile)
- [x] Make all sections responsive with proper breakpoints

## Phase 3: Terminal UI (TerminalView.tsx)
### Layout & Structure
- [x] Create full-screen terminal container
- [x] Set up dark theme with terminal color scheme
- [x] Configure monospace font (multiple options via Google Fonts)
- [x] Create fixed input line at bottom
- [x] Set up scrollable output area

### Terminal Functionality
- [x] Implement blinking cursor effect
- [x] Capture user keyboard input
- [x] Display command output in terminal
- [x] Auto-scroll to latest output
- [x] Focus input on terminal load
- [x] Add welcome message with ASCII art on terminal load
- [x] Add CRT screen effect (optional styling)

### Command History
- [x] Implement arrow key navigation (up/down)
- [x] Store command history in array
- [x] Navigate through previous commands

## Phase 4: Terminal Commands (TerminalView.tsx)
### Core Commands
- [x] `help` - List all available commands with descriptions
- [x] `about` - Display personal bio and background
- [x] `projects` - List projects with descriptions (with data integration)
- [x] `skills` - Display technical skills categorized
- [ ] `resume` - Provide link or display resume content
- [x] `contact` - Show contact information with links
- [x] `clear` - Clear terminal screen
- [x] `gui`/`exit` - Return to GUI mode

### Command Processing
- [x] Create command-function mapping via switch statement
- [x] Implement command parser (trim, lowercase)
- [x] Handle invalid/unknown commands gracefully
- [ ] Add command suggestions for typos (optional)
- [x] Display error messages for invalid commands
- [x] Integrate with React hooks for dynamic data

## Phase 5: Content & Integration
- [x] Set up custom React hooks for data (useProjects, useSkills, useExperience)
- [x] Create data structure with TypeScript types
- [ ] Add real project data (currently using placeholder/demo data)
- [ ] Add complete skills list (currently using placeholder data)
- [ ] Write professional about/bio content
- [ ] Link GitHub repositories with real URLs
- [ ] Add live demo links where available
- [ ] Include real work experience data
- [x] Ensure content consistency between GUI and terminal
- [x] Implement data fetching with React Query

## Phase 6: Polish & Quality
### Accessibility
- [x] Add proper semantic HTML tags
- [ ] Add alt text for images (placeholders currently)
- [x] Ensure keyboard navigation works everywhere
- [x] Implement keyboard shortcut (Cmd/Ctrl+K) for mode toggle
- [ ] Test with screen readers
- [x] Add ARIA labels where needed
- [x] Ensure sufficient color contrast via theme variables

### Visual Refinement
- [x] Refine color palette with CSS variables
- [x] Fine-tune typography and spacing with Tailwind
- [x] Add smooth transitions/animations with Framer Motion
- [x] Polish button and link styles with hover effects
- [x] Ensure visual consistency across components
- [x] Add background transitions between modes
- [x] Implement CRT terminal effects

### Testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [x] Test all terminal commands
- [x] Test navigation between GUI and terminal
- [ ] Validate HTML and TypeScript compilation
- [ ] Check for console errors

### Performance
- [ ] Optimize page load speed
- [x] Code splitting with Vite
- [x] Lazy loading with React Query
- [ ] Test on slow connections
- [x] Optimize bundle size

## Phase 6.5: Additional Features
- [x] Implement mode toggle component (GUI ↔ Terminal)
- [x] Add Framer Motion page transitions
- [x] Create custom portfolio data hooks
- [x] Set up React Query for data management
- [x] Implement theme variables for consistent styling
- [x] Add TypeScript throughout the project
- [x] Configure shadcn/ui component library
- [x] Set up project structure with client/server separation
- [ ] Add dark/light theme toggle (currently single theme)

## Phase 7: Static Deployment
- [ ] Create GitHub repository
- [ ] Add .gitignore file
- [ ] Add README.md with project description
- [ ] Push all files to repository
- [ ] Deploy to hosting platform (Vercel/Netlify/GitHub Pages)
- [ ] Configure build settings for Vite
- [ ] Verify deployment works correctly
- [ ] Test all links and functionality on live site
- [ ] Share portfolio URL
- [ ] Ensure all assets load correctly

## Future Scope (Not Part of Current Build)
- [ ] Add backend-powered contact form with email integration
- [ ] Store analytics data
- [ ] Convert project data to API-driven content
- [ ] Add CMS for easy content updates
- [ ] Implement blog section
- [ ] Add more terminal commands (e.g., `socials`, `resume download`)
- [ ] Enhanced animations and transitions
- [ ] Add more interactive terminal features
