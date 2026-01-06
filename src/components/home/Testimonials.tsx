export function Testimonials() {
    const testimonials = [
        {
            quote: "Finally, AI + Markdown = pro site in 10 mins. Saved 15 hrs/week vs. Webflow.",
            author: "Alex Rivera",
            role: "Freelance Coach",
        },
        {
            quote: "Ditched $49/mo subs. One upload, stunning landing page—landed 3 clients fast.",
            author: "Jamie Lee",
            role: "Course Creator",
        },
        {
            quote: "Full control, no code. Perfect for my Twitter promo sites. Game-changer.",
            author: "Chris Patel",
            role: "Consultant",
        },
    ];

    return (
        <div className="py-24 sm:py-32 bg-gray-50 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-lg font-semibold leading-8 tracking-tight text-blue-600 dark:text-blue-500">Testimonials</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Solopreneurs Love It
                    </p>
                </div>
                <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="flex flex-col justify-between bg-white dark:bg-black p-6 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 rounded-2xl">
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
