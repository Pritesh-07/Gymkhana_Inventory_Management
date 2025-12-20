import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import { getEquipments, saveEquipments, saveLogs, addPreviousYearPurchase } from '../utils/localStorage';
import { USER_ROLES, EQUIPMENT_TYPES, SPORT_TYPES } from '../utils/constants';

const ProcurementList = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [globalSupplierInfo, setGlobalSupplierInfo] = useState('');
  const [globalBillParticulars, setGlobalBillParticulars] = useState('');
  const [globalProcurementDate, setGlobalProcurementDate] = useState('');
  const [items, setItems] = useState([
    {
      id: 1,
      serialNumber: '',
      description: '',
      sport: 'Athletics', // Default sport
      quantity: '',
      costPerArticle: '',
      totalValue: '',
      remarks: '',
      category: EQUIPMENT_TYPES.CONSUMABLE
    }
  ]);
  
  // Check authentication and role
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !hasRole(USER_ROLES.MANAGER)) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Add a new item row
  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        serialNumber: '',
        description: '',
        sport: 'Athletics', // Default sport
        quantity: '',
        costPerArticle: '',
        totalValue: '',
        remarks: '',
        category: EQUIPMENT_TYPES.CONSUMABLE
      }
    ]);
  };

  // Remove an item row
  const removeItem = (id) => {
    if (items.length <= 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  // Update item field
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all items
    for (const item of items) {
      if (!item.serialNumber || !item.description || !item.sport || !item.quantity || !item.costPerArticle || !item.totalValue) {
        toast.error('Please fill in all required fields for all items');
        return;
      }
      
      if (isNaN(item.quantity) || parseInt(item.quantity) <= 0) {
        toast.error('Quantity must be a positive number');
        return;
      }
      
      if (isNaN(item.costPerArticle) || parseFloat(item.costPerArticle) <= 0) {
        toast.error('Cost per article must be a positive number');
        return;
      }
      
      if (isNaN(item.totalValue) || parseFloat(item.totalValue) <= 0) {
        toast.error('Total value must be a positive number');
        return;
      }
    }
    
    // Check if global procurement date is provided
    if (!globalProcurementDate) {
      toast.error('Please enter the procurement date');
      return;
    }
    
    // Process procurement
    try {
      const equipments = getEquipments();
      
      // Update inventory for each item
      items.forEach(item => {
        // Check if equipment with same name (case-insensitive) already exists
        const existingEquipmentIndex = equipments.findIndex(eq => 
          eq.name.toLowerCase() === item.description.toLowerCase()
        );
        
        let equipmentId;
        if (existingEquipmentIndex !== -1) {
          // Equipment exists, update quantity
          const existingEquipment = equipments[existingEquipmentIndex];
          equipmentId = existingEquipment.id;
          const newQuantity = parseInt(existingEquipment.quantity) + parseInt(item.quantity);
          equipments[existingEquipmentIndex] = {
            ...existingEquipment,
            quantity: newQuantity,
            availableQuantity: newQuantity,
            lastUpdated: new Date().toISOString(),
            procurementDetails: {
              ...existingEquipment.procurementDetails,
              procurementDate: globalProcurementDate,
              costPerArticle: parseFloat(item.costPerArticle),
              totalValue: parseFloat(item.totalValue),
              supplierInfo: globalSupplierInfo,
              billParticulars: globalBillParticulars,
            }
          };
        } else {
          // New equipment, add to list
          const newItem = {
            id: `equip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.description,
            sport: item.sport, // Use the selected sport
            quantity: parseInt(item.quantity),
            availableQuantity: parseInt(item.quantity),
            condition: 'New',
            equipmentType: item.category,
            lastUpdated: new Date().toISOString(),
            procurementDetails: {
              serialNumber: item.serialNumber,
              procurementDate: globalProcurementDate,
              costPerArticle: parseFloat(item.costPerArticle),
              totalValue: parseFloat(item.totalValue),
              supplierInfo: globalSupplierInfo,
              billParticulars: globalBillParticulars,
              remarks: item.remarks
            }
          };
          
          equipmentId = newItem.id;
          equipments.push(newItem);
        }
        
        // Update previous year purchases for this equipment
        addPreviousYearPurchase(equipmentId, item.description, item.quantity, '', globalProcurementDate);
      });
      
      // Save updated equipment list
      saveEquipments(equipments);
      
      // Log the procurement
      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      const newLog = {
        id: `log_${Date.now()}`,
        action: 'PROCUREMENT',
        description: `Manager ${currentUser?.name} added ${items.length} items to inventory`,
        timestamp: new Date().toISOString(),
        userId: currentUser?.id,
        details: items.map(item => ({
          description: item.description,
          sport: item.sport,
          procurementDate: globalProcurementDate,
          quantity: item.quantity,
          totalValue: item.totalValue
        }))
      };
      logs.push(newLog);
      saveLogs(logs);
      
      // Reset form
      setGlobalSupplierInfo('');
      setGlobalBillParticulars('');
      setGlobalProcurementDate('');
      setItems([
        {
          id: 1,
          serialNumber: '',
          description: '',
          sport: 'Athletics', // Default sport
          quantity: '',
          costPerArticle: '',
          totalValue: '',
          remarks: '',
          category: EQUIPMENT_TYPES.CONSUMABLE
        }
      ]);
      
      toast.success('Procurement list submitted successfully! Inventory updated.');
    } catch (error) {
      toast.error('Error processing procurement list');
      console.error('Procurement error:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Procurement List</h1>
              <p className="text-gray-100">Add new equipment to inventory</p>
            </div>
            <button
              onClick={() => navigate('/manager-dashboard')}
              className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Global Fields */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Procurement Date</label>
              <input
                type="date"
                value={globalProcurementDate}
                onChange={(e) => setGlobalProcurementDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supplier/Source Information</label>
              <input
                type="text"
                value={globalSupplierInfo}
                onChange={(e) => setGlobalSupplierInfo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter supplier information"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bill Particulars/Reference</label>
              <input
                type="text"
                value={globalBillParticulars}
                onChange={(e) => setGlobalBillParticulars(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter bill reference"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description of Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Article (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.serialNumber}
                          onChange={(e) => updateItem(item.id, 'serialNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="SN001"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Equipment description"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.sport}
                          onChange={(e) => updateItem(item.id, 'sport', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {SPORT_TYPES.map(sport => (
                            <option key={sport} value={sport}>{sport}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0"
                          min="1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={item.costPerArticle}
                          onChange={(e) => updateItem(item.id, 'costPerArticle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          min="0.01"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={item.totalValue}
                          onChange={(e) => updateItem(item.id, 'totalValue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          min="0.01"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Additional notes"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value={EQUIPMENT_TYPES.CONSUMABLE}>Consumable</option>
                          <option value={EQUIPMENT_TYPES.NON_CONSUMABLE}>Non-Consumable</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                Add Item
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              >
                Submit Procurement List
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcurementList;