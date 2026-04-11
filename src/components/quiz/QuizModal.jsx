import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const QuizModal = ({ isOpen, onClose, quiz, onSubmit }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const response = await onSubmit(answers);
    setResult(response);
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted && result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 text-center">
          <div className={`text-5xl mb-4 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
            {result.passed ? '🎉' : '😢'}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {result.passed ? 'Congratulations!' : 'Not this time'}
          </h2>
          <p className="text-gray-600 mb-2">
            You scored {result.percentage}%
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Passing score: {result.passingScore}%
          </p>
          {result.passed ? (
            <button onClick={onClose} className="btn-primary w-full">
              Get Certificate
            </button>
          ) : (
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentQuestion(0);
                setAnswers({});
                setResult(null);
              }}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <button onClick={onClose} className="text-gray-500">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>Time: {quiz.timeLimit} min</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{question.questionText}</h3>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question.id, idx)}
                  className={`w-full text-left p-3 border rounded-xl transition ${
                    answers[question.id] === idx
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {currentQuestion === quiz.questions.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;