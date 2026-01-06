import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Pricing } from "@/components/home/Pricing";
import { Testimonials } from "@/components/home/Testimonials";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/home/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LiteCMS - AI Markdown CMS for Solopreneurs | Build Stunning Sites No Code",
  description:
    "Ditch WordPress & Webflow dashboards. Generate pro websites with AI & Markdown. Instant uploads, full control, 10x faster updates. Join waitlist for lifetime access.",
};

export default function Home() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
