"use client";

import { useEffect, useMemo, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({
  value,
  onChange,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(
    () => Math.max(value.split("\n").length, 1),
    [value]
  );

  useEffect(() => {
    if (!lineNumbersRef.current || !textareaRef.current) return;

    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  }, [value]);

  function handleScroll() {
    if (!lineNumbersRef.current || !textareaRef.current) return;

    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key !== "Tab") return;

    event.preventDefault();

    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const nextValue =
      value.substring(0, start) +
      "    " +
      value.substring(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.selectionStart = start + 4;
      textarea.selectionEnd = start + 4;
    });
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#03070d]">
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="w-12 shrink-0 overflow-hidden border-r border-slate-900 bg-[#050a11] py-4 text-right font-mono text-xs leading-6 text-slate-700"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index} className="h-6 pr-3">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-300 outline-none placeholder:text-slate-700"
          placeholder="# Start writing your quantum program..."
          aria-label="Quantum Python code editor"
        />
      </div>
    </div>
  );
}