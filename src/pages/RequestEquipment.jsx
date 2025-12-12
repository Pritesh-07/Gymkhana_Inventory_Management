import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import { getUsedEquipments, getEquipmentRequests, saveEquipmentRequests, generateId } from '../utils/localStorage';

const RequestEquipment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isPreSelected, setIsPreSelected] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '1',
    purpose: '',
    expectedReturnTime: ''
  });

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
    
    // Check if equipment was pre-selected from navigation state
    if (location.state?.selectedEquipment) {
      const preSelected = location.state.selectedEquipment;
      setSelectedEquipment(preSelected);
      setIsPreSelected(true);
    }
  }, [navigate, location.state]);

  const loadEquipments = () => {
    const loadedEquipments = getUsedEquipments();
    // Only show equipments with quantity > 0
    const availableEquipments = loadedEquipments.filter(
      (eq) => parseInt(eq.quantity) > 0
    );
    setEquipments(availableEquipments);
  };

  const handleEquipmentSelect = (e) => {
    const equipmentId = e.target.value;
    const equipment = equipments.find(eq => eq.id === equipmentId);
    setSelectedEquipment(equipment);
    setFormData({ ...formData, quantity: '1' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateTimeFormat = (timeValue) => {
    if (!timeValue) return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEquipment) {
      toast.error('Please select an equipment');
      return;
    }

    // Check if the selected equipment is from the issue counter
    const usedEquipments = getUsedEquipments();
    const isValidEquipment = usedEquipments.some(eq => eq.id === selectedEquipment.id);
    
    if (!isValidEquipment) {
      toast.error('Invalid equipment selection. Students can only request from the issue counter.');
      return;
    }

    const requestQuantity = parseInt(formData.quantity);
    const availableQuantity = parseInt(selectedEquipment.quantity);

    if (requestQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (requestQuantity > availableQuantity) {
      toast.error('Required quantity not available');
      return;
    }

    if (formData.expectedReturnTime && !validateTimeFormat(formData.expectedReturnTime)) {
      toast.error('Please enter time in correct format (HH:MM)');
      return;
    }

    if (!formData.expectedReturnTime) {
      toast.error('Please specify expected return time');
      return;
    }

    if (!formData.purpose.trim()) {
      toast.error('Please specify the purpose');
      return;
    }

    // Create equipment request
    const request = {
      id: generateId(),
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      sportType: selectedEquipment.sportType,
      category: selectedEquipment.category,
      quantity: requestQuantity,
      studentId: currentUser.id,
      studentName: currentUser.name,
      registrationNumber: currentUser.registrationNumber,
      branch: currentUser.branch,
      purpose: formData.purpose,
      expectedReturnTime: formData.expectedReturnTime,
      requestTime: new Date().toISOString(),
      status: 'pending'
    };

    // Save request
    const requests = getEquipmentRequests();
    saveEquipmentRequests([...requests, request]);

    toast.success('Equipment request submitted successfully!');
    
    // Redirect to equipment browse page
    navigate('/student-equipments');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Request Equipment</h1>
          <p className="text-gray-100">Submit your equipment request for manager approval</p>
        </div>
      </div>

      {/* Request Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Display (Pre-selected) or Selection Dropdown */}
            {isPreSelected ? (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Equipment *
                </label>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">{selectedEquipment.name}</h3>
                      <p className="text-blue-700 text-sm">{selectedEquipment.sportType} - {selectedEquipment.category || 'General'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Available</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedEquipment.quantity}</p>
                      <p className="text-xs text-blue-600">units</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Requesting this specific equipment</p>
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Equipment *
                </label>
                <select
                  value={selectedEquipment?.id || ''}
                  onChange={handleEquipmentSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">-- Choose Equipment --</option>
                  {equipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} - {equipment.sportType} (Available: {equipment.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Equipment Details (only if not pre-selected, since pre-selected shows above) */}
            {selectedEquipment && !isPreSelected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Equipment Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name:</span>
                    <p className="text-blue-900">{selectedEquipment.name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Sport Type:</span>
                    <p className="text-blue-900">{selectedEquipment.sportType}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Category:</span>
                    <p className="text-blue-900">{selectedEquipment.category || 'General'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Available:</span>
                    <p className="text-blue-900">{selectedEquipment.quantity} units</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                max={selectedEquipment ? selectedEquipment.quantity : 1}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Purpose *
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Specify the purpose of borrowing this equipment..."
                required
              ></textarea>
            </div>

            {/* Expected Return Time */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Expected Return Time *
              </label>
              <input
                type="time"
                name="expectedReturnTime"
                value={formData.expectedReturnTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify when you plan to return the equipment (Format: HH:MM)
              </p>
            </div>

            {/* Student Info Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Requester Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Name:</span>
                  <p className="text-gray-800">{currentUser.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Reg. Number:</span>
                  <p className="text-gray-800">{currentUser.registrationNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Branch:</span>
                  <p className="text-gray-800">{currentUser.branch}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Semester:</span>
                  <p className="text-gray-800">{currentUser.semester}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => navigate('/student-dashboard')}
                className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Request Guidelines:</p>
              <ul className="space-y-1">
                <li>• Your request will be reviewed by the manager</li>
                <li>• You'll be notified once your request is approved or denied</li>
                <li>• Make sure to return equipment on time to avoid penalties</li>
                <li>• Check your dashboard for request status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestEquipment;
