import { LayoutDashboard, Mail, Upload, ShieldCheck, Zap, Users, Plug } from "lucide-react";

const features = [
    {
        name: "Lead inbox & dashboard",
        description:
            "All submissions from every form land in one place. Search, filter, open attachments, and export—so you are not juggling spreadsheets or lost notification threads.",
        icon: LayoutDashboard,
    },
    {
        name: "Email notifications",
        description:
            "Get alerted the second a new lead submits, while the full record is saved in Lite Forms. Route copies to teammates or use templates—without running your own mail server.",
        icon: Mail,
    },
    {
        name: "File uploads",
        description:
            "Accept resumes, attachments, and media with multipart forms. Files land in your dashboard, ready to review or forward.",
        icon: Upload,
    },
    {
        name: "Field validations",
        description:
            "Enforce required fields, formats, and honeypots from the dashboard so your front-end stays simple and your data stays clean.",
        icon: ShieldCheck,
    },
    {
        name: "Auto-responses",
        description:
            "Send instant thank-you or confirmation emails to visitors. Set it up in minutes instead of wiring SMTP yourself.",
        icon: Zap,
    },
    {
        name: "Team workspaces",
        description:
            "Invite clients or colleagues to a form or project. Everyone sees the same submissions without sharing passwords.",
        icon: Users,
    },
    {
        name: "Integrations & webhooks",
        description:
            "Push submissions to Slack, Sheets, CRMs, or any HTTP endpoint. Connect the tools you already use.",
        icon: Plug,
    },
];

export function LiteFormsFeatures() {
    return (
        <div id="features" className="py-24 sm:py-32 bg-gray-50 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-500">Collect & work leads</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        From first ping to a tidy lead list
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Wire up your HTML, React, Vue, or static site form once. You stay in the loop by email, and your team works every lead from the same Lite Forms workspace—spam, uploads, and integrations included.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">{feature.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="mx-auto mt-20 max-w-3xl rounded-2xl bg-white dark:bg-black px-6 py-10 ring-1 ring-gray-200 dark:ring-gray-800 sm:px-10">
                    <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-500">Spam, no thanks</p>
                    <h3 className="mt-3 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Strong spam protection out of the box
                    </h3>
                    <p className="mt-4 text-center text-base leading-7 text-gray-600 dark:text-gray-300">
                        Heuristics, honeypots, and rate limits cut noise before it hits your inbox—so legitimate leads stay visible.
                    </p>
                </div>
            </div>
        </div>
    );
}
