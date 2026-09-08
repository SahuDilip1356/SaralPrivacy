"use client";
import { getNiche } from "@/lib/discovery/data";
import type { Answers, AnswerValue } from "@/lib/discovery/types";

export default function ControlQuestions({
  niche,
  answers,
  setAnswers,
}: {
  niche: string;
  answers: Answers;
  setAnswers: (a: Answers) => void;
}) {
  const n = getNiche(niche);
  const isProc = n && (n.role === "P" || n.role === "B");

  const QS: { k: keyof Answers; q: string; opts: [AnswerValue, string][] }[] = [
    {
      k: "q1",
      q: isProc
        ? "Do you work to clear, documented instructions from the clients whose data you handle?"
        : "Do you clearly tell people why their data is collected and how it will be used?",
      opts: [
        ["yes", "Yes, documented"],
        ["partially", "Partially"],
        ["no", "No"],
        ["notsure", "Not sure"],
      ],
    },
    {
      k: "q2",
      q: "Do you share this data with vendors, platforms, agencies, cloud tools or partners?",
      opts: [
        ["yes", "Yes"],
        ["no", "No"],
        ["notsure", "Not sure"],
      ],
    },
    {
      k: "q3",
      q: "Do you have documented access control, retention and breach-response practices?",
      opts: [
        ["yes", "Yes"],
        ["partially", "Partially"],
        ["no", "No"],
        ["notsure", "Not sure"],
      ],
    },
  ];

  return (
    <div className="cqs">
      <p className="review-lead">Three quick questions. No right answers — they tune your risk read.</p>
      {QS.map((Q, i) => (
        <div className="cq" key={Q.k}>
          <div className="cq-q" id={`cq-${Q.k}`}>
            <span className="cq-n" aria-hidden="true">{i + 1}</span>
            <span>{Q.q}</span>
          </div>
          <div className="cq-opts" role="radiogroup" aria-labelledby={`cq-${Q.k}`}>
            {Q.opts.map(([v, label]) => {
              const on = answers[Q.k] === v;
              return (
                <button
                  type="button"
                  key={v}
                  role="radio"
                  aria-checked={on}
                  className={"cq-opt" + (on ? " on" : "")}
                  onClick={() => setAnswers({ ...answers, [Q.k]: v })}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
