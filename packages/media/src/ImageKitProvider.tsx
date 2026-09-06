"use client";

import React, { type ReactNode } from "react";
import { ImageKitProvider as IKProvider } from "imagekitio-next";

interface ImageKitProviderProps {
  children: ReactNode;
  urlEndpoint?: string;
  publicKey?: string;
  authEndpoint?: string;
}

export function ImageKitProvider({
  children,
  urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  authEndpoint = "/api/imagekit/auth",
}: ImageKitProviderProps) {
  const authenticator = async () => {
    try {
      const response = await fetch(authEndpoint);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ImageKit authentication request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw error;
    }
  };

  return (
    <IKProvider
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      {children}
    </IKProvider>
  );
}
