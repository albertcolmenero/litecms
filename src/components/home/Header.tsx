import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                            LiteCMS
                        </Link>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            Blog
                        </Link>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="ghost" className="hidden sm:inline-flex">
                            <Link href="/app/sign-in">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="#pricing">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
