import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { getStorage } from '../../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api';

const EditQuizModal = ({ isOpen, onClose, quiz, onQuizUpdated }) => {
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 30
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  useEffect(() => {
    if (quiz && isOpen) {
      setQuizForm({
        title: quiz.title || '',
        description: quiz.description || '',
        passingScore: quiz.passingScore || 70,
        timeLimit: quiz.timeLimit || 30
      });
      setQuestions(quiz.questions || []);
    }
  }, [quiz, isOpen]);

  if (!isOpen) return null;

  const handleUpdateQuiz = async () => {
    if (!quizForm.title) {
      alert('Quiz title is required');
      return;
    }

    setLoading(true);
    const token = getStorage('token');
    
    try {
      const response = await fetch(`${API_URL}/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Quiz updated successfully!');
        onQuizUpdated();
        onClose();
      } else {
        alert(data.message || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this quiz? All questions and attempts will be deleted.')) {
      return;
    }
    
    setLoading(true);
    const token = getStorage('token');
    
    try {
      const response = await fetch(`${API_URL}/quizzes/${quiz.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Quiz deleted successfully!');
        onQuizUpdated();
        onClose();
      } else {
        alert(data.message || 'Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!currentQuestion.questionText) {
      alert('Question text is required');
      return;
    }
    
    const emptyOptions = currentQuestion.options.some(opt => opt === '');
    if (emptyOptions) {
      alert('Please fill all 4 options');
      return;
    }
    
    const token = getStorage('token');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/quizzes/${quiz.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions: [currentQuestion] })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Question added successfully!');
        setQuestions([...questions, { ...currentQuestion, id: data.data[0].id }]);
        setCurrentQuestion({
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 1
        });
        setShowQuestionModal(false);
      } else {
        alert(data.message || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    
    const token = getStorage('token');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/quizzes/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentQuestion)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Question updated successfully!');
        setQuestions(questions.map(q => 
          q.id === editingQuestion.id ? { ...q, ...currentQuestion } : q
        ));
        setEditingQuestion(null);
        setCurrentQuestion({
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 1
        });
        setShowQuestionModal(false);
      } else {
        alert(data.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Delete this question?')) return;
    
    const token = getStorage('token');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/quizzes/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Question deleted successfully!');
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        alert(data.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const openEditQuestion = (question) => {
    setEditingQuestion(question);
    setCurrentQuestion({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      points: question.points
    });
    setShowQuestionModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Quiz: {quiz?.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Quiz Details Form */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Quiz Details</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Quiz Title"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                className="input"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Passing Score (%)"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Time Limit (minutes)"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Questions ({questions.length})</h3>
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setCurrentQuestion({
                    questionText: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    points: 1
                  });
                  setShowQuestionModal(true);
                }}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" /> Add Question
              </button>
            </div>
            
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No questions yet. Click "Add Question" to create one.</p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">Q{idx + 1}: {q.questionText}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Correct: {q.options[q.correctAnswer]} | Points: {q.points}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="text-blue-500 hover:text-blue-600"
                          title="Edit Question"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete Question"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleUpdateQuiz}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDeleteQuiz}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex-1"
            >
              Delete Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
              <button onClick={() => setShowQuestionModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Question text"
                value={currentQuestion.questionText}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                className="input"
              />
              
              {currentQuestion.options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...currentQuestion.options];
                    newOptions[idx] = e.target.value;
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                  className="input"
                />
              ))}
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                  className="input"
                >
                  {currentQuestion.options.map((_, idx) => (
                    <option key={idx} value={idx}>Correct: Option {idx + 1}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Points"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                className="btn-primary flex-1"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditQuizModal;