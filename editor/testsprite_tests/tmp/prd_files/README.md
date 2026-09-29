# Editor Project — README

## Overview

This project follows a **feature-based, scalable React + TypeScript architecture** designed for an editor application with authentication, dashboard, document workspace, AI assistance, and reusable UI components.

## Project Structure

```text
src/
├── app/          # Application configuration, routing, guards, layouts
├── shared/       # Reusable APIs, components, hooks, utilities and types
└── features/     # Business features/modules
    ├── auth/     # Authentication and user access
    ├── dashboard/ # Dashboard and analytics
    └── editor/   # Main document editor and workspace
```

## Architecture

### `app/`

Contains application-level configuration and infrastructure.

* **config/** — environment, navigation, roles, permissions and constants
* **guards/** — authentication, role, permission and workspace protection
* **layouts/** — root, authentication, dashboard and editor layouts
* **providers/** — global React providers
* **router/** — application routes, lazy loading and route paths

### `shared/`

Contains reusable code that can be used across multiple features.

* **api/** — Axios/API client and interceptors
* **components/** — reusable UI components
* **hooks/** — shared React hooks
* **lib/** — shared libraries/helpers
* **types/** — common TypeScript types
* **utils/** — utility functions
* **constants/** — shared application constants
* **assets/** — static assets

### `features/`

Contains independent business modules.

#### `auth/`

Responsible for:

* Login
* Registration
* Password recovery
* Authentication state
* Auth API/repository/service
* Validation schemas
* Auth-specific components and hooks

#### `dashboard/`

Responsible for:

* Dashboard page
* Statistics
* Revenue/analytics
* Recent activity
* Dashboard API, repository and services
* Dashboard-specific hooks and components

#### `editor/`

Responsible for the complete document editing experience.

Includes:

* Editor API, repository and services
* Editor and workspace state
* Editor contexts and hooks
* Editor page and layout
* Header and navigation
* Left/right overlays
* Document workspace
* AI assistant panel
* Status bar and zoom controls
* Document-related modules such as writing, tables, figures, references, styles, templates and settings

## Editor Layout

```text
┌─────────────────────────────────────────────────────────────┐
│                       Editor Header                         │
├──────┬──────────────────┬───────────────────────┬───────────┤
│ ICON │   Left Overlay   │  Document Workspace   │ AI Panel  │
│ BAR  │ Document/Writing │   PDF/DOCX Viewer     │           │
│      │ Tables/etc.      │                       │           │
├──────┴──────────────────┴───────────────────────┴───────────┤
│                    Status Bar / Footer                      │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

* **Feature-based architecture**
* **Separation of UI, business logic and API layers**
* **Reusable shared components**
* **Type-safe TypeScript**
* **Lazy-loaded routes**
* **Centralized authentication and permissions**
* **Independent feature modules**
* **Scalable editor/workspace architecture**

### Folder Responsibility

```text
API → Repository → Service → Hook/Context → Component → Page
```

This structure keeps the application **maintainable, testable and scalable** as new editor modules and business features are added.
If you mean the **next README section**, I’d add the **Editor folder README** next:

# Editor Feature

The `editor` feature contains the complete document-editing workspace, including document viewing, workspace management, AI assistance, panels, navigation, and editor state.

```text
editor/
├── api/          # Editor API communication
├── repository/   # Data access layer
├── services/     # Editor business logic
├── hooks/        # Editor and workspace hooks
├── context/      # Editor/workspace state
├── pages/        # Editor pages
├── layouts/      # Editor-specific layouts
├── components/   # Editor UI components
├── modules/      # Functional editor modules
├── types/        # Editor TypeScript types
├── schemas/      # Validation schemas
├── utils/        # Editor utilities
├── constants/    # Editor constants
└── index.ts      # Public exports
```

### Main Editor Areas

* **Header** — user profile, workspace switching and actions
* **Sidebar** — editor navigation and panel selection
* **Left Overlay** — document, writing, tables, figures, references, etc.
* **Workspace** — document canvas and PDF/DOCX viewport
* **AI Panel** — AI chat, history and assistance
* **Footer** — word count, document status and zoom controls

### Data Flow

```text
Component
    ↓
Hook / Context
    ↓
Service
    ↓
Repository
    ↓
API
```

This keeps **UI, state management, business logic and API communication separated**, making the editor easier to maintain and extend.
### Next: `modules/` README section

The `modules` folder contains the **functional editor modules**. Each module represents a specific document-editing capability and should remain independent from the core editor workspace.

```text
modules/
├── links/          # Hyperlinks and link management
├── writing/        # Writing and text-editing tools
├── styles/         # Document styles and formatting
├── tables/         # Table creation and editing
├── figures/        # Images, figures and captions
├── references/     # References and citations
├── symbols/        # Special characters and symbols
├── appendices/     # Appendix management
├── trackChanges/   # Change tracking and review
├── templates/      # Document templates
├── auditTrail/     # Document activity/history
├── settings/       # Editor settings
├── ai/             # AI-powered editor features
└── workspace/      # Workspace-specific functionality
```

### Module Principle

Each module should contain only the functionality related to its domain and should communicate with the core editor through **hooks, contexts, services, and shared types**.

```text
Editor
  │
  ├── Workspace
  ├── Document
  ├── Modules
  │    ├── Writing
  │    ├── Tables
  │    ├── References
  │    ├── Track Changes
  │    └── AI
  │
  └── Shared Components
```

**Goal:** Keep every editor capability **modular, reusable, testable, and easy to extend** without affecting the core editor architecture.
# Project Folder Structure

A **scalable, feature-based React + TypeScript architecture** designed for maintainability, separation of concerns, and easy future expansion.

## Architecture

```text
src/
├── app/        # Application configuration, routing, guards & layouts
├── shared/     # Reusable components, utilities, APIs, hooks & types
└── features/   # Business features such as Auth, Dashboard & Editor
```

## `app/`

Handles application-level configuration and infrastructure.

* **config/** — environment, navigation, roles, permissions and constants
* **guards/** — authentication, authorization and workspace access control
* **layouts/** — Root, Auth, Dashboard and Editor layouts
* **providers/** — global application and query providers
* **router/** — route definitions, lazy loading and route paths

## `shared/`

Contains reusable code that is independent of a specific business feature.

* **api/** — Axios client, API configuration and interceptors
* **assets/** — shared images, icons and static assets
* **components/** — reusable UI and common components
* **hooks/** — reusable application hooks
* **lib/** — shared libraries and integrations
* **types/** — global TypeScript types
* **utils/** — helper and utility functions
* **constants/** — application-wide constants

## `features/`

Contains isolated business modules.

### `auth/`

Responsible for authentication and user access.

```text
api/
repository/
services/
hooks/
context/
pages/
components/
schemas/
types/
utils/
constants/
index.ts
```

Handles login, registration, password recovery, authentication state and related validation.

### `dashboard/`

Responsible for dashboard functionality.

```text
api/
repository/
services/
hooks/
pages/
components/
schemas/
types/
utils/
constants/
index.ts
```

Handles dashboard data, statistics, charts, activities and dashboard UI.

### `editor/`

Responsible for the document/editor workspace.

```text
api/
repository/
services/
hooks/
context/
pages/
layouts/
components/
modules/
types/
schemas/
utils/
constants/
index.ts
```

The Editor is structured around:

```text
Header
  ↓
Sidebar / Left Overlay
  ↓
Document Workspace
  ↓
AI Support Panel
  ↓
Status Bar / Footer
```

The editor modules can contain:

```text
links/
writing/
styles/
tables/
figures/
references/
symbols/
appendices/
trackChanges/
templates/
auditTrail/
settings/
ai/
workspace/
```

## Design Principles

* **Feature-based architecture** — business logic stays within its feature.
* **Separation of concerns** — UI, API, repository and service layers remain separate.
* **Reusable shared layer** — common functionality is centralized in `shared/`.
* **Scalable structure** — new features can be added without restructuring existing modules.
* **Type safety** — TypeScript types define clear contracts between layers.
* **Centralized routing & permissions** — application access is controlled through guards and router configuration.
* **Clean exports** — feature-level `index.ts` files provide controlled public APIs.

> **Rule:** Feature-specific code belongs inside its feature. Only genuinely reusable code should be placed inside `shared/`.
