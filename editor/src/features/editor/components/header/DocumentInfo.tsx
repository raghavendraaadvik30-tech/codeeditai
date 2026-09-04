/*
Purpose:
DocumentInfo is a small UI component used to display
document-related information within the editor.

What it does:
- Provides a dedicated area for document metadata or status.
- Uses a muted text style for secondary information.
- Uses a vertical flex layout to keep document details organized.

Current State:
The component currently contains an empty paragraph, so no
document information is being displayed yet.

Future Use:
Document details such as document name, word count, page count,
last saved status, or other metadata can be added here.

Data/API:
This component currently does not use any API, backend, or
editor state.

UI Responsibility:
Only handles the presentation area for document information.
*/

export default function DocumentInfo() {
 

  return (
    <div className="flex flex-col justify-center">
     

      <p className="text-xs text-muted-foreground">
        
      </p>
    </div>
  );
}