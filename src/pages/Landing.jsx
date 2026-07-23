import { useEffect, useState } from "react";
import {
    Heart,
    ThumbsUp,
    Sparkles,
    Flame,
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,

    Menu,
    X,
    Award,
    Layers,
    TrendingUp,
} from "lucide-react";
import logo from "../assets/logos/logo6.png"
import logo2 from "../assets/logos/logo2.png"
import heroimg from "../assets/habiba.png"
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import hero1 from "../assets/habiba.png";
import hero2 from "../assets/fasika.png";
import { AnimatePresence, motion } from "framer-motion";

export default function InfulencerHubLanding() {
    const [current, setCurrent] = useState(0);
    const images = [hero1, hero2, hero1, hero2, hero1, hero2];

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(timer);
    }, [current]);
    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrent((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    return (
        <div className="min-h-full poppins bg-white text-primary font-sans ">
            {/* ============ HEADER ============ */}
            <Header />
            {/* ============ HERO ============ */}
            <section className="relative  overflow-hidden  bg-gradient-to-br from-primary via-secondary to-primary py-16 sm:py-24">
                <div className="pointer-events-none absolute -top-40 -right-32 w-96 h-40 rounded-full bg-amber-400/20 blur-3xl" />

                <div className="max-w-6xl mx-auto px-5 sm:px-8 relative grid lg:grid-cols-2 gap-14 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase">
                            <span className="w-5 h-0.5 bg-amber-400 rounded-full" />
                            Creator Marketplace
                        </span>

                        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                            Influencers &amp; <span className="text-amber-400">Creators</span>, monetized right.
                        </h1>

                        <p className="mt-5 text-violet-100/80 text-lg leading-relaxed max-w-md">
                            Turn your content, creativity, and influence into income — in the largest marketplace built for creators of its kind.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center rounded-full bg-amber-400 text-violet-950 font-semibold px-7 py-4 shadow-lg hover:bg-amber-500 hover:-translate-y-0.5 transition"
                            >
                                I'm a Creator
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center rounded-full border border-white/40 text-white font-semibold px-7 py-4 hover:bg-white/10 hover:-translate-y-0.5 transition"
                            >
                                I'm a Brand
                            </a>
                        </div>

                        <div className="mt-11 flex items-center gap-4">
                            <div className="flex -space-x-2.5">
                                {["A", "M", "J", "K"].map((letter) => (
                                    <span
                                        key={letter}
                                        className="w-9 h-9 rounded-full border-2 border-violet-900 bg-amber-400 text-violet-950 text-xs font-bold flex items-center justify-center"
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-violet-100/75">
                                <strong className="text-white">12,400+</strong> creators already earning on InfulencerHub
                            </p>
                        </div>
                    </div>

                    {/* Hero visual placeholder — replace with a real photo of creators
              using their phones, e.g. <img src="/assets/hero-creators.jpg" /> */}
                    <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-violet-700 via-violet-800 to-violet-950  flex items-center justify-center ">
                        <Camera className="text-white/40" size={72} strokeWidth={1.2} />
                        <img src={heroimg} className="absolute h-full w-full rounded-3xl  object-cover" />


                        <span className="absolute top-[6%] left-[4%] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce">
                            <Heart size={20} className="text-rose-500" fill="currentColor" />
                        </span>
                        <span
                            className="absolute top-[16%] right-[8%] w-12 h-12 rounded-full bg-amber-400 shadow-lg flex items-center justify-center animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                        >
                            <ThumbsUp size={20} className="text-violet-950" />
                        </span>
                        <span
                            className="absolute bottom-[30%] left-[-6%] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce"
                            style={{ animationDelay: "0.6s" }}
                        >
                            <Sparkles size={20} className="text-violet-700" />
                        </span>
                        <span
                            className="absolute top-[44%] right-[-8%] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce"
                            style={{ animationDelay: "0.9s" }}
                        >
                            <Flame size={20} className="text-amber-500" />
                        </span>
                    </div>
                </div>
            </section>

            {/* ============ PASSION SECTION ============ */}
            <section className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
                    <div className="order-2 lg:order-1">
                        <span className="inline-flex items-center gap-2 text-violet-800 text-xs font-bold tracking-widest uppercase">
                            <span className="w-5 h-0.5 bg-secondary rounded-full" />
                            Why creators choose us
                        </span>

                        <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                            You bring the passion, we'll bring the brands.
                        </h2>

                        <p className="mt-5 text-violet-950/60 text-base leading-relaxed max-w-md">
                            Create a free profile and get the opportunity to partner with industry-leading food, fashion, beauty, and lifestyle brands. Don't sell your influence short.
                        </p>

                        <ul className="mt-6 flex flex-col gap-3">
                            {[
                                "No cost to join, ever",
                                "Get matched with vetted brand partners",
                                "Keep full ownership of your content",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm font-medium">
                                    <Check size={18} className="text-violet-800 mt-0.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <a
                            href="#"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-tertiary text-primary font-semibold px-7 py-4 shadow-md hover:bg-amber-500 hover:-translate-y-0.5 transition"
                        >
                            Create a free Profile →
                        </a>
                    </div>

                    {/* Passion visual placeholder — replace with a real photo of a
              creator/photographer setup, e.g. <img src="/assets/creator-studio.jpg" /> */}
                    <div className="order-1 lg:order-2 relative aspect-[5/4] rounded-3xl bg-gradient-to-br from-violet-100 via-violet-200 to-violet-300 shadow-xl overflow-hidden">

                        <Camera
                            className="absolute text-violet-800/20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            size={70}
                        />

                        <AnimatePresence mode="slide">
                            <motion.img
                                key={current}
                                src={images[current]}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{
                                    opacity: 0,
                                    x: 80,
                                    scale: 1.05,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: -80,
                                    scale: 0.95,
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeInOut",
                                }}
                            />
                        </AnimatePresence>

                        <div className="absolute left-5 right-5 bottom-5 flex items-center justify-between rounded-2xl bg-white/85 backdrop-blur px-4 py-3 text-sm font-semibold text-violet-950">

                            <span>Aaliyah getting ready for her next video</span>

                            <div className="flex gap-2">
                                <button
                                    onClick={prevSlide}
                                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-amber-400 transition"
                                >
                                    <ChevronLeft size={15} />
                                </button>

                                <button
                                    onClick={nextSlide}
                                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-amber-400 transition"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* ============ IT'S SIMPLE / STEPS ============ */}
            <section id="deals" className="py-4 sm:py-4 bg-violet-100/60">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="max-w-lg mb-14">
                        <span className="inline-flex items-center gap-2 text-violet-800 text-xs font-bold tracking-widest uppercase">
                            <span className="w-5 h-0.5 bg-amber-400 rounded-full" />
                            It's Simple
                        </span>
                        <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                            Three ways to earn on InfulencerHub
                        </h2>
                        <p className="mt-4 text-violet-950/60 text-base leading-relaxed">
                            Whichever path fits your content style, every campaign is transparent, tracked, and paid on time.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
                        {[
                            {
                                num: "01",
                                icon: Award,
                                title: "Sponsored",
                                desc: "Monetize your content, creativity, and influence in the industry's largest creator marketplace.",
                                featured: false,
                            },
                            {
                                num: "02",
                                icon: Layers,
                                title: "Content",
                                desc: "Share branded content and earn money based on engagement, reach, and performance.",
                                featured: false,
                            },
                            {
                                num: "03",
                                icon: TrendingUp,
                                title: "Promoted",
                                desc: "Share branded content and earn money based on the boosted reach a brand puts behind it.",
                                featured: true,
                            },
                        ].map(({ num, icon: Icon, title, desc, featured }) => (
                            <div
                                key={title}
                                className={`rounded-2xl p-8 border transition hover:-translate-y-1.5 ${featured
                                    ? "bg-gradient-to-br from-amber-400 to-amber-300 border-transparent shadow-lg hover:shadow-xl"
                                    : "bg-white border-violet-950/10 hover:shadow-lg"
                                    }`}
                            >
                                <span className={`text-xs font-bold tracking-widest ${featured ? "text-violet-950/50" : "text-violet-800/60"}`}>
                                    {num}
                                </span>
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center my-5 ${featured ? "bg-violet-950/10 text-violet-950" : "bg-violet-100 text-violet-800"
                                        }`}
                                >
                                    <Icon size={24} />
                                </div>
                                <h3 className={`text-xl font-bold ${featured ? "text-violet-950" : ""}`}>{title}</h3>
                                <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-violet-950/70" : "text-violet-950/55"}`}>
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ STATS ============ */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        ["12.4k", "Active creators"],
                        ["860+", "Partner brands"],
                        ["$4.2M", "Paid out to creators"],
                        ["98%", "On-time payouts"],
                    ].map(([value, label]) => (
                        <div key={label}>
                            <h3 className="text-3xl sm:text-4xl font-bold text-violet-800">{value}</h3>
                            <span className="mt-2 block text-sm text-violet-950/55 font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ TESTIMONIAL ============ */}
            <section className="pb-24">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="rounded-3xl  bg-gradient-to-br from-primary via-secondary to-primary p-10 sm:p-16 grid sm:grid-cols-[auto_1fr] gap-8 items-center shadow-xl text-center sm:text-left">
                        <span className="text-7xl sm:text-8xl font-bold text-amber-400 leading-none mx-auto sm:mx-0">"</span>
                        <div>
                            <p className="text-white text-xl sm:text-2xl font-medium leading-snug">
                                InfulencerHub matched me with brands that actually fit my content — my first campaign paid out before I even finished editing the video.
                            </p>
                            <div className="mt-6 flex items-center justify-center sm:justify-start gap-3">
                                <span className="w-11 h-11 rounded-full bg-amber-400 text-violet-950 font-bold flex items-center justify-center">
                                    A
                                </span>
                                <div className="text-left">
                                    <strong className="block text-white text-sm">Aaliyah N.</strong>
                                    <span className="text-xs text-violet-200/70">Lifestyle Creator, 240k followers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ CTA BANNER ============ */}
            <section id="contact" className="pb-24">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-amber-400 px-8 py-16 sm:py-20 text-center">
                        <div className="pointer-events-none absolute -top-24 -left-16 w-56 h-56 rounded-full bg-violet-950/10" />
                        <div className="pointer-events-none absolute -bottom-20 -right-10 w-40 h-40 rounded-full bg-violet-950/10" />

                        <h2 className="relative text-3xl sm:text-4xl font-bold text-violet-950 tracking-tight">
                            Ready to bring your influence to the table?
                        </h2>
                        <p className="relative mt-4 max-w-md mx-auto text-violet-950/70">
                            Join thousands of creators and brands already growing together on InfulencerHub.
                        </p>
                        <div className="relative mt-8 flex flex-wrap gap-4 justify-center">
                            <a href="#" className="rounded-full bg-violet-950 text-white font-semibold px-7 py-4 hover:bg-violet-900 hover:-translate-y-0.5 transition">
                                I'm a Creator
                            </a>
                            <a href="#" className="rounded-full bg-white text-violet-950 font-semibold px-7 py-4 hover:-translate-y-0.5 transition">
                                I'm a Brand
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ FOOTER ============ */}
            <Footer />
        </div>
    );
}