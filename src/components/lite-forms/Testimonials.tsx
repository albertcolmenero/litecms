export function LiteFormsTestimonials() {
    const testimonials = [
        {
            quote: "We get the email ping for every new lead, but the real win is the inbox—every client form feeds one list we can search and export.",
            author: "Nina Ortiz",
            role: "Agency lead",
        },
        {
            quote: "I wanted alerts without building a backend. Having submissions in a dashboard means I am not digging through notification threads to find a contact.",
            author: "Marcus Chen",
            role: "Indie SaaS",
        },
        {
            quote: "Spam dropped immediately. The lead workspace is clear enough to hand off to non-devs on the team.",
            author: "Priya Shah",
            role: "Marketing ops",
        },
    ];

    return (
        <div className="py-24 sm:py-32 bg-gray-50 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600 dark:text-blue-500">Trusted by builders</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Teams catch and close more leads
                    </p>
                </div>
                <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-between bg-white dark:bg-black p-6 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 rounded-2xl"
                            >
                                <blockquote className="text-gray-900 dark:text-gray-100">
                                    <p>“{testimonial.quote}”</p>
                                </blockquote>
                                <div className="mt-6 flex items-center gap-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold">
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{testimonial.author}</div>
                                        <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
