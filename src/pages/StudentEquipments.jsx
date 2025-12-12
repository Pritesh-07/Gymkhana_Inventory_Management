import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import { getUsedEquipments } from '../utils/localStorage';

/**
 * Student Equipment Browse Page
 * Allows students to browse available equipment and submit requests
 */
const StudentEquipments = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [filterSport, setFilterSport] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('student')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadEquipments();
  }, [navigate]);

  const loadEquipments = () => {
    const loadedEquipments = getUsedEquipments(); // Students can only see issue counter
    setEquipments(loadedEquipments);
    setFilteredEquipments(loadedEquipments);
  };

  useEffect(() => {
    filterEquipments();
  }, [filterSport, searchTerm, equipments]);

  const filterEquipments = () => {
    let filtered = equipments;

    if (filterSport !== 'all') {
      filtered = filtered.filter(eq => eq.sportType === filterSport);
    }

    if (searchTerm) {
      filtered = filtered.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.sportType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEquipments(filtered);
  };

  const handleRequest = (equipment) => {
    // Navigate to request page with equipment pre-selected
    navigate('/request-equipment', { state: { selectedEquipment: equipment } });
  };

  const sportTypes = [...new Set(equipments.map(eq => eq.sportType))];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Browse Equipment</h1>
          <p className="text-gray-100">View available sports equipment and submit requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="w-full md:w-64">
              <select
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Sports</option>
                {sportTypes.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        {filteredEquipments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">No equipment found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipments.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Equipment Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{equipment.name}</h3>
                    <p className="text-sm text-gray-600">{equipment.sportType}</p>
                  </div>

                  {/* Equipment Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Category:</span>
                      <span className="font-semibold text-gray-800">{equipment.category || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Available:</span>
                      <span className={`font-bold text-lg ${
                        parseInt(equipment.quantity) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {equipment.quantity} units
                      </span>
                    </div>
                    {equipment.condition && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Condition:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          equipment.condition === 'Good' ? 'bg-green-100 text-green-800' :
                          equipment.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {equipment.condition}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Request Button */}
                  <button
                    onClick={() => handleRequest(equipment)}
                    disabled={parseInt(equipment.quantity) === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 ${
                      parseInt(equipment.quantity) === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {parseInt(equipment.quantity) === 0 ? 'Out of Stock' : 'Request Equipment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEquipments;
