'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { 
  RiBold, 
  RiItalic,
  RiH2,
  RiListUnordered,
  RiListOrdered,
  RiSeparator
} from 'react-icons/ri';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: false,
      }),
      Heading.configure({
        HTMLAttributes: {
          class: 'text-xl font-bold',
        },
        levels: [2],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc ml-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal ml-4',
        },
      }),
      ListItem,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px]',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
    enableCoreExtensions: true,
    enableInputRules: true,
    enablePasteRules: true,
    immediatelyRender: false
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:border-indigo-300 transition-all">
      <div className="border-b bg-white p-2 flex items-center gap-1">
        {/* Text Style Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <button
            type="button"
            onClick={() => editor.commands.toggleBold()}
            className={`p-2 rounded hover:bg-indigo-50 transition-colors ${
              editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
            title="Bold (Ctrl+B)"
          >
            <RiBold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.commands.toggleItalic()}
            className={`p-2 rounded hover:bg-indigo-50 transition-colors ${
              editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
            title="Italic (Ctrl+I)"
          >
            <RiItalic className="w-4 h-4" />
          </button>
        </div>

        {/* Heading */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <button
            type="button"
            onClick={() => editor.commands.toggleHeading({ level: 2 })}
            className={`p-2 rounded hover:bg-indigo-50 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
            title="Heading"
          >
            <RiH2 className="w-4 h-4" />
          </button>
        </div>

        {/* List Group */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <button
            type="button"
            onClick={() => editor.commands.toggleBulletList()}
            className={`p-2 rounded hover:bg-indigo-50 transition-colors ${
              editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
            title="Bullet List"
          >
            <RiListUnordered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.commands.toggleOrderedList()}
            className={`p-2 rounded hover:bg-indigo-50 transition-colors ${
              editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
            title="Numbered List"
          >
            <RiListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Rule */}
        <div className="flex items-center gap-1 px-2">
          <button
            type="button"
            onClick={() => editor.commands.setHorizontalRule()}
            className="p-2 rounded hover:bg-indigo-50 transition-colors text-gray-600"
            title="Horizontal Rule"
          >
            <RiSeparator className="w-4 h-4" />
          </button>
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none bg-white" 
      />
    </div>
  );
};

export default RichTextEditor;
