import React, { useState, useEffect } from 'react';
import { getLogs, formatDate, exportToPDF } from '../utils/localStorage';

/**
 * Logs Page
 * Display complete transaction history with export functionality
 */
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Load logs on mount
  useEffect(() => {
    const loadedLogs = getLogs();
    setLogs(loadedLogs);
    setFilteredLogs(loadedLogs);
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let result = logs;

    // Search
    if (searchTerm) {
      result = result.filter(
        (log) =>
          log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.sportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.branch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.issueTime) - new Date(a.issueTime));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.issueTime) - new Date(b.issueTime));
    }

    setFilteredLogs(result);
  }, [searchTerm, sortBy, logs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export');
      return;
    }

    const exportData = filteredLogs.map((log) => ({
      'Equipment Name': log.equipmentName,
      'Sport Type': log.sportType,
      Category: log.category || '',
      Quantity: log.quantity,
      'Student Name': log.studentName,
      'Registration Number': log.registrationNumber,
      Branch: log.branch,
      'Issue Time': formatDate(log.issueTime),
      'Return Time': formatDate(log.returnTime),
    }));

    const filename = `sports-inventory-logs-${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(exportData, filename, 'Transaction Logs Report');
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Transaction Logs
            </h1>
            <p className="text-gray-600">
              Complete history • {filteredLogs.length} record(s)
            </p>
          </div>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-4 md:mt-0"
            disabled={filteredLogs.length === 0}
          >
            📥 Export to PDF
          </button>
        </div>

        {/* Filters */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Search Logs
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search by student, equipment, sport, or branch..."
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-4">
              {logs.length === 0
                ? 'No transaction logs yet'
                : 'No logs match your search criteria'}
            </p>
            {logs.length === 0 && (
              <p className="text-gray-400">
                Logs will appear here when equipment is returned
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Equipment</th>
                    <th className="px-6 py-4 text-left font-semibold">Sport</th>
                    <th className="px-6 py-4 text-left font-semibold">Student</th>
                    <th className="px-6 py-4 text-left font-semibold">Branch</th>
                    <th className="px-6 py-4 text-center font-semibold">Qty</th>
                    <th className="px-6 py-4 text-left font-semibold">Issue Time</th>
                    <th className="px-6 py-4 text-left font-semibold">Return Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={log.id || index}
                      className={`hover:bg-gray-50 transition ${log.wasOverdue ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            {log.equipmentName}
                            {log.wasOverdue && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded" title="Was overdue">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          {log.category && (
                            <div className="text-sm text-gray-500">
                              {log.category}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.sportType}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {log.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.registrationNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.branch}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {log.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(log.issueTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(log.returnTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <div key={log.id || index} className={`p-6 ${log.wasOverdue ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        {log.equipmentName}
                        {log.wasOverdue && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            OVERDUE
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {log.sportType}
                        {log.category && ` • ${log.category}`}
                      </p>
                    </div>
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {log.quantity}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-gray-700">
                      <strong>Student:</strong> {log.studentName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Reg No:</strong> {log.registrationNumber}
                    </p>
                    <p className="text-gray-700">
                      <strong>Branch:</strong> {log.branch}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p className="text-gray-600 mb-1">
                      <strong>Issued:</strong> {formatDate(log.issueTime)}
                    </p>
                    <p className="text-gray-600">
                      <strong>Returned:</strong> {formatDate(log.returnTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {logs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-800">
                {logs.length}
              </div>
              <div className="text-gray-600">
                Total Transactions
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-800">
                {[...new Set(logs.map((log) => log.equipmentName))].length}
              </div>
              <div className="text-gray-600">
                Unique Equipments
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-800">
                {[...new Set(logs.map((log) => log.registrationNumber))].length}
              </div>
              <div className="text-gray-600">
                Unique Students
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
