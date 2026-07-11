"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const heroImages = [
  "/assets/ecimg1.jpg",
  "/assets/ecimg2.jpg",
  "/assets/images.jpeg",
  "/assets/2.jpg"
];

export function HeroCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Image
      src={heroImages[currentImageIndex]}
      alt="Multi-vendor ecommerce platform"
      fill
      priority
      className="object-cover"
      unoptimized
    />
  );
}
