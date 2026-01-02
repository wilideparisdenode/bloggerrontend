
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
  const [error, setError] = useState(null);
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

  // Image compression function
  const compressImage = useCallback((file, maxWidth = 1200, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const insertImageFromFile = useCallback(async (file) => {
    if (!editor) return;
    if (!file) return;

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please select an image smaller than 10MB.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Compress image before processing
    const compressedFile = await compressImage(file);

    // If uploadImage prop provided, use it to upload and get URL
    if (uploadImage && typeof uploadImage === 'function') {
      try {
        const url = await uploadImage(compressedFile);
        if (url) {
          editor.chain().focus().setImage({ 
            src: url,
            style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;'
          }).run();
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        setError(err.message || 'Image upload failed. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
      return;
    }

    // Fallback: create data URL (embed) — note: compressed images are smaller
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      editor.chain().focus().setImage({ 
        src: dataUrl,
        style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;'
      }).run();
    };
    reader.readAsDataURL(compressedFile);
  }, [editor, uploadImage, compressImage]);

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
      {error && (
        <div className="error-message" style={{
          marginBottom: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(220, 38, 38, 0.1)',
          color: '#dc2626',
          borderRadius: '8px',
          border: '1px solid #dc2626',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
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
        <ToolbarButton onClick={insertImageFromUrl} title="Insert Image from URL"><FaImage /></ToolbarButton>

        {/* hidden file input for uploads */}
        <input type="file" accept="image/*" id="rte-image-upload" className="hidden" onChange={handleFileInput} />
        <label htmlFor="rte-image-upload" className="inline-block cursor-pointer">
          <ToolbarButton as="span" title="Upload Image"><FaImage /></ToolbarButton>
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
