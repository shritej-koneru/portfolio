# Design Document

## Design Philosophy
- Clarity over decoration
- Terminal is optional, not forced
- Professional first impression

## Layout Overview

### Minimal Website
- Header with name and role
- Hero section with short summary
- Projects section (cards or list)
- Resume download button
- Open Terminal button
- Footer with contact links

### Terminal Interface
- Full-screen dark UI
- Monospace font
- Blinking cursor
- Scrollable output
- Fixed input line

## Terminal Design Intent
- The terminal interface is designed as an exploratory and informational tool, not a simulation of a real shell environment.

## Interaction Design
- Click “Open Terminal” to enter terminal mode
- Type commands and press Enter
- Arrow keys for command history
- `exit` command returns to website

## Typography
- Minimal site: Inter / Poppins (sans-serif)
- Terminal: JetBrains Mono / Fira Code

## Color Strategy
- Light theme for minimal site
- Dark, low-glare theme for terminal
- Shared accent color for consistency

## Accessibility Guidelines
- Minimum color contrast ratio of 4.5:1
- Keyboard-only navigation supported
- Terminal usable without mouse interaction
- No critical information hidden behind animations
