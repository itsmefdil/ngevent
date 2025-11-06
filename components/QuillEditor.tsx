'use client';

import { useEffect, useRef } from 'react';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export default function QuillEditor({ value, onChange, placeholder = 'Write something...', height = '300px' }: QuillEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const isUpdating = useRef(false);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!editorRef.current) return;
        if (typeof window === 'undefined') return;
        if (isInitialized.current) return; // Prevent re-initialization

        isInitialized.current = true;

        // Dynamic import Quill to avoid SSR issues
        import('quill').then((QuillModule) => {
            const Quill = QuillModule.default;

            // Initialize Quill
            const quill = new Quill(editorRef.current!, {
                theme: 'snow',
                placeholder,
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        [{ font: [] }],
                        [{ size: ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ color: [] }, { background: [] }],
                        [{ script: 'sub' }, { script: 'super' }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ indent: '-1' }, { indent: '+1' }],
                        [{ align: [] }],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video'],
                        ['clean']
                    ],
                },
            });

            quillRef.current = quill;

            // Set initial value
            if (value) {
                const delta = quill.clipboard.convert({ html: value });
                quill.setContents(delta);
            }

            // Listen to text changes
            quill.on('text-change', () => {
                if (!isUpdating.current) {
                    const html = quill.root.innerHTML;
                    onChange(html);
                }
            });
        });

        // Cleanup
        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
            }
        };
    }, [placeholder, onChange]);

    // Update content when value changes externally
    useEffect(() => {
        if (!quillRef.current || isUpdating.current) return;

        const currentHtml = quillRef.current.root.innerHTML;
        if (currentHtml !== value) {
            isUpdating.current = true;
            const delta = quillRef.current.clipboard.convert({ html: value || '' });
            quillRef.current.setContents(delta);
            isUpdating.current = false;
        }
    }, [value]);

    return (
        <div className="quill-wrapper" style={{ marginBottom: '2rem' }}>
            <div ref={editorRef} style={{ minHeight: height }} />
            <style jsx global>{`
                .ql-container {
                    font-family: inherit;
                    font-size: 14px;
                }
                .ql-editor {
                    min-height: ${height};
                    max-height: 500px;
                    overflow-y: auto;
                }
                .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9ca3af;
                }
                
                /* Dark mode styles */
                .dark .ql-toolbar {
                    background-color: #374151;
                    border-color: #4b5563;
                }
                .dark .ql-container {
                    background-color: #1f2937;
                    border-color: #4b5563;
                    color: #fff;
                }
                .dark .ql-editor {
                    color: #fff;
                }
                .dark .ql-stroke {
                    stroke: #9ca3af;
                }
                .dark .ql-fill {
                    fill: #9ca3af;
                }
                .dark .ql-picker-label {
                    color: #9ca3af;
                }
                .dark .ql-picker-options {
                    background-color: #374151;
                    border-color: #4b5563;
                }
                .dark .ql-picker-item:hover {
                    color: #fff;
                }
                .dark .ql-toolbar button:hover,
                .dark .ql-toolbar button.ql-active {
                    background-color: #4b5563;
                }
                .dark .ql-toolbar button:hover .ql-stroke,
                .dark .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #fff;
                }
                .dark .ql-toolbar button:hover .ql-fill,
                .dark .ql-toolbar button.ql-active .ql-fill {
                    fill: #fff;
                }
                
                /* Toolbar styling */
                .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                .ql-container.ql-snow {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
            `}</style>
        </div>
    );
}
