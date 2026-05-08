import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Linkedin, Mail, Twitter, ExternalLink, Calendar, Briefcase, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
    const site = await prisma.site.findFirst({
        where: {
            OR: [
                { customDomain: "albertcolmenero.com" },
                { subdomain: "albertcolmenero" },
            ],
        },
        select: { settings: true },
    });

    const faviconUrl = (site?.settings as any)?.faviconUrl;

    return {
        title: "Albert Colmenero | SaaS Builder & GTM Expert",
        description: "Personal website of Albert Colmenero. SaaS builder, operator, and expert in GTM strategy and product-led growth.",
        ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
    };
}

export default function PersonalPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/albertcolmenero" className="text-xl font-bold tracking-tight">
                        Albert Colmenero
                    </Link>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <Link href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
                        <Link href="#experience" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Experience</Link>
                        <Link href="#projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projects</Link>
                        <Link href="#resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Resources</Link>
                    </div>
                    <div className="flex gap-4">
                        <Link href="https://linkedin.com/in/albertcolmenero" target="_blank" className="text-gray-500 hover:text-blue-600 transition-colors">
                            <Linkedin size={20} />
                        </Link>
                        <Link href="https://twitter.com/albertcolmenero" target="_blank" className="text-gray-500 hover:text-blue-400 transition-colors">
                            <Twitter size={20} />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="py-20 md:py-32 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="max-w-3xl">
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                SaaS Builder & <br /> GTM Expert
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
                                Building full autonomy for Go-To-Market. <br />
                                Scaling B2B SaaS from 0-to-1 to global exits.
                            </p>
                            <div className="flex gap-4">
                                <Link href="#contact">
                                    <Button size="lg" className="rounded-full px-8 text-base">
                                        Get in touch <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20 px-6 bg-white dark:bg-zinc-900/50 border-y border-gray-100 dark:border-zinc-800">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-[30%_70%] gap-12">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">About Me</h2>
                            <div className="w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed space-y-6">
                            <p>
                                I'm a SaaS builder and operator with over 20 years of experience scaling B2B SaaS from 0-to-1 to global exits. I specialize in GTM strategy, product-led growth, and monetization.
                            </p>
                            <p>
                                Previously, I co-founded Kompyte, a competitive intelligence platform that I scaled to a successful acquisition by Semrush (NYSE: SEMR) in 2022. Following the acquisition, I led the Competitive Intelligence unit operations and AI at Semrush.
                            </p>
                            <p>
                                Before that, I co-founded COCOsoft in 2006, building internet platforms that still power thousands of businesses today. Most recently, I spent 2025 leading product & engineering at Atlas, an AI-native monetization platform.
                            </p>
                            <p>
                                Now, I'm launching <strong>PlayGTM</strong>—empowering early-stage SaaS & AI founders to build high-velocity go-to-market engines. As a 500 Global mentor, I also guide founders on GTM playbooks, pricing, and turning bold ideas into sustainable traction.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Experience Section */}
                <section id="experience" className="py-24 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold mb-4">Journey</h2>
                            <p className="text-gray-600 dark:text-gray-400">My professional path and key milestones.</p>
                        </div>

                        <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-12">

                            {/* PlayGTM */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-black"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <h3 className="text-xl font-bold">Co-Founder & CPTO</h3>
                                    <span className="text-sm text-gray-500 font-mono">Jan 2026 - Present</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">PlayGTM</div>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                    Building Full Autonomy for Go-To-Market. Empowering early-stage SaaS & AI founders to build high-velocity GTM engines.
                                </p>
                            </div>

                            {/* 500 Global */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <h3 className="text-xl font-bold">Mentor - Alumni Founder Coach</h3>
                                    <span className="text-sm text-gray-500 font-mono">Jun 2024 - Present</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">500 Global</div>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                    Guiding founders on GTM playbooks, pricing/monetization, avoiding common pitfalls, and turning bold ideas into sustainable traction.
                                </p>
                            </div>

                            {/* Atlas */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <h3 className="text-xl font-bold">Product</h3>
                                    <span className="text-sm text-gray-500 font-mono">Jan 2025 - Dec 2025</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Atlas</div>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                    Led product & engineering for an AI-native monetization platform fusing real-time revenue intelligence with no-code billing.
                                </p>
                            </div>

                            {/* Semrush */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <h3 className="text-xl font-bold">Head of Operations, Competitive Intelligence Unit</h3>
                                    <span className="text-sm text-gray-500 font-mono">Mar 2022 - Dec 2024</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Semrush</div>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                    Led Customer Success, Support, and the AI Lab for the Competitive Intelligence Unit following the Kompyte acquisition.
                                </p>
                            </div>

                            {/* Kompyte */}
                            <div className="relative pl-8 md:pl-12">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-black"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                    <h3 className="text-xl font-bold">COO & CPO (Co-Founder)</h3>
                                    <span className="text-sm text-gray-500 font-mono">Jan 2014 - Mar 2022</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Kompyte</div>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                                    Co-founded and scaled the competitive intelligence platform from 0 to successful acquisition by Semrush. (500 Global Batch 19).
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Projects Showcase */}
                <section id="projects" className="py-24 px-6 bg-gray-50 dark:bg-zinc-900/30">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-4">Projects</h2>
                            <p className="text-gray-600 dark:text-gray-400">What I've been working on recently.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Placeholder Project Card 1 */}
                            <div className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="aspect-video bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Briefcase className="w-12 h-12 text-gray-300" />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">PlayGTM Platform</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        The operating system for modern GTM teams. Automating strategy to execution.
                                    </p>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                                        Coming Soon <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>

                            {/* Placeholder Project Card 2 */}
                            <div className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="aspect-video bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Briefcase className="w-12 h-12 text-gray-300" />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">GTM Playbook Collection</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        A curated library of proven Go-To-Market strategies for early stage SaaS.
                                    </p>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center">
                                        Coming Soon <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources Section */}
                <section id="resources" className="py-24 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-4">Resources</h2>
                            <p className="text-gray-600 dark:text-gray-400">Tools, templates, and reading for founders.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {/* Resource Item 1 */}
                            <Link href="#" className="block p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors">SaaS Pricing Model Template</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Spreadsheet ensuring your monetization strategy scales.</p>
                            </Link>

                            {/* Resource Item 2 */}
                            <Link href="#" className="block p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors">GTM Checklist for Seed Stage</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Essential steps before your first 10 customers.</p>
                            </Link>

                            {/* Resource Item 3 */}
                            <Link href="#" className="block p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors">Recommended Reading</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Books that shaped my thinking on product and growth.</p>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-24 px-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Let's Connect</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
                            Always open to discussing new opportunities, GTM strategy, or just geek out on SaaS.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="rounded-full gap-2" asChild>
                                <Link href="mailto:hello@albertcolmenero.com">
                                    <Mail className="w-4 h-4" /> Email Me
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full gap-2" asChild>
                                <Link href="https://linkedin.com/in/albertcolmenero" target="_blank">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full gap-2" asChild>
                                <Link href="https://twitter.com/albertcolmenero" target="_blank">
                                    <Twitter className="w-4 h-4" /> Twitter
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        © {new Date().getFullYear()} Albert Colmenero. All rights reserved.
                    </p>
                </footer>

            </main>
        </div>
    );
}
