"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Store, ShieldCheck, Flame, PhoneCall, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "./Container";

interface MiniBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  actionText: string;
  href: string;
  isExternal?: boolean;
  isPhone?: boolean;
  gradientClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
  icon: React.ReactNode;
}

const miniBanners: MiniBannerItem[] = [
  {
    id: "sell-on-ushop",
    title: "Sell on U-Shop",
    subtitle: "Open your store & reach thousands of campus buyers today.",
    badge: "For Merchants",
    actionText: "Register as Seller",
    href: "https://seller.ushopgh.com",
    isExternal: true,
    gradientClass: "from-[#6B1FA8] via-[#5D1694] to-[#450C72] text-white",
    borderClass: "border-purple-300/20 hover:border-purple-300/40",
    iconBgClass: "bg-white/15 text-white",
    iconColorClass: "text-white",
    icon: <Store className="w-5 h-5" />,
  },
  {
    id: "verified-stores",
    title: "Verified Stores",
    subtitle: "Shop directly from trusted Personal, Business, and Student sellers.",
    badge: "Verified Sellers",
    actionText: "Browse Stores",
    href: "/stores",
    gradientClass: "from-[#063c28] via-[#094d35] to-[#04281b] text-white",
    borderClass: "border-emerald-300/20 hover:border-emerald-300/40",
    iconBgClass: "bg-white/15 text-white",
    iconColorClass: "text-white",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: "deals-offers",
    title: "Hot Deals & Offers",
    subtitle: "Save big with daily discounts, clearance & flash sales.",
    badge: "Up to 40% Off",
    actionText: "View All Deals",
    href: "/deals",
    gradientClass: "from-[#E8000B] via-[#D4009B] to-[#B00080] text-white",
    borderClass: "border-red-300/20 hover:border-red-300/40",
    iconBgClass: "bg-white/15 text-white",
    iconColorClass: "text-white",
    icon: <Flame className="w-5 h-5" />,
  },
  {
    id: "call-to-order",
    title: "Call To Order",
    subtitle: "Speak directly with our support team for instant order help.",
    badge: "Direct Support",
    actionText: "+233 50 956 5794",
    href: "tel:+233509565794",
    isPhone: true,
    gradientClass: "from-[#0f172a] via-[#1e293b] to-[#0a0f1d] text-white",
    borderClass: "border-slate-400/20 hover:border-slate-400/40",
    iconBgClass: "bg-white/15 text-white",
    iconColorClass: "text-white",
    icon: <PhoneCall className="w-5 h-5" />,
  },
];

const ActionMiniBanners: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full mt-4 sm:mt-6">
      <div className="relative group/carousel">
        {/* Navigation Buttons (Desktop) */}
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll banners left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 text-gray-800 shadow-md border border-gray-100 hover:text-ushop-pink hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleScroll("right")}
          aria-label="Scroll banners right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 text-gray-800 shadow-md border border-gray-100 hover:text-ushop-pink hover:bg-white hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* One-Line Carousel Track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-3.5 sm:gap-4 pb-2 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
        >
          {miniBanners.map((banner) => {
            const content = (
              <div
                className={`h-full rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${banner.gradientClass} border ${banner.borderClass} shadow-md hover:shadow-xl hoverEffect transform hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden group cursor-pointer`}
              >
                {/* Background ambient glow circle */}
                <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between gap-2.5 mb-3.5">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${banner.iconBgClass} flex items-center justify-center shadow-xs backdrop-blur-xs group-hover:scale-105 transition-transform`}
                  >
                    {banner.icon}
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs tracking-wide uppercase">
                    {banner.badge}
                  </span>
                </div>

                {/* Middle: Title & Subtitle */}
                <div className="space-y-1 z-10 mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {banner.subtitle}
                  </p>
                </div>

                {/* Bottom: Action link button */}
                <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs font-bold tracking-wide">
                  <span className="group-hover:translate-x-0.5 transition-transform truncate mr-2">
                    {banner.actionText}
                  </span>

                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 shrink-0 flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                    {banner.isExternal ? (
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ) : (
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            );

            if (banner.isExternal) {
              return (
                <a
                  key={banner.id}
                  href={banner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={banner.title}
                  className="shrink-0 w-[78vw] max-w-[270px] sm:w-[270px] lg:w-[280px] snap-start block h-full"
                >
                  {content}
                </a>
              );
            }

            if (banner.isPhone) {
              return (
                <a
                  key={banner.id}
                  href={banner.href}
                  aria-label={`Call ${banner.title}`}
                  className="shrink-0 w-[78vw] max-w-[270px] sm:w-[270px] lg:w-[280px] snap-start block h-full"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={banner.id}
                href={banner.href}
                aria-label={banner.title}
                className="shrink-0 w-[78vw] max-w-[270px] sm:w-[270px] lg:w-[280px] snap-start block h-full"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionMiniBanners;
