import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getStorage } from '../../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RaiseDoubtModal = ({ isOpen, onClose, courseId, courseTitle, lessonId, lessonTitle }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message');
      setLoading(false);
      return;
    }

    try {
      const token = getStorage('token');
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          lessonId: lessonId || null,
          subject,
          message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Doubt raised successfully! Admin will respond soon.');
        setTimeout(() => {
          onClose();
          setSubject('');
          setMessage('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to raise doubt');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Raise a Doubt
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-500">
          <p><strong>Course:</strong> {courseTitle}</p>
          {lessonTitle && <p><strong>Lesson:</strong> {lessonTitle}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              placeholder="Brief description of your doubt"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input"
              rows={5}
              placeholder="Please explain your doubt in detail..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Submitting...' : 'Submit Doubt'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseDoubtModal;