import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const includedFeatures = [
    "Unified lead inbox (all forms)",
    "Instant email notifications",
    "Unlimited forms",
    "File uploads",
    "Spam protection",
    "Webhooks",
    "AJAX & JSON API",
    "Custom redirect after submit",
    "Export submissions (CSV)",
];

export function LiteFormsPricing() {
    return (
        <div id="pricing" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl sm:text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Simple pricing for forms and lead management
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Start free for side projects. Upgrade when you need higher volume, longer submission history in your inbox, and team access to the same leads.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 dark:ring-gray-700 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                    <div className="p-8 sm:p-10 lg:flex-auto">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Pro workspace</h3>
                        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">
                            Everything in Free, plus higher monthly submissions, longer lead history in the dashboard, priority notification delivery, and shared workspaces for agencies and product teams.
                        </p>
                        <div className="mt-10 flex items-center gap-x-4">
                            <h4 className="flex-none text-sm font-semibold leading-6 text-blue-600 dark:text-blue-500">Included</h4>
                            <div className="h-px flex-auto bg-gray-100 dark:bg-gray-700" />
                        </div>
                        <ul
                            role="list"
                            className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:grid-cols-2 sm:gap-6"
                        >
                            {includedFeatures.map((feature) => (
                                <li key={feature} className="flex gap-x-3">
                                    <Check className="h-6 w-5 flex-none text-blue-600 dark:text-blue-500" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                        <div className="rounded-2xl bg-gray-50 dark:bg-zinc-900/50 py-10 text-center ring-1 ring-inset ring-gray-900/5 dark:ring-white/10 lg:flex lg:flex-col lg:justify-center lg:py-16">
                            <div className="mx-auto max-w-xs px-8">
                                <p className="text-base font-semibold text-gray-600 dark:text-gray-300">From</p>
                                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                                    <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">$19</span>
                                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">/ mo</span>
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Free tier available · no card to try</p>
                                <Button asChild className="mt-10 w-full" size="lg">
                                    <Link href="#">Create form endpoint</Link>
                                </Button>
                                <p className="mt-6 text-xs leading-5 text-gray-600 dark:text-gray-300">
                                    Need more volume? Contact us for annual or enterprise plans.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
