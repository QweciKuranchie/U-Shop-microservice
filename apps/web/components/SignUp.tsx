"use client";

import React, { AnchorHTMLAttributes } from 'react';
import Link from 'next/link';

const SignUp = React.forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href="/sign-up"
        className={className || 'text-ushop-purple border border-ushop-pink px-6 py-2 rounded-full hover:bg-ushop-pink hover:text-white hoverEffect cursor-pointer flex items-center justify-center font-semibold text-sm'}
        {...props}
      >
        {children || "Register"}
      </Link>
    );
  }
);

SignUp.displayName = "SignUp";

export default SignUp;