interface Props {
  label: string;
  children: React.ReactNode;
}

export function StyleFormRow({
  label,
  children,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </label>

      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {children}
      </div>
    </div>
  );
}