import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getOverdueEquipments,
  saveOverdueEquipments,
  getEquipments,
  saveEquipments,
  getUsedEquipments,
  saveUsedEquipments,
  getLogs,
  saveLogs,
  formatDate,
  exportToPDF,
} from '../utils/localStorage';

/**
 * Overdue Equipments Page
 * View and manage overdue equipments
 */
const Overdue = () => {
  const [overdueEquipments, setOverdueEquipments] = useState([]);
  const [filteredOverdue, setFilteredOverdue] = useState([]);
  const [filterBranch, setFilterBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load overdue equipments on mount
  useEffect(() => {
    loadOverdueEquipments();
  }, []);

  const loadOverdueEquipments = () => {
    const overdue = getOverdueEquipments();
    setOverdueEquipments(overdue);
    setFilteredOverdue(overdue);
  };

  // Filter logic
  useEffect(() => {
    let result = overdueEquipments;

    // Filter by branch
    if (filterBranch) {
      result = result.filter((item) => item.branch === filterBranch);
    }

    // Search by student name or equipment name
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOverdue(result);
  }, [filterBranch, searchTerm, overdueEquipments]);

  const handleReturn = (overdueItem) => {
    if (
      window.confirm(
        `Mark ${overdueItem.equipmentName} as returned by ${overdueItem.studentName}?`
      )
    ) {
      // Remove from overdue equipments
      const updatedOverdue = overdueEquipments.filter(
        (item) => item.id !== overdueItem.id
      );
      saveOverdueEquipments(updatedOverdue);
      setOverdueEquipments(updatedOverdue);

      // Return quantity to issue counter (not main inventory)
      const usedEquipments = getUsedEquipments();
      const updatedUsedEquipments = usedEquipments.map((eq) =>
        eq.id === overdueItem.equipmentId
          ? {
              ...eq,
              quantity: parseInt(eq.quantity) + parseInt(overdueItem.quantity),
            }
          : eq
      );
      saveUsedEquipments(updatedUsedEquipments);

      // Add to logs
      const logs = getLogs();
      const logEntry = {
        ...overdueItem,
        returnTime: new Date().toISOString(),
        wasOverdue: true,
      };
      saveLogs([...logs, logEntry]);

      toast.success('Overdue equipment marked as returned!');
    }
  };

  const handleExportPDF = () => {
    if (filteredOverdue.length === 0) {
      toast.error('No overdue items to export');
      return;
    }

    const exportData = filteredOverdue.map((item) => ({
      'Equipment Name': item.equipmentName,
      'Sport Type': item.sportType,
      Category: item.category || '',
      Quantity: item.quantity,
      'Student Name': item.studentName,
      'Registration Number': item.registrationNumber,
      Branch: item.branch,
      'Issue Time': formatDate(item.issueTime),
      'Expected Return Time': item.expectedReturnTime || 'Not Specified',
      'Time Overdue': item.expectedReturnTime 
        ? calculateTimeOverdue(item.issueTime, item.expectedReturnTime)
        : 'N/A',
    }));

    const filename = `overdue-equipments-${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(exportData, filename, 'Overdue Equipments Report');
    toast.success('Overdue list exported successfully!');
  };

  const calculateTimeOverdue = (issueTime, expectedReturnTime) => {
    if (!expectedReturnTime) return 'No time set';
    
    const [hours, minutes] = expectedReturnTime.split(':').map(Number);
    const issueDate = new Date(issueTime);
    
    // Create expected return datetime
    const expectedReturn = new Date(issueDate);
    expectedReturn.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const diffMs = now - expectedReturn;
    
    if (diffMs <= 0) return 'Due soon';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h overdue`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m overdue`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} overdue`;
    }
  };

  const calculateDaysOverdue = (expectedReturnDate) => {
    if (!expectedReturnDate) return 'No due date';
    const days = Math.floor((new Date() - new Date(expectedReturnDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} day${days > 1 ? 's' : ''} overdue` : 'Due today';
  };

  const branches = [
    ...new Set(overdueEquipments.map((item) => item.branch)),
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Overdue Equipment</h1>
            <p className="text-gray-600 mt-2">
              Equipment past expected return date • {filteredOverdue.length} item(s)
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={filteredOverdue.length === 0}
          >
           📄 Export to PDF
          </button>
        </div>

        {/* Filters */}
        {overdueEquipments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search by student or equipment name..."
                />
              </div>

              {/* Filter by Branch */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Filter by Branch
                </label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Items List */}
        {filteredOverdue.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg mb-4">
              {overdueEquipments.length === 0
                ? 'No overdue equipments - Great job!'
                : 'No items match your search criteria'}
            </p>
            {overdueEquipments.length === 0 && (
              <p className="text-gray-400">
                Overdue items will appear here when return dates are missed
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOverdue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition border-l-4 border-red-500"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {item.equipmentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.sportType}
                      {item.category && ` • ${item.category}`}
                    </p>
                  </div>
                  <div className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                    Qty: {item.quantity}
                  </div>
                </div>

                {/* Overdue Badge */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">
                      {calculateTimeOverdue(item.issueTime, item.expectedReturnTime)}
                    </span>
                  </div>
                  {item.expectedReturnTime && (
                    <p className="text-sm text-red-600 mt-1">
                      Expected: {item.expectedReturnTime} (24-hour format)
                    </p>
                  )}
                </div>

                {/* Student Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    👤 Student Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <strong>Name:</strong> {item.studentName}
                    </p>
                    <p className="text-gray-600">
                      <strong>Reg No:</strong> {item.registrationNumber}
                    </p>
                    <p className="text-gray-600">
                      <strong>Branch:</strong> {item.branch}
                    </p>
                  </div>
                </div>

                {/* Issue Time */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Issued on:</strong> {formatDate(item.issueTime)}
                  </p>
                </div>

                {/* Return Button */}
                <button
                  onClick={() => handleReturn(item)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  ✅ Mark as Returned
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overdue;
