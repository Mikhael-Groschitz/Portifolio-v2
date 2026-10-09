"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  DatabaseIcon,
  KeywordIcon,
  ProcedureIcon,
  TableIcon,
} from "@/components/icons";
import { useLanguage } from "@/components/locale/language-context";
import { LocaleText } from "@/components/locale/locale-text";
import { QUERY_DOCUMENT } from "@/components/shell/section-routes";
import { useWorkspace } from "@/components/shell/workspace-context";
import { type Localized, mapLocalized } from "@/content/locales";
import type { CompletionKind, QueryText } from "@/content/types";
import { catalogIdentifiers } from "@/engine/catalog";
import { MAX_QUERY_LENGTH } from "@/engine/execute";
import {
  type Completion,
  type CompletionItem,
  completionAt,
  isWordCharacter,
} from "./completions";
import { documentTabId } from "./document-ids";
import { isExecuteShortcut } from "./execute-shortcut";
import { highlightTsql } from "./highlight";
import { cursorOf } from "./query-store";
import styles from "./query-editor.module.css";

const IDENTIFIERS = catalogIdentifiers();
const PAGE_SIZE = 8;

const KIND_ICONS: Record<CompletionKind, ReactNode> = {
  keyword: <KeywordIcon />,
  table: <TableIcon />,
  procedure: <ProcedureIcon />,
  database: <DatabaseIcon />,
};

const MOVES: Record<string, number> = {
  ArrowDown: 1,
  ArrowUp: -1,
  PageDown: PAGE_SIZE,
  PageUp: -PAGE_SIZE,
};

interface OpenCompletion extends Completion {
  active: number;
  line: number;
  column: number;
}

interface CompletionListProps {
  id: string;
  completion: OpenCompletion;
  text: QueryText;
  onPick: (item: CompletionItem) => void;
}

function CompletionList({
  id,
  completion,
  text,
  onPick,
}: Readonly<CompletionListProps>) {
  const listRef = useRef<HTMLDivElement>(null);
  const { items, active, line, column } = completion;
  const selected = items[active];

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      className={styles.completion}
      style={{ "--line": line, "--column": column } as CSSProperties}
    >
      <div
        ref={listRef}
        id={id}
        role="listbox"
        aria-label={text.suggestions}
        className={styles.list}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === active}
            className={styles.option}
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(item);
            }}
          >
            <span className={styles.optionIcon}>{KIND_ICONS[item.kind]}</span>
            <span className={styles.optionLabel}>{item.label}</span>
            <span className={styles.optionOwner}>{item.owner}</span>
            <span className="visually-hidden">{text.kinds[item.kind]}</span>
          </div>
        ))}
      </div>
      <div className={styles.detail} aria-hidden="true">
        {KIND_ICONS[selected.kind]}
        {`${text.kinds[selected.kind]} ${selected.label}`}
      </div>
    </div>
  );
}

function isTyping(event: ChangeEvent<HTMLTextAreaElement>): boolean {
  const typed = (event.nativeEvent as InputEvent).data ?? "";
  return (
    typed.length > 0 &&
    [...typed].every(
      (character) => isWordCharacter(character) || character === " ",
    )
  );
}

export function QueryEditor({
  text,
}: Readonly<{ text: Localized<QueryText> }>) {
  const { query } = useWorkspace();
  const { locale } = useLanguage();
  const snapshot = useSyncExternalStore(
    query.subscribe,
    query.getSnapshot,
    query.getSnapshot,
  );
  const [completion, setCompletion] = useState<OpenCompletion | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const accepting = useRef(false);
  const labelId = useId();
  const hintId = useId();
  const listId = useId();
  const lines = useMemo(
    () => highlightTsql(snapshot.text, IDENTIFIERS),
    [snapshot.text],
  );
  const empty = snapshot.text === "";

  useEffect(() => {
    function focusIfRequested() {
      if (query.takeFocusRequest()) {
        textareaRef.current?.focus();
      }
    }
    focusIfRequested();
    return query.subscribe(focusIfRequested);
  }, [query]);

  function suggest(value: string, caret: number, explicit: boolean) {
    const next = completionAt(value, caret, explicit);
    if (!next) {
      setCompletion(null);
      return;
    }
    setCompletion({ ...next, active: 0, ...cursorOf(value, next.from) });
  }

  function accept(item: CompletionItem) {
    const textarea = textareaRef.current;
    if (!textarea || !completion) {
      return;
    }
    textarea.focus();
    textarea.setSelectionRange(completion.from, completion.to);
    accepting.current = true;
    const inserted = document.execCommand("insertText", false, item.label);
    accepting.current = false;
    if (!inserted) {
      textarea.setRangeText(item.label, completion.from, completion.to, "end");
      query.update({
        text: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      });
    }
    setCompletion(null);
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const { value, selectionStart, selectionEnd } = event.target;
    query.update({ text: value, selectionStart, selectionEnd });
    if (accepting.current) {
      return;
    }
    if (completion || isTyping(event)) {
      suggest(value, selectionStart, false);
    }
  }

  function handleSelect(event: SyntheticEvent<HTMLTextAreaElement>) {
    const { value, selectionStart, selectionEnd } = event.currentTarget;
    query.update({ selectionStart, selectionEnd });
    if (!completion) {
      return;
    }
    if (selectionStart !== selectionEnd || selectionStart < completion.from) {
      setCompletion(null);
    } else if (selectionStart !== completion.to) {
      suggest(value, selectionStart, false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey && event.key === " ") {
      event.preventDefault();
      suggest(
        event.currentTarget.value,
        event.currentTarget.selectionStart,
        true,
      );
      return;
    }
    if (!completion) {
      return;
    }
    if (isExecuteShortcut(event)) {
      setCompletion(null);
      return;
    }
    const move = MOVES[event.key];
    if (move !== undefined) {
      event.preventDefault();
      const last = completion.items.length - 1;
      setCompletion({
        ...completion,
        active: Math.min(Math.max(completion.active + move, 0), last),
      });
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      accept(completion.items[completion.active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setCompletion(null);
    }
  }

  return (
    <section
      aria-labelledby={documentTabId(QUERY_DOCUMENT)}
      data-editor=""
      className={styles.editor}
    >
      <span id={labelId} className="visually-hidden">
        <LocaleText text={mapLocalized(text, (entry) => entry.editorLabel)} />
      </span>
      <div className={styles.gutter} aria-hidden="true">
        {lines.map((_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
      <div className={styles.surface}>
        <pre className={styles.highlight} aria-hidden="true">
          {lines.map((line, index) => (
            <span key={index}>
              {line.map((token, position) => (
                <span
                  key={position}
                  style={token.color ? { color: token.color } : undefined}
                >
                  {token.content}
                </span>
              ))}
              {"\n"}
            </span>
          ))}
        </pre>
        {empty && (
          <p id={hintId} className={styles.placeholder}>
            <LocaleText
              text={mapLocalized(text, (entry) => entry.placeholder)}
            />
          </p>
        )}
        <textarea
          ref={textareaRef}
          className={styles.input}
          value={snapshot.text}
          maxLength={MAX_QUERY_LENGTH}
          wrap="off"
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          aria-labelledby={labelId}
          aria-describedby={empty ? hintId : undefined}
          aria-autocomplete="list"
          aria-controls={completion ? listId : undefined}
          aria-activedescendant={
            completion ? `${listId}-${completion.active}` : undefined
          }
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onBlur={() => setCompletion(null)}
        />
        {completion && (
          <CompletionList
            id={listId}
            completion={completion}
            text={text[locale]}
            onPick={accept}
          />
        )}
      </div>
    </section>
  );
}
