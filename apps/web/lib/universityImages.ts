import { urlFor } from "@repo/sanity";

export function getUniversityImageUrl(university: {
  slug?: { current?: string };
  image?: unknown;
  logo?: unknown;
}): string {
  // 1. Check Sanity image/logo first
  if (university?.image) {
    try {
      return urlFor(university.image).url();
    } catch {
      // Fallback if urlFor fails
    }
  }

  if (university?.logo) {
    try {
      return urlFor(university.logo).url();
    } catch {
      // Fallback if urlFor fails
    }
  }

  // 2. Fallback to local assets in /public/assets/images/universities/
  const slug = (university?.slug?.current || "").toLowerCase();

  if (slug.includes("legon") || slug.includes("ug") || slug.includes("university-of-ghana")) {
    return "/assets/images/universities/legon.jpg";
  }
  if (slug.includes("knust") || slug.includes("kwame-nkrumah")) {
    return "/assets/images/universities/knust.jpg";
  }
  if (slug.includes("ucc") || slug.includes("cape-coast")) {
    return "/assets/images/universities/ucc.jpg";
  }
  if (slug.includes("gctu") || slug.includes("communication")) {
    return "/assets/images/universities/gctu.jpg";
  }
  if (slug.includes("umat") || slug.includes("mines")) {
    return "/assets/images/universities/umat.jpeg";
  }

  // Default fallback asset
  return "/assets/images/universities/legon.jpg";
}
