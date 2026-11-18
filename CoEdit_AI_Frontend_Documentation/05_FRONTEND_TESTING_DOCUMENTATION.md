# CoEdit.ai – Frontend Testing Documentation (Admin & Editor Modules)

---

## 1. Document Control & Quality Assurance Overview

| Property | Value |
| :--- | :--- |
| **Document Title** | CoEdit.ai Frontend Testing Strategy & Comprehensive Test Cases |
| **Target Version** | v1.0.0-rc |
| **Testing Scope** | Frontend User Interface, Functional Behavior, Responsive Layouts, Accessibility & Cross-Browser Compatibility |
| **System Architecture** | React 19 + TypeScript + Vite + Tailwind CSS |
| **Modules Covered** | Admin Module (`/dashboard`, `/dashboard/users`), Editor Module (`/editor` and all submodules) |
| **Execution Environment** | Client-Side SPA (Single Page Application) |
| **Status** | Baseline Test Suite – Not Executed |

---

## 2. Testing Objectives & Strategy

### 2.1 Objectives
1. **Validate Complete Frontend Implementation:** Verify that all pages, routes, components, sidebars, modal dialogs, and toolbar controls render correctly according to the production design system.
2. **Ensure Functional Integrity:** Validate interactive states, form inputs, validation rules, client-side store synchronization (Zustand), dropdown menus, selection synchronization, and modal dialog lifecycles.
3. **Verify UI/UX Consistency:** Ensure visual harmony across dark and light modes, typography scales, border radii, spacing systems, and component states (hover, focus, active, disabled).
4. **Guarantee Responsive Adaptability:** Ensure flawless presentation and touch/pointer usability across 6 standard viewport breakpoints (375px, 768px, 1024px, 1280px, 1440px, 1920px).
5. **Ensure Web Accessibility (a11y):** Comply with WCAG 2.1 Level AA standards, verifying keyboard navigation, ARIA labeling, focus entrapment, and color contrast.
6. **Cross-Browser Verification:** Verify identical rendering and event handling across modern desktop and mobile browsers (Chrome, Edge, Firefox, Safari).

### 2.2 Scope Boundaries
- **In-Scope (Frontend Only):**
  - All DOM element rendering, visibility, and layout geometry.
  - Interactive controls: buttons, input fields, selects, textareas, checkboxes, toggles, sliders, color pickers.
  - Client-side routing transitions (`react-router-dom`), route guards, and layout persistence.
  - State management stores (`useUsersStore`, `navigationStore`, local UI states).
  - Ribbon toolbar tabs (Home, Insert, Layout, Review) and contextual tabs (Header & Footer, Chart Design/Format).
  - Left Overlay navigation submodules (Documents, Writing, Styles, Symbols, Tables, Figures, Links, Reference, Appendices, Track Changes, Settings, AI).
  - Document canvas rendering, page scaling/zoom, text selection synchronization, caret positioning, and font styling synchronization.
  - Modal dialog lifecycles: open, backdrop click, Escape key dismiss, validation messages, form submit, and close.
  - Responsive viewports, drawer collapse, horizontal scroll guards, and touch targets.
- **Out-of-Scope (Backend & Server Infrastructure):**
  - Server-side REST / GraphQL API endpoints.
  - Database persistence, schema migrations, and SQL performance.
  - Production OAuth2 / SSO backend credential verification.
  - Heavy cloud AI inference latency (mocked/simulated on client for frontend test verification).

---

## 3. Test Methodology & Execution Guidelines

### 3.1 Testing Methodologies
- **Black-Box Functional Testing:** Verifying user flows against visual expectations and functional specifications without inspecting internal component closures.
- **Component State Testing:** Verifying initial state, loaded state, dirty state, empty state, validation error state, and disabled state.
- **Synchronization Testing:** Verifying two-way synchronization between document selection (DOM selection/ranges) and toolbar dropdowns (Font Family, Font Size, Line Spacing).
- **Responsive Testing:** Utilizing DevTools viewport emulation across designated viewport matrix dimensions.
- **Keyboard Navigation & Accessibility Testing:** Navigating using solely `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow` keys, and `Esc` to verify focus rings and accessibility trees.

### 3.2 Test Case Identifier Convention

| Prefix | Domain / Area | Example |
| :--- | :--- | :--- |
| `ADM-UI-xxx` | Admin Module UI & Layout Rendering | `ADM-UI-001` |
| `ADM-FN-xxx` | Admin Module Functional & Form Operations | `ADM-FN-001` |
| `ADM-RS-xxx` | Admin Module Responsive Viewports | `ADM-RS-001` |
| `EDT-UI-xxx` | Editor Module Workspace & Canvas UI | `EDT-UI-001` |
| `EDT-FN-xxx` | Editor Module Functional & Core Behaviors | `EDT-FN-001` |
| `EDT-RB-xxx` | Ribbon Toolbar Tabs & Dropdown Controls | `EDT-RB-001` |
| `EDT-DOC-xxx` | Documents Submodule & Find / Replace Utilities | `EDT-DOC-001` |
| `EDT-WRT-xxx` | Writing Tools (Highlights, Alignment, Lists, Casing) | `EDT-WRT-001` |
| `EDT-STY-xxx` | Styles Submodule & Style Formatting Gallery | `EDT-STY-001` |
| `EDT-SYM-xxx` | Symbols Submodule & Math/Greek Insertions | `EDT-SYM-001` |
| `EDT-NAV-xxx` | Links & Navigation (Web URL, Email, References) | `EDT-NAV-001` |
| `EDT-RS-xxx` | Editor Module Responsive Viewports | `EDT-RS-001` |
| `ACC-xxx` | Accessibility & WCAG Compliance | `ACC-001` |
| `BRW-xxx` | Cross-Browser Compatibility Verification | `BRW-001` |

---

## 4. Admin Module Test Cases

### 4.1 Admin UI & Layout Test Cases (`ADM-UI`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ADM-UI-001` | Admin | Layout | Admin Layout | `/dashboard` | Sidebar Navigation | Verify Admin Sidebar rendering and branding | Admin layout loaded | 1. Navigate to `/dashboard`<br>2. Inspect left navigation sidebar<br>3. Verify CoEdit.ai logo and title<br>4. Check navigation links | N/A | Sidebar displays logo, "CoEdit.ai" title, links for Dashboard and Users, and collapsed toggle button | Unverified | High | Core admin layout structure |
| `ADM-UI-002` | Admin | Layout | Admin Layout | `/dashboard` | Header Profile | Verify Admin Header user avatar and profile menu | User authenticated | 1. Navigate to `/dashboard`<br>2. Inspect top header bar<br>3. Check notification bell icon<br>4. Check user profile badge | N/A | Header displays system notification icon, user avatar, name ("Admin User"), and role badge | Unverified | Medium | Header profile element check |
| `ADM-UI-003` | Admin | Overview | Dashboard Overview | `/dashboard` | Metrics Cards | Verify KPI summary metric cards render correctly | Dashboard loaded | 1. Navigate to `/dashboard`<br>2. Inspect 4 metric cards: Total Users, Active Now, Documents, AI Credits Used | N/A | Cards render with appropriate icons, metric counts ("1,280", "42", "3,842", "84%"), and trend badges | Unverified | High | Visual KPI dashboard validation |
| `ADM-UI-004` | Admin | Overview | Dashboard Overview | `/dashboard` | Quick Actions | Verify Quick Action buttons render with correct icons | Dashboard loaded | 1. Navigate to `/dashboard`<br>2. Inspect Quick Actions bar<br>3. Check "Create Document", "Manage Users", "Add New User" | N/A | 3 distinct action buttons render with icons (FilePlus, Users, UserPlus) and clear hover states | Unverified | Medium | Admin quick launch bar |
| `ADM-UI-005` | Admin | Overview | Dashboard Overview | `/dashboard` | Recent Activity | Verify Recent Activity table layout and typography | Activity data exists | 1. Navigate to `/dashboard`<br>2. Scroll to Recent Activity table<br>3. Inspect column headers: User, Action, Document, Timestamp | N/A | Table renders cleanly with alternating row colors, user avatars, activity tags, and timestamps | Unverified | Medium | Data table styling |
| `ADM-UI-006` | Admin | Overview | Dashboard Overview | `/dashboard` | System Health | Verify System Status and Storage usage widget | Dashboard loaded | 1. Navigate to `/dashboard`<br>2. Inspect right-hand status panel | N/A | Widget shows green "Operational" badge, CPU/Memory gauges, and cloud storage progress bar | Unverified | Low | Status widget check |
| `ADM-UI-007` | Admin | Users | User Management | `/dashboard/users` | Users Table Header | Verify Users Table renders with all standard columns | Users page loaded | 1. Navigate to `/dashboard/users`<br>2. Inspect table header row | N/A | Headers render: "User", "Role", "Status", "Last Active", "Actions" with sort arrows | Unverified | High | User grid presentation |
| `ADM-UI-008` | Admin | Users | User Management | `/dashboard/users` | Filters Bar | Verify Search input and Role/Status filter dropdowns | Users page loaded | 1. Navigate to `/dashboard/users`<br>2. Inspect search bar and dropdown filters | N/A | Search field renders with search glass icon and placeholder; Role and Status select dropdowns render with default values | Unverified | Medium | Search and filter toolbar |
| `ADM-UI-009` | Admin | Users | User Management | `/dashboard/users` | Action Buttons | Verify Add User button and row action buttons | Users page loaded | 1. Inspect top right "Add User" button<br>2. Inspect each row's Edit and Delete action buttons | N/A | "Add User" displays primary blue background with plus icon; row actions render edit pencil and trash icons | Unverified | High | Action trigger styling |
| `ADM-UI-010` | Admin | Users | User Management | `/dashboard/users` | Role Badges | Verify visual styling of Role and Status badges | Users loaded | 1. Inspect Role pills (Admin, Editor, Viewer)<br>2. Inspect Status pills (Active, Inactive, Suspended) | N/A | Admin badge is purple, Editor is blue, Viewer is gray; Active is emerald green, Inactive is amber, Suspended is red | Unverified | Medium | Status pill styling |

---

### 4.2 Admin Functional & Form Test Cases (`ADM-FN`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ADM-FN-001` | Admin | Overview | Dashboard Overview | `/dashboard` | Quick Action Nav | Clicking "Create Document" redirects to Editor | Dashboard loaded | 1. Click "Create Document" quick action button | N/A | Application transitions URL to `/editor` and renders editor workspace canvas | Unverified | High | Cross-module navigation |
| `ADM-FN-002` | Admin | Overview | Dashboard Overview | `/dashboard` | Quick Action Nav | Clicking "Manage Users" navigates to Users page | Dashboard loaded | 1. Click "Manage Users" quick action button | N/A | Application transitions URL to `/dashboard/users` and loads User Management view | Unverified | High | Sub-route navigation |
| `ADM-FN-003` | Admin | Overview | Dashboard Overview | `/dashboard` | Add User Modal | Clicking "Add New User" opens Add User dialog modal | Dashboard loaded | 1. Click "Add New User" button | N/A | Add User modal opens with focus inside the First Name/Full Name input field; backdrop dims background | Unverified | High | Modal trigger test |
| `ADM-FN-004` | Admin | Users | User Management | `/dashboard/users` | User Search | Search users by text query filters table rows dynamically | Users populated | 1. Enter "Sarah" into search input field<br>2. Observe table row updates | Query: `"Sarah"` | Table immediately filters to display only rows where Name or Email contains "Sarah" | Unverified | High | Real-time client search |
| `ADM-FN-005` | Admin | Users | User Management | `/dashboard/users` | Role Filter | Filter users by Role dropdown selection | Users populated | 1. Click Role filter dropdown<br>2. Select "Admin"<br>3. Verify filtered rows | Filter: `"Admin"` | Table updates to display only users with Role equal to "Admin" | Unverified | High | Dropdown filter test |
| `ADM-FN-006` | Admin | Users | User Management | `/dashboard/users` | Status Filter | Filter users by Status dropdown selection | Users populated | 1. Click Status filter dropdown<br>2. Select "Active"<br>3. Verify filtered rows | Filter: `"Active"` | Table displays only users with Status equal to "Active" | Unverified | High | Dropdown filter test |
| `ADM-FN-007` | Admin | Users | User Management | `/dashboard/users` | Add User Validation | Form field validation prevents empty submission | Modal open | 1. Click "Add User" button<br>2. Leave all fields empty<br>3. Click "Create User" submit button | Empty fields | Form submission blocked; inline validation errors appear below Name, Email, and Password | Unverified | Critical | Client-side validation |
| `ADM-FN-008` | Admin | Users | User Management | `/dashboard/users` | Email Validation | Invalid email format displays validation error | Modal open | 1. Enter invalid email string into Email field<br>2. Tab away or submit | Email: `"invalid-email@"` | Form displays "Please enter a valid email address" error; submit button remains blocked | Unverified | High | Regex email validation |
| `ADM-FN-009` | Admin | Users | User Management | `/dashboard/users` | Create User Success | Valid user details add new row to Zustand store and grid | Modal open | 1. Fill Name: "Alice Smith", Email: "alice@coedit.ai", Role: "Editor", Status: "Active", Password: "Password123!"<br>2. Click "Create User" | Valid data | Modal closes, success toast notification displays, new row appears in users table | Unverified | Critical | Zustand store dispatch |
| `ADM-FN-010` | Admin | Users | User Management | `/dashboard/users` | Edit User Modal | Clicking Edit button populates modal with row details | Users populated | 1. Click Edit icon on user "Sarah Connor"<br>2. Inspect modal fields | User ID: `user-02` | Modal opens titled "Edit User"; fields are pre-populated with Sarah's existing name, email, and role | Unverified | High | Form pre-fill validation |
| `ADM-FN-011` | Admin | Users | User Management | `/dashboard/users` | Delete User Confirm | Clicking Delete displays confirmation prompt | Users populated | 1. Click Delete trash icon on a user row | User ID: `user-03` | Confirmation modal appears: "Are you sure you want to delete this user? This action cannot be undone." | Unverified | High | Destructive action confirmation |
| `ADM-FN-012` | Admin | Users | User Management | `/dashboard/users` | Delete User Action | Confirming deletion removes user row from table | Confirm open | 1. Click "Confirm Delete" button | Action: Confirm | Modal closes, target user row is removed from table, and Total Users count decrements | Unverified | Critical | State removal test |
| `ADM-FN-013` | Admin | Profile | Admin Layout | `/dashboard` | Profile Modal | Clicking user profile opens Profile & Security modal | Dashboard loaded | 1. Click user avatar in header<br>2. Select "Profile & Security" | Click event | Profile & Security modal opens with tabs: General Profile, Password Change, and 2FA Settings | Unverified | Medium | Security dialog check |

---

### 4.3 Admin Responsive Layout Test Cases (`ADM-RS`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Viewport | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ADM-RS-001` | Admin | Layout | Admin Layout | `/dashboard` | Mobile Drawer | Sidebar collapses to drawer menu with hamburger button | `375px` (Mobile) | Sidebar collapses off-screen; hamburger button appears in header; clicking toggles drawer overlay | Unverified | High | Mobile navigation |
| `ADM-RS-002` | Admin | Overview | Dashboard Overview | `/dashboard` | Metric Stacking | Metric cards stack in single column vertically | `375px` (Mobile) | 4 KPI metric cards stack vertically (1 column grid) without horizontal clipping or text overflow | Unverified | High | Card layout reflow |
| `ADM-RS-003` | Admin | Overview | Dashboard Overview | `/dashboard` | Tablet Grid | Metric cards display in 2x2 grid layout | `768px` (Tablet) | Metric cards display cleanly in 2 columns and 2 rows with balanced gutter spacing | Unverified | Medium | Tablet layout reflow |
| `ADM-RS-004` | Admin | Users | User Management | `/dashboard/users` | Table Scroll | Users table enables horizontal touch scroll container | `375px` / `768px` | Table wraps in horizontal scroll container (`overflow-x-auto`); page does not break viewport width | Unverified | High | Table overflow guard |
| `ADM-RS-005` | Admin | Users | User Management | `/dashboard/users` | Filter Stacking | Filter controls stack vertically on small viewports | `375px` (Mobile) | Search input and dropdown selects stack vertically with full width (w-full) | Unverified | Medium | Form control reflow |
| `ADM-RS-006` | Admin | Layout | Admin Layout | `/dashboard` | Desktop Layout | Persistent sidebar and multi-column dashboard grid | `1440px` (Desktop) | Sidebar remains visible at fixed width (260px); main content spans remaining width with 4-card metric row | Unverified | High | Desktop layout check |

---

## 5. Editor Module Test Cases

### 5.1 Editor UI & Workspace Test Cases (`EDT-UI`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EDT-UI-001` | Editor | Workspace | Document Editor | `/editor` | Editor Canvas | Verify document page canvas renders with page shadow and margin guides | Editor loaded | 1. Navigate to `/editor`<br>2. Inspect central workspace canvas | N/A | White page canvas (A4 default) renders centered on neutral gray background with subtle drop shadow | Unverified | Critical | Primary workspace canvas |
| `EDT-UI-002` | Editor | Ribbon | Document Editor | `/editor` | Ribbon Tabs Bar | Verify Ribbon Tab navigation bar renders all top-level tabs | Editor loaded | 1. Inspect top ribbon tab strip | N/A | Tabs render: "Home", "Insert", "Layout", "Review"; active tab ("Home") is underlined with accent color | Unverified | High | Ribbon tab bar |
| `EDT-UI-003` | Editor | Ribbon | Document Editor | `/editor` | Ribbon Groups | Verify Home tab tool groups render with vertical divider separators | Home tab active | 1. Inspect Home tab toolbar sections | N/A | Groups render with labels: Clipboard, Font, Paragraph, Styles, Editing; thin vertical divider lines separate groups | Unverified | High | Group organization |
| `EDT-UI-004` | Editor | Sidebar | Document Editor | `/editor` | Icon Sidebar | Verify left icon sidebar displays all module icon shortcuts | Editor loaded | 1. Inspect leftmost narrow vertical icon bar | N/A | Icons render: Document, Writing, Styles, Symbols, Tables, Figures, Links/Reference, Appendices, Track Changes, Settings, AI | Unverified | High | Vertical shortcut rail |
| `EDT-UI-005` | Editor | Overlay | Document Editor | `/editor` | Left Overlay | Verify Left Overlay panel slides open when clicking icon sidebar | Editor loaded | 1. Click "Writing" icon on left rail | Tool: Writing | Overlay drawer slides out smoothly (320px width) with header "Writing", subtitle, and close button (X) | Unverified | High | Overlay drawer toggle |
| `EDT-UI-006` | Editor | Status Bar | Document Editor | `/editor` | Status Bar | Verify bottom status bar metrics and zoom slider controls | Editor loaded | 1. Inspect bottom horizontal bar | N/A | Displays "Page 1 of 1", "0 words", language "English (US)", zoom percentage ("100%"), zoom slider, and view mode buttons | Unverified | Medium | Bottom status strip |
| `EDT-UI-007` | Editor | AI Panel | Document Editor | `/editor` | AI Assistant | Verify AI Assistant panel toggles and displays prompt interface | Editor loaded | 1. Click AI sparkle icon on top-right toolbar or sidebar | N/A | AI Assistant drawer opens on right side with prompt textarea, quick action chips, and history section | Unverified | Medium | AI side panel |

---

### 5.2 Ribbon Toolbar Test Cases (`EDT-RB`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EDT-RB-001` | Editor | Ribbon | Document Editor | `/editor` | Font Family Picker | Select font family from dropdown applies style to selected text | Text selected | 1. Select text in document<br>2. Click Font Family dropdown in Ribbon<br>3. Select "Georgia" | Font: `"Georgia"` | Dropdown shows "Georgia"; selected document text changes font family to Georgia in real-time | Unverified | High | Font family change |
| `EDT-RB-002` | Editor | Ribbon | Document Editor | `/editor` | Font Size Picker | Select font size from dropdown applies size to selected text | Text selected | 1. Select text in document<br>2. Click Font Size dropdown in Ribbon<br>3. Select "18" | Size: `"18"` | Dropdown displays "18"; selected text font size updates to 18pt | Unverified | High | Font size change |
| `EDT-RB-003` | Editor | Ribbon | Document Editor | `/editor` | Font Size Steppers | Clicking Increase/Decrease Font Size buttons increments/decrements size | Text selected | 1. Select text with size 12<br>2. Click "Grow Font" button (A^)<br>3. Click "Shrink Font" button (Av) | Steppers | First click increases size to 14pt; second click returns size to 12pt; dropdown reflects changes | Unverified | Medium | Font size steppers |
| `EDT-RB-004` | Editor | Ribbon | Document Editor | `/editor` | Font Sync | Selecting existing paragraph synchronizes font family and font size dropdowns | Formatted text | 1. Click cursor inside paragraph formatted in "Courier New" at "16pt"<br>2. Observe Ribbon dropdowns | Formatted node | Font Family dropdown immediately updates to "Courier New"; Font Size dropdown immediately updates to "16" | Unverified | Critical | Text selection sync (Case 2 fix) |
| `EDT-RB-005` | Editor | Ribbon | Document Editor | `/editor` | Formatting Toggles | Bold, Italic, Underline, Strikethrough buttons toggle active states | Text selected | 1. Click Bold (B)<br>2. Click Italic (I)<br>3. Click Underline (U)<br>4. Click Strikethrough (S) | Formatting commands | Buttons display active pressed state; selected text applies bold, italic, underline, and strikethrough styles | Unverified | High | Inline formatting |
| `EDT-RB-006` | Editor | Ribbon | Document Editor | `/editor` | Color Pickers | Text Color and Text Highlight color popover palettes apply colors | Text selected | 1. Click Text Color picker arrow<br>2. Pick red swatch (#EF4444)<br>3. Click Highlight picker<br>4. Pick yellow swatch | Color: Red / Yellow | Text font color changes to red; text background highlight changes to yellow | Unverified | High | Color palette application |
| `EDT-RB-007` | Editor | Ribbon | Document Editor | `/editor` | Paragraph Alignment | Left, Center, Right, and Justify alignment buttons update block style | Paragraph active | 1. Place cursor in paragraph<br>2. Click Center Align<br>3. Click Right Align<br>4. Click Justify | Alignment commands | Active button updates; paragraph alignment aligns to center, right, and full justification accordingly | Unverified | High | Alignment formatting |
| `EDT-RB-008` | Editor | Ribbon | Document Editor | `/editor` | Line Spacing Menu | Line spacing dropdown displays options and updates paragraph line height | Paragraph active | 1. Click Line Spacing button dropdown<br>2. Verify menu options: 1.0, 1.15, 1.5, 2.0, 2.5, 3.0<br>3. Select 1.5 | Value: `1.5` | Dropdown displays options; clicking 1.5 sets paragraph `line-height` to 1.5; active checkmark appears | Unverified | High | Line spacing dropdown |
| `EDT-RB-009` | Editor | Ribbon | Document Editor | `/editor` | Lists Dropdowns | Bulleted and Numbered lists apply list formatting with sub-variants | Document active | 1. Click Bulleted List button<br>2. Enter two items<br>3. Toggle to Numbered List | List toggle | Items format with disc bullets; toggling changes to decimal numerals (1., 2.) | Unverified | High | List formatting |
| `EDT-RB-010` | Editor | Ribbon | Document Editor | `/editor` | Insert Tab | Insert Blank Page, Page Break, and Table grid picker | Insert tab active | 1. Click Insert tab<br>2. Click "Table" button<br>3. Hover over 3x3 grid<br>4. Click grid cell | Grid: 3x3 | A 3-column by 3-row HTML/rich-text table is inserted at current document cursor position | Unverified | High | Table insertion |
| `EDT-RB-011` | Editor | Ribbon | Document Editor | `/editor` | Layout Tab Margins | Layout tab Margins dropdown changes page margins | Layout tab active | 1. Click Layout tab<br>2. Click "Margins" dropdown<br>3. Select "Narrow" (0.5 in) | Preset: "Narrow" | Document page canvas margin guides adjust to 0.5 inches (48px) padding dynamically | Unverified | High | Page layout styling |
| `EDT-RB-012` | Editor | Ribbon | Document Editor | `/editor` | Layout Tab Orientation | Layout tab Orientation toggles between Portrait and Landscape | Layout tab active | 1. Click Orientation dropdown<br>2. Select "Landscape" | Mode: Landscape | Canvas dimensions swap to width: 297mm, height: 210mm (Landscape orientation) | Unverified | High | Orientation toggle |
| `EDT-RB-013` | Editor | Ribbon | Document Editor | `/editor` | Review Track Changes | Review tab Track Changes toggle enables revision tracking mode | Review tab active | 1. Click Review tab<br>2. Click "Track Changes" toggle button | Toggle: ON | Track Changes button highlights in active amber state; subsequent typing appears in revision markup style | Unverified | High | Revision tracking toggle |

---

### 5.3 Left Overlay Submodules Test Cases (`EDT-DOC`, `EDT-WRT`, `EDT-STY`, `EDT-SYM`, `EDT-NAV`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EDT-DOC-001` | Editor | Documents | Document Editor | `/editor` | Search Documents | Search input filters list of existing document records | Overlay open | 1. Open Documents overlay<br>2. Type query in "Search documents..." input | Query: `"Contract"` | Documents list filters in real-time to items matching "Contract" | Unverified | Medium | Document list filter |
| `EDT-DOC-002` | Editor | Documents | Document Editor | `/editor` | New Document | Clicking "+ New" button creates new blank document card | Overlay open | 1. Click "+ New" button in Documents overlay | Action: Click | New document record is created and set as active unsaved document tab | Unverified | High | New document creation |
| `EDT-DOC-003` | Editor | Documents | Document Editor | `/editor` | Breaks Section | Expanding Breaks section displays Page Break and Section Break triggers | Overlay open | 1. Click accordion header "Breaks"<br>2. Click "Page Break" button | Break: Page | Section expands smoothly; clicking Page Break inserts page divider into document | Unverified | Medium | Accordion & breaks |
| `EDT-DOC-004` | Editor | Documents | Document Editor | `/editor` | Find & Replace UI | Navigation accordion displays Find and Replace tabbed inputs | Overlay open | 1. Expand "Navigation" accordion<br>2. Click "Replace" tab | Subtab: Replace | Panel displays "Find what" and "Replace with" rounded inputs, and action buttons: Replace, Replace All, Find Next, Cancel | Unverified | High | Find / Replace panel |
| `EDT-DOC-005` | Editor | Documents | Document Editor | `/editor` | Find Next Action | Entering query in Find What and clicking "Find Next" highlights match | Text exists | 1. Enter search term in "Find what"<br>2. Click "Find Next" button | Query: `"Agreement"` | First occurrence of "Agreement" in document text is highlighted and scrolled into view | Unverified | High | Search highlight |
| `EDT-DOC-006` | Editor | Documents | Document Editor | `/editor` | Replace All Action | Clicking "Replace All" substitutes all query instances with replacement | Text exists | 1. Enter "old" in Find what<br>2. Enter "new" in Replace with<br>3. Click "Replace All" | Find: "old", Replace: "new" | All occurrences of "old" in the document are replaced with "new"; match count notification displays | Unverified | High | Global text replacement |
| `EDT-WRT-001` | Editor | Writing | Document Editor | `/editor` | Tool Search | Writing tools search input filters available controls | Writing open | 1. Open Writing overlay<br>2. Type "highlight" in search box | Query: `"highlight"` | Only Text Highlight tool section remains visible; other sections hide | Unverified | Low | Writing tools search |
| `EDT-WRT-002` | Editor | Writing | Document Editor | `/editor` | Highlight Swatches | Clicking color swatch applies background highlight to selected text | Text selected | 1. Select text in document<br>2. Click Yellow swatch (#FEF08A) in Writing panel | Color: Yellow | Selected text receives yellow background highlight; swatch displays active ring border | Unverified | High | Highlight application |
| `EDT-WRT-003` | Editor | Writing | Document Editor | `/editor` | Remove Highlight | Clicking "Remove" button clears background highlight from selection | Highlighted text | 1. Select highlighted text<br>2. Click "Remove" button next to swatches | Action: Remove | Background highlight is removed from selected text; text background returns to transparent | Unverified | Medium | Highlight removal |
| `EDT-WRT-004` | Editor | Writing | Document Editor | `/editor` | Alignment Buttons | Left, Center, Right, Justify buttons in panel format active block | Paragraph active | 1. Place cursor in paragraph<br>2. Click "Center" alignment button | Alignment: Center | Active button displays active blue styling; paragraph text aligns to center | Unverified | High | Panel alignment controls |
| `EDT-WRT-005` | Editor | Writing | Document Editor | `/editor` | List Selectors | Bullets and Numbering dropdown selectors format lists | Text selected | 1. Select 3 lines of text<br>2. Click Bullets dropdown button | List: Bullets | Lines convert to an unordered list with bullet points | Unverified | High | Panel list controls |
| `EDT-STY-001` | Editor | Styles | Document Editor | `/editor` | Styles Gallery | Clicking style card (Heading 1, Heading 2, Quote) formats block | Block active | 1. Open Styles overlay<br>2. Place cursor in paragraph<br>3. Click "Heading 1" card | Style: "Heading 1" | Block element transforms into `<h1>` with Heading 1 font size (24pt), bold weight, and heading margins | Unverified | High | Style preset application |
| `EDT-STY-002` | Editor | Styles | Document Editor | `/editor` | Clear Formatting | Clicking "Clear Formatting" button strips inline styles back to Normal | Styled text | 1. Select text with mixed bold/italic/colors<br>2. Click "Clear Formatting" | Action: Clear | All inline styling spans are removed; text resets to Normal style (11pt default font) | Unverified | Medium | Clear style operation |
| `EDT-SYM-001` | Editor | Symbols | Document Editor | `/editor` | Search Symbols | Typing symbol name in search input filters symbols grid | Symbols open | 1. Open Symbols overlay<br>2. Enter "alpha" in search field | Query: `"alpha"` | Grid filters to Greek letter α (U+03B1) and Α (U+0391) | Unverified | Low | Symbol search filter |
| `EDT-SYM-002` | Editor | Symbols | Document Editor | `/editor` | Insert Symbol | Clicking symbol tile inserts character at current cursor position | Caret placed | 1. Place cursor in text<br>2. Open Symbols overlay<br>3. Click copyright symbol © | Char: `©` | Symbol © is inserted immediately at cursor position; focus remains in document editor | Unverified | High | Symbol insertion |
| `EDT-NAV-001` | Editor | Navigation | Document Editor | `/editor` | Tab Switcher | Navigation panel switches between Web URL tab and Email tab | Navigation open | 1. Open Navigation/Reference overlay<br>2. Click "Email" tab<br>3. Click "Web URL" tab | Tab click | Active tab switches with rounded pill styling; corresponding form view displays below | Unverified | High | Navigation tab switcher |
| `EDT-NAV-002` | Editor | Navigation | Document Editor | `/editor` | Web URL Form | Enter Link Text, Web Address, and insert hyperlink | Text caret set | 1. Enter Link Text: "Google"<br>2. Enter Web Address: "https://google.com"<br>3. Check "Open link in new browser tab"<br>4. Click "Insert Link ->" | Link data | Hyperlink `<a href="https://google.com" target="_blank">Google</a>` is inserted into document | Unverified | High | Hyperlink insertion |
| `EDT-NAV-003` | Editor | Navigation | Document Editor | `/editor` | Email Form UI | Email tab displays Recipient Email, Subject, Message, and Send to Gmail | Email tab active | 1. Click "Email" tab<br>2. Verify form fields and "Send to Gmail" button | N/A | Form displays Recipient Email (with mail icon), Subject, Message textarea, and "Send to Gmail" button | Unverified | High | Email tab UI validation |
| `EDT-NAV-004` | Editor | Navigation | Document Editor | `/editor` | Send to Gmail Action | Clicking Send to Gmail opens mailto or Gmail compose in new tab | Valid fields | 1. Enter recipient: "test@example.com"<br>2. Enter subject: "Review"<br>3. Click "Send to Gmail" | Email data | Browser opens Gmail web compose URL with recipient, subject, and encoded message prefilled | Unverified | Medium | Email external launcher |
| `EDT-NAV-005` | Editor | Navigation | Document Editor | `/editor` | Bare Links Action | Clicking "Bare Links (Convert Raw URLs)" scans and converts raw URLs | Raw URLs in text | 1. Type raw URL `https://coedit.ai` into editor<br>2. Open Navigation overlay<br>3. Click "BARE LINKS (Convert Raw URLs)" | Raw text URL | Raw URL string is detected and automatically converted into clickable hyperlink tag | Unverified | High | URL auto-linker |
| `EDT-NAV-006` | Editor | Navigation | Document Editor | `/editor` | Links History List | Inserted links appear in Links History list with counter badge | Link inserted | 1. Insert a link<br>2. Inspect "LINKS HISTORY" section in overlay | History state | Links History counter increments to 1; history list renders item with URL, text, and timestamp | Unverified | Medium | Links history tracker |

---

### 5.4 Editor Responsive Layout Test Cases (`EDT-RS`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Viewport | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EDT-RS-001` | Editor | Workspace | Document Editor | `/editor` | Canvas Scaling | Document canvas auto-fits viewport width with horizontal scroll | `375px` (Mobile) | Canvas scales down or allows horizontal pan without breaking UI headers; no unconstrained text spill | Unverified | High | Mobile canvas behavior |
| `EDT-RS-002` | Editor | Ribbon | Document Editor | `/editor` | Ribbon Overflow | Ribbon toolbar groups wrap or enable horizontal scroll | `768px` (Tablet) | Ribbon items do not wrap into multi-row mess; ribbon scrolls horizontally smoothly or collapses into overflow | Unverified | High | Tablet ribbon handling |
| `EDT-RS-003` | Editor | Overlay | Document Editor | `/editor` | Overlay Full Width | Left overlay drawer spans full viewport width on mobile | `375px` (Mobile) | Overlay panel adjusts width to 100vw, with prominent close button (X) and touch-friendly padding | Unverified | High | Mobile overlay drawer |
| `EDT-RS-004` | Editor | Status Bar | Document Editor | `/editor` | Status Bar Wrap | Status bar hides secondary metrics and preserves zoom controls | `768px` (Tablet) | Word count and page count remain visible; zoom percentage and slider adjust cleanly without clipping | Unverified | Medium | Status bar responsiveness |
| `EDT-RS-005` | Editor | Workspace | Document Editor | `/editor` | Desktop Canvas | Centered canvas layout with comfortable margins on standard screens | `1280px` (Desktop) | Canvas centers with generous margins; Left Overlay opens beside canvas without obscuring text | Unverified | High | Desktop workspace layout |
| `EDT-RS-006` | Editor | Workspace | Document Editor | `/editor` | Ultra-Wide Layout | Centered canvas layout on 1920px Full HD monitor | `1920px` (Full HD) | Canvas maintains max-width constraints; left and right gutters distribute evenly without distortion | Unverified | Low | Ultra-wide screen layout |

---

## 6. Accessibility & WCAG 2.1 AA Test Cases (`ACC`)

| Test Case ID | Module | Submodule | Page Name | Route | Feature | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ACC-001` | Universal | a11y | All Pages | Multiple | Keyboard Tab Nav | All interactive elements are reachable via sequential `Tab` key | Page loaded | 1. Press `Tab` repeatedly through header, sidebar, and forms | Keyboard | Visible focus ring (outline) appears on every focused button, link, and input element | Unverified | Critical | WCAG 2.1.1 Keyboard |
| `ACC-002` | Universal | a11y | Admin / Editor | Multiple | Modal Focus Trap | Focus is trapped inside open modal dialogs | Modal open | 1. Open "Add User" or "Insert Table" modal<br>2. Tab through elements | Keyboard | Focus cycles only between modal form controls and close button; does not escape to background | Unverified | High | WCAG 2.4.3 Focus Order |
| `ACC-003` | Universal | a11y | Admin / Editor | Multiple | Escape Dismiss | Pressing `Escape` key closes active modal dialog or overlay drawer | Modal/Drawer open | 1. Open Left Overlay drawer<br>2. Press `Escape` key | Key: `Esc` | Active drawer or modal closes immediately; focus returns to the initiating trigger button | Unverified | High | WCAG 2.1.2 No Keyboard Trap |
| `ACC-004` | Universal | a11y | All Pages | Multiple | ARIA Attributes | Buttons, dropdowns, and dialogs have appropriate ARIA roles and labels | Page loaded | 1. Inspect DOM using Accessibility inspector | DevTools | Dialogs have `role="dialog"`, buttons have descriptive `aria-label`, dropdowns have `aria-expanded` | Unverified | High | WCAG 4.1.2 Name, Role, Value |
| `ACC-005` | Universal | a11y | All Pages | Multiple | Color Contrast | Text elements meet minimum 4.5:1 contrast ratio against backgrounds | Page loaded | 1. Run Lighthouse / axe-core color contrast audit | Audit tool | All regular text achieves >= 4.5:1 contrast; large text achieves >= 3:1 in both light and dark themes | Unverified | High | WCAG 1.4.3 Contrast Minimum |

---

## 7. Cross-Browser Compatibility Test Cases (`BRW`)

| Test Case ID | Module | Submodule | Browser | OS | Feature | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status | Priority | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BRW-001` | Universal | Browser | Google Chrome | Windows / macOS | All Features | Complete test execution in Google Chrome (V8 engine) | Latest Chrome | 1. Execute full Admin & Editor test suites in Chrome | All features render, execute, and animate without layout shifts or script exceptions | Unverified | Critical | Primary desktop browser |
| `BRW-002` | Universal | Browser | Microsoft Edge | Windows | All Features | Complete test execution in Microsoft Edge (Chromium) | Latest Edge | 1. Execute Admin & Editor test suites in MS Edge | Rendering and performance identical to Chrome; all CSS grid and flexbox properties stable | Unverified | High | Standard enterprise browser |
| `BRW-003` | Universal | Browser | Mozilla Firefox | Windows / Linux | All Features | Complete test execution in Mozilla Firefox (Gecko engine) | Latest Firefox | 1. Execute Admin & Editor test suites in Firefox | Font metrics, scrollbars, dropdowns, and canvas rendering match visual baseline | Unverified | High | Non-Chromium engine |
| `BRW-004` | Universal | Browser | Apple Safari | macOS / iOS | All Features | Complete test execution in Apple Safari (WebKit engine) | Latest Safari | 1. Execute Admin & Editor test suites in Safari | Backdrop blur filters, SVG icons, inputs, and touch gestures render cleanly without WebKit quirks | Unverified | High | WebKit compatibility |

---

## 8. Summary of Test Case Counts

| Module / Category | Identifier Prefix | Total Test Cases | High / Critical | Medium | Low |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin UI & Layout** | `ADM-UI` | 10 | 6 | 3 | 1 |
| **Admin Functional & Forms** | `ADM-FN` | 13 | 12 | 1 | 0 |
| **Admin Responsive** | `ADM-RS` | 6 | 4 | 2 | 0 |
| **Editor UI & Workspace** | `EDT-UI` | 7 | 5 | 2 | 0 |
| **Ribbon Toolbar & Controls** | `EDT-RB` | 13 | 11 | 2 | 0 |
| **Left Overlay Submodules** | `EDT-DOC/WRT/STY/SYM/NAV` | 17 | 13 | 2 | 2 |
| **Editor Responsive** | `EDT-RS` | 6 | 4 | 1 | 1 |
| **Accessibility (WCAG AA)** | `ACC` | 5 | 5 | 0 | 0 |
| **Cross-Browser Compatibility** | `BRW` | 4 | 4 | 0 | 0 |
| **Total Comprehensive Test Cases**| **All Suites** | **81** | **64** | **13** | **4** |

---
*Documentation generated strictly for frontend testing and quality assurance of CoEdit.ai.*
