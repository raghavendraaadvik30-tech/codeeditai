/*
Purpose:
EditorHeader is the main top navigation/header component of the
document editor.

What it does:
- Displays the application/editor logo using HeaderLogo.
- Provides a flexible center area to separate the logo from actions.
- Displays editor-related actions using HeaderActions.
- Displays the current user's profile using UserProfile.

Layout:
HeaderLogo
     ↓
Flexible Space
     ↓
HeaderActions + UserProfile

UI:
- Fixed header height of 58px.
- Uses a bottom border for visual separation.
- Supports both light and dark themes.
- Uses flexbox for alignment and spacing.

Component Responsibility:
EditorHeader only handles the header layout and composition.
The individual functionality is handled by:
- HeaderLogo → Logo/branding
- HeaderActions → Header action buttons
- UserProfile → User information/profile actions

Data/API:
This component does not directly call any API or backend service.
*/


import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";

export default function EditorHeader() {
  return (
    <header
      className="
        h-13
        border-b
        bg-[#D3E3FD]
        dark:bg-[#0B1528]
        border-[#E0E7EF]
        dark:border-[#1E3A5F]
        flex
        items-center
        justify-between
        px-3.5
        shadow-xs
      "
    >
      <HeaderLogo />

      <div className="flex-1" />

      <HeaderActions />
    </header>
  );
}
