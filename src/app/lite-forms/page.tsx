import { LiteFormsHeader } from "@/components/lite-forms/Header";
import { LiteFormsHero } from "@/components/lite-forms/Hero";
import { LiteFormsFeatures } from "@/components/lite-forms/Features";
import { LiteFormsPricing } from "@/components/lite-forms/Pricing";
import { LiteFormsTestimonials } from "@/components/lite-forms/Testimonials";
import { LiteFormsGuides } from "@/components/lite-forms/Guides";
import { LiteFormsCTA } from "@/components/lite-forms/CTA";
import { LiteFormsFooter } from "@/components/lite-forms/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lite Forms — Form API, notifications & lead management",
    description:
        "Get instant email alerts when someone submits your form, and manage every lead in one Lite Forms dashboard—search, export, uploads, spam protection, and webhooks without building a backend.",
};

export default function LiteFormsHome() {
    return (
        <div className="bg-white dark:bg-black min-h-screen">
            <LiteFormsHeader />
            <main>
                <LiteFormsHero />
                <LiteFormsFeatures />
                <LiteFormsPricing />
                <LiteFormsTestimonials />
                <LiteFormsGuides />
                <LiteFormsCTA />
            </main>
            <LiteFormsFooter />
        </div>
    );
}
