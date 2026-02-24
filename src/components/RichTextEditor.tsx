import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  FileCode,
  Highlighter,
  Link as LinkIcon,
  Minus,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

// ─── Toolbar button ──────────────────────────────────────

function Btn({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-[rgb(var(--cta))]/15 text-[rgb(var(--cta))]"
          : "text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))]"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-[rgb(var(--border))] mx-1" />;
}

// ─── Fixed toolbar ───────────────────────────────────────

function FixedToolbar({ editor }: { editor: any }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const s = 20;
  const sw = 2.5;

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-[rgb(var(--border))]">
      <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        <Heading1 size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        <Heading2 size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
        <Heading3 size={s} strokeWidth={sw} />
      </Btn>
      <Sep />
      <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <Bold size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <Italic size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
        <UnderlineIcon size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
        <Strikethrough size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
        <Highlighter size={s} strokeWidth={sw} />
      </Btn>
      <Sep />
      <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        <List size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
        <ListOrdered size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist">
        <ListChecks size={s} strokeWidth={sw} />
      </Btn>
      <Sep />
      <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
        <Quote size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
        <FileCode size={s} strokeWidth={sw} />
      </Btn>
      <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
        <Code size={s} strokeWidth={sw} />
      </Btn>
      <Sep />
      <Btn onClick={setLink} active={editor.isActive("link")} title="Link">
        <LinkIcon size={s} strokeWidth={sw} />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus size={s} strokeWidth={sw} />
      </Btn>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "pine-editor outline-none min-h-[320px] px-1 py-2",
      },
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  return (
    <div className="w-full">
      {editable && <FixedToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Helper: get plain text from HTML for word count ─────

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
