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
import { SavedContact, loadSavedContact } from "@/lib/templates/contact-storage";

interface TemplateDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDownloadModal({
  open,
  onOpenChange,
}: TemplateDownloadModalProps) {
  const [defaultContact, setDefaultContact] = useState<SavedContact | null>(null);
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);

  // On open: load any previously saved contact (shared with the /resources
  // gate — completing either surface fills the other)
  useEffect(() => {
    if (!open) return;
    const contact = loadSavedContact();
    if (contact) {
      setDefaultContact(contact);
      setShowPrefillBanner(true);
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
          defaultContact={defaultContact}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
