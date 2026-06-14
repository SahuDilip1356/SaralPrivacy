import Link from "next/link";
import { ArrowRight, Phone, Mail, Calendar } from "lucide-react";

export function ConsultationCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-navy-700 rounded-2xl p-10 lg:p-14 relative overflow-hidden">
          {/* Background accent — teal radial */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute right-0 top-0 w-96 h-96 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #35B6AE 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-500/40 rounded-full px-3.5 py-1.5 mb-5">
                <span className="text-teal-300 text-xs font-semibold">Free 30-minute consultation</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Not sure where to start?
                <span className="block text-teal-400 mt-1">We can help you figure it out.</span>
              </h2>

              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                We help Indian businesses turn sector-specific DPDPA risk into practical controls, templates
                and operating steps. Tell us where you are and we&apos;ll tell you what to prioritise.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Calendar, text: "30-minute discovery call — free, no obligation" },
                  { icon: Mail, text: "Written summary of next steps after the call" },
                  { icon: Phone, text: "Available via phone, video, or WhatsApp" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Icon size={16} className="text-teal-400 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-base"
              >
                Request Consultation
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Right: mini form teaser */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-bold text-white text-base mb-4">What the consultation covers</h3>
              <div className="space-y-3">
                {[
                  "Whether and how DPDPA applies to your specific business model",
                  "Your highest-risk privacy gaps based on current practices",
                  "Practical quick wins you can implement immediately",
                  "A prioritised roadmap for the next 90 days",
                  "Resource and cost estimates for your readiness programme",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                    <span className="text-green-400 mt-1 shrink-0">→</span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-slate-400 text-xs">
                  We handle your contact information in accordance with our Privacy Notice. You will
                  receive confirmation within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
