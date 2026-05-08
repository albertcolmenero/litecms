import Link from "next/link";

export function LiteFormsFooter() {
    return (
        <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    {[
                        { name: "Privacy Policy", href: "#" },
                        { name: "Terms of Service", href: "#" },
                        { name: "DPA", href: "#" },
                        { name: "Contact", href: "#" },
                    ].map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="sr-only">{item.name}</span>
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} Lite Forms. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
