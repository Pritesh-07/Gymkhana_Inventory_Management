import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDamagedEquipments, formatDate, exportToPDF } from '../utils/localStorage';
import { SPORT_TYPES } from '../utils/constants';

/**
 * Damaged Equipment Page
 * View and manage damaged equipment inventory
 * Includes filtering, search, and PDF export functionality
 */
const DamagedEquipment = () => {
  const [damagedEquipments, setDamagedEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [filterEquipmentType, setFilterEquipmentType] = useState('');
  const [filterSourceInventory, setFilterSourceInventory] = useState('');

  // Load damaged equipments on mount
  useEffect(() => {
    loadDamagedEquipments();
  }, []);

  const loadDamagedEquipments = () => {
    const damaged = getDamagedEquipments();
    setDamagedEquipments(damaged);
    setFilteredEquipments(damaged);
  };

  // Filter and search logic
  useEffect(() => {
    let result = damagedEquipments;

    // Filter by sport type
    if (filterSport) {
      result = result.filter((eq) => eq.sportType === filterSport);
    }

    // Filter by equipment type
    if (filterEquipmentType) {
      result = result.filter((eq) => eq.equipmentType === filterEquipmentType);
    }

    // Filter by source inventory
    if (filterSourceInventory) {
      result = result.filter((eq) => eq.originalInventory === filterSourceInventory);
    }

    // Search by name
    if (searchTerm) {
      result = result.filter((eq) =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEquipments(result);
  }, [searchTerm, filterSport, filterEquipmentType, filterSourceInventory, damagedEquipments]);

  const handleExportToPDF = () => {
    if (filteredEquipments.length === 0) {
      toast.error('No damaged equipment to export');
      return;
    }

    const exportData = filteredEquipments.map((item, index) => ({
      '#': index + 1,
      'Equipment Name': item.name,
      'Sport Type': item.sportType,
      'Category': item.category || 'N/A',
      'Type': item.equipmentType === 'consumable' ? 'Consumable' : 'Non-Consumable',
      'Quantity': item.quantity,
      'Condition': item.condition,
      'Source': item.originalInventory === 'main' ? 'Main Inventory' : 'Issue Counter',
      'Damaged Date': formatDate(item.damagedDate),
    }));

    const filename = `Damaged_Equipment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(exportData, filename, 'Damaged Equipment Report');
    toast.success('Damaged equipment report exported successfully!');
  };

  const getTotalQuantity = () => {
    return filteredEquipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
  };

  const sportTypes = [...new Set(damagedEquipments.map(eq => eq.sportType))];

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Damaged Equipment
            </h1>
            <p className="text-gray-600 mt-2">View and manage damaged equipment inventory</p>
          </div>
          <button
            onClick={handleExportToPDF}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Total Damaged Items</p>
                <p className="text-4xl font-bold">{filteredEquipments.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Total Quantity</p>
                <p className="text-4xl font-bold">{getTotalQuantity()}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Sport Types</p>
                <p className="text-4xl font-bold">{sportTypes.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filter & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search equipment..."
              />
            </div>

            {/* Filter by Sport */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Sport Type
              </label>
              <select
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Sports</option>
                {SPORT_TYPES.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Equipment Type */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Equipment Type
              </label>
              <select
                value={filterEquipmentType}
                onChange={(e) => setFilterEquipmentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="consumable">Consumable</option>
                <option value="non-consumable">Non-Consumable</option>
              </select>
            </div>

            {/* Filter by Source Inventory */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Filter by Source
              </label>
              <select
                value={filterSourceInventory}
                onChange={(e) => setFilterSourceInventory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Sources</option>
                <option value="main">Main Inventory</option>
                <option value="used">Issue Counter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Damaged Equipment List */}
        {filteredEquipments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Damaged Equipment</h3>
            <p className="text-gray-600">
              {damagedEquipments.length === 0 
                ? 'Great! No equipment has been marked as damaged yet.'
                : 'No items match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipments.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-l-4 border-yellow-500"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {equipment.image ? (
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                      <span className="text-7xl">⚠️</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-red-500 text-white">
                      DAMAGED
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        equipment.equipmentType === 'consumable'
                          ? 'bg-orange-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}
                    >
                      {equipment.equipmentType === 'consumable' ? '🔄 Consumable' : '⚙️ Durable'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">
                    {equipment.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-semibold">{equipment.sportType}</span>
                    </div>
                    {equipment.category && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>{equipment.category}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-semibold text-lg text-red-600">{equipment.quantity} damaged</span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-semibold text-gray-800">{equipment.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <span className="font-semibold text-gray-800">
                        {equipment.originalInventory === 'main' ? 'Main Inventory' : 'Issue Counter'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Damaged Date:</span>
                      <span className="font-semibold text-gray-800">{formatDate(equipment.damagedDate)}</span>
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

export default DamagedEquipment;
