import { useEffect, useRef, useState } from "react";
import { normalizeNumericInput } from "@/lib/format";

type Props = {
  value: number;
  label: string;
  onCommit: (value: number) => void;
  compact?: boolean;
};

/** Keep a text draft until confirmation: numeric coercion interrupts Arabic
 * keyboards, deleting a value, and entering a trailing decimal separator. */
export default function MoneyEditor({ value, label, onCommit }: Props) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setDraft(String(value));
  }, [value]);

  function commit() {
    const text = normalizeNumericInput(draft);
    if (!/^\d*(\.\d{0,3})?$/.test(text) || text === ".") {
      setError(true);
      return;
    }
    const amount = text === "" ? 0 : Number(text);
    if (!Number.isFinite(amount)) { setError(true); return; }
    setError(false);
    // The parent may cap a value (e.g. restaurants). Show the accepted prop,
    // then the effect picks up any newly committed value.
    setDraft(String(value));
    if (amount !== value) onCommit(amount);
  }

  return (
    <span className="money-editor" data-invalid={error || undefined}>
      <input
        ref={input}
        aria-label={label}
        aria-invalid={error || undefined}
        title={error ? "اكتب مبلغاً صحيحاً، حتى ٣ خانات عشرية" : label}
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        autoComplete="off"
        spellCheck={false}
        dir="ltr"
        value={draft}
        onFocus={(event) => { editing.current = true; event.currentTarget.select(); }}
        onChange={(event) => {
          setDraft(normalizeNumericInput(event.target.value));
          setError(false);
        }}
        onBlur={() => { editing.current = false; commit(); }}
        onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); input.current?.blur(); }
          if (event.key === "Escape") { setDraft(String(value)); setError(false); }
        }}
        className="money-edit-input number-ltr"
      />
      <button type="button" className="money-editor-done" aria-label={`حفظ ${label}`}
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => { commit(); input.current?.blur(); }}>تم</button>
    </span>
  );
}
