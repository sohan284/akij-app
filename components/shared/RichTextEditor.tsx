'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Undo, 
  Redo, 
  ChevronLeft 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type here...',
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm focus:outline-none w-full p-4 min-h-[120px] max-w-none text-slate-700 leading-relaxed",
          className
        ),
      },
    },
  });

  // Sync content if it changes externally (e.g. when editing a different question)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-slate-50/50">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-500 hover:text-primary"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={16} />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-500 hover:text-primary"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={16} />
        </Button>
        
        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
        
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white border rounded-md text-sm text-slate-600 cursor-default">
          Normal text <ChevronLeft size={14} className="-rotate-90" />
        </div>
        
        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-slate-500 hover:text-primary transition-colors",
            editor.isActive('bulletList') && "text-primary bg-indigo-50"
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </Button>

        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-slate-500 hover:text-primary transition-colors",
            editor.isActive('orderedList') && "text-primary bg-indigo-50"
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-slate-500 hover:text-primary transition-colors",
            editor.isActive('bold') && "text-primary bg-indigo-50"
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 text-slate-500 hover:text-primary transition-colors",
            editor.isActive('italic') && "text-primary bg-indigo-50"
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </Button>
      </div>

      {/* Content Area */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
