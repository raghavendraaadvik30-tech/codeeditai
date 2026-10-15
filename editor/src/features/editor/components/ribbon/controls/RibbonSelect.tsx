/*
Purpose:

Creates a reusable dropdown/combobox select control for the editor ribbon,
supporting both standard dropdowns and Microsoft Word–style editable controls
(where users can both type custom values and select from dropdowns).

Features:
- Standard select mode (editable=false).
- Microsoft Word–style editable combobox mode (editable=true):
  * Type custom font names or custom positive font sizes directly.
  * Dropdown arrow button toggles the dropdown list.
  * Enter commits value and applies to document selection.
  * Escape cancels editing and restores previous value.
  * Autocomplete / filtered list while typing (when filterOptions=true).
  * Direct validation against empty, negative, or invalid values.
  * Keyboard navigation with ArrowUp / ArrowDown / Enter / Escape.
  * Full dark / light mode support matching Office ribbon styling.
  * Selection preservation: ensures editor selection is never unintentionally dropped.
*/

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { ChevronDown, Check } from "lucide-react";

export interface RibbonSelectOption {
  label: string;
  value?: string;
  onSelect: () => void;
  style?: React.CSSProperties;
}

export interface RibbonSelectProps {
  label: string;
  options: RibbonSelectOption[];
  width?: number;
  disabled?: boolean;
  editable?: boolean;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
  inputMode?: "text" | "decimal" | "numeric";
  filterOptions?: boolean;
  allowCustomValue?: boolean;
  validate?: (value: string) => boolean;
  onCommit?: (value: string) => void;
  onCancel?: () => void;
  onFocusChange?: (focused: boolean) => void;
}

export default function RibbonSelect({
  label,
  options,
  width = 120,
  disabled = false,
  editable = false,
  placeholder,
  title,
  ariaLabel,
  inputMode = "text",
  filterOptions = false,
  allowCustomValue = true,
  validate,
  onCommit,
  onCancel,
  onFocusChange,
}: RibbonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(label);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isCancelledRef = useRef(false);

  // Synchronize internal input value with external label when user is not actively editing
  useEffect(() => {
    if (!isFocused) {
      setInputValue(label);
    }
  }, [label, isFocused]);

  // Notify parent of focus changes
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  const preventFocusLoss = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Filter options if filterOptions is true and user is actively typing
  const filteredOptions =
    editable && filterOptions && isFocused && inputValue.trim().length > 0
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(inputValue.trim().toLowerCase())
        )
      : options;

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll<HTMLElement>("[data-select-item]");
      const target = items[highlightedIndex];
      if (target) {
        target.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  // Set initial highlighted index to current value when opening dropdown
  useEffect(() => {
    if (isOpen) {
      const currentVal = inputValue.trim().toLowerCase();
      const idx = filteredOptions.findIndex(
        (opt) => opt.label.toLowerCase() === currentVal
      );
      setHighlightedIndex(idx >= 0 ? idx : -1);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Commit value handler
  const commitValue = (valToCommit: string) => {
    const trimmed = valToCommit.trim();

    if (!trimmed) {
      setInputValue(label);
      return;
    }

    if (validate && !validate(trimmed)) {
      setInputValue(label);
      return;
    }

    // Check if matches an existing option exactly
    const exactMatch = options.find(
      (opt) => opt.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactMatch) {
      exactMatch.onSelect();
      setInputValue(exactMatch.label);
    } else if (allowCustomValue && onCommit) {
      onCommit(trimmed);
      setInputValue(trimmed);
    } else {
      setInputValue(label);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
        return;
      }
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        const option = filteredOptions[highlightedIndex];
        option.onSelect();
        setInputValue(option.label);
      } else {
        commitValue(inputValue);
      }

      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      isCancelledRef.current = true;
      setInputValue(label);
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
      onCancel?.();
      return;
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // If blur was caused by clicking inside our own container (e.g. dropdown toggle or list), ignore
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
      return;
    }

    setIsFocused(false);
    setIsOpen(false);

    const trimmed = inputValue.trim();
    if (!trimmed || (validate && !validate(trimmed))) {
      setInputValue(label);
      return;
    }

    if (trimmed !== label) {
      commitValue(trimmed);
    }
  };

  // ----------------------------------------------------
  // Non-editable standard dropdown (preserve 100% existing functionality)
  // ----------------------------------------------------
  if (!editable) {
    return (
      <div
        ref={containerRef}
        onMouseDown={preventFocusLoss}
        className="relative select-none"
      >
        <button
          type="button"
          disabled={disabled}
          onMouseDown={preventFocusLoss}
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            flex
            h-8
            items-center
            gap-2
            rounded-md
            border
            border-border
            dark:border-secondary-foreground
            bg-card
            dark:bg-[#111D29]
            px-2
            text-xs
            text-foreground
            dark:text-muted-foreground
            hover:bg-muted
            dark:hover:bg-muted
            disabled:opacity-50
            disabled:pointer-events-none
            cursor-pointer
          "
          style={{ minWidth: width }}
        >
          <span className="flex-1 truncate text-left">{label}</span>

          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground dark:text-muted-foreground transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            onMouseDown={preventFocusLoss}
            className="
              absolute
              left-0
              top-full
              z-50
              mt-1
              max-h-60
              overflow-y-auto
              min-w-full
              rounded-md
              border
              border-secondary
              dark:border-secondary-foreground
              bg-card
              dark:bg-[#0D1A26]
              shadow-lg
              py-1
            "
          >
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  option.onSelect();
                  setIsOpen(false);
                }}
                style={option.style}
                className="
                  block
                  w-full
                  px-3
                  py-1.5
                  text-left
                  text-xs
                  text-secondary-foreground
                  hover:bg-primary/10
                  hover:text-primary
                  dark:text-muted-foreground
                  dark:hover:bg-muted
                  dark:hover:text-primary-foreground
                  cursor-pointer
                  transition-colors
                "
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // Editable Microsoft Word–style combobox
  // ----------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      {/* COMBOBOX INPUT & TOGGLE CONTAINER */}
      <div
        className={`
          flex
          h-8
          w-full
          items-center
          rounded-md
          border
          bg-card
          dark:bg-[#111D29]
          text-xs
          text-foreground
          dark:text-muted-foreground
          transition-all
          ${disabled ? "opacity-50 pointer-events-none" : ""}
          ${
            isFocused || isOpen
              ? "border-brand ring-1 ring-brand dark:border-primary dark:ring-primary shadow-xs"
              : "border-border dark:border-secondary-foreground hover:border-slate-400 dark:hover:border-slate-500 shadow-2xs"
          }
        `}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          title={title}
          aria-label={ariaLabel || placeholder || label}
          inputMode={inputMode}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            if (!isOpen) setIsOpen(true);
            e.currentTarget.select();
          }}
          onClick={(e) => {
            if (!isFocused) {
              setIsFocused(true);
              setIsOpen(true);
            }
            e.currentTarget.select();
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="
            flex-1
            min-w-0
            h-full
            bg-transparent
            px-2
            text-xs
            text-foreground
            dark:text-white
            outline-none
            font-medium
            select-text
          "
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={preventFocusLoss}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => {
              const next = !prev;
              if (next) {
                inputRef.current?.focus();
              }
              return next;
            });
          }}
          className="
            flex
            h-full
            w-5.5
            shrink-0
            items-center
            justify-center
            border-l
            border-border/60
            dark:border-secondary-foreground/60
            text-muted-foreground
            hover:bg-muted/70
            dark:hover:bg-muted/40
            cursor-pointer
            rounded-r-md
            transition-colors
          "
          title={title || "Open list"}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div
          ref={dropdownRef}
          onMouseDown={preventFocusLoss}
          className="
            absolute
            left-0
            top-full
            z-50
            mt-1
            max-h-60
            overflow-y-auto
            min-w-full
            w-max
            max-w-[280px]
            rounded-md
            border
            border-secondary
            dark:border-secondary-foreground
            bg-card
            dark:bg-[#0D1A26]
            shadow-xl
            py-1
          "
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => {
              const isSelected =
                option.label.toLowerCase() === inputValue.trim().toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={option.label}
                  data-select-item="true"
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    option.onSelect();
                    setInputValue(option.label);
                    setIsOpen(false);
                    setIsFocused(false);
                    inputRef.current?.blur();
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={option.style}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    px-3
                    py-1.5
                    text-left
                    text-xs
                    cursor-pointer
                    transition-colors
                    ${
                      isHighlighted || isSelected
                        ? "bg-primary/10 text-primary dark:bg-muted dark:text-primary-foreground font-semibold"
                        : "text-secondary-foreground dark:text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-muted dark:hover:text-primary-foreground"
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="ml-2 h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">
              {allowCustomValue && inputValue.trim()
                ? `Press Enter to apply "${inputValue.trim()}"`
                : "No matching options"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
