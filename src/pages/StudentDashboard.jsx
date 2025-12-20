import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole, logout } from '../utils/auth';
import { getIssuedEquipments, getLogs, getEquipmentRequests } from '../utils/localStorage';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('student')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadStudentData(user);
  }, [navigate]);

  const loadStudentData = (user) => {
    const allIssued = getIssuedEquipments();
    const allLogs = getLogs();
    const allRequests = getEquipmentRequests();

    // Filter by student's registration number
    const studentIssues = allIssued.filter(
      item => item.registrationNumber === user.registrationNumber
    );
    const studentHistory = allLogs.filter(
      item => item.registrationNumber === user.registrationNumber
    );
    const studentRequests = allRequests.filter(
      item => item.registrationNumber === user.registrationNumber && item.status === 'pending'
    );

    setMyIssues(studentIssues);
    setMyHistory(studentHistory);
    setMyRequests(studentRequests);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
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

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Refined Red Header */}
      <div className="bg-red-100 border-b border-red-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div>
            <h1 className="text-2xl font-bold text-red-800">Student Dashboard</h1>
            <p className="text-red-600">Welcome, {currentUser.name}</p>
            <p className="text-sm text-red-500">{currentUser.registrationNumber} | {currentUser.branch}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
                <p className="text-4xl font-bold text-yellow-600">{myRequests.length}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-xl">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Currently Borrowed</p>
                <p className="text-4xl font-bold text-orange-600">{myIssues.length}</p>
                <p className="text-sm text-gray-500 mt-1">Active items</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl">
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total History</p>
                <p className="text-4xl font-bold text-purple-600">{myHistory.length}</p>
                <p className="text-sm text-gray-500 mt-1">Past transactions</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Quick Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Link
            to="/student-equipments"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Browse Equipment
          </Link>
          <Link
            to="/request-equipment"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Quick Request
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Requests
            </h2>

            {myRequests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No pending requests</p>
                <Link
                  to="/request-equipment"
                  className="inline-block mt-4 text-primary font-semibold hover:underline"
                >
                  Submit a new request
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((item) => (
                  <div key={item.id} className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.equipmentName}</h3>
                        <p className="text-sm text-gray-600">{item.sportType} - {item.category || 'General'}</p>
                      </div>
                      <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Pending
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-3">
                      <div><span className="font-semibold">Quantity:</span> {item.quantity}</div>
                      <div><span className="font-semibold">Purpose:</span> {item.purpose}</div>
                      <div><span className="font-semibold">Requested:</span> {formatDate(item.requestTime)}</div>
                      {item.expectedReturnTime && (
                        <div><span className="font-semibold">Expected Return:</span> {item.expectedReturnTime}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currently Borrowed Items */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Currently Borrowed
            </h2>

            {myIssues.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No items currently borrowed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myIssues.map((item) => (
                  <div key={item.id} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.equipmentName}</h3>
                        <p className="text-sm text-gray-600">{item.sportType} - {item.category || 'General'}</p>
                      </div>
                      <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                      <div>
                        <span className="font-semibold">Quantity:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="font-semibold">Issued:</span> {formatDate(item.issueTime)}
                      </div>
                      {item.expectedReturnTime && (
                        <div className="col-span-2">
                          <span className="font-semibold">Expected Return:</span> {item.expectedReturnTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Transaction History
            </h2>

            {myHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No transaction history yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myHistory.map((item) => (
                  <div key={item.id} className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.equipmentName}</h3>
                        <p className="text-sm text-gray-600">{item.sportType} - {item.category || 'General'}</p>
                      </div>
                      <span className={`text-white text-xs px-3 py-1 rounded-full font-semibold ${
                        item.wasOverdue ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {item.wasOverdue ? 'Overdue' : 'Returned'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                      <div>
                        <span className="font-semibold">Quantity:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="font-semibold">Issued:</span> {formatDate(item.issueTime)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Returned:</span> {formatDate(item.returnTime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please return equipment on time to avoid penalties</li>
                <li>• Contact the gymkhana manager for any equipment issues</li>
                <li>• Report damaged equipment immediately</li>
                <li>• Maximum borrowing period is as specified during issue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
