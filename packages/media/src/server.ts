import ImageKit from "@imagekit/nodejs";

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
}

export function getImageKitAuthParams(): ImageKitAuthParams {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "Missing ImageKit configuration environment variable (IMAGEKIT_PRIVATE_KEY)."
    );
  }

  const imagekit = new ImageKit({
    privateKey,
  });

  return imagekit.helper.getAuthenticationParameters();
}
