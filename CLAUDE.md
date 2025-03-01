# CLAUDE.md - Guidelines for Postit Notes App

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint codebase
- `npm run lint -- --fix` - Fix linting issues automatically

## Code Style Guidelines
- **Imports**: Group imports by type (React, external libs, internal modules)
- **TypeScript**: Use strict typing with interfaces for complex objects
- **Components**: Use functional components with React hooks
- **State Management**: Use React's useState/useContext for state
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **Callbacks**: Use useCallback for functions passed as props
- **Error Handling**: Use try/catch blocks for async operations
- **CSS**: Use CSS modules with meaningful class names
- **File Structure**: Keep related files close, follow Next.js app directory conventions
- **Event Handlers**: Prefix with 'handle' (handleClick, handleDrag)

This app is a Next.js TypeScript project with TailwindCSS for a drag-and-drop sticky notes application.