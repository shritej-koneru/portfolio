# Product Requirement Document (PRD)
## Hybrid Developer Portfolio (Minimal + Terminal Interface)

## Purpose
To build a personal developer portfolio that combines a clean, minimal website for recruiters with an optional interactive terminal interface for technical users.

## Product Type
This product is a static, client-side web application designed as an interactive landing page. It does not include backend services or persistent data storage.

## Problem Statement
Most portfolios are either visually cluttered or too generic. Recruiters want clarity and speed, while engineers want depth and technical proof. This portfolio solves both by separating the experience into two layers.

## Target Users
1. Recruiters / HR – quick access to resume and projects
2. Engineers / Interviewers – explore technical depth
3. Developers / Peers – inspect structure and interaction

## Core Features
- Minimal, professional landing page
- Projects showcase with links
- Resume download
- Optional terminal interface
- Command-based navigation in terminal
- Easy exit from terminal mode

## Functional Requirements
### Minimal Website
- Loads fast
- Fully usable without terminal
- Responsive on all devices

### Terminal Interface
- Accepts typed commands
- Shows helpful error messages
- Commands map to real content
- No backend dependency

## Non-Functional Requirements
- Accessibility compliant
- High performance
- Simple maintainable structure
- Compatible with GitHub Pages

## Success Metrics
- Resume accessible within 2 clicks
- Terminal loads in under 1 second
- Projects visible via both UI and terminal
- Portfolio loads fully in under 1 second on average connections
- All core information accessible without JavaScript-heavy interaction
- Terminal commands respond instantly without page reloads

## Non-Goals
- User authentication
- Data persistence or databases
- Backend APIs
- Form submissions requiring server processing
