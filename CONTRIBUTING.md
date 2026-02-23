# Contributing to LA.IO Badge Builder

Thank you for your interest in contributing to the LA.IO Badge Builder! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:

- Age, body size, disability, ethnicity, gender identity
- Experience level, nationality, personal appearance
- Race, religion, or sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Professional misconduct
- Any conduct inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork locally

2. **Clone and install**
   ```bash
   git clone https://github.com/YOUR_USERNAME/badge-builder.git
   cd badge-builder
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   - Open http://localhost:3000
   - Test customization features
   - Check browser console for errors

---

## 💻 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/dark-mode`)
- `fix/*` - Bug fixes (e.g., `fix/color-validation`)
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Sync with latest changes
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Development Cycle

1. **Make changes**
   - Write code
   - Test locally
   - Check browser console for errors

2. **Format and lint**
   ```bash
   npm run format
   npm run lint:fix
   ```

3. **Test thoroughly**
   - Test in Chrome, Firefox, Safari
   - Test on mobile devices
   - Test keyboard navigation
   - Test screen reader compatibility

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add dark mode toggle"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📝 Coding Standards

### JavaScript Style

- Use ES6+ features
- Prefer `const` over `let`, never use `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Add JSDoc comments for functions

**Example:**

```javascript
/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(/[<>]/g, '');
}
```

### HTML Standards

- Use semantic HTML5 elements
- Include ARIA attributes for accessibility
- Maintain heading hierarchy (h1 → h2 → h3)
- Always include `alt` text for images

### CSS Standards

- Use CSS custom properties (variables)
- Follow mobile-first approach
- Use meaningful class names
- Keep specificity low
- Use transitions for smooth interactions

**Example:**

```css
/* Good */
.card {
  background: var(--card-bg);
  transition: border-color var(--transition-base);
}

.card:hover {
  border-color: var(--accent);
}

/* Avoid */
div.container > div.card-wrapper > div.card { }
```

### Accessibility Requirements

**All contributions must:**
- Support keyboard navigation
- Include ARIA labels where needed
- Maintain color contrast ratios (WCAG AA)
- Work with screen readers
- Have visible focus indicators

**Test with:**
- Tab key navigation
- Screen reader (NVDA, JAWS, VoiceOver)
- Axe DevTools browser extension

### Security Requirements

**Always:**
- Validate and sanitize user input
- Escape HTML output
- Use Content Security Policy
- Avoid `eval()` and `innerHTML` with user data
- Check dependencies for vulnerabilities

```bash
# Before submitting PR
npm audit
```

---

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(colors): add custom hex color input

# Bug fix
fix(validation): prevent XSS in slug input

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(preview): extract render logic to separate function

# Performance
perf(fonts): convert TTF to WOFF2 for faster loading
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues in footer: "Fixes #123"

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Ran `npm run format` and `npm run lint:fix`
- [ ] All tests pass (if applicable)
- [ ] Tested in multiple browsers
- [ ] Tested keyboard navigation
- [ ] Updated documentation if needed
- [ ] Added comments for complex logic
- [ ] No console.log statements left in code

### PR Title Format

Follow commit message format:

```
feat(colors): add dark mode support
fix(badge): resolve tracking pixel issue
docs(contributing): add PR checklist
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] Tested keyboard navigation
- [ ] Tested with screen reader

## Screenshots
(If UI changes, add before/after screenshots)

## Related Issues
Fixes #123
```

### Review Process

1. **Automated checks run**
   - Linting
   - Build verification
   - (Future: tests)

2. **Code review**
   - Maintainer reviews code
   - May request changes
   - Discussion in PR comments

3. **Approval and merge**
   - Once approved, maintainer merges
   - Branch is automatically deleted

---

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** - bug may already be reported
2. **Test on latest version** - bug may already be fixed
3. **Try to reproduce** - ensure it's not environment-specific

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.0]
- Device: [e.g., iPhone 15, Desktop]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Before Requesting

1. **Search existing requests** - may already exist
2. **Consider scope** - should it be a core feature?
3. **Think about users** - who benefits from this?

### Feature Request Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Mockups, examples, or related features

**Who Benefits**
Which users would use this feature?
```

---

## 🎨 Design Contributions

We welcome design improvements!

### Design Guidelines

- Follow existing visual style
- Use Aktiv Grotesk typography
- Respect LA.IO brand colors
- Maintain accessibility standards
- Consider mobile/tablet/desktop views

### Submitting Designs

1. Create mockups (Figma, Sketch, etc.)
2. Open an issue with designs attached
3. Explain rationale and use cases
4. Wait for feedback before implementing

---

## 📞 Questions?

- **Email**: info@la.io
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions help make the Louisiana Innovation community stronger. We appreciate your time and effort!

**The Future Flows Through Louisiana**

---

**Last Updated**: November 2025
