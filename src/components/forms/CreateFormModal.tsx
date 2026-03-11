'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createForm } from '@/app/actions-forms';
import { Plus, X, Loader2 } from 'lucide-react';

export default function CreateFormModal({ siteId }: { siteId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createForm(siteId, name);
            setIsOpen(false);
            setName('');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to create form');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
                <Plus size={16} />
                Create Form
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Create New Form</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-black dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Form Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Waitlist, Newsletter"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-800 dark:border-neutral-700"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Default Setup</label>
                        <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm dark:bg-neutral-800 dark:border-neutral-700">
                            CTA: Submit, one email field
                        </div>
                        <p className="text-xs text-gray-400">You can edit fields and settings after creating the form.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 create-form-actions">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            Create Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
