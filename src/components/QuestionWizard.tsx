import React, { useState } from "react";
import { SetupQuestion, SetupAnswers } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronRight, ChevronLeft, Bot, HelpCircle, Activity } from "lucide-react";

interface QuestionWizardProps {
  nicheName: string;
  nicheDescription: string;
  questions: SetupQuestion[];
  isLoading: boolean;
  onComplete: (answers: SetupAnswers) => void;
  onReset: () => void;
}

export default function QuestionWizard({
  nicheName,
  nicheDescription,
  questions,
  isLoading,
  onComplete,
  onReset
}: QuestionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SetupAnswers>({});

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Validate answers or supply defaults for empty ones
      const finalAnswers = { ...answers };
      questions.forEach(q => {
        if (!finalAnswers[q.id]) {
          finalAnswers[q.id] = q.type === 'select' ? (q.options?.[0] || "") : "Not specified";
        }
      });
      onComplete(finalAnswers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-110 animate-pulse"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="relative p-4 bg-slate-900 border border-blue-500/30 rounded-2xl"
          >
            <Activity className="w-10 h-10 text-blue-400" />
          </motion.div>
        </div>
        <h3 className="font-sans text-xl font-medium text-slate-100 mb-2">Analyzing Niche Architecture</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          Gemini is synthesizing targeted discovery credentials customized dynamically for <span className="text-blue-400">"{nicheName}"</span>...
        </p>
        <div className="w-56 h-1 w-full max-w-xs bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          ></motion.div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const activeQuestion = questions[currentStep];
  const currentValue = answers[activeQuestion.id] || "";

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-md border border-[#1E293B] rounded-3xl p-6 md:p-8 shadow-2xl">
      {/* Top Progress Grid */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Interactive Setup Discovery</span>
          <h2 className="font-sans text-lg font-bold text-slate-100 mt-1">{nicheName}</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full text-xs text-slate-400 border border-slate-850">
          <span className="font-mono text-indigo-400">{currentStep + 1}</span> of <span className="font-mono text-slate-500">{questions.length}</span>
        </div>
      </div>

      {/* Steps Visual Bar */}
      <div className="flex gap-2 mb-8">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx === currentStep
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/20"
                : idx < currentStep
                ? "bg-slate-700"
                : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      {/* Main Question Body */}
      <div className="min-h-[180px] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 mt-1">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{activeQuestion.category}</span>
                <label className="block text-lg font-medium text-slate-100 leading-snug">
                  {activeQuestion.question}
                </label>
              </div>
            </div>

            <div className="pt-2">
              {activeQuestion.type === "textarea" ? (
                <textarea
                  rows={4}
                  placeholder={activeQuestion.placeholder}
                  value={currentValue}
                  onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                  className="w-full text-slate-200 placeholder-slate-500 bg-slate-950/70 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-none"
                />
              ) : activeQuestion.type === "select" ? (
                <div className="space-y-2">
                  {activeQuestion.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange(activeQuestion.id, option)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                        currentValue === option
                          ? "bg-blue-500/10 border-blue-500/75 text-blue-200 font-medium"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <span>{option}</span>
                      {currentValue === option && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 shadow-glow" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={activeQuestion.placeholder}
                  value={currentValue}
                  onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                  className="w-full text-slate-200 placeholder-slate-500 bg-slate-950/70 border border-slate-800 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Button Operations */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-850">
        <button
          onClick={currentStep === 0 ? onReset : handlePrev}
          className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer text-slate-350 hover:text-slate-100"
        >
          <span>{currentStep === 0 ? "Abort Configuration" : "Previous Step"}</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white shadow-lg shadow-indigo-500/20 inline-flex items-center gap-1.5 transition-all select-none cursor-pointer"
        >
          <span>
            {currentStep === questions.length - 1 ? "Compile Squad Architecture" : "Save & Continue"}
          </span>
          {currentStep === questions.length - 1 ? (
            <Sparkles className="w-4 h-4 text-amber-300" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
