import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
    return (
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),black)] opacity-20" />
            <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white dark:bg-black shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 dark:ring-indigo-900 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Ready to Own Your Site?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                    Join waitlist now—get early access, 20% lifetime discount, and exclusive AI prompts. Be first to launch.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button asChild size="lg" className="h-12 px-8 text-base">
                        <Link href="#">Join Waitlist Now</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
