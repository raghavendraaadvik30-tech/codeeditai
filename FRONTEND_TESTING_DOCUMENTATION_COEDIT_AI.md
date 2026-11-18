# FRONTEND TESTING DOCUMENTATION: COEDIT.AI
## Comprehensive Quality Assurance & Manual Test Specification (Admin & Editor Modules)

---

## 1. PROJECT OVERVIEW

**CoEdit.ai** (internally branded as *DocuPilot* / *Smart Authoring Suite*) is an enterprise-grade document editing, regulatory authoring, and workspace administration platform built with a modern single-page application (SPA) architecture in React, TypeScript, and Tailwind CSS.

The application delivers two core operational domains:
1. **Admin Module (System Administration Portal):** A centralized operational interface for administrators to monitor system-wide statistics, manage registered users, administer user roles (Administrators vs. Authors), configure security credentials, export audit reports, and manage administrative profile settings.
2. **Editor Module (Document Editor & Authoring Suite):** An advanced web-based WYSIWYG rich-text document authoring environment featuring a multi-page document pagination engine, an Office-style Ribbon toolbar (Home, Insert, Layout, Review, and contextual Header & Footer tabs), an expandable icon rail with specialized sidebar panels (Document Management, Links & Internal References, Writing Tools, Tables, Figures, References, Symbols, Appendices, Track Changes, and Author Settings), a split-screen AI writing assistant, an interactive Find & Replace system, and multi-format document export/import workflows.

This documentation serves as the **definitive, exhaustive frontend testing specification** for CoEdit.ai, formulated directly from static and structural code inspection of the production repository.

---

## 2. TESTING OBJECTIVES

The primary objectives of this frontend testing specification are:
1. **Functional Integrity:** Verify that every user interface component, button, combobox, modal, accordion, and input field performs according to its client-side state machine and design specification.
2. **Visual & Design System Fidelity:** Validate adherence to the established design tokens, typography scales, color schemes (soft blues `#EEF7FF`, `#D3E3FC`, brand navy `#324480`, `#172033`), dark mode variables, border radiuses, and spacing conventions.
3. **Selection & State Synchronization:** Ensure the document editor maintains synchronized toolbar states (such as active font family, font size, bold/italic, alignment, line spacing) reflecting real-time DOM selection ranges, caret movements, and multi-node text selections (including mixed formatting states).
4. **Form & Data Validation:** Verify rigorous client-side input validation across user creation, password modification, search queries, custom margin inputs, paper size specifications, and hyperlink formatting.
5. **Cross-Device & Viewport Responsiveness:** Guarantee seamless layout adaptations, panel resizing, toolbar wrapping, modal centering, and canvas scaling across standard desktop, laptop, tablet, and mobile viewports.
6. **Accessibility (a11y):** Ensure accessibility compliance based on WCAG 2.1 AA guidelines, including keyboard tab navigation, ARIA attributes, semantic markup, focus rings, and high-contrast color ratios.

---

## 3. TESTING SCOPE

This specification strictly encompasses **client-side frontend testing**, including:
- **Routing & Navigation:** Verification of URL routes, child routes, redirects, layout wrappers, and role-based client routing guards.
- **UI & Component Rendering:** Visual presentation of headers, sidebars, cards, modals, dropdowns, tables, progress indicators, canvas pages, and status bars.
- **User Interactions:** Mouse clicks, drags, resizable panels, combobox typing, selection highlights, keyboard shortcuts, and accordion toggling.
- **Client-Side State Management:** LocalStorage persistence (e.g., sidebar collapse state, theme toggle, active document cache, undo/redo history stacks).
- **Form Validations:** Real-time feedback, dirty states, invalid submission blocks, and success banners.
- **Responsive & Layout Testing:** Validation across 6 distinct screen resolutions and breakpoints.
- **Browser Compatibility:** Cross-engine rendering across Chromium, Gecko, and WebKit browsers.

---

## 4. OUT OF SCOPE

The following backend, architectural, and non-frontend areas are explicitly excluded from this test plan:
- Backend REST API endpoint implementations and server health checks.
- Database transactions, PostgreSQL schemas, and Go ORM queries.
- Server-side JWT token generation, signature validation, and refresh rotation algorithms.
- Server-side email delivery servers (SMTP / SendGrid).
- Infrastructure stress testing, DDoS resilience, and Kubernetes pod auto-scaling.
- Direct hardware printer integration (testing verifies client-side `window.print()` triggers only).

---

## 5. TECHNOLOGY STACK (VERIFIED FROM CODEBASE)

The frontend application stack was verified directly from `editor/package.json` and project source configurations:

| Category | Technology / Package | Version | Purpose in Application |
|---|---|---|---|
| **Core Framework** | React | `^19.2.6` | Component model, reactive rendering, hooks |
| **DOM Engine** | React DOM | `^19.2.6` | Client-side DOM mounting and reconciliation |
| **Language** | TypeScript | `~6.0.0` | Strict static typing, type definitions, interfaces |
| **Build Tool & Bundler** | Vite | `^8.1.5` | Fast HMR dev server and Rolldown/Vite production bundler |
| **Styling & CSS** | Tailwind CSS | `^4.0.0` | Utility-first CSS engine with `@tailwindcss/vite` |
| **CSS Animations** | `tw-animate-css` / `tailwindcss-animate` | `^1.4.0` | Micro-interactions, slide-ins, and transitions |
| **Client Routing** | `react-router-dom` | `^7.18.1` | Declarative client routing, nested layouts, guards |
| **State Management** | Zustand | `^5.0.14` | Global reactive stores (`useUsersStore`, `navigationStore`) |
| **Server State** | TanStack React Query | `^5.101.4` | Asynchronous query caching and data synchronization |
| **Form Handling** | React Hook Form | `^7.82.0` | Controlled/uncontrolled form states, validation lifecycle |
| **Schema Validation** | Zod | `^4.4.3` | Object schema validation and runtime type coercion |
| **Form Resolvers** | `@hookform/resolvers` | `^5.4.0` | Seamless bridge connecting React Hook Form with Zod schemas |
| **Iconography** | `lucide-react` | `^1.28.0` | High-consistency SVG iconography |
| **UI Primitives** | Radix UI / Shadcn / Base UI | Various | Accessible dialogs, popovers, dropdowns, selects, tabs |
| **Spreadsheet Engine**| `xlsx` (SheetJS) | `^0.18.5` | Client-side workbook parsing and Excel data export |
| **Data Visualization**| Recharts | `^3.8.0` | Charting engine for figures and document data visualization |
| **PDF Processing** | `pdfjs-dist` | `^6.4.299` | Client-side PDF parsing and text/canvas extraction |
| **Packaging / Zip** | JSZip | `^3.10.2` | Document package extraction and archive bundling |

---

## 6. FRONTEND PROJECT STRUCTURE

The project is structured under the `editor/src/` hierarchy using domain-driven modular boundaries:

```text
editor/
├── public/                     # Static assets (favicons, manifests)
├── src/
│   ├── app/
│   │   ├── config/             # Navigation mappings, roles, permissions, constants
│   │   ├── guards/             # AuthGuard, GuestGuard, RoleGuard, PermissionGuard
│   │   ├── layouts/            # DashboardLayout, EditorLayout, AuthLayout, RootLayout, SuperAdminLayout
│   │   ├── providers/          # AppProvider, QueryProvider, ThemeProvider
│   │   ├── router/             # routes.tsx, routePaths.ts, LazyRoutes.ts, index.tsx
│   │   ├── App.tsx             # Root application wrapper
│   │   └── main.tsx            # DOM bootstrap entry point
│   ├── assets/                 # Shared images, company logos, branding
│   ├── features/
│   │   ├── auth/               # Login, ForgotPassword, ResetPassword
│   │   ├── dashboard/          # Admin Overview, UserManagement components & stores
│   │   ├── editor/             # Complete WYSIWYG Document Editor Feature
│   │   │   ├── components/     # Header, Ribbon, IconSidebar, Overlay, Workspace, StatusBar, AI
│   │   │   ├── context/        # EditorContext, AuditContext
│   │   │   ├── layouts/        # EditorLayout
│   │   │   ├── modules/        # Modular editor subsystems:
│   │   │   │   ├── ai/         # AI Assistant Chat & Quick Actions
│   │   │   │   ├── document/   # Document Page, FindReplace, Breaks, WordCount, Export
│   │   │   │   ├── figures/    # Image uploads, Charts, SmartArt
│   │   │   │   ├── links/      # WebUrl, Email, Bookmarks, Cross-References
│   │   │   │   ├── reference/  # Citations, Bibliography, Sources
│   │   │   │   ├── settings/   # Editor author preferences & tolerances
│   │   │   │   ├── styles/     # Heading presets, typography styling
│   │   │   │   ├── symbols/    # Greek symbols, math operators, regulatory marks
│   │   │   │   ├── tables/     # Table wizard, floating toolbar, cell formatting
│   │   │   │   ├── trackChanges/# Revision history, accept/reject diff engine
│   │   │   │   └── writing/    # Casing, formatting, highlight, alignment, line spacing, lists
│   │   │   ├── pages/          # EditorPage entry
│   │   │   ├── services/       # DocumentService, PrintService
│   │   │   ├── store/          # documentModel.tsx (Core multi-page document store)
│   │   │   └── utils/          # File import/export parsers, DOM utilities
│   │   └── super-admin/        # Super-Admin tenant, branch, workspace & activity management
│   ├── shared/                 # Reusable UI primitives, stores (usersStore), theme hooks
│   └── styles/                 # global.css, variables.css, editor.css, dashboard.css
```

---

## 7. APPLICATION ROUTING OVERVIEW

Client-side routing is managed through `react-router-dom` in `editor/src/app/router/routes.tsx`. Access is controlled via hierarchical guards:

```text
RootLayout (/)
 │
 ├── [RootRedirector] -> Redirects based on role (Admin -> /dashboard, Author -> /editor, Guest -> /login)
 │
 ├── GuestGuard + AuthLayout
 │    ├── /login                     (PortalLoginPage)
 │    ├── /forgot-password           (ForgotPassword)
 │    └── /reset-password            (ResetPassword)
 │
 ├── GuestGuard
 │    └── /super-admin/login         (SuperAdminLogin)
 │
 ├── AuthGuard + DashboardLayout (SYSTEM ADMIN PORTAL)
 │    ├── /dashboard                 (DashboardHome / DashboardOverview - Role: Admin)
 │    └── /dashboard/users           (UsersPage / UserManagement - Role: Admin)
 │
 ├── AuthGuard + EditorLayout (COEDIT.AI DOCUMENT EDITOR)
 │    └── /editor                    (EditorPage - Roles: Admin, Author)
 │
 └── AuthGuard + RoleGuard (SuperAdmin) + SuperAdminLayout
      ├── /super-admin/dashboard     (SuperAdminDashboard)
      ├── /super-admin/users         (SuperAdminUsersPage)
      ├── /super-admin/admins        (AdminsPage)
      ├── /super-admin/branches      (BranchesPage)
      ├── /super-admin/clients       (ClientsPage)
      ├── /super-admin/workspaces    (WorkspacesPage)
      ├── /super-admin/activity      (ActivityTrackingPage)
      ├── /super-admin/notifications (NotificationsPage)
      ├── /super-admin/reports       (ReportsPage)
      ├── /super-admin/sessions      (SecuritySessionsPage)
      ├── /super-admin/subscriptions (SubscriptionsPage)
      └── /super-admin/settings      (SystemSettingsPage)
```

---

## 8. ADMIN MODULE – FRONTEND TESTING

### 8.1 Admin Route Inventory

| Page Name | Exact Route URL | Parent Layout | Role Requirement | Main Component | Key Child Components |
|---|---|---|---|---|---|
| **Admin Overview** | `/dashboard` | `DashboardLayout` | `Role.Admin` | `DashboardHome` (`DashboardOverview.tsx`) | Summary Cards, Role Progress Bars, Active Users Box |
| **User Management** | `/dashboard/users` | `DashboardLayout` | `Role.Admin` | `UsersPage` (`UserManagement.tsx`) | User Table, Add User Modal, View Modal, Invite Modal, Password Modal |
| **Admin Profile Modal** | N/A (Modal overlay) | `DashboardLayout` | `Role.Admin` | `AdminProfileSecurity` | Profile Details Tab, Change Admin Password Tab |

### 8.2 Admin Dashboard (`/dashboard`)
- **Header & Title:** Displays "System Administration Overview" with breadcrumb context.
- **Metric Cards (3 Widgets):**
  1. *Total Registered Users:* Aggregates total items in `useUsersStore()`, displays numeric value with sky-blue icon circle (`Users`).
  2. *Admin Accounts:* Counts users where `role === "Admin"`, displays numeric badge with amber shield (`ShieldCheck`).
  3. *Author Accounts:* Counts users where `role === "Author"`, displays numeric badge with rose file icon (`FileText`).
- **Role Distribution Widget:**
  - Displays dynamic percentage bar for Admins (sky-blue bar with numeric count, separator, and `%`).
  - Displays dynamic percentage bar for Authors (blue/indigo bar with numeric count, separator, and `%`).

### 8.3 Admin Navigation & Sidebar (`DashboardLayout.tsx`)
- **Sidebar Rail:**
  - Default width: `188px` (expanded) or `64px` (collapsed).
  - Toggled via top header hamburger icon (`Menu`); persists state in `localStorage.getItem("sidebarExpanded")`.
  - Brand header displaying DocuPilot logo, title "Docu Pilot", and subtitle "Doc. Prep. Reimagined!".
  - Role-filtered navigation links from `navigation.ts`:
    - `Dashboard` (`/dashboard`) with `LayoutGrid` icon.
    - `Users` (`/dashboard/users`) with `Users` icon.
  - Active route highlighting: white pill background with `#324480` text and soft drop shadow.
  - Bottom section: User workspace pill trigger and "Sign Out" button (`LogOut` icon) calling `logout()`.
- **Top Header Bar:**
  - Sidebar toggle button.
  - Portal title: "SYSTEM ADMIN PORTAL" in bold uppercase tracking.
  - Theme Toggle: Sun/Moon button switching between light (`#EEF7FF`) and dark (`#0B1426`) modes.

### 8.4 User Management Page (`/dashboard/users`)
- **Toolbar & Actions:**
  - Real-time search input with magnifying glass (`Search`) filtering users by name and email.
  - Role Filter dropdown: "All Roles", "Admin", "Author".
  - "Export to Excel" button: Converts current user dataset to `.xlsx` using SheetJS (`XLSX.writeFile`).
  - "+ Add User" primary button opening the user creation dialog.
- **Data Table:**
  - Columns: User (Avatar initials, Full Name, Email), Role (Styled badge: Admin in primary/amber, Author in secondary/indigo), Created Date (formatted with `Calendar` icon), Actions.
  - Row Actions:
    - *View User:* Opens read-only user summary dialog.
    - *Change Password (`KeyRound`):* Opens user password reset modal.
    - *Invite Link (`Share2` / `Copy`):* Generates shareable portal invitation link.
- **Empty & Loading States:**
  - Spinner (`Loader2`) during initial store hydration.
  - Empty state displaying informative illustration when search yields 0 matches.

### 8.5 Admin Form Validation Specifications

#### Form A: Add User Dialog (`addUserFormSchema`)
- **Full Name (`fullName`):**
  - Minimum 3 characters (`"Full Name must contain at least 3 characters"`).
  - Required field.
- **Email (`email`):**
  - Required (`"Email address is required"`).
  - Standard email format (`"Provide a valid email address"`).
- **Password (`password`):**
  - Minimum 6 characters (`"Password must contain at least 6 characters"`).
  - Password visibility toggle (`Eye` / `EyeOff`).
- **Role (`role`):**
  - Radio/Select choice: `"Admin"` or `"Author"`.

#### Form B: Admin Self-Security Dialog (`AdminProfileSecurity`)
- **New Password:**
  - Minimum 8 characters (`"Password must contain at least 8 characters."`).
  - Maximum 72 bytes (`"Password must not exceed 72 bytes."`).
  - Minimum 1 uppercase character (`/[A-Z]/`).
  - Minimum 1 lowercase character (`/[a-z]/`).
  - Minimum 1 number (`/[0-9]/`).
  - Minimum 1 special character (`/[^A-Za-z0-9]/`).
- **Confirm Password:**
  - Must match new password exactly (`"Passwords do not match."`).

---

## 9. EDITOR MODULE – FRONTEND TESTING

### 9.1 Editor Route Inventory

| Page Name | Exact Route URL | Parent Layout | Role Requirements | Main Component | Primary Context Providers |
|---|---|---|---|---|---|
| **CoEdit.ai Document Editor** | `/editor` | `EditorLayout` | `Role.Admin`, `Role.Author` | `EditorPage.tsx` | `DocumentModelProvider`, `EditorProvider`, `HeaderFooterProvider`, `TrackChangesProvider`, `TableProvider`, `FigureProvider`, `AuditProvider` |

### 9.2 Editor Top Header (`EditorHeader.tsx` & `HeaderActions.tsx`)
- **Branding:** Header logo and application name.
- **Document Title:** Editable or auto-saved document title label.
- **Actions:**
  - *Save (`Save`):* Triggers document save with temporary flash indicator.
  - *Save As (`FileDown`):* Opens dialog to save a duplicate under a new name.
  - *Upload Document (`Upload`):* Accepts `.docx`, `.pdf`, `.txt`; verifies 10-document workspace quota.
  - *Print (`Printer`):* Triggers native print preview through `printService`.
  - *Export:* Generates PDF or Word downloads.
  - *User Profile:* Shows author avatar, email, and session controls.

### 9.3 Ribbon Toolbar Subsystem (`RibbonToolbar.tsx`)

#### A. Home Ribbon (`HomeTab.tsx`)
- **Font Family Combobox:**
  - Custom searchable combobox with asynchronous Google Fonts catalog fetching and standard system fonts (`Calibri`, `Arial`, `Times New Roman`, `Georgia`, etc.).
  - Real-time DOM inspection: Synchronizes with caret position and non-collapsed multi-node text selections.
  - **Heterogeneous Formatting Handling:** Displays a blank/placeholder state (`""`) when selected text contains mixed font families.
- **Font Size Combobox:**
  - Direct point value input or dropdown selection (8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72 pt).
  - Converts DOM computed pixel sizes to typographical points (`pt = px * 0.75`).
  - **Mixed Size Handling:** Displays empty placeholder when selection spans multiple font sizes.
- **Undo / Redo Split-Buttons:**
  - Single-click undo (`Ctrl+Z`) and redo (`Ctrl+Y`).
  - Dropdown caret opening undo/redo action history list.
  - Hover highlights multiple historical actions for bulk undo/redo.

#### B. Insert Ribbon (`InsertTab.tsx`)
- **Pages Group:**
  - `Add Page`: Appends a new blank page to the active document section.
  - `Delete Page`: Deletes active page (disabled when document has only 1 page).
- **Page Number Dropdown:**
  - `Top of Page` Submenu: Left, Center, Right page number placement in header.
  - `Bottom of Page` Submenu: Left, Center, Right page number placement in footer.
  - `Format Page Numbers...`: Modal dialog configuring numbering format (`1, 2, 3`, `a, b, c`, `A, B, C`, `i, ii, iii`, `I, II, III`) and section continuation vs. start at value.
  - `Remove Page Numbers`: Clears page numbers from the active section.

#### C. Layout Ribbon (`LayoutTab.tsx`)
- **Margins Dropdown:**
  - Presets: Normal (1 inch / 96px), Narrow (0.5 inch / 48px), Moderate, Wide.
  - Custom Margins Dialog: Precise top, bottom, left, and right margin numeric inputs.
- **Orientation Popover:**
  - Portrait (standard vertical aspect ratio).
  - Landscape (horizontal aspect ratio with width/height transposition).
- **Paper Size Dropdown:**
  - Standard sizes: Letter, Legal, A4, Executive, A5, and Custom Paper Dimensions.
- **Columns Dropdown:**
  - Single column, Two columns, Three columns, Left biased, Right biased.
  - Multi-column balancing, gap spacing, and column break insertion.
- **Watermark Dropdown:**
  - Preset text watermarks (CONFIDENTIAL, DRAFT, SAMPLE, DO NOT COPY).
  - Custom text watermark modal (text, font, size, color, diagonal vs. horizontal).
  - Remove watermark control.
- **Page Color Dropdown:**
  - Interactive theme color palette, standard swatches, and "No Color" reset.
- **Page Borders Dialog:**
  - Comprehensive borders modal: Setting (None, Box, Shadow, 3D, Custom), line styles, border color, point width (1/4 pt to 6 pt), individual side toggles (Top, Bottom, Left, Right), and margin offsets.

#### D. Review Ribbon (`ReviewTab.tsx`)
- **Track Changes Toggle:**
  - Activates revision tracking mode (`Ctrl+Shift+E`).
  - Shows pending changes badge counter.
- **Navigation Controls:**
  - `Prev`: Jumps to and highlights previous tracked revision.
  - `Next`: Jumps to and highlights next tracked revision.
- **Resolution Controls:**
  - `Accept`: Accepts selected revision and merges change into document.
  - `Reject`: Rejects selected revision and reverts DOM node.
  - `Accept All`: Batch accepts all pending revisions across all pages.
  - `Reject All`: Batch rejects all pending revisions.
- **Visual Markup Toggles:**
  - `Show Markup`: Renders green insertions, red strikethrough deletions, and revision flags.
  - `Hide Markup`: Displays clean document preview as if all revisions were accepted.

#### E. Contextual Header & Footer Ribbon (`HeaderFooterTab.tsx`)
- Automatically activates when double-clicking any page header or footer area.
- Controls: Different First Page checkbox, Different Odd & Even Pages checkbox, Link to Previous Section toggle, Header Top Distance slider/input, Footer Bottom Distance slider/input, and "Close Header and Footer" button.

### 9.4 Icon Sidebar & Specialized Overlay Panels (`LeftOverlay.tsx`)

#### 1. Document Management Panel (`modules/document/pages/DocumentPage.tsx`)
- **Document List:** Searchable list of saved documents (title, page count, saved timestamp, unsaved indicator).
- **Delete Document:** Trash button triggering modal confirmation.
- **Workspace Limits:** Alerts author when reaching the 10-document storage threshold.
- **Accordions:**
  - *Breaks:* Page Break, Line Break, Column Break.
  - *Navigation (Find & Replace):*
    - Find input with live counter (`Match X of Y`).
    - Replace input.
    - Action buttons: Find Next, Replace, Replace All, Cancel.
    - Soft yellow (`#fef08a`) highlight on all matches, dark yellow (`#facc15`) with outline on active match, auto-scroll to view.
  - *Document Utilities:* Word count stats (words, characters, paragraphs, pages) and document permissions.

#### 2. Links & References Panel (`modules/links`)
- Sub-tabs: **Web URL** and **Email**.
- *Web URL Tab:*
  - Link Text input.
  - Web Address input with URL syntax validation.
  - "Open link in new browser tab" checkbox (`target="_blank"`).
  - Light-blue styled "Insert Link ->" button (`bg-[#D9E8FF] text-[#1E3A8A]`).
- *Email Tab:*
  - Recipient Email input with asterisk indicator and email format validation.
  - Subject input.
  - Message textarea.
  - "Send to Gmail" primary button generating sanitized `mailto:` link.
- *Bare Links Section:* Converts raw unlinked URLs in document into clickable hyperlinks.
- *Links History:* Lists recently inserted hyperlinks with single-click remove and refresh controls.

#### 3. Writing Panel (`modules/writing/components/WritingPanel.tsx`)
- Search filter for writing controls.
- *Casing:* Sentence Case, lowercase, UPPERCASE, Capitalize Each Word.
- *Formatting:* Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Strikethrough, Superscript, Subscript.
- *Font Color:* Color swatch palette with hex codes.
- *Text Highlight:* Yellow, Green, Cyan, Pink, Orange swatches + "Remove" pill button.
- *Paragraph Alignment:* Left, Center, Right, Justify buttons.
- *Line Spacing:* Dropdown providing options: `1.0`, `1.15`, `1.5`, `2.0`, `2.5`, `3.0`.
- *Lists & Indentation:* Bullet lists (disc, circle, square), Numbered lists (numeric, alpha, roman), Increase Indent, Decrease Indent.

#### 4. Tables Panel (`modules/tables`)
- Interactive grid selector for rapid table dimension insertion (rows × columns).
- Table style templates, header row toggle, banded rows toggle.
- Floating table formatting toolbar on table selection.

#### 5. Track Changes & Revisions Panel (`modules/trackChanges`)
- List of all tracked modifications categorized by author and timestamp.
- Side-by-side diff comparison card.

### 9.5 Document Canvas & Workspace (`Workspace.tsx`)
- Multi-page virtualized rendering layout with real-time CSS page break isolation.
- Canvas background: `#EEF7FF` in light mode, `#0B1426` in dark mode.
- Base text color: Strictly defaults to black (`#000000`) in light mode and white (`#ffffff`) in dark mode.
- Interactive Headers & Footers:
  - Clean and empty by default (no unwanted default branding strings).
  - Default page numbering disabled until explicitly inserted.
- Resizable left drawer rail with drag handle (`col-resize`) constrained between 240px and `window.innerWidth - 450px`.

### 9.6 AI Assistant Panel (`AIPanel.tsx`)
- Slide-in drawer toggled from editor header.
- Quick Actions: Summarize, Fix Grammar & Spelling, Improve Tone, Make Shorter, Make Longer.
- Interactive multi-turn chat input with context-aware selection injection.

### 9.7 Status Bar (`EditorStatusBar.tsx`)
- Active page and total pages indicator (`Page X of Y`).
- Real-time word count and character count calculator.
- Track Changes indicator badge.
- View Mode Switcher: "Read Mode" (full-window distraction-free two-page book spread with keyboard arrow and mouse-wheel navigation).
- Zoom Engine: Zoom Out (`-`), Zoom In (`+`), Zoom Slider (50% to 200%), and reset to 100%.

---

## 10. COMMON UI COMPONENTS TESTING

| Component Name | File Path | States to Test | Interactions |
|---|---|---|---|
| **RibbonSelect** | `editor/src/features/editor/components/ribbon/controls/RibbonSelect.tsx` | Idle, Focused, Open, Disabled, Filtered, Empty/Mixed | Click toggle, text search/autocomplete, arrow key navigation, Enter to commit, Escape to cancel |
| **RibbonButton** | `editor/src/features/editor/components/ribbon/controls/RibbonButton.tsx` | Default, Hover, Active, Disabled, Selected | Click trigger, tooltips, icon alignment |
| **RibbonDivider** | `editor/src/features/editor/components/ribbon/controls/RibbonDivider.tsx` | Light mode, Dark mode | Visual border rendering between toolbar groups |
| **ThemeToggle** | `editor/src/shared/components/theme/themeToggle.tsx` | Light (Sun), Dark (Moon) | Click to toggle theme, persistence in `localStorage` |
| **Dialog / Modal** | `editor/src/shared/components/ui/dialog.tsx` | Open, Close, Backdrop blur, Exit animations | Click outside backdrop, Escape key press, X button click |
| **Input & Select** | `editor/src/shared/components/ui/input.tsx`, `select.tsx` | Default, Focus, Error, Disabled, Placeholder | Keyboard input, validation borders, select item clicks |

---

## 11. NAVIGATION & ROUTING TEST CASES

| Test Case ID | Module | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `TC-NAV-001` | Core | Root Redirect | `/` | Root Redirector | Unauthenticated root visit | User is logged out | 1. Open browser.<br>2. Navigate to `/`. | None | User is redirected immediately to `/login`. | | Not Executed | High | Core entry redirect |
| `TC-NAV-002` | Core | Root Redirect | `/` | Root Redirector | Admin role root visit | User logged in with `Role.Admin` | 1. Authenticate as Admin.<br>2. Navigate to `/`. | Valid Admin session | User is redirected to `/dashboard`. | | Not Executed | High | Role routing |
| `TC-NAV-003` | Core | Root Redirect | `/` | Root Redirector | Author role root visit | User logged in with `Role.Author` | 1. Authenticate as Author.<br>2. Navigate to `/`. | Valid Author session | User is redirected to `/editor`. | | Not Executed | High | Role routing |
| `TC-NAV-004` | Admin | Dashboard | `/dashboard` | RoleGuard | Author attempting Admin route | User logged in with `Role.Author` | 1. Log in as Author.<br>2. Manually enter `/dashboard` in URL bar. | URL: `/dashboard` | User is blocked and redirected to `/login` or unauthorized fallback. | | Not Executed | Critical | Security guard |
| `TC-NAV-005` | Admin | Users Page | `/dashboard/users` | Sidebar Navigation | Navigate from Dashboard to Users | User logged in as Admin on `/dashboard` | 1. Click on "Users" sidebar menu item. | Mouse click | URL changes to `/dashboard/users`; User Management table renders. | | Not Executed | High | Sidebar link |
| `TC-NAV-006` | Admin | Sidebar | `/dashboard` | Layout Toggle | Expand/collapse sidebar rail | Admin portal loaded on desktop (1920x1080) | 1. Click hamburger icon in top header.<br>2. Observe width transition.<br>3. Refresh page. | Click toggle | Rail toggles between 188px and 64px; state persists across reloads via localStorage. | | Not Executed | Medium | State persistence |
| `TC-NAV-007` | Editor | Editor | `/editor` | AuthGuard | Unauthenticated access to editor | User session is cleared | 1. Navigate directly to `/editor`. | URL: `/editor` | Redirected to `/login`; editor canvas is never exposed. | | Not Executed | Critical | Auth guard |
| `TC-NAV-008` | Admin | Sign Out | `/dashboard` | Logout | Admin sign out button | Admin logged in | 1. Click "Sign Out" button at bottom of sidebar. | Click | User auth token cleared, user redirected to `/login`. | | Not Executed | High | Session teardown |

---

## 12. FUNCTIONAL TEST CASES

### 12.1 Admin Module Functional Test Cases

| Test Case ID | Module | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `TC-ADM-FNC-001` | Admin | Overview | `/dashboard` | Metric Cards | Display registered user counts | Users exist in `usersStore` | 1. Navigate to `/dashboard`.<br>2. Observe numeric values in 3 cards. | Store with 5 users (2 Admin, 3 Author) | Total shows 5, Admin Accounts shows 2, Author Accounts shows 3. | | Not Executed | High | Dashboard metrics |
| `TC-ADM-FNC-002` | Admin | Overview | `/dashboard` | Progress Bars | Role distribution calculation | Users exist in store | 1. View "User Role Distribution" card.<br>2. Verify percentage widths and text. | 2 Admins (40%), 3 Authors (60%) | Admin bar displays 40% width; Author bar displays 60% width. | | Not Executed | Medium | Visual charts |
| `TC-ADM-FNC-003` | Admin | Users | `/dashboard/users` | Search Users | Filter user table by search text | User table populated | 1. Type partial name or email in search input. | Query: `"admin@"` | Table updates dynamically showing only matching records. | | Not Executed | High | Real-time filter |
| `TC-ADM-FNC-004` | Admin | Users | `/dashboard/users` | Role Filter | Filter user table by role dropdown | User table populated | 1. Click role filter dropdown.<br>2. Select "Author". | Value: `"Author"` | Only users with role "Author" remain visible in table. | | Not Executed | High | Select filter |
| `TC-ADM-FNC-005` | Admin | Users | `/dashboard/users` | Export to Excel | Export user table to spreadsheet | User table populated | 1. Click "Export to Excel" button. | Click | A valid `.xlsx` workbook file is generated and downloaded by browser. | | Not Executed | Medium | SheetJS export |
| `TC-ADM-FNC-006` | Admin | Users | `/dashboard/users` | View User | Open user details modal | User table populated | 1. Click "View" action icon on a user row. | Target: First row user | Modal opens displaying full name, email, role, and creation date. | | Not Executed | Medium | Read-only dialog |
| `TC-ADM-FNC-007` | Admin | Users | `/dashboard/users` | Copy Invite | Copy user invitation link | User row visible | 1. Click "Invite Link" action icon.<br>2. Click "Copy Link" inside modal. | Click | Invitation URL copied to clipboard; confirmation checkmark displayed. | | Not Executed | Low | Shareable invite |

### 12.2 Editor Module Functional Test Cases

| Test Case ID | Module | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `TC-EDT-FNC-001` | Editor | Editor | `/editor` | Home Ribbon | Font family selection sync | Document canvas has text with Arial font | 1. Click cursor inside Arial paragraph.<br>2. Observe Font Family combobox in ribbon. | Font: Arial | Font Family dropdown displays "Arial" automatically. | | Not Executed | High | Selection sync |
| `TC-EDT-FNC-002` | Editor | Editor | `/editor` | Home Ribbon | Font size selection sync | Document canvas has 16pt text | 1. Select text formatted in 16pt.<br>2. Observe Font Size combobox in ribbon. | Size: 16pt | Font Size combobox displays "16". | | Not Executed | High | Selection sync |
| `TC-EDT-FNC-003` | Editor | Editor | `/editor` | Home Ribbon | Mixed font family selection state | Selection spans Arial and Calibri text | 1. Drag selection across paragraphs with different fonts.<br>2. Observe Font Family combobox. | Mixed fonts | Combobox displays empty/blank placeholder state (`""`). | | Not Executed | High | Microsoft Word parity |
| `TC-EDT-FNC-004` | Editor | Editor | `/editor` | Home Ribbon | Mixed font size selection state | Selection spans 11pt and 18pt text | 1. Drag selection across words with different font sizes.<br>2. Observe Font Size combobox. | Mixed sizes (11pt & 18pt) | Combobox displays empty/blank placeholder state (`""`). | | Not Executed | High | Microsoft Word parity |
| `TC-EDT-FNC-005` | Editor | Editor | `/editor` | Home Ribbon | Undo / Redo history actions | Text typed into document | 1. Type "Sample Text".<br>2. Click Undo button (`Ctrl+Z`).<br>3. Click Redo button (`Ctrl+Y`). | Keystrokes | Text disappears on undo and restores completely on redo. | | Not Executed | High | Undo/Redo stack |
| `TC-EDT-FNC-006` | Editor | Editor | `/editor` | Insert Ribbon | Add & Delete Page | Single-page document active | 1. Click "Add Page" in Insert tab.<br>2. Click "Delete Page". | User clicks | New page is appended below Page 1; Page 2 is cleanly deleted on delete. | | Not Executed | High | Canvas pagination |
| `TC-EDT-FNC-007` | Editor | Editor | `/editor` | Insert Ribbon | Page number insertion & format | Multi-page document | 1. Click "Page Number" -> "Bottom of Page" -> "Right".<br>2. Check footer. | Alignment: Right | Page number appears right-aligned in footer. Top of page stays clean. | | Not Executed | High | Header/Footer numbering |
| `TC-EDT-FNC-008` | Editor | Editor | `/editor` | Layout Ribbon | Page Orientation change | Portrait document active | 1. Click "Orientation" -> "Landscape". | Orientation: Landscape | Page canvas dimensions flip to landscape width/height immediately. | | Not Executed | High | Layout geometry |
| `TC-EDT-FNC-009` | Editor | Editor | `/editor` | Layout Ribbon | Margins preset change | Document loaded | 1. Click "Margins" -> "Narrow". | Top/Bottom/Left/Right: 48px | Document text padding updates to narrow margins without page reload. | | Not Executed | Medium | Layout margins |
| `TC-EDT-FNC-010` | Editor | Editor | `/editor` | Layout Ribbon | Watermark insertion | Document loaded | 1. Click "Watermark" -> "CONFIDENTIAL". | Text: "CONFIDENTIAL" | Diagonal semi-transparent watermark renders across all pages. | | Not Executed | Medium | Canvas rendering |
| `TC-EDT-FNC-011` | Editor | Editor | `/editor` | Review Ribbon | Track Changes lifecycle | Document loaded | 1. Click "Track Changes" (turns ON).<br>2. Type "New Proposal".<br>3. Highlight "New Proposal" and click "Accept". | Insertion text | Text turns green with revision tag; upon clicking Accept, tag is resolved into normal text. | | Not Executed | Critical | Revision engine |
| `TC-EDT-FNC-012` | Editor | Editor | `/editor` | Writing Panel | Line Spacing application | Paragraph selected | 1. Open Writing panel.<br>2. Click Line Spacing dropdown.<br>3. Select "2.0". | Option: "2.0" | Selected paragraph CSS updates to `line-height: 2.0` with visible spacing. | | Not Executed | High | Writing tools |
| `TC-EDT-FNC-013` | Editor | Editor | `/editor` | Writing Panel | Text Highlight application | Word selected | 1. Highlight word.<br>2. Click Yellow swatch in Highlight section. | Color: Yellow (`#fef08a`) | Word background color updates to yellow; clicking "Remove" restores normal background. | | Not Executed | Medium | Text styling |
| `TC-EDT-FNC-014` | Editor | Editor | `/editor` | Navigation Panel | Find & Replace Next | Document with repeated word | 1. Open Navigation -> Find tab.<br>2. Enter "clinical".<br>3. Click "Find Next". | Query: "clinical" | First occurrence is outlined in yellow (`#facc15`); status reads "Match 1 of N". | | Not Executed | High | Word search |
| `TC-EDT-FNC-015` | Editor | Editor | `/editor` | Navigation Panel | Replace All | Document with 3 instances of "old" | 1. Enter "old" in Find.<br>2. Enter "new" in Replace.<br>3. Click "Replace All". | Find: "old", Replace: "new" | All 3 instances update to "new"; status confirms 3 replacements completed. | | Not Executed | High | DOM replacement |
| `TC-EDT-FNC-016` | Editor | Editor | `/editor` | Links Panel | Web URL insertion | Text selected | 1. Open Links panel -> Web URL.<br>2. Enter URL `https://example.com`.<br>3. Click "Insert Link ->". | URL: `https://example.com` | Text converts into anchor tag with light-blue button styling matching design. | | Not Executed | High | Link generator |
| `TC-EDT-FNC-017` | Editor | Editor | `/editor` | Status Bar | Read Mode full screen spread | Document with 4 pages | 1. Click "Read Mode" in status bar.<br>2. Press right arrow key.<br>3. Press `Escape`. | Key presses | Enters 2-page horizontal spread view; navigates to Screen 2; exits cleanly on Escape. | | Not Executed | Medium | Distraction-free view |
| `TC-EDT-FNC-018` | Editor | Editor | `/editor` | Status Bar | Zoom slider scaling | Document canvas visible | 1. Drag zoom slider to 150%. | Zoom: 150% | Canvas transforms with `scale(1.5)` smoothly without horizontal overflow distortion. | | Not Executed | Medium | Zoom transform |
| `TC-EDT-FNC-019` | Editor | Editor | `/editor` | Header Actions | Save As duplicate | Document open | 1. Click "Save As".<br>2. Enter "Protocol Amendment V2".<br>3. Click Save. | Title: "Protocol Amendment V2" | New document model is created and appears in Document Management list. | | Not Executed | High | Document persistence |

---

## 13. FORM VALIDATION TEST CASES

| Test Case ID | Form Name | Field | Validation Rule | Test Input | Expected Behavior | Status | Priority |
|---|---|---|---|---|---|---|---|
| `TC-VAL-001` | Add User Form | Full Name | Required & Min length >= 3 | Leave blank (`""`) | Displays `"Full Name must contain at least 3 characters"`. Form submit blocked. | Not Executed | High |
| `TC-VAL-002` | Add User Form | Full Name | Min length boundary | Enter `"Ab"` (2 chars) | Displays `"Full Name must contain at least 3 characters"`. Form submit blocked. | Not Executed | High |
| `TC-VAL-003` | Add User Form | Email | Required format | Enter `"admin_at_company"` | Displays `"Provide a valid email address"`. Submit blocked. | Not Executed | High |
| `TC-VAL-004` | Add User Form | Email | Valid email | Enter `"sarah.author@parexel.com"` | Error disappears, field shows valid state. | Not Executed | High |
| `TC-VAL-005` | Add User Form | Password | Min length >= 6 | Enter `"12345"` | Displays `"Password must contain at least 6 characters"`. Submit blocked. | Not Executed | High |
| `TC-VAL-006` | Admin Security Form | New Password | Min length >= 8 | Enter `"Abc1!"` (5 chars) | Displays `"Password must contain at least 8 characters."`. | Not Executed | Critical |
| `TC-VAL-007` | Admin Security Form | New Password | Uppercase requirement | Enter `"alllowercase1!"` | Displays `"Password must contain at least one uppercase letter."`. | Not Executed | Critical |
| `TC-VAL-008` | Admin Security Form | New Password | Lowercase requirement | Enter `"ALLUPPERCASE1!"` | Displays `"Password must contain at least one lowercase letter."`. | Not Executed | Critical |
| `TC-VAL-009` | Admin Security Form | New Password | Number requirement | Enter `"NoNumbersHere!"` | Displays `"Password must contain at least one number."`. | Not Executed | Critical |
| `TC-VAL-010` | Admin Security Form | New Password | Special character | Enter `"NoSpecialChar123"` | Displays `"Password must contain at least one special character."`. | Not Executed | Critical |
| `TC-VAL-011` | Admin Security Form | Confirm Password | Matching check | New: `"SecurePass1!"`, Confirm: `"Different2@"` | Displays `"Passwords do not match."`. | Not Executed | Critical |
| `TC-VAL-012` | Web URL Form | Web Address | Empty validation | Leave blank and click Insert | Displays error indicating Web address is required. | Not Executed | High |
| `TC-VAL-013` | Email Link Form | Recipient Email | Email format | Enter `"notanemail"` | Error prompt displays invalid email format. Submit blocked. | Not Executed | High |

---

## 14. RESPONSIVE UI TEST CASES

The application layout must be validated across the 6 standard target viewports:

| Test Case ID | Target Viewport | Target Device | Module / Page | Inspection Points | Expected Responsive Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| `TC-RSP-001` | **1920 × 1080** | Full HD Desktop | Admin Portal (`/dashboard`) | Sidebar rail, 3 metric cards, role distribution layout | Sidebar displays at 188px; 3 cards align in 3-column grid; no horizontal overflow. | Not Executed | High |
| `TC-RSP-002` | **1920 × 1080** | Full HD Desktop | Document Editor (`/editor`) | Ribbon toolbar, Icon rail, Canvas center alignment | Ribbon items display in full horizontal sequence without clipping; document page centered with comfortable gray gutters. | Not Executed | High |
| `TC-RSP-003` | **1366 × 768** | Standard Laptop | Admin Portal (`/dashboard/users`) | User management table, search bar, export button | Table columns adjust padding; search bar and buttons wrap cleanly if necessary. | Not Executed | High |
| `TC-RSP-004` | **1366 × 768** | Standard Laptop | Document Editor (`/editor`) | Ribbon toolbar, Left overlay panel drawer | Ribbon groups compress gracefully; left drawer opens at 320px leaving >= 650px canvas area. | Not Executed | High |
| `TC-RSP-005` | **1280 × 720** | Small Laptop / 720p | Document Editor (`/editor`) | Resizable overlay drawer | Resizing drawer handle stops at max boundary (`window.innerWidth - 450px`); document canvas never collapses below 450px. | Not Executed | Medium |
| `TC-RSP-006` | **768 × 1024** | Tablet (Portrait) | Admin Portal (`/dashboard`) | Sidebar collapse, top header hamburger | Sidebar translates off-canvas (`-translate-x-full`); hamburger button opens overlay drawer; metric cards stack into 1-2 columns. | Not Executed | High |
| `TC-RSP-007` | **768 × 1024** | Tablet (Portrait) | Document Editor (`/editor`) | Ribbon overflow, Navigation panel Find/Replace | Ribbon becomes horizontally scrollable with smooth touch scrolling; Find & Replace buttons wrap into 2x2 grid. | Not Executed | High |
| `TC-RSP-008` | **390 × 844** | Mobile (iPhone 14) | Admin Portal (`/dashboard/users`) | Mobile drawer menu, user table horizontal scroll | Sidebar opens full-height modal drawer; user table allows horizontal scroll without breaking page container. | Not Executed | High |
| `TC-RSP-009` | **390 × 844** | Mobile (iPhone 14) | Document Editor (`/editor`) | Left overlay panels, Header actions | Left tool panel occupies 100% width overlay with prominent close button; canvas zooms to fit viewport width. | Not Executed | Medium |
| `TC-RSP-010` | **360 × 800** | Small Android | Admin Portal (`/dashboard`) | Metric cards typography, Modal dialogs | Card heading text scales gracefully (`text-2xl`); profile modal fits within 340px width with inner scroll. | Not Executed | Medium |

---

## 15. ACCESSIBILITY TEST CASES (WCAG 2.1 AA)

| Test Case ID | Test Category | Component / Area | Verification Criteria | Expected Result | Status | Priority |
|---|---|---|---|---|---|---|
| `TC-ACC-001` | Keyboard Navigation | Ribbon Toolbar | Tab & Arrow key traversal | User can tab into Ribbon, use Arrow Left/Right between tabs, and hit Space/Enter to activate. | Not Executed | High |
| `TC-ACC-002` | Keyboard Navigation | Modals (Add User, Margins) | Focus trap & Escape key | Focus is trapped inside active dialog; pressing `Escape` closes dialog and returns focus to trigger button. | Not Executed | High |
| `TC-ACC-003` | ARIA Attributes | Form Inputs | `aria-invalid`, `aria-describedby` | Invalid fields set `aria-invalid="true"` with `aria-describedby` pointing to the error message text element. | Not Executed | High |
| `TC-ACC-004` | Color Contrast | Document Canvas & Text | Contrast ratio >= 4.5:1 | Default document text `#000000` on white page `#ffffff` achieves maximum 21:1 contrast ratio. | Not Executed | Critical |
| `TC-ACC-005` | Screen Reader | Icon Buttons | Accessible labels (`aria-label`) | Buttons with icons only (`Menu`, `Sun`, `Moon`, `X`, `Undo`, `Redo`) include explicit `aria-label` or `title` attributes. | Not Executed | High |
| `TC-ACC-006` | Focus Indicators | Form Controls & Buttons | Visible focus rings | Tabbing into any button, link, or input produces a high-visibility focus ring (`focus:ring-2 focus:ring-primary/20`). | Not Executed | High |

---

## 16. BROWSER COMPATIBILITY TEST CASES

| Test Case ID | Browser Engine | Target Browser | OS Platform | Scope | Expected Result | Status | Priority |
|---|---|---|---|---|---|---|---|
| `TC-BRW-001` | Chromium / Blink | Google Chrome (Latest) | Windows 11 / macOS | Full Admin & Editor suites | 100% visual and functional fidelity; smooth CSS transforms. | Not Executed | Critical |
| `TC-BRW-002` | Chromium / Blink | Microsoft Edge (Latest) | Windows 11 | Full Admin & Editor suites | Identical rendering to Chrome; seamless text editing and clipboard integration. | Not Executed | High |
| `TC-BRW-003` | Gecko | Mozilla Firefox (Latest) | Windows 11 / Linux | Canvas contenteditable & Ribbon | `contenteditable` caret rendering, selection range detection, and custom scrollbar rendering operate without defects. | Not Executed | High |
| `TC-BRW-004` | WebKit | Apple Safari (v17+) | macOS / iPadOS | Ribbon dropdowns, Zoom slider | Custom zoom slider, backdrop blur filters, and col-resize cursor behavior operate cleanly. | Not Executed | High |

---

## 17. TEST DATA & PRECONDITIONS

To execute manual tests consistently, the following standardized test datasets should be prepared:

### 17.1 User Authentication Test Data
- **Admin Account:**
  - Email: `admin@docupilot.ai` / `admin@parexel.com`
  - Role: `Admin`
  - Password: `Password123!`
- **Author Account:**
  - Email: `sarah.author@parexel.com`
  - Role: `Author`
  - Password: `AuthorPass2026!`

### 17.2 Document Test Data
- **Standard Protocol Document:** 5 pages, mixed headings (`H1`, `H2`, `H3`), tables with header rows, bulleted lists, and images.
- **Heterogeneous Formatting Document:** Paragraph 1 in Arial 14pt, Paragraph 2 in Calibri 11pt, Paragraph 3 in Times New Roman 12pt (used for selection sync testing).
- **Find & Replace Corpus:** Text containing 10 occurrences of keyword `"safety"` and 5 occurrences of `"endpoint"`.

---

## 18. TEST EXECUTION SUMMARY

*(This section is reserved for QA execution metrics upon completion of manual test runs.)*

| Test Suite | Total Test Cases | Passed | Failed | Blocked | Execution Progress | Pass Rate (%) |
|---|---|---|---|---|---|---|
| **Navigation & Routing** | 8 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Admin Module Functional** | 7 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Editor Module Functional** | 19 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Form Validations** | 13 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Responsive Layouts** | 10 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Accessibility (a11y)** | 6 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Browser Compatibility** | 4 | 0 | 0 | 0 | 0% (Not Executed) | 0.0% |
| **Total** | **67** | **0** | **0** | **0** | **0%** | **0.0%** |

---

## 19. DEFECT REPORTING TEMPLATE

When defects are discovered during test execution, document each defect using the following standardized schema:

| Field | Description |
|---|---|
| **Bug ID** | Unique defect identifier (e.g., `BUG-EDT-001`, `BUG-ADM-002`) |
| **Module** | `Admin` or `Editor` |
| **Page** | Affected component or view (e.g., `HomeTab.tsx`, `UserManagement.tsx`) |
| **Route** | Actual URL path where defect occurred |
| **Bug Title** | Concise, actionable summary of the failure |
| **Steps to Reproduce** | Exact numbered reproduction sequence |
| **Expected Result** | Specified correct UI/functional behavior |
| **Actual Result** | Observed defective behavior |
| **Severity** | `Critical` (blocker) / `High` (major feature broken) / `Medium` (minor bug) / `Low` (cosmetic) |
| **Priority** | `High` (fix immediately) / `Medium` (fix before release) / `Low` (scheduled fix) |
| **Screenshot Reference** | Path or filename of captured evidence |
| **Status** | `Open` / `In Progress` / `Fixed` / `Retested` |

---

## 20. KNOWN LIMITATIONS & PENDING VERIFICATIONS

1. **Document Storage Quota:** The client-side Document Manager limits active documents to 10 items in `localStorage`. Documents beyond 10 trigger a warning modal.
2. **Read Mode Editing:** Read Mode is strictly a view-only paginated display mode; direct keyboard text input is intentionally disabled during full-screen reading.
3. **Complex Column Balancing:** Highly complex nested tables within multi-column sections rely on standard CSS `break-inside-avoid-column`; extreme table heights may overflow column containers on narrow viewports.

---

## 21. FINAL TESTING CHECKLIST

Before approving any frontend release candidate for CoEdit.ai, the QA engineer must verify:

- [ ] All routes defined in `routes.tsx` load their expected layouts without console runtime errors.
- [ ] RoleGuard blocks unauthenticated and unauthorized users from accessing `/dashboard` or `/editor`.
- [ ] Theme switcher switches between light and dark themes smoothly across both Admin and Editor pages.
- [ ] Admin User Management search and role filters update table records in real time.
- [ ] Add User and Admin Security forms reject invalid passwords, emails, and character counts.
- [ ] Editor Ribbon Font Family and Font Size comboboxes accurately reflect selection ranges and mixed states.
- [ ] Editor document canvas text strictly defaults to black (`#000000`) in light mode and white (`#ffffff`) in dark mode.
- [ ] New documents initialize with empty, clean footers without default hardcoded branding strings.
- [ ] Find and Replace highlights all matches in soft yellow and navigates sequential occurrences cleanly.
- [ ] Internal References (Web URL and Email tabs) insert links and trigger sanitized actions.
- [ ] Responsive layouts adjust without horizontal body scrolling on desktop, laptop, tablet, and mobile viewports.

---

## 22. TESTING CONCLUSION

This frontend testing documentation provides exhaustive, repeatable, and code-verified test cases covering the entire CoEdit.ai user interface. By executing these test cases against the Admin and Editor modules, the quality assurance team can guarantee that CoEdit.ai delivers a reliable, high-performance, and accessible document authoring experience meeting enterprise software standards.
