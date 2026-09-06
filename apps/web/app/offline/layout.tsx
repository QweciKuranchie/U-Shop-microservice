import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're Offline | U-Shop",
  description: "You appear to be offline. Please check your internet connection.",
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
