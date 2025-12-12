import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getIssuedEquipments,
  saveIssuedEquipments,
  getOverdueEquipments,
  saveOverdueEquipments,
  getEquipments,
  saveEquipments,
  getUsedEquipments,
  saveUsedEquipments,
  getLogs,
  saveLogs,
  formatDate,
} from '../utils/localStorage';

/**
 * Issued Equipments Page
 * View and manage currently issued equipments
 */
const Issued = () => {
  const [issuedEquipments, setIssuedEquipments] = useState([]);
  const [filteredIssued, setFilteredIssued] = useState([]);
  const [filterBranch, setFilterBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load issued equipments on mount
  useEffect(() => {
    loadIssuedEquipments();
    checkAndMoveOverdueItems();
  }, []);

  const loadIssuedEquipments = () => {
    const issued = getIssuedEquipments();
    setIssuedEquipments(issued);
    setFilteredIssued(issued);
  };

  const checkAndMoveOverdueItems = () => {
    const issued = getIssuedEquipments();
    const overdue = getOverdueEquipments();
    const now = new Date();

    const overdueItems = [];
    const stillIssued = [];

    issued.forEach((item) => {
      if (item.expectedReturnTime) {
        // Parse the expected return time (HH:MM format)
        const [hours, minutes] = item.expectedReturnTime.split(':').map(Number);
        const issueDate = new Date(item.issueTime);
        
        // Create expected return datetime based on issue date and expected time
        const expectedReturn = new Date(issueDate);
        expectedReturn.setHours(hours, minutes, 0, 0);
        
        // If current time is past expected return time, mark as overdue
        if (now > expectedReturn) {
          overdueItems.push(item);
        } else {
          stillIssued.push(item);
        }
      } else {
        stillIssued.push(item);
      }
    });

    if (overdueItems.length > 0) {
      // Move overdue items
      saveIssuedEquipments(stillIssued);
      saveOverdueEquipments([...overdue, ...overdueItems]);
      setIssuedEquipments(stillIssued);
      toast.info(`${overdueItems.length} item(s) moved to Overdue list`);
    }
  };

  // Filter logic
  useEffect(() => {
    let result = issuedEquipments;

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

    setFilteredIssued(result);
  }, [filterBranch, searchTerm, issuedEquipments]);

  const handleReturn = (issuedItem) => {
    if (
      window.confirm(
        `Mark ${issuedItem.equipmentName} as returned by ${issuedItem.studentName}?`
      )
    ) {
      // Remove from issued equipments
      const updatedIssued = issuedEquipments.filter(
        (item) => item.id !== issuedItem.id
      );
      saveIssuedEquipments(updatedIssued);
      setIssuedEquipments(updatedIssued);

      // Return quantity to issue counter (not main inventory)
      const usedEquipments = getUsedEquipments();
      const updatedUsedEquipments = usedEquipments.map((eq) =>
        eq.id === issuedItem.equipmentId
          ? {
              ...eq,
              quantity: parseInt(eq.quantity) + parseInt(issuedItem.quantity),
            }
          : eq
      );
      saveUsedEquipments(updatedUsedEquipments);

      // Add to logs
      const logs = getLogs();
      const logEntry = {
        ...issuedItem,
        returnTime: new Date().toISOString(),
      };
      saveLogs([...logs, logEntry]);

      toast.success('Equipment marked as returned!');
    }
  };

  const branches = [
    ...new Set(issuedEquipments.map((item) => item.branch)),
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Issued Equipments
          </h1>
          <p className="text-gray-600">
            Currently issued items • {filteredIssued.length} item(s)
          </p>
        </div>

        {/* Filters */}
        {issuedEquipments.length > 0 && (
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

        {/* Issued Items List */}
        {filteredIssued.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg mb-4">
              {issuedEquipments.length === 0
                ? 'No equipments currently issued'
                : 'No items match your search criteria'}
            </p>
            {issuedEquipments.length === 0 && (
              <a
                href="/issue"
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition inline-block"
              >
                Issue Equipment
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIssued.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
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
                  <div className="bg-primary text-white px-3 py-1 rounded-lg font-semibold">
                    Qty: {item.quantity}
                  </div>
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

export default Issued;
