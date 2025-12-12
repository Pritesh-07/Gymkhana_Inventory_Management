import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import { getSelectionFeedback, saveSelectionFeedback } from '../utils/localStorage';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('admin')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadFeedback();
  }, [navigate]);

  const loadFeedback = () => {
    const allFeedback = getSelectionFeedback();
    setFeedback(allFeedback);
  };

  const updateFeedbackStatus = (feedbackId, newStatus) => {
    const updatedFeedback = feedback.map(item => {
      if (item.id === feedbackId) {
        return {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    saveSelectionFeedback(updatedFeedback);
    setFeedback(updatedFeedback);
    toast.success(`Feedback marked as ${newStatus}`);
  };

  const deleteFeedback = (feedbackId) => {
    const updatedFeedback = feedback.filter(item => item.id !== feedbackId);
    saveSelectionFeedback(updatedFeedback);
    setFeedback(updatedFeedback);
    toast.success('Feedback deleted successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter feedback
  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // Sort feedback
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Sport Selection Feedback</h1>
              <p className="text-gray-100">Manage and review sport team selection feedback from students</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white font-semibold">
                Total Feedback: <span className="text-xl">{feedback.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="all">All Feedback</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <button
              onClick={loadFeedback}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {sortedFeedback.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No feedback found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "There is no sport selection feedback at the moment." 
                : `No feedback with status "${filter}" found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedFeedback.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.gameParticipated}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status || 'pending')}`}>
                          {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Submitted on</p>
                      <p className="font-semibold">{formatDate(item.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Student Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Reg No</p>
                        <p className="font-medium">{item.registrationNumber}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Branch</p>
                        <p className="font-medium">{item.branch}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Semester</p>
                        <p className="font-medium">{item.semester}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">College</p>
                        <p className="font-medium">{item.collegeName}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-medium text-sm">{item.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Feedback */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Selection Process Ratings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Notice Advance</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.noticeAdvance / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-blue-700">{item.noticeAdvance}/5</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Rules Explanation</p>
                        <p className="font-semibold text-green-700">{item.rulesExplanation}</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Facility Preparation</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(item.facilityPreparation / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-purple-700">{item.facilityPreparation}/5</span>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Skill Opportunities</p>
                        <p className="font-semibold text-yellow-700">{item.skillOpportunities}</p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Time Limit</p>
                        <p className="font-semibold text-orange-700">{item.timeLimit}</p>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-1">Communication</p>
                        <p className="font-semibold text-indigo-700">{item.communication}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Suggestions */}
                  {item.additionalSuggestions && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Additional Suggestions</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{item.additionalSuggestions}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      Last updated: {formatDate(item.updatedAt || item.submittedAt)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {(!item.status || item.status === 'pending') && (
                        <>
                          <button
                            onClick={() => updateFeedbackStatus(item.id, 'in-progress')}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateFeedbackStatus(item.id, 'resolved')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      
                      {item.status === 'in-progress' && (
                        <button
                          onClick={() => updateFeedbackStatus(item.id, 'resolved')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition"
                        >
                          Resolve
                        </button>
                      )}
                      
                      {item.status !== 'dismissed' && (
                        <button
                          onClick={() => updateFeedbackStatus(item.id, 'dismissed')}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          Dismiss
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this feedback?')) {
                            deleteFeedback(item.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
