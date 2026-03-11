'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FormField, FormLayout, sanitizeFormLayout } from '@/lib/forms';

type PublicFormConfig = {
    id: string;
    name: string;
    ctaText: string;
    layout: FormLayout;
    fields: FormField[];
};

export default function Form({ id }: { id: string }) {
    const [config, setConfig] = useState<PublicFormConfig | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            setIsLoadingConfig(true);
            try {
                const res = await fetch(`/api/forms/${id}`);
                if (!res.ok) throw new Error('Failed to load form');
                const data = await res.json();
                setConfig({
                    ...data,
                    layout: sanitizeFormLayout(data.layout),
                });
                const initialValues: Record<string, string> = {};
                for (const field of data.fields || []) {
                    initialValues[field.key] = '';
                }
                setValues(initialValues);
            } catch (error) {
                console.error(error);
                toast.error('Unable to load form.');
            } finally {
                setIsLoadingConfig(false);
            }
        };
        loadConfig();
    }, [id]);

    const sortedFields = useMemo(() => {
        if (!config?.fields) return [];
        return [...config.fields].sort((a, b) => a.order - b.order);
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formId: id, values }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                const message = payload?.error || 'Failed to submit';
                throw new Error(message);
            }

            setIsSuccess(true);
            const resetValues: Record<string, string> = {};
            for (const field of sortedFields) {
                resetValues[field.key] = '';
            }
            setValues(resetValues);
            toast.success('Submitted successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingConfig) {
        return (
            <div className="p-6">
                <Loader2 className="animate-spin" size={18} />
            </div>
        );
    }

    if (!config || sortedFields.length === 0) {
        return <p className="text-sm text-red-600">This form is not configured yet.</p>;
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col p-8 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="text-green-500 w-10 h-10 mb-3" />
                <h3 className="text-lg font-semibold text-green-800">Submission received!</h3>
                <p className="text-green-600">Thanks for filling out the form.</p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 text-sm text-green-700 underline hover:text-green-900"
                >
                    Submit another response
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`max-w-3xl ${config.layout === 'inlineDesktop'
                ? 'flex flex-col md:flex-row md:items-end gap-3'
                : 'flex flex-col gap-3 max-w-md'
                }`}
        >
            {sortedFields.map((field) => (
                <label
                    key={field.id || field.key}
                    className={`space-y-1 ${
                        config.layout === 'inlineDesktop'
                            ? field.type === 'longText'
                                ? 'flex-1 min-w-0'
                                : 'md:w-[200px] md:flex-none'
                            : ''
                    }`}
                >
                    {field.label?.trim() ? (
                        <span className="text-sm text-gray-700">
                            {field.label}
                            {field.required ? ' *' : ''}
                        </span>
                    ) : null}
                    {field.type === 'longText' ? (
                        <textarea
                            required={field.required}
                            placeholder={field.placeholder || field.key}
                            aria-label={field.label?.trim() || field.key}
                            value={values[field.key] || ''}
                            onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                            rows={4}
                        />
                    ) : (
                        <input
                            type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                            required={field.required}
                            placeholder={field.placeholder || field.key}
                            aria-label={field.label?.trim() || field.key}
                            value={values[field.key] || ''}
                            onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        />
                    )}
                </label>
            ))}
            <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px] ${config.layout === 'inlineDesktop' ? 'md:self-end md:w-auto' : ''
                    }`}
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : config.ctaText || 'Submit'}
            </button>
        </form>
    );
}
