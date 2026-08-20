"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AssessmentQuestion, AssessmentResult } from "@/lib/types";
import { calculateAssessmentResult } from "@/lib/data/assessments";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  title: string;
  industry: string;
  questions: AssessmentQuestion[];
}

export function AssessmentWizard({ title, industry, questions }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);

  const currentQuestion = questions[step];
  const progress = Math.round(((step) / questions.length) * 100);
  const isLastQuestion = step === questions.length - 1;
  const hasAnswer = answers[currentQuestion?.id];

  const handleAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const result = calculateAssessmentResult(questions, answers);
      setResult(result);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const getRiskIcon = (level: string) => {
    if (level === "green") return <CheckCircle size={28} className="text-green-800" />;
    if (level === "amber") return <AlertTriangle size={28} className="text-amber-600" />;
    return <XCircle size={28} className="text-red-600" />;
  };

  const getRiskBg = (level: string) => {
    if (level === "green") return "bg-green-50 border-green-200";
    if (level === "amber") return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getRiskTextColor = (level: string) => {
    if (level === "green") return "text-green-800";
    if (level === "amber") return "text-amber-800";
    return "text-red-800";
  };

  // Result screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Score header */}
        <div className={`rounded-2xl border-2 p-7 mb-6 ${getRiskBg(result.riskLevel)}`}>
          <div className="flex items-start gap-4">
            {getRiskIcon(result.riskLevel)}
            <div>
              <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${getRiskTextColor(result.riskLevel)}`}>
                {result.riskLevel === "green"
                  ? "Low Complexity"
                  : result.riskLevel === "amber"
                  ? "Moderate Exposure"
                  : "High-Priority Action Needed"}
              </div>
              <h2 className={`text-xl font-semibold leading-snug ${getRiskTextColor(result.riskLevel)}`}>
                {result.headline}
              </h2>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h3 className="font-semibold text-navy-700 text-sm mb-4">Your Score Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Applicability", score: result.applicabilityScore, color: "bg-blue-500" },
              { label: "Risk Level", score: result.riskScore, color: result.riskLevel === "green" ? "bg-green-500" : result.riskLevel === "amber" ? "bg-amber-500" : "bg-red-500" },
              { label: "Maturity", score: result.maturityScore, color: "bg-green-500" },
              { label: "Urgency", score: result.urgencyScore, color: result.urgencyScore > 60 ? "bg-red-400" : "bg-slate-400" },
            ].map(({ label, score, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{label}</span>
                  <span className="font-bold">{score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
          <h3 className="font-semibold text-navy-700 text-lg mb-3">Assessment Summary</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-5">{result.summary}</p>

          <h4 className="font-semibold text-navy-700 text-sm mb-3">Key Recommendations</h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Next step CTA */}
        <div className="bg-navy-700 rounded-xl p-6 mb-5">
          <h4 className="font-semibold text-white text-sm mb-2">Recommended next step</h4>
          <p className="text-slate-300 text-sm mb-4">{result.nextStep}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="flex-1 text-center py-2.5 px-5 bg-green-500 hover:bg-green-500 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Request Free Consultation
            </Link>
            <Link
              href="/white-paper"
              className="flex-1 text-center py-2.5 px-5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg text-sm border border-white/20 transition-colors"
            >
              Download the Guide
            </Link>
          </div>
        </div>

        {/* Email capture */}
        {!emailSaved ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h4 className="font-semibold text-navy-700 text-sm mb-1">
              Save your results and get a detailed report
            </h4>
            <p className="text-slate-600 text-xs mb-3">
              Enter your email to receive a copy of your assessment results and a tailored action guide.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => setEmailSaved(true)}
                className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg text-sm hover:bg-green-600"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              By sharing your email, you consent to receive your assessment results and related resources.
              See our <a href="/privacy" className="text-green-500 underline">Privacy Notice</a>.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <CheckCircle size={24} className="text-green-800 mx-auto mb-2" />
            <p className="text-green-800 font-semibold text-sm">Results saved! Check your inbox.</p>
          </div>
        )}

        <button
          onClick={() => {
            setAnswers({});
            setResult(null);
            setStep(0);
          }}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Retake Assessment
        </button>
      </div>
    );
  }

  // Question screen
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-7">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>Question {step + 1} of {questions.length}</span>
          <span className="font-semibold text-green-800">{progress}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
        {/* Category label */}
        <div className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-3">
          {currentQuestion.category.replace(/-/g, " ")}
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-navy-700 leading-snug mb-2">
          {currentQuestion.text}
        </h2>

        {currentQuestion.helpText && (
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            {currentQuestion.helpText}
          </p>
        )}

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all text-sm leading-snug font-medium",
                answers[currentQuestion.id] === option.id
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors",
                    answers[currentQuestion.id] === option.id
                      ? "border-green-400 bg-green-500"
                      : "border-slate-300"
                  )}
                />
                {option.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLastQuestion ? "See Results" : "Next Question"}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Skip notice */}
      <p className="text-center text-xs text-slate-400 mt-4">
        Select an option to continue. All responses are confidential.
      </p>
    </div>
  );
}
