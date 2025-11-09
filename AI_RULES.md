# AI Rules for Amdora DLC Control System

This document outlines the core technologies and library usage guidelines for the Amdora DLC Control System.

## Tech Stack Description

*   **React**: A JavaScript library for building user interfaces, providing a component-based architecture.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Vite**: A fast build tool that provides an instant development server and optimized builds for production.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of reusable components built with Radix UI and styled with Tailwind CSS, providing a consistent and accessible UI.
*   **React Router**: A standard library for routing in React applications, enabling navigation between different views.
*   **TanStack Query**: A powerful library for managing, caching, and synchronizing server state in React applications.
*   **Lucide React**: A library providing a set of beautiful, customizable SVG icons for React projects.
*   **date-fns**: A comprehensive and lightweight JavaScript date utility library for parsing, formatting, and manipulating dates.
*   **Zod & React Hook Form**: `react-hook-form` is used for efficient form management, and `zod` is used for schema-based form validation.
*   **Sonner**: A modern toast library for displaying notifications to the user.

## Library Usage Rules

To maintain consistency and leverage the existing ecosystem, please adhere to the following library usage rules:

*   **UI Components**: Always use components from `shadcn/ui` for all user interface elements (e.g., buttons, inputs, tables, dialogs, cards, selects, tabs). If a specific component is not available in `shadcn/ui`, create a new component following the `shadcn/ui` styling conventions (Tailwind CSS and Radix UI primitives if applicable).
*   **Icons**: Use icons exclusively from the `lucide-react` library.
*   **Routing**: Manage all application routing using `react-router-dom`. Keep route definitions within `src/App.tsx`.
*   **State Management**:
    *   For server-side data fetching, caching, and synchronization, use `@tanstack/react-query`.
    *   For local component state, use React's built-in `useState` and `useReducer` hooks.
*   **Form Handling**: Implement all forms using `react-hook-form` for state management and validation. For schema validation, use `zod`.
*   **Styling**: Apply all styling using Tailwind CSS classes. Avoid writing custom CSS unless absolutely necessary for complex, non-component-specific styles.
*   **Date Manipulation**: Use `date-fns` for any date parsing, formatting, or calculations.
*   **Toast Notifications**: For displaying user feedback and notifications, use the `sonner` library.