/*### `useEditor.ts` — Description

**Purpose:**
Provides a simple re-export of the `useEditor` hook from `EditorContext`.

**Responsibilities:**

* Imports `useEditor` from the editor context.
* Re-exports it so other components can access the editor state through a cleaner import path.
* Avoids duplicating the hook implementation.

**In short:**

> `useEditor.ts` acts as a **convenience/export layer**, allowing components to access the shared editor state using a consistent hook import.
*/



export { useEditor } from "../context/EditorContext";
