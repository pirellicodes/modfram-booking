"use client";

import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TallyEmbedProps {
  formId: string;
  mode?: "inline" | "modal";
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  className?: string;
  width?: string;
  height?: string;
  hiddenFields?: Record<string, string>;
}

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
      openPopup: (formId: string, options?: any) => void;
    };
  }
}

export function TallyEmbed({
  formId,
  mode = "inline",
  isOpen = false,
  onClose,
  onSubmit,
  className = "",
  width = "100%",
  height = "500px",
  hiddenFields = {},
}: TallyEmbedProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Load Tally script
  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      if (window.Tally) {
        window.Tally.loadEmbeds();
      }
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script as it might be used by other components
    };
  }, []);

  // Handle form submission via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://tally.so") return;

      if (event.data.type === "TALLY_FORM_SUBMIT" && event.data.formId === formId) {
        if (onSubmit) {
          onSubmit(event.data.payload);
        }
        if (mode === "modal" && onClose) {
          onClose();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [formId, onSubmit, onClose, mode]);

  // Generate Tally URL with hidden fields
  const getTallyUrl = () => {
    const baseUrl = `https://tally.so/embed/${formId}`;
    const params = new URLSearchParams();

    // Add hidden fields
    Object.entries(hiddenFields).forEach(([key, value]) => {
      params.append(key, value);
    });

    // Add embed parameters
    params.append("hideTitle", "1");
    params.append("transparentBackground", "1");
    params.append("dynamicHeight", "1");

    return `${baseUrl}?${params.toString()}`;
  };

  if (mode === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Additional Information</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <iframe
              src={getTallyUrl()}
              width="100%"
              height="600px"
              style={{ border: "none" }}
              title="Tally Form"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      ref={embedRef}
      className={`tally-embed ${className}`}
      style={{ width, height }}
    >
      <iframe
        src={getTallyUrl()}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Tally Form"
      />
    </div>
  );
}

// Hook for using Tally forms in booking flow
export function useTallyForm() {
  const openTallyModal = (formId: string, options?: {
    hiddenFields?: Record<string, string>;
    onSubmit?: (data: any) => void;
  }) => {
    if (window.Tally) {
      window.Tally.openPopup(formId, {
        hideTitle: true,
        ...options,
      });
    }
  };

  return { openTallyModal };
}
