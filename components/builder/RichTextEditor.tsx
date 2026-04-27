"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-on-surface text-sm leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Enter URL", previous ?? "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const buttons: { name: string; icon: string; action: () => void; active: boolean }[] = [
    {
      name: "Bold",
      icon: "format_bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      name: "Italic",
      icon: "format_italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      name: "H2",
      icon: "format_h2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      name: "H3",
      icon: "format_h3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      name: "Bullet list",
      icon: "format_list_bulleted",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      name: "Numbered list",
      icon: "format_list_numbered",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      name: "Code block",
      icon: "code",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      name: "Quote",
      icon: "format_quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
  ]

  const isEmpty = editor.isEmpty
  const showPlaceholder = isEmpty && placeholder

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low">
      <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-outline-variant bg-surface-container">
        {buttons.map((b) => (
          <button
            key={b.name}
            type="button"
            onClick={b.action}
            aria-label={b.name}
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-surface-container-high transition-colors ${
              b.active ? "text-primary bg-primary/10" : "text-on-surface-variant"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined !text-lg">{b.icon}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={setLink}
          aria-label="Link"
          disabled={disabled}
          className={`p-1.5 rounded hover:bg-surface-container-high transition-colors ${
            editor.isActive("link") ? "text-primary bg-primary/10" : "text-on-surface-variant"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="material-symbols-outlined !text-lg">link</span>
        </button>
      </div>
      <div className="relative">
        {showPlaceholder && (
          <span className="absolute top-3 left-4 text-on-surface-variant text-sm pointer-events-none">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
