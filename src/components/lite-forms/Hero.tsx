import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardCopy, FormInput } from "lucide-react";

const exampleSnippet = `<form action="https://lite-forms.example/s/{YOUR_FORM_ID}"
  method="POST" enctype="multipart/form-data">
  <input type="email" name="email" required>
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>`;

export function LiteFormsHero() {
    return (
        <div className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),black)] opacity-20" />
            <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white dark:bg-black shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 dark:ring-indigo-900 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-400 dark:ring-gray-50/10 dark:hover:ring-gray-50/20">
                            <span className="inline-flex items-center gap-1">
                                <FormInput className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Form API + lead workspace — no backend required</span>
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Know the moment a lead submits <br />
                        <span className="text-blue-600 dark:text-blue-500">Manage every lead in Lite Forms</span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Connect your HTML form to Lite Forms and get instant email notifications when someone fills it out—then review, search, and organize every submission in one dashboard. File uploads, spam blocking, and webhooks included. No servers to deploy.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button asChild size="lg" className="h-12 px-8 text-base">
                            <Link href="#pricing">
                                Get started free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                            <Link href="#features">See features</Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch">
                    <div className="rounded-2xl bg-gray-50 dark:bg-zinc-900/50 p-6 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-500">Your form endpoint</p>
                        <p className="mt-3 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                            https://lite-forms.example/s/xxxxxxxx
                        </p>
                        <Button type="button" variant="secondary" size="sm" className="mt-4 gap-2" disabled>
                            <ClipboardCopy className="h-4 w-4" />
                            Copy endpoint
                        </Button>
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Preview only — after signup, your live endpoint and full lead inbox live in the Lite Forms dashboard.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-gray-900 p-4 text-left ring-1 ring-gray-800 shadow-lg">
                        <p className="mb-3 text-xs font-medium text-gray-400">HTML — drop into any site</p>
                        <pre className="overflow-x-auto text-xs leading-relaxed text-gray-100 sm:text-sm">
                            <code>{exampleSnippet}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
