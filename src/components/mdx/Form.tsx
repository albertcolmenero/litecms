'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Form({ id }: { id: string }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/leads/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formId: id, email }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            setIsSuccess(true);
            setEmail('');
            toast.success('Joined successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-xl border border-green-100 text-center">
                <CheckCircle className="text-green-500 w-10 h-10 mb-3" />
                <h3 className="text-lg font-semibold text-green-800">You're on the list!</h3>
                <p className="text-green-600">Thanks for joining.</p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4 text-sm text-green-700 underline hover:text-green-900"
                >
                    Submit another email
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Join Waitlist'}
            </button>
        </form>
    );
}
