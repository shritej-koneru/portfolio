# Tech Rules & Stack Definition

## Application Scope
This project is a static, client-side application with no backend services, databases, or server-side logic.

## Core Technologies
- HTML5
- CSS3
- Vanilla JavaScript

## Styling Rules
- Use CSS variables
- Separate CSS for minimal site and terminal
- No inline styles

## JavaScript Rules
- No frameworks
- Modular JS files
- Commands handled via command-function mapping
- Clear, readable logic

## JavaScript Constraints
- No external JS frameworks or libraries
- No eval or dynamic code execution
- All command logic must be deterministic
- State must be reset on page reload

## Folder Structure
portfolio/
├── index.html
├── terminal.html
├── css/
│   ├── main.css
│   └── terminal.css
├── js/
│   ├── main.js
│   └── terminal.js
├── assets/
│   └── resume.pdf

## Hosting Rules
- Must work on GitHub Pages
- No backend services
- Static assets only

## Code Quality
- Meaningful function names
- No unused files
- Comments only when necessary

## Hosting & Deployment
- Designed for static hosting (GitHub Pages, Netlify)
- Must work without server-side configuration
