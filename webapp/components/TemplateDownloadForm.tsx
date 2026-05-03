"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  TemplateDownloadFormSchema,
  TemplateDownloadFormData,
  templateNames,
  templateOptions,
} from "@/lib/templates/validation";
import { Loader2, Download, MessageCircle } from "lucide-react";

const STORAGE_KEY = "saral_template_contact";

interface TemplateDownloadFormProps {
  onSuccess?: () => void;
  defaultEmail?: string;
}

export function TemplateDownloadForm({
  onSuccess,
  defaultEmail = "",
}: TemplateDownloadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successState, setSuccessState] = useState<{
    templateName: string;
    whatsapp: boolean;
  } | null>(null);

  const form = useForm<TemplateDownloadFormData>({
    resolver: zodResolver(TemplateDownloadFormSchema),
    defaultValues: {
      email:             defaultEmail,
      contactPersonName: "",
      businessName:      "",
      templateSelected:  undefined,
      phoneNumber:       "+91",
      consentContact:    false,
      consentBriefings:  true,
    },
  });

  async function onSubmit(values: TemplateDownloadFormData) {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/templates/download", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send template");
      }

      // Persist contact for next download (pre-fill)
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email:             values.email,
            contactPersonName: values.contactPersonName,
            businessName:      values.businessName,
            phoneNumber:       values.phoneNumber,
          })
        );
      }

      setSuccessState({
        templateName: templateNames[values.templateSelected],
        whatsapp:     data.whatsapp === true,
      });

      onSuccess?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Success state
  if (successState) {
    return (
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Download size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Template sent!</p>
            <p className="text-xs text-green-700">
              <strong>{successState.templateName}</strong> has been sent to your email.
            </p>
          </div>
        </div>
        {successState.whatsapp && (
          <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <MessageCircle size={15} className="text-teal-600 shrink-0" />
            <p className="text-xs text-teal-700">Download link also sent to your WhatsApp.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name + Business in a row on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactPersonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Ravi Sharma" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Pvt Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Template selector */}
        <FormField
          control={form.control}
          name="templateSelected"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Template *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templateOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {templateNames[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+91 98765 43210" {...field} />
              </FormControl>
              <FormDescription>
                Indian number (+91). Required to receive the template on WhatsApp.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Consent checkboxes */}
        <div className="space-y-3 pt-1">
          <FormField
            control={form.control}
            name="consentContact"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-medium cursor-pointer">
                    Send template to WhatsApp
                  </FormLabel>
                  <FormDescription>
                    We'll send the download link to your WhatsApp number above.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consentBriefings"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-medium cursor-pointer">
                    Subscribe to daily DPDPA briefings
                  </FormLabel>
                  <FormDescription>
                    Free daily updates on compliance, enforcement, and sector news.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {submitError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          {!isLoading && <Download size={16} className="mr-1" />}
          {isLoading ? "Sending…" : "Download Template"}
        </Button>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          By downloading you agree to our{" "}
          <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
          We will never share your details.
        </p>
      </form>
    </Form>
  );
}
