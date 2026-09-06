"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@repo/utils";

interface ApplicationSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  type?: "premium" | "business" | "order" | "general";
  className?: string;
}

const messages: Record<string, { title: string; body: string }> = {
  premium: {
    title: "Premium Application Submitted!",
    body: "Your premium application is now under review. You'll be notified once it's approved.",
  },
  business: {
    title: "Business Application Submitted!",
    body: "Your business account application has been submitted successfully and is now under review.",
  },
  order: {
    title: "Order Placed Successfully!",
    body: "Your order has been confirmed and is being processed.",
  },
  general: {
    title: "Success!",
    body: "Your request has been submitted successfully.",
  },
};

const ApplicationSuccessNotification: React.FC<
  ApplicationSuccessNotificationProps
> = ({ isVisible, onClose, type = "general", className }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const { title, body } = messages[type] || messages.general;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300",
        className
      )}
    >
      <div className="bg-white border border-green-200 rounded-xl shadow-xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-600 mt-0.5">{body}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export { ApplicationSuccessNotification };
export default ApplicationSuccessNotification;
