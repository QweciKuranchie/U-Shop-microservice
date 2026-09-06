"use client";

import React, { type ReactNode } from "react";
import { ImageKitProvider as IKProvider } from "@imagekit/next";

interface ImageKitProviderProps {
  children: ReactNode;
  urlEndpoint?: string;
}

export function ImageKitProvider({
  children,
  urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
}: ImageKitProviderProps) {
  return (
    <IKProvider urlEndpoint={urlEndpoint}>
      {children}
    </IKProvider>
  );
}
