import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getEquipments,
  saveEquipments,
  getUsedEquipments,
  saveUsedEquipments,
  getIssuedEquipments,
  saveIssuedEquipments,
  getStudents,
  saveStudents,
  generateId,
} from '../utils/localStorage';

/**
 * Issue Equipment Page
 * Issue equipment to students with validation
 */
const Issue = () => {
  const location = useLocation();
  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    registrationNumber: '',
    branch: '',
    quantity: '1',
    expectedReturnTime: '',
  });

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Others',
  ];

  // Load equipments on mount
  useEffect(() => {
    const loadedEquipments = getEquipments();
    // Only show equipments with quantity > 0
    const availableEquipments = loadedEquipments.filter(
      (eq) => parseInt(eq.quantity) > 0
    );
    setEquipments(availableEquipments);

    // Check if equipment was passed from navigation state
    if (location.state?.selectedEquipment) {
      const preSelectedEquipment = location.state.selectedEquipment;
      // Verify the equipment still has available quantity
      if (parseInt(preSelectedEquipment.quantity) > 0) {
        setSelectedEquipment(preSelectedEquipment);
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateTimeFormat = (timeValue) => {
    if (!timeValue) return true; // Optional field
    // Check if time is in HH:MM format (24-hour)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeValue);
  };

  const handleEquipmentSelect = (e) => {
    const equipmentId = e.target.value;
    const equipment = equipments.find((eq) => eq.id === equipmentId);
    setSelectedEquipment(equipment);
    setFormData({ ...formData, quantity: '1' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEquipment) {
      toast.error('Please select an equipment');
      return;
    }

    if (
      !formData.studentName ||
      !formData.registrationNumber ||
      !formData.branch
    ) {
      toast.error('Please fill in all student details');
      return;
    }

    // Validate time format if provided
    if (formData.expectedReturnTime && !validateTimeFormat(formData.expectedReturnTime)) {
      toast.error('Please enter time in correct format (HH:MM)');
      return;
    }

    const issueQuantity = parseInt(formData.quantity);
    const availableQuantity = parseInt(selectedEquipment.quantity);

    if (issueQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (issueQuantity > availableQuantity) {
      toast.error('Required quantity not available');
      return;
    }

    // Create issue record
    const issueRecord = {
      id: generateId(),
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      sportType: selectedEquipment.sportType,
      category: selectedEquipment.category,
      quantity: issueQuantity,
      studentName: formData.studentName,
      registrationNumber: formData.registrationNumber,
      branch: formData.branch,
      issueTime: new Date().toISOString(),
      expectedReturnTime: formData.expectedReturnTime || null,
    };

    // Update equipment quantity in main inventory
    const allEquipments = getEquipments();
    const updatedEquipments = allEquipments.map((eq) =>
      eq.id === selectedEquipment.id
        ? { ...eq, quantity: availableQuantity - issueQuantity }
        : eq
    );
    saveEquipments(updatedEquipments);

    // Move issued quantity to issue counter
    const usedEquipments = getUsedEquipments();
    const existingUsedItem = usedEquipments.find(
      (eq) => eq.id === selectedEquipment.id
    );

    let updatedUsedEquipments;
    if (existingUsedItem) {
      // Add to existing issue counter item
      updatedUsedEquipments = usedEquipments.map((eq) =>
        eq.id === selectedEquipment.id
          ? { ...eq, quantity: parseInt(eq.quantity) + issueQuantity }
          : eq
      );
    } else {
      // Create new issue counter item
      const usedItem = {
        ...selectedEquipment,
        quantity: issueQuantity,
        usageStatus: 'used',
        firstIssuedDate: new Date().toISOString(),
      };
      updatedUsedEquipments = [...usedEquipments, usedItem];
    }
    saveUsedEquipments(updatedUsedEquipments);

    // Save issue record
    const issuedEquipments = getIssuedEquipments();
    saveIssuedEquipments([...issuedEquipments, issueRecord]);

    // Update students list
    const students = getStudents();
    const studentExists = students.find(
      (s) => s.registrationNumber === formData.registrationNumber
    );

    if (!studentExists) {
      const newStudent = {
        name: formData.studentName,
        registrationNumber: formData.registrationNumber,
        branch: formData.branch,
      };
      saveStudents([...students, newStudent]);
    }

    // Update local state
    setEquipments(
      updatedEquipments.filter((eq) => parseInt(eq.quantity) > 0)
    );

    toast.success(
      `${selectedEquipment.name} issued successfully to ${formData.studentName}!`
    );

    // Reset form
    setFormData({
      studentName: '',
      registrationNumber: '',
      branch: '',
      quantity: '1',
      expectedReturnTime: '',
    });
    setSelectedEquipment(null);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Issue Equipment
          </h1>
          <p className="text-gray-600">
            Issue sports equipment to students
          </p>
        </div>

        {/* Issue Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {equipments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">
                No equipments available for issuing
              </p>
              <a
                href="/equipments"
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition inline-block"
              >
                Add Equipments
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Equipment Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Equipment *
                </label>
                <select
                  value={selectedEquipment?.id || ''}
                  onChange={handleEquipmentSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose equipment...</option>
                  {equipments.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.sportType}) - Available:{' '}
                      {equipment.quantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Details Preview */}
              {selectedEquipment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Selected Equipment Details:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">
                      <strong>Name:</strong> {selectedEquipment.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Sport:</strong> {selectedEquipment.sportType}
                    </p>
                    <p className="text-gray-600">
                      <strong>Available:</strong> {selectedEquipment.quantity}
                    </p>
                    <p className="text-gray-600">
                      <strong>Condition:</strong> {selectedEquipment.condition}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Student Details
                </h3>

                <div className="space-y-4">
                  {/* Student Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter registration number"
                      required
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Branch *
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max={selectedEquipment?.quantity || 1}
                      required
                    />
                  </div>

                  {/* Expected Return Time */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Expected Return Time
                    </label>
                    <input
                      type="time"
                      name="expectedReturnTime"
                      value={formData.expectedReturnTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter expected return time"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty if no specific return time (Format: HH:MM)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition text-lg"
              >
                📤 Issue Equipment
              </button>
            </form>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            ℹ️ Important Information
          </h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Ensure all student details are accurate before issuing</li>
            <li>• Equipment quantity will be automatically reduced</li>
            <li>• Issue record will be saved for tracking</li>
            <li>• Student can return equipment from the "Issued" page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Issue;
