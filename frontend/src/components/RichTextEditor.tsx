"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-container" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="tiptap-toolbar" style={{ padding: '10px', display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={{ padding: '5px 10px', background: editor.isActive('bold') ? 'var(--accent-color)' : 'transparent', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ padding: '5px 10px', background: editor.isActive('italic') ? 'var(--accent-color)' : 'transparent', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ padding: '5px 10px', background: editor.isActive('heading', { level: 2 }) ? 'var(--accent-color)' : 'transparent', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={{ padding: '5px 10px', background: editor.isActive('heading', { level: 3 }) ? 'var(--accent-color)' : 'transparent', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ padding: '5px 10px', background: editor.isActive('bulletList') ? 'var(--accent-color)' : 'transparent', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Bullet List
        </button>
      </div>
      <div style={{ padding: '20px', minHeight: '300px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
