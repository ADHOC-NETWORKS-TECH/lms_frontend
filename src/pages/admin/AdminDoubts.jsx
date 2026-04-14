import React, { useState, useEffect } from 'react';
import { getStorage } from '../../utils/storage';
import Loader from '../../components/common/Loader';
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PlayCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDoubts = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const token = getStorage('token');
      const url = filter === 'all' 
        ? `${API_URL}/tickets/all`
        : `${API_URL}/tickets/all?status=${filter}`;
      
      const response = await fetch(url, {
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

  const handleRespond = async (ticketId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      const token = getStorage('token');
      const response = await fetch(`${API_URL}/tickets/${ticketId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminResponse: responseText,
          status: status || 'resolved'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Response sent successfully!');
        setResponseText('');
        setSelectedTicket(null);
        fetchTickets();
      } else {
        alert(data.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error responding:', error);
      alert('Network error');
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

  const getStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    return { open, inProgress, resolved };
  };

  const stats = getStats();

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">Manage Doubts</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
          <p className="text-sm text-gray-600">Open</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in-progress', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === f 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <ChatBubbleLeftRightIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No doubts found</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Student:</strong> {ticket.user?.name} ({ticket.user?.email})
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong>Course:</strong> {ticket.course?.title}
                    </p>
                    {ticket.lesson && (
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Lesson:</strong> {ticket.lesson?.title}
                      </p>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Question:</strong> {ticket.message}
                      </p>
                    </div>
                    {ticket.adminResponse && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Admin Response:</strong> {ticket.adminResponse}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Posted: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Response Form */}
                {selectedTicket?.id === ticket.id ? (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="input mb-3"
                      rows={4}
                      placeholder="Type your response here..."
                    />
                    <div className="flex gap-3">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="input flex-1"
                      >
                        <option value="resolved">Resolved</option>
                        <option value="in-progress">In Progress</option>
                        <option value="open">Open</option>
                      </select>
                      <button
                        onClick={() => handleRespond(ticket.id)}
                        className="btn-primary"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setResponseText(ticket.adminResponse || '');
                      setStatus(ticket.status);
                    }}
                    className="mt-4 btn-secondary text-sm"
                  >
                    {ticket.adminResponse ? 'Edit Response' : 'Respond'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDoubts;