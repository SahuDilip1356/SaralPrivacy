"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateDownloadForm } from "@/components/TemplateDownloadForm";

interface TemplateDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = "saral_template_contact";

export function TemplateDownloadModal({
  open,
  onOpenChange,
}: TemplateDownloadModalProps) {
  const [defaultEmail, setDefaultEmail] = useState("");
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);

  // On open: load any previously saved contact from sessionStorage
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const contact = JSON.parse(stored);
        if (contact?.email) {
          setDefaultEmail(contact.email);
          setShowPrefillBanner(true);
        }
      }
    } catch {
      // Corrupt storage — ignore
    }
  }, [open]);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Download DPDPA Template</DialogTitle>
          <DialogDescription>
            Select a template below — we'll send the download link to your email
            instantly, and to WhatsApp if you opt in.
          </DialogDescription>
        </DialogHeader>

        {showPrefillBanner && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700 mb-1">
            Your previous details have been pre-filled — just pick a template and download.
          </div>
        )}

        <TemplateDownloadForm
          defaultEmail={defaultEmail}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
