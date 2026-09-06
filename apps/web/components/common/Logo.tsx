import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@repo/utils";

interface LogoProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  href?: React.ComponentPropsWithoutRef<typeof Link>["href"];
  imageClassName?: string;
}

function Logo({ className, imageClassName, ...props }: LogoProps) {
  return (
    <Link
      href={"/"}
      className={cn(
        "inline-flex items-center gap-2 rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <Image
        src="/assets/logos/web/logo-300w.png"
        alt="U-Shop Logo"
        width={140}
        height={40}
        style={{ width: "auto" }}
        className={cn("w-auto h-8 md:h-10 object-contain", imageClassName)}
        priority
      />
    </Link>
  );
}

export default Logo;
