import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <div className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),black)] opacity-20" />
            <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white dark:bg-black shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 dark:ring-indigo-900 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-400 dark:ring-gray-50/10 dark:hover:ring-gray-50/20">
                            <span className="inline-flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span>New: AI-Powered Layouts</span>
                                <Link href="/blog" className="font-semibold text-blue-600 dark:text-blue-400 ml-1">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    Read more <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Ditch Dashboard Hell: <br />
                        <span className="text-blue-600 dark:text-blue-500">AI Markdown to Pro Sites</span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Solopreneurs, stop wasting 10-20 hrs/mo on clunky CMS. Prompt ChatGPT/Claude, upload Markdown, launch stunning landing pages & blogs that convert 20-30% better—in minutes.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Button asChild size="lg" className="h-12 px-8 text-base">
                            <Link href="#pricing">
                                Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                            <Link href="#features">Learn more</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
