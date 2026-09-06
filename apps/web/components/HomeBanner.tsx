"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sliderData = [
  {
    id: 1,
    title: "Experience Pure Sound — Your Perfect Headphones Await!",
    offer: "Limited Time Offer 30% Off",
    buttonText: "Shop Audio Gear",
    buttonLink: "/shop?query=audio",
    imgSrc: "/assets/images/hero/header_headphone_image.png",
  },
  {
    id: 2,
    title: "Next-Level Gaming Starts Here — Discover PlayStation 5!",
    offer: "Hurry Up, Only a Few Left!",
    buttonText: "Explore Flash Deals",
    buttonLink: "/deals",
    imgSrc: "/assets/images/hero/header_playstation_image.png",
  },
  {
    id: 3,
    title: "Power Meets Elegance — Apple MacBook Pro Is Here!",
    offer: "Exclusive Deal 40% Off",
    buttonText: "Shop Laptops Now",
    buttonLink: "/shop?query=macbook",
    imgSrc: "/assets/images/hero/header_macbook_image.png",
  },
];

function HomeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {sliderData.map((slide) => (
          <div
            key={slide.id}
            className="relative flex flex-col-reverse md:flex-row items-center justify-between bg-ushop-purple-dark text-white py-10 px-8 md:px-16 min-w-full min-h-[480px]"
          >
            {/* Background decorative elements */}
            <div className="absolute top-1/2 -translate-y-1/2 right-12 lg:right-32 w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border border-white/10 pointer-events-none" />

            {/* Left content */}
            <div className="flex-1 space-y-5 z-10 max-w-lg mt-8 md:mt-0">
              <div className="inline-flex items-center gap-2 bg-ushop-pink text-white text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-widest w-max">
                {slide.offer}
              </div>

              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold text-white">
                {slide.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center gap-2 bg-white text-ushop-purple-dark font-semibold px-7 py-2.5 md:px-10 md:py-3 rounded-full hover:bg-gray-100 transition-all shadow-lg shadow-black/10 text-sm hoverEffect group"
                >
                  {slide.buttonText}
                  <ArrowRight className="w-4 h-4 text-ushop-pink group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative z-10 flex items-center justify-center flex-1">
              {/* Decorative circle */}
              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-white/5 border border-white/10 pointer-events-none" />
              <Image
                src={slide.imgSrc}
                alt={slide.title}
                width={400}
                height={400}
                className="relative z-10 w-48 sm:w-56 md:w-72 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all duration-300 hoverEffect ${
              currentSlide === index
                ? "w-7 h-2.5 bg-ushop-pink"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeBanner;
