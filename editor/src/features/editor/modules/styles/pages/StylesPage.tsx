// import { useStyles } from "../hooks/useStyles";
// import { StylesProvider } from "../context/StyleContext";
// import { StylesPanel } from "../components/StylesPanel";

// export default function StylesPage() {
//   const {
//     styles,
//     loading,
//     error,
//   } = useStyles();

//   if (loading) {
//     return (
//       <div className="flex h-full w-full items-center justify-center">
//         <div className="text-sm text-muted-foreground">
//           Loading styles...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-full w-full items-center justify-center p-4">
//         <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
//           Failed to load styles.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <StylesProvider styles={styles}>
//       <div className="h-full w-full">
//         <StylesPanel />
//       </div>
//     </StylesProvider>
//   );
// }


import {
  StylesPanel,
} from "../components/StylesPanel";

import {
  StyleProvider,
} from "../context/StyleContext";

export function StylesPage() {
  return (
    <StyleProvider>
      <div className="h-full min-h-0">
        <StylesPanel />
      </div>
    </StyleProvider>
  );
}