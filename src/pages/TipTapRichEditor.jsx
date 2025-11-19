
import { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { FaBold, FaItalic, FaHeading, FaListUl, FaListOl, FaLink, FaImage, FaQuoteRight, FaCode, FaUndo, FaRedo, FaTrash, FaSave } from 'react-icons/fa';
import "./style.css";
const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
  >
    {children}
  </button>
);

export default function TipTapRichEditor({
  initialContent = '',
  onChange = () => {},
  onSave = null,
  uploadImage = null,
  autoSave = false,
  className = ''
}) {
  const [html, setHtml] = useState(initialContent || '');
  const saveTimer = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: 'code-block' }
        }
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing your article...'
      })
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const updated = editor.getHTML();
      setHtml(updated);
      // Debounced onChange
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onChange(updated);
        if (autoSave && typeof onSave === 'function') {
          onSave(updated);
        }
      }, 300);
    }
  });

  // Rehydrate when initialContent prop changes
  useEffect(() => {
    if (!editor) return;
    if (initialContent === undefined || initialContent === null) return;
    // only set if different
    if (editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertImageFromFile = useCallback(async (file) => {
    if (!editor) return;
    if (!file) return;

    // If uploadImage prop provided, use it to upload and get URL
    if (uploadImage && typeof uploadImage === 'function') {
      try {
        const url = await uploadImage(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Image upload failed');
      }
      return;
    }

    // Fallback: create data URL (embed) — note: big images will bloat DB if saved as HTML
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      editor.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
  }, [editor, uploadImage]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    insertImageFromFile(file);
    e.target.value = '';
  }, [insertImageFromFile]);

  const command = (name) => {
    if (!editor) return false;
    switch (name) {
      case 'bold':
        return editor.chain().focus().toggleBold().run();
      case 'italic':
        return editor.chain().focus().toggleItalic().run();
      case 'h1':
        return editor.chain().focus().toggleHeading({ level: 1 }).run();
      case 'h2':
        return editor.chain().focus().toggleHeading({ level: 2 }).run();
      case 'h3':
        return editor.chain().focus().toggleHeading({ level: 3 }).run();
      case 'ul':
        return editor.chain().focus().toggleBulletList().run();
      case 'ol':
        return editor.chain().focus().toggleOrderedList().run();
      case 'quote':
        return editor.chain().focus().toggleBlockquote().run();
      case 'codeblock':
        return editor.chain().focus().toggleCodeBlock().run();
      case 'undo':
        return editor.chain().undo().run();
      case 'redo':
        return editor.chain().redo().run();
      case 'clear':
        return editor.commands.clearContent(true);
      default:
        return false;
    }
  };

  const save = useCallback(() => {
    if (!editor) return;
    const out = editor.getHTML();
    if (typeof onSave === 'function') onSave(out);
  }, [editor, onSave]);

  return (
    <div className={`prose max-w-full bg-white dark:bg-gray-900 border rounded-md p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => command('undo')} title="Undo"><FaUndo /></ToolbarButton>
        <ToolbarButton onClick={() => command('redo')} title="Redo"><FaRedo /></ToolbarButton>

        <div className="border-l h-6 mx-2" />

        {/* Basic formatting */}
        <ToolbarButton onClick={() => command('bold')} title="Bold"><FaBold /></ToolbarButton>
        <ToolbarButton onClick={() => command('italic')} title="Italic"><FaItalic /></ToolbarButton>

        <div className="border-l h-6 mx-2" />

        {/* Headings */}
        <ToolbarButton onClick={() => command('h1')} title="H1"><FaHeading /> H1</ToolbarButton>
        <ToolbarButton onClick={() => command('h2')} title="H2"><FaHeading /> H2</ToolbarButton>
        <ToolbarButton onClick={() => command('h3')} title="H3"><FaHeading /> H3</ToolbarButton>

        <div className="border-l h-6 mx-2" />

        {/* Lists */}
        <ToolbarButton onClick={() => command('ul')} title="Bulleted List"><FaListUl /></ToolbarButton>
        <ToolbarButton onClick={() => command('ol')} title="Numbered List"><FaListOl /></ToolbarButton>

        <div className="border-l h-6 mx-2" />

        {/* Quote & codeblock */}
        <ToolbarButton onClick={() => command('quote')} title="Quote"><FaQuoteRight /></ToolbarButton>
        <ToolbarButton onClick={() => command('codeblock')} title="Code Block"><FaCode /></ToolbarButton>

        <div className="border-l h-6 mx-2" />

        {/* Link / Image */}
        <ToolbarButton onClick={setLink} title="Insert / Edit Link"><FaLink /></ToolbarButton>
        {/* <ToolbarButton onClick={insertImageFromUrl} title="Insert Image from URL"><FaImage /></ToolbarButton> */}

        {/* hidden file input for uploads */}
        <input type="file" accept="image/*" id="rte-image-upload" className="hidden" onChange={handleFileInput} />
        <label htmlFor="rte-image-upload" className="inline-block">
          {/* <ToolbarButton as="label" title="Upload Image"><FaImage /></ToolbarButton> */}
        </label>

        <div className="flex-1" />

        <ToolbarButton onClick={() => command('clear')} title="Clear content"><FaTrash /></ToolbarButton>
        <ToolbarButton onClick={save} title="Save"><FaSave /></ToolbarButton>
      </div>

      <div className="editor-body border rounded-md overflow-hidden">
        <EditorContent editor={editor} className="min-h-[200px] p-4" />
      </div>

      <div className="mt-3 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span>{editor ? editor.getText().length : 0} chars</span>
          <span className="mx-2">•</span>
          <span>{editor ? editor.state.doc.content.size : 0} nodes</span>
        </div>
        <div className="text-right">
          <span className="italic">Content format: HTML</span>
        </div>
      </div>
    </div>
  );
}
