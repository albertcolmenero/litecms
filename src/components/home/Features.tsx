import { Sparkles, Upload, Layout, Shield } from "lucide-react";

const features = [
    {
        name: "AI-Powered Markdown",
        description:
            "Prompt any LLM for perfect pages—hero sections, testimonials, cards. Upload & go live instantly.",
        icon: Sparkles,
    },
    {
        name: "Drag-Drop Publishing",
        description:
            "Edit in Notion/VS Code/GitHub, upload files—no dashboards. Changes live in seconds.",
        icon: Upload,
    },
    {
        name: "Stunning Layouts",
        description:
            "Multi-column grids, buttons, forms via simple syntax. Responsive, SEO-optimized designs boost leads.",
        icon: Layout,
    },
    {
        name: "Full Ownership",
        description:
            "Export plain text anytime. Built-in analytics, custom domains—no lock-in fears.",
        icon: Shield,
    },
];

export function Features() {
    return (
        <div id="features" className="py-24 sm:py-32 bg-gray-50 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-500">
                        10x Faster Sites
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Build & Update Without Code or Headaches
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Turn your daily AI workflow into revenue-driving websites. Own your content forever, escape $29+/mo subscriptions.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
