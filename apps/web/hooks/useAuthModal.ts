import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  mode: "sign-in" | "sign-up";
  openAuthModal: (mode?: "sign-in" | "sign-up") => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: "sign-in",
  openAuthModal: (mode = "sign-in") => {
    if (typeof window !== "undefined") {
      window.location.href = `/${mode}`;
    }
  },
  closeAuthModal: () => set({ isOpen: false }),
}));
