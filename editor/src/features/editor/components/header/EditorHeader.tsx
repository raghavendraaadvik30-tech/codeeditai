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
import UserProfile from "./UserProfile";

export default function EditorHeader() {
  return (
    <header
      className="
        h-[58px]
        border-b
        bg-white
        dark:bg-[#0B1620]
        border-gray-200
        dark:border-slate-800
        flex
        items-center
        px-3
      "
    >
      <HeaderLogo />

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <HeaderActions />
        <UserProfile />
      </div>
    </header>
  );
}