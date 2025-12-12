import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import {
  getEquipmentRequests,
  saveEquipmentRequests,
  getEquipments,
  saveEquipments,
  getUsedEquipments,
  saveUsedEquipments,
  getIssuedEquipments,
  saveIssuedEquipments,
  getLogs,
  saveLogs,
  generateId,
  formatDate
} from '../utils/localStorage';

const ManagerRequests = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filterBranch, setFilterBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('manager')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadRequests();
  }, [navigate]);

  const loadRequests = () => {
    const allRequests = getEquipmentRequests();
    // Only show pending requests
    const pendingRequests = allRequests.filter(req => req.status === 'pending');
    setRequests(pendingRequests);
  };

  const handleApprove = (request) => {
    if (!window.confirm(`Approve equipment request for ${request.studentName}?`)) {
      return;
    }

    // Get current equipment
    const equipments = getEquipments();
    const equipment = equipments.find(eq => eq.id === request.equipmentId);

    if (!equipment) {
      toast.error('Equipment not found!');
      return;
    }

    const availableQuantity = parseInt(equipment.quantity);
    const requestedQuantity = parseInt(request.quantity);

    // Check if enough quantity available
    if (requestedQuantity > availableQuantity) {
      toast.error('Required quantity not available in inventory!');
      return;
    }

    // Update equipment quantity
    const updatedEquipments = equipments.map(eq =>
      eq.id === request.equipmentId
        ? { ...eq, quantity: availableQuantity - requestedQuantity }
        : eq
    );
    saveEquipments(updatedEquipments);

    // Move issued quantity to issue counter
    const usedEquipments = getUsedEquipments();
    const existingUsedItem = usedEquipments.find(
      (eq) => eq.id === request.equipmentId
    );

    let updatedUsedEquipments;
    if (existingUsedItem) {
      // Add to existing issue counter item
      updatedUsedEquipments = usedEquipments.map((eq) =>
        eq.id === request.equipmentId
          ? { ...eq, quantity: parseInt(eq.quantity) + requestedQuantity }
          : eq
      );
    } else {
      // Create new issue counter item from main inventory equipment
      const usedItem = {
        ...equipment,
        quantity: requestedQuantity,
        usageStatus: 'used',
        firstIssuedDate: new Date().toISOString(),
      };
      updatedUsedEquipments = [...usedEquipments, usedItem];
    }
    saveUsedEquipments(updatedUsedEquipments);

    // Create issued record
    const issueRecord = {
      id: generateId(),
      equipmentId: request.equipmentId,
      equipmentName: request.equipmentName,
      sportType: request.sportType,
      category: request.category,
      quantity: request.quantity,
      studentName: request.studentName,
      registrationNumber: request.registrationNumber,
      branch: request.branch,
      issueTime: new Date().toISOString(),
      expectedReturnTime: request.expectedReturnTime,
      purpose: request.purpose,
      approvedBy: currentUser.name
    };

    // Add to issued equipments
    const issued = getIssuedEquipments();
    saveIssuedEquipments([...issued, issueRecord]);

    // Update request status
    const allRequests = getEquipmentRequests();
    const updatedRequests = allRequests.map(req =>
      req.id === request.id
        ? { ...req, status: 'approved', approvedTime: new Date().toISOString(), approvedBy: currentUser.name }
        : req
    );
    saveEquipmentRequests(updatedRequests);

    toast.success(`Request approved! Equipment issued to ${request.studentName}`);
    loadRequests();
  };

  const handleDeny = (request) => {
    const reason = window.prompt(`Deny request for ${request.studentName}?\n\nEnter reason for denial (optional):`);
    
    if (reason === null) {
      // User cancelled
      return;
    }

    // Update request status
    const allRequests = getEquipmentRequests();
    const updatedRequests = allRequests.map(req =>
      req.id === request.id
        ? { 
            ...req, 
            status: 'denied', 
            deniedTime: new Date().toISOString(), 
            deniedBy: currentUser.name,
            denialReason: reason || 'No reason provided'
          }
        : req
    );
    saveEquipmentRequests(updatedRequests);

    toast.success('Request denied');
    loadRequests();
  };

  const filteredRequests = requests.filter(request => {
    const matchesBranch = filterBranch === 'all' || request.branch === filterBranch;
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  const branches = [...new Set(requests.map(req => req.branch))];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Equipment Requests</h1>
          <p className="text-gray-100">Review and manage student equipment requests</p>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by student name, reg. number, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Branch Filter */}
            <div className="w-full md:w-64">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Badge */}
            <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {filteredRequests.length} Pending
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{request.equipmentName}</h3>
                          <p className="text-sm text-gray-600">{request.sportType} - {request.category || 'General'}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Student</p>
                          <p className="font-semibold text-gray-800">{request.studentName}</p>
                          <p className="text-sm text-gray-600">{request.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Branch & Quantity</p>
                          <p className="font-semibold text-gray-800">{request.branch}</p>
                          <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Purpose</p>
                        <p className="text-gray-800">{request.purpose}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Requested:</span>
                          <p className="text-gray-800">{formatDate(request.requestTime)}</p>
                        </div>
                        {request.expectedReturnTime && (
                          <div>
                            <span className="text-gray-600">Expected Return:</span>
                            <p className="text-gray-800">{request.expectedReturnTime}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-3 lg:w-40">
                      <button
                        onClick={() => handleApprove(request)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(request)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Deny
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

export default ManagerRequests;
