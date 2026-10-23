import React, { useState } from 'react';
import { Flag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { QuizQuestion, QuestionReport } from '../types/quiz';

interface ReportModalProps {
  question: QuizQuestion;
  onClose: () => void;
  onSubmitReport: (report: QuestionReport) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  question,
  onClose,
  onSubmitReport
}) => {
  const [reason, setReason] = useState<'ambiguous' | 'incorrect_answer' | 'typo' | 'other'>('ambiguous');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      questionId: question.id,
      prompt: question.prompt,
      reason,
      comment: comment.trim(),
      timestamp: new Date().toISOString()
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close report modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank you for reporting!</h3>
            <p className="text-sm text-slate-600 mt-1">
              Your feedback helps improve assessment quality.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-2 text-rose-600">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Report Question</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">
              "{question.prompt}"
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  What is the issue?
                </label>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === 'ambiguous'}
                      onChange={() => setReason('ambiguous')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ambiguous wording or missing context</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === 'incorrect_answer'}
                      onChange={() => setReason('incorrect_answer')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Listed correct answer appears inaccurate</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === 'typo'}
                      onChange={() => setReason('typo')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Typographical error or formatting problem</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === 'other'}
                      onChange={() => setReason('other')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Other concern</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why this question or explanation seems questionable..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
                  maxLength={500}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
