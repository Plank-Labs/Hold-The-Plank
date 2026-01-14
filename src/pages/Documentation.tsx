import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X, BookOpen, Shield, Globe, Users, TrendingUp, Zap, Target, Rocket, ShieldCheck, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DocSection {
    id: string;
    title: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    subsections?: { id: string; title: string }[];
}

const Documentation = () => {
    const [activeTab, setActiveTab] = useState("business-plan");
    const [activeSection, setActiveSection] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Business Plan Sections
    const businessPlanSections: DocSection[] = [
        {
            id: "executive-summary",
            title: "1. Executive Summary",
            icon: <BookOpen className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p className="text-lg leading-relaxed text-foreground/90">
                        Conquer Plank is a crypto-powered training and payments platform designed to solve one of the biggest challenges in the crypto ecosystem: sustainable user onboarding with real-world usage.
                    </p>
                    <p>
                        Today, crypto adoption remains limited to approximately 6–7% of the global population. User acquisition is expensive, speculative, and often disconnected from everyday life. At the same time, the global fitness industry faces a different problem: gyms and training platforms struggle to build digital engagement, retain users, and monetize beyond monthly fees.
                    </p>
                    <p>
                        Conquer Plank connects these two worlds through a B2B2C model that turns gyms into physical onboarding hubs for crypto adoption.
                    </p>
                    <p>
                        Through a gamified training app focused on isometric workouts, users earn progression and crypto rewards by completing real physical effort. That crypto can then be used immediately to pay for something tangible: their gym membership. For most users, this becomes their first meaningful crypto transaction.
                    </p>
                    <p>
                        Gyms benefit by onboarding new users, receiving payments directly into their wallets, and earning additional incentives based on user activity and content creation. The platform captures value through transaction fees, a multigym membership model, premium training content, and digital assets.
                    </p>
                    <p>
                        Unlike traditional fitness apps or multigym platforms, Conquer Plank does not compete on price or convenience alone. Its core differentiation lies in combining physical discipline, community, and crypto payments into a single engagement loop that reduces acquisition costs and increases retention.
                    </p>
                    <p>
                        The initial go-to-market strategy focuses on gym partners operating in Argentina and Spain, providing early validation in both emerging and developed markets. The hackathon MVP includes live wallets and peer-to-peer crypto payments, demonstrating real-world utility from day one.
                    </p>
                    <p>
                        Over a three-year horizon, Conquer Plank aims to establish itself as a new onboarding rail for crypto, starting with fitness and expanding into payments, data, and additional real-world verticals.
                    </p>
                </div>
            )
        },
        {
            id: "the-problem",
            title: "2. The Problem",
            icon: <Target className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">2.1 Crypto onboarding lacks lifestyle relevance and everyday utility</h4>
                        <p>Crypto adoption is no longer constrained by technology, but by cultural relevance and daily usefulness.</p>
                        <p>Although approximately 6–7% of the global population holds cryptocurrencies, usage remains largely episodic. For most users, crypto exists in a parallel financial universe—separate from their everyday routines, identity, and social life.</p>
                        <p className="mt-4 font-bold text-foreground/80">Current onboarding channels emphasize:</p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/70">
                            <li>trading interfaces</li>
                            <li>financial incentives</li>
                            <li>and short-term rewards.</li>
                        </ul>
                        <p className="mt-4">This framing positions crypto as something to watch or speculate on, rather than something to use, live with, or identify with. As a result users engage sporadically, not habitually; crypto remains abstract and intimidating for mainstream users; and long-term retention depends more on market cycles than on real behavior.</p>
                        <p className="mt-2">Crypto lacks natural lifestyle entry points where usage feels intuitive, social, and culturally embedded.</p>
                    </section>

                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">2.2 Fitness communities represent a powerful lifestyle layer — but remain financially disconnected</h4>
                        <p>In contrast, the global fitness ecosystem has become one of the strongest lifestyle-driven communities in modern consumer culture.</p>
                        <p>People who train regularly build identity around discipline and consistency, participate in physical communities (gyms, studios, classes), value progress, status, and belonging, and integrate training into their daily routines.</p>
                        <p>While only ~3% of the global population pays for a formal gym membership, penetration reaches 15–25% in developed markets, representing tens of millions of highly engaged users with recurring spending habits. Despite this engagement, gyms remain financially and digitally constrained:</p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/70 mt-4">
                            <li>payments are largely passive and transactional</li>
                            <li>monetization rarely extends beyond monthly fees</li>
                            <li>and gyms lack tools to create digital-native communities or economic layers around their users.</li>
                        </ul>
                        <p className="mt-4">This leaves a gap between high lifestyle engagement and low financial innovation.</p>
                    </section>

                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">2.3 Payments today are treated as friction, not as engagement</h4>
                        <p>Across both crypto and fitness ecosystems, payments are treated as a background utility:</p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/70 my-4">
                            <li>In crypto, payments are abstract and rarely tied to real-world services.</li>
                            <li>In fitness, payments are repetitive costs with little emotional or social meaning.</li>
                        </ul>
                        <p>Existing platforms fail to connect community and identity, daily behavior, and economic participation. As a result: crypto platforms struggle to feel culturally “cool” or lifestyle-native, fitness platforms struggle to evolve beyond utility, and neither creates a strong loop between action, belonging, and value exchange.</p>
                    </section>
                </div>
            )
        },
        {
            id: "the-opportunity",
            title: "3. The Opportunity",
            icon: <Zap className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.1 Gyms as cultural gateways into crypto adoption</h4>
                        <p>Gyms are not just places to train. They are physical communities where identity is reinforced daily. They offer recurring, high-frequency touchpoints, social validation and peer effects, visible progress and shared rituals, and a built-in willingness to pay.</p>
                        <p>This makes gyms a unique and underutilized distribution channel for crypto adoption — not as a financial product, but as a cultural layer embedded into an existing lifestyle. Instead of asking users to “learn crypto,” Conquer Plank allows them to extend who they already are into a digital-native economic system.</p>
                    </section>

                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.2 Making crypto participation social, habitual, and aspirational</h4>
                        <p>By integrating crypto into training, progression, and community interaction, Conquer Plank reframes adoption:</p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/70 my-4">
                            <li>Training generates progression and rewards.</li>
                            <li>Rewards translate into usable value.</li>
                            <li>Payments become moments of participation, not friction.</li>
                            <li>Community reinforces consistency and status.</li>
                        </ul>
                        <p>Crypto becomes part of a daily routine, socially visible, and aligned with modern lifestyle brands. In this context, adoption is driven not by financial promises, but by belonging and identity.</p>
                    </section>

                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.3 Turning gym payments into a real-world crypto use case</h4>
                        <p>Gym memberships represent one of the most consistent and predictable consumer payment behaviors globally. Conquer Plank leverages this by transforming gym payments into a first meaningful crypto transaction, a recurring on-chain economic flow, and a direct link between physical effort and financial utility.</p>
                        <p>Users earn crypto through training and can immediately use it to pay for something tangible: their gym membership. For many users, this becomes their first real-world crypto payment, not trading or speculation.</p>
                        <p>Gyms receive payments directly into their wallets, without needing to manage crypto exposure or volatility, while benefiting from increased engagement and retention. This creates a closed loop where effort drives value, value drives payment, and payment reinforces community participation.</p>
                    </section>

                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.4 A scalable B2B2C financial wedge with clear monetization</h4>
                        <p>Starting with gym payments provides a focused and monetizable wedge into broader adoption. From a business perspective, this model enables transaction fees on gym payments, multigym memberships settled through the platform, premium training and digital assets, and long-term expansion into payments infrastructure and data products.</p>
                        <p>From a distribution perspective: gyms act as trusted onboarding partners, user acquisition costs are reduced through lifestyle alignment, and recurring payments create predictable revenue streams. Fitness is not the end market — it is the entry point. By anchoring crypto adoption in a real-world lifestyle and a recurring financial behavior, Conquer Plank establishes a scalable foundation for expanding into additional verticals where community, payments, and identity intersect.</p>
                    </section>
                </div>
            )
        },
        {
            id: "market-size",
            title: "4. Market Size & Potential",
            icon: <TrendingUp className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">4.1 TAM: The Global Fitness Economy</h4>
                        <p>The global fitness industry is valued at approximately $96 billion annually. This includes gym memberships, equipment, training apps, and wearable technology. Physical training is one of the most resilient consumer sectors, showing consistent growth even during economic downturns.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">4.2 SAM: Digital Fitness and Multigym Platforms</h4>
                        <p>The digital fitness market is worth ~$16 billion and is growing at 15% CAGR. Conquer Plank targets the intersection of physical gym-goers and digital-native users who value gamification and rewards.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">4.3 SOM: Crypto-Curious Fitness Users in Key Markets</h4>
                        <p>Initial SOM focuses on Argentina (high inflation, #1 crypto adoption in LatAm) and Spain (mature fitness market). Target: 50,000 active users across 500 partner gyms in 18 months.</p>
                    </section>
                </div>
            )
        },
        {
            id: "product-overview",
            title: "5. Product Overview",
            icon: <ShieldCheck className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">5.1 The Training App: Gamified Isometrics</h4>
                        <p>The app centers on isometrics (planks). No equipment needed. MediaPipe tracks posture for "Proof of Work." Users compete in challenges and earn digital relics.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">5.2 The Payment Rail: Effort to Equity</h4>
                        <p>Peer-to-peer crypto payments for memberships. High-frequency real-world transactions that build on-chain history through physical discipline.</p>
                    </section>
                </div>
            )
        },
        {
            id: "business-model",
            title: "6. Business Model",
            icon: <DollarSign className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">6.1 Transaction Fees (Gym Payments)</h4>
                        <p>1.5% - 2.5% fee on memberships. Lower than traditional credit card fees, providing recurring revenue for the protocol.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">6.2 Multi-gym Pass</h4>
                        <p>Global subscription for access to multiple gyms. Revenue distributed based on usage tracked on-chain.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">6.3 Premium Training & Marketplace</h4>
                        <p>Specialized programs and content sold by elite trainers. Digital relics with utility and social status.</p>
                    </section>
                </div>
            )
        },
        {
            id: "go-to-market",
            title: "7. Go-To-Market",
            icon: <Rocket className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">7.1 B2B2C Principles</h4>
                        <p>Gyms are trusted partners. Acquisition is lifestyle-driven, not financial-first. Payments as the activation moment.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">7.2 Launch Markets</h4>
                        <p>Argentina (mass adoption due to inflation) and Spain (strong gym culture). Urban hubs as primary distribution nodes.</p>
                    </section>
                </div>
            )
        },
        {
            id: "competitive-landscape",
            title: "8. Competitive Landscape",
            icon: <Globe className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <p>Unlike aggregators (Gympass) or training apps (Freeletics), Conquer Plank integrates physical gyms with a direct payment and reputation rail.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded bg-stone/20 border border-gold/10">
                            <h5 className="text-gold uppercase text-xs mb-2">VS Aggregators</h5>
                            <p className="text-xs opacity-70">Focus on community and identity, not just price and access.</p>
                        </div>
                        <div className="p-4 rounded bg-stone/20 border border-gold/10">
                            <h5 className="text-gold uppercase text-xs mb-2">VS Move-to-Earn</h5>
                            <p className="text-xs opacity-70">Anchors value in real recurring payments, not inflationary rewards.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "financial-overview",
            title: "10. Financial Overview",
            icon: <TrendingUp className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p>Projected 750k users by Year 3. ARPU growth from $35 to $75 as premium features and payment adoption scale.</p>
                    <div className="bg-navy-light/30 p-4 rounded-lg border border-gold/20">
                        <h5 className="text-primary font-serif uppercase tracking-widest text-sm mb-4">Baseline Growth (USD)</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Year 1 Revenue</span><span className="text-gold">$1.75M</span></div>
                            <div className="flex justify-between"><span>Year 2 Revenue</span><span className="text-gold">$13.75M</span></div>
                            <div className="flex justify-between"><span>Year 3 Revenue</span><span className="text-gold">$56.25M</span></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "risks-mitigation",
            title: "11. Risks & Mitigation",
            icon: <Shield className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-stone/30 border border-gold/10">
                            <h5 className="text-gold text-xs uppercase mb-1">Adoption Risk</h5>
                            <p className="text-xs opacity-70">Mitigation: Tie payments to existing gym expenses, not abstract products.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-stone/30 border border-gold/10">
                            <h5 className="text-gold text-xs uppercase mb-1">Regulatory Risk</h5>
                            <p className="text-xs opacity-70">Mitigation: MVP uses P2P crypto payments without offering custody initially.</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // Tokenomics Sections
    const tokenomicsSections: DocSection[] = [
        {
            id: "token-overview",
            title: "1. Design Philosophy",
            icon: <Zap className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p>Building a lifestyle-native economy on <strong>Mantle Network</strong> that rewards behavior and routine. By leveraging Mantle’s modular rollup architecture, we ensure near-instant verification and low-cost transactions for every workout and payment.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded bg-gold/5 border border-gold/20">
                            <h5 className="text-gold font-serif text-sm mb-2">AURA</h5>
                            <p className="text-xs opacity-70">Non-transferable reputation. Earned purely through effort. Controls governance and passive income.</p>
                        </div>
                        <div className="p-4 rounded bg-gold/5 border border-gold/20">
                            <h5 className="text-gold font-serif text-sm mb-2">$PLANK</h5>
                            <p className="text-xs opacity-70">The direct utility rail. Used for gym payments, memberships, and trading. Fixed supply of 1B.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "dual-token",
            title: "2. Token System Overview",
            icon: <ShieldCheck className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p>The system separates reputation from economic exchange to reduce inflationary pressure while preserving alignment.</p>
                    <table className="w-full text-xs text-left border-collapse border border-gold/10">
                        <thead className="bg-stone/30">
                            <tr>
                                <th className="p-2 border border-gold/10 text-gold uppercase tracking-tighter">Token</th>
                                <th className="p-2 border border-gold/10 text-gold uppercase tracking-tighter">Transferable</th>
                                <th className="p-2 border border-gold/10 text-gold uppercase tracking-tighter">Function</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 border border-gold/10 font-bold">Aura</td>
                                <td className="p-2 border border-gold/10 text-rose-400">No</td>
                                <td className="p-2 border border-gold/10">Reputation, Governance, Revenue Share</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-gold/10 font-bold">$PLANK</td>
                                <td className="p-2 border border-gold/10 text-emerald-400">Yes</td>
                                <td className="p-2 border border-gold/10">Payments, Marketplace, Incentives</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        },
        {
            id: "aura-mechanics",
            title: "3. Aura — Reputation & Governance",
            icon: <Target className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.1 Aura as Reputation</h4>
                        <p>Non-transferable score earned exclusively through verified training. It reflects consistency, commitment, and community contribution.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">3.2 Passive Income Distribution</h4>
                        <p>5% of the network’s passive revenue is distributed semi-annually to Aura holders in stablecoins. This aligns long-term contributors with platform success without introducing sell pressure on $PLANK tokens.</p>
                    </section>
                </div>
            )
        },
        {
            id: "plank-utility",
            title: "4. $PLANK — Utility & Incentives",
            icon: <Zap className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">4.1 Core Utility</h4>
                        <p>The engine of the ecosystem. Used for gym memberships, multi-gym passes, premium training content, and digital relics. It anchors demand in real behaviors.</p>
                    </section>
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">4.2 Incentive Alignment</h4>
                        <p>$PLANK is distributed as an incentive for verified training and bootstrapping early adoption, rather than functioning as perpetual inflationary yield.</p>
                    </section>
                </div>
            )
        },
        {
            id: "supply-allocation",
            title: "5. Supply & Allocation",
            icon: <TrendingUp className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h5 className="text-gold text-xs uppercase letter-spacing-2">Total Supply</h5>
                            <div className="text-3xl font-serif text-primary">1,000,000,000 <span className="text-xs uppercase opacity-50 block">$PLANK (Fixed)</span></div>
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-gold text-xs uppercase letter-spacing-2">Distribution</h5>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span>Game Rewards</span><span className="text-gold">50%</span></div>
                                <div className="flex justify-between"><span>Ecosystem/Treasury</span><span className="text-gold">25%</span></div>
                                <div className="flex justify-between"><span>Team/Advisors</span><span className="text-gold">15%</span></div>
                                <div className="flex justify-between"><span>Investors</span><span className="text-gold">10%</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "emission-schedule",
            title: "6. Emission & Incentives",
            icon: <Rocket className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p>Incentives follow a halving-like emission model, reducing issuance every 6 months to ensure strong early adoption while decreasing inflation over time.</p>
                    <div className="p-4 rounded border border-gold/10 bg-navy-light/20">
                        <h5 className="text-xs text-gold mb-2 uppercase">Incentive Budget (3 Years)</h5>
                        <p className="text-xl font-serif">$7.5M <span className="text-[10px] opacity-40 uppercase">(Token-based)</span></p>
                    </div>
                </div>
            )
        },
        {
            id: "relics-economics",
            title: "7. Relics & Economic Sinks",
            icon: <Shield className="w-4 h-4" />,
            content: (
                <div className="space-y-8">
                    <section>
                        <h4 className="text-gold font-serif mb-3 uppercase tracking-wider">7.1 The Relic System</h4>
                        <p>Relics are NFTs that unlock fee reductions and protocol advantages. They can ONLY be obtained using Aura, creating a permanent utility loop for training activity.</p>
                    </section>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        {['None', 'Bronze', 'Silver', 'Gold'].map((m) => (
                            <div key={m} className="p-2 border border-gold/10 rounded">
                                <div className="text-[10px] uppercase opacity-40 mb-1">{m}</div>
                                <div className="text-gold font-serif text-sm">{m === 'None' ? '25%' : m === 'Bronze' ? '10%' : m === 'Silver' ? '5%' : '2%'}</div>
                                <div className="text-[8px] opacity-30 mt-1 uppercase">Fee Rate</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "gym-economics",
            title: "8. Gym B2B2C Economics",
            icon: <Users className="w-4 h-4" />,
            content: (
                <div className="space-y-6">
                    <p>Gyms are on-chain stakeholders. When users train via gym referrals, gyms receive 20% of the Aura earned by the user, granting them governance rights and revenue participation.</p>
                    <p className="p-4 rounded-lg bg-stone/30 border border-gold/10 italic text-sm opacity-80">"Gyms transition from simple service providers to active protocol stakeholders."</p>
                </div>
            )
        }
    ];

    const currentSections = activeTab === "business-plan" ? businessPlanSections : tokenomicsSections;

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section[id]");
            let currentActive = "";
            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    currentActive = section.id;
                }
            });
            setActiveSection(currentActive);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth"
            });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-navy-deep text-foreground font-sans selection:bg-gold/30 selection:text-gold">
            {/* Meander Pattern Top */}
            <div className="h-2 w-full meander-pattern opacity-50 sticky top-0 z-50" />

            {/* Header */}
            <header className="sticky top-2 z-40 bg-navy-deep/80 backdrop-blur-md border-b border-gold/10 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-serif font-bold text-gold tracking-widest uppercase">
                            Conquer Plank <span className="hidden md:inline font-light text-foreground/60 text-sm ml-2">DOCUMENTATION</span>
                        </h1>
                    </div>

                    <nav className="hidden md:flex bg-stone/30 p-1 rounded-lg border border-gold/10">
                        <button
                            onClick={() => setActiveTab("business-plan")}
                            className={cn(
                                "px-4 py-1.5 text-xs font-serif uppercase tracking-widest transition-all",
                                activeTab === "business-plan" ? "bg-gold text-navy-deep" : "hover:text-gold"
                            )}
                        >
                            Business Plan
                        </button>
                        <button
                            onClick={() => setActiveTab("tokenomics")}
                            className={cn(
                                "px-4 py-1.5 text-xs font-serif uppercase tracking-widest transition-all",
                                activeTab === "tokenomics" ? "bg-gold text-navy-deep" : "hover:text-gold"
                            )}
                        >
                            Tokenomics
                        </button>
                    </nav>

                    <button
                        className="md:hidden text-gold"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex gap-12 px-4 py-12 md:px-8">
                {/* Sidebar Nav */}
                <aside className="hidden lg:block w-72 h-[calc(100vh-160px)] sticky top-28">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-serif text-gold uppercase tracking-[0.2em] mb-4 opacity-50">Contents</h3>
                            <nav className="space-y-1">
                                {currentSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={cn(
                                            "flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition-all text-sm group",
                                            activeSection === section.id
                                                ? "bg-gold/10 text-gold border-l-2 border-gold"
                                                : "text-foreground/60 hover:text-gold hover:bg-gold/5 border-l-2 border-transparent"
                                        )}
                                    >
                                        <span className={cn(
                                            "transition-transform group-hover:scale-110",
                                            activeSection === section.id ? "text-gold" : "text-foreground/30"
                                        )}>
                                            {section.icon}
                                        </span>
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-4 rounded-lg bg-stone/50 border border-gold/10">
                            <p className="text-xs text-foreground/40 leading-relaxed">
                                Official documentation for $PLANK Ecosystem. Version 1.0 — Hackathon Edition.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-24 pb-32"
                        >
                            {currentSections.map((section, idx) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-32 prose prose-invert prose-gold max-w-none"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="text-gold opacity-50">0{idx + 1}</span>
                                        <h2 className="m-0 text-3xl font-serif text-gold uppercase tracking-wider">
                                            {section.title.split('. ').slice(1).join('. ') || section.title}
                                        </h2>
                                    </div>

                                    <div className="pl-0 md:pl-10 border-l-0 md:border-l border-gold/10">
                                        {section.content}
                                    </div>

                                    {idx < currentSections.length - 1 && (
                                        <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
                                    )}
                                </section>
                            ))}

                            <div className="pt-12 text-center opacity-30">
                                <p className="font-serif text-sm italic">End of {activeTab.replace('-', ' ')}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-navy-deep pt-20 px-6"
                    >
                        <div className="flex flex-col gap-8">
                            <nav className="flex bg-stone/30 p-1 rounded-lg border border-gold/10 w-fit mx-auto">
                                <button
                                    onClick={() => setActiveTab("business-plan")}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-serif uppercase tracking-widest transition-all",
                                        activeTab === "business-plan" ? "bg-gold text-navy-deep" : "hover:text-gold"
                                    )}
                                >
                                    Business
                                </button>
                                <button
                                    onClick={() => setActiveTab("tokenomics")}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-serif uppercase tracking-widest transition-all",
                                        activeTab === "tokenomics" ? "bg-gold text-navy-deep" : "hover:text-gold"
                                    )}
                                >
                                    Tokens
                                </button>
                            </nav>

                            <div className="space-y-4">
                                {currentSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-stone/30 border border-gold/10"
                                    >
                                        <span className="text-gold">{section.icon}</span>
                                        <span className="font-serif text-sm uppercase tracking-wider">{section.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            className="absolute top-6 right-6 text-gold"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Meander */}
            <div className="h-4 w-full meander-pattern opacity-20 mt-20" />
        </div>
    );
};

export default Documentation;
