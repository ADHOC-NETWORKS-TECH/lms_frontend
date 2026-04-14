import React, { useState, useEffect } from 'react';
import { getStorage } from '../../utils/storage';
import Loader from '../../components/common/Loader';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyDoubts = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = getStorage('token');
      const response = await fetch(`${API_URL}/tickets/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTickets(data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">My Doubts</h1>

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
          <ChatBubbleLeftRightIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No doubts raised yet</h3>
          <p className="text-gray-500">Have a question? Raise a doubt from the course player.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{ticket.subject}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Course: {ticket.course?.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ticket.message.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted: {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.status === 'resolved' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                  {ticket.status === 'open' && <ClockIcon className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>

              {/* Admin Response - Show when expanded */}
              {selectedTicket?.id === ticket.id && ticket.adminResponse && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      Admin Response:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {ticket.adminResponse}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Responded: {new Date(ticket.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDoubts;