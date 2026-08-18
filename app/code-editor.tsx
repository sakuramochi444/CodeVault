"use client";

import { KeyboardEvent, useRef } from "react";

type CodeEditorProps = {
  value: string;
  onValueChange: (value: string) => void;
  highlight: (value: string) => string;
};

export default function CodeEditor({ value, onValueChange, highlight }: CodeEditorProps) {
  const highlightRef = useRef<HTMLPreElement>(null);

  const syncScroll = (target: HTMLTextAreaElement) => {
    if (!highlightRef.current) return;
    highlightRef.current.scrollTop = target.scrollTop;
    highlightRef.current.scrollLeft = target.scrollLeft;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextValue = `${value.slice(0, start)}    ${value.slice(end)}`;
    onValueChange(nextValue);

    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + 4;
    });
  };

  const highlightedCode = `${highlight(value)}${value.endsWith("\n") ? " " : ""}`;

  return (
    <div className="code-editor">
      <pre
        ref={highlightRef}
        className="code-editor-highlight"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <textarea
        id="algorithm-code"
        className="code-editor-input"
        aria-label="コードエディタ"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={(event) => syncScroll(event.currentTarget)}
      />
    </div>
  );
}
