// interface Props {
//   label: string;
//   children: React.ReactNode;
// }

// export function StyleFormRow({
//   label,
//   children,
// }: Props) {
//   return (
//     <div className="flex items-center gap-3">
//       <label className="text-xs text-muted-foreground w-24 shrink-0">
//         {label}
//       </label>

//       <div className="flex items-center gap-2 flex-1 flex-wrap">
//         {children}
//       </div>
//     </div>
//   );
// }

interface Props {
  label: string;

  children: React.ReactNode;

  suffix?: string;
}

export function StyleFormRow({
  label,
  children,
  suffix,
}: Props) {
  return (
    <div
      className="
        grid
        grid-cols-[120px_1fr]
        items-center
        gap-4
      "
    >
      <label className="text-sm text-muted-foreground">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {children}

        {suffix && (
          <span className="text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}