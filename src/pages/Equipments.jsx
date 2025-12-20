import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEquipments, saveEquipments, getUsedEquipments, saveUsedEquipments, getDamagedEquipments, saveDamagedEquipments, generateId, getPreviousYearPurchases, addPreviousYearPurchase, getPreviousYearPurchase, getUsedInventoryRequests, saveUsedInventoryRequests } from '../utils/localStorage';
import { SPORT_TYPES, EQUIPMENT_CONDITIONS, EQUIPMENT_TYPES, EQUIPMENT_TYPE_LABELS, EQUIPMENT_TYPE_EXAMPLES, USER_ROLES } from '../utils/constants';
import { getCurrentUser } from '../utils/auth';

const Equipments = () => {
    const navigate = useNavigate();
    const [equipments, setEquipments] = useState([]);
    const [usedEquipments, setUsedEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    // Removed isFormOpen state as form functionality is no longer needed
    // Removed editingId state as form functionality is no longer needed
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSport, setFilterSport] = useState('');
    const [filterEquipmentType, setFilterEquipmentType] = useState(''); // Filter by equipment type
    const [inventoryType, setInventoryType] = useState('main'); // 'main' or 'used'
    const [currentUser, setCurrentUser] = useState(null);
    const [previousYearPurchases, setPreviousYearPurchases] = useState({});
    // Removed formData state as form functionality is no longer needed
    const [procurementInputs, setProcurementInputs] = useState({}); // { [id]: { requiredQty: '', brand: '' } }
    const [showProcurementList, setShowProcurementList] = useState(false);
    const [usedInventoryRequests, setUsedInventoryRequests] = useState([]);
    // Removed studentRequests state as it's no longer needed
    const [showRequests, setShowRequests] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // For procurement list pagination
    const itemsPerPage = 10; // Items per page for procurement list

    // State for procurement list inputs - REMOVED

    const sportTypes = SPORT_TYPES;
    const conditions = EQUIPMENT_CONDITIONS;

    // Get current user
    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
    }, []);

    // Load equipments from localStorage on mount
    useEffect(() => {
        const loadedEquipments = getEquipments();
        const loadedUsedEquipments = getUsedEquipments();
        const loadedPreviousPurchases = getPreviousYearPurchases();
        const loadedRequests = getUsedInventoryRequests();
        // Removed student requests loading as it's no longer needed
        setEquipments(loadedEquipments);
        setUsedEquipments(loadedUsedEquipments);
        setPreviousYearPurchases(loadedPreviousPurchases);
        setUsedInventoryRequests(loadedRequests);

        // Force 'used' inventory view for students
        const user = getCurrentUser();
        if (user && user.role === 'student') {
            setInventoryType('used');
            setFilteredEquipments(loadedUsedEquipments);
        } else {
            setFilteredEquipments(loadedEquipments);
        }
    }, []);

    // Filter and search logic
    useEffect(() => {
        // For students, always use issue counter regardless of inventoryType state
        const user = getCurrentUser();
        const isStudent = user && user.role === 'student';
        
        const sourceData = isStudent || inventoryType === 'used' ? usedEquipments : equipments;
        let result = sourceData;

        // Filter by sport type
        if (filterSport) {
            result = result.filter((eq) => eq.sportType === filterSport);
        }

        // Filter by equipment type (consumable/non-consumable)
        if (filterEquipmentType) {
            result = result.filter((eq) => eq.equipmentType === filterEquipmentType);
        }

        // Search by name
        if (searchTerm) {
            result = result.filter((eq) =>
                eq.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEquipments(result);
    }, [searchTerm, filterSport, filterEquipmentType, equipments, usedEquipments, inventoryType]);

    // Removed form-related functions as form functionality is no longer needed
    
    const handleEdit = (equipment) => {
        // Removed form functionality - no longer needed
        console.log('Edit functionality removed');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            const updatedEquipments = equipments.filter((eq) => eq.id !== id);
            setEquipments(updatedEquipments);
            saveEquipments(updatedEquipments);
            toast.success('Equipment deleted successfully!');
        }
    };

    const handleMarkAsDamaged = (equipment) => {
        const damageQuantity = window.prompt(
            `How many units of "${equipment.name}" are damaged?\n\nAvailable: ${equipment.quantity}`,
            equipment.quantity
        );

        if (damageQuantity === null) {
            return; // User cancelled
        }

        const damagedQty = parseInt(damageQuantity);
        const availableQty = parseInt(equipment.quantity);

        if (isNaN(damagedQty) || damagedQty <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        if (damagedQty > availableQty) {
            toast.error('Damaged quantity cannot exceed available quantity');
            return;
        }

        if (!window.confirm(`Mark ${damagedQty} unit(s) of "${equipment.name}" as damaged?`)) {
            return;
        }

        // Create damaged equipment record
        const damagedItem = {
            ...equipment,
            quantity: damagedQty,
            damagedDate: new Date().toISOString(),
            originalInventory: inventoryType, // Track where it came from
        };

        // Add to damaged inventory
        const damagedEquipments = getDamagedEquipments();
        saveDamagedEquipments([...damagedEquipments, damagedItem]);

        // Reduce quantity from source inventory
        const remainingQty = availableQty - damagedQty;

        if (inventoryType === 'main') {
            const updatedEquipments = equipments.map(eq =>
                eq.id === equipment.id
                    ? { ...eq, quantity: remainingQty }
                    : eq
            ).filter(eq => parseInt(eq.quantity) > 0);
            setEquipments(updatedEquipments);
            saveEquipments(updatedEquipments);
        } else {
            const updatedUsedEquipments = usedEquipments.map(eq =>
                eq.id === equipment.id
                    ? { ...eq, quantity: remainingQty }
                    : eq
            ).filter(eq => parseInt(eq.quantity) > 0);
            setUsedEquipments(updatedUsedEquipments);
            saveUsedEquipments(updatedUsedEquipments);
        }

        toast.success(`${damagedQty} unit(s) of ${equipment.name} moved to damaged inventory`);
    };

    const handleRequestMoveToUsed = (equipment) => {
        const moveQuantity = window.prompt(
            `Request to move "${equipment.name}" to Issue Counter.

Available: ${equipment.quantity}

Enter quantity to move:`,
            '1'
        );

        if (moveQuantity === null) return;

        const qty = parseInt(moveQuantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error('Invalid quantity');
            return;
        }

        if (qty > parseInt(equipment.quantity)) {
            toast.error('Quantity exceeds available stock');
            return;
        }

        const reason = window.prompt('Enter reason for moving to issue counter (optional):', 'Wear and tear');

        const newRequest = {
            id: generateId(),
            equipmentId: equipment.id,
            equipmentName: equipment.name,
            quantity: qty,
            reason: reason || 'No reason provided',
            requester: currentUser.name,
            status: 'pending',
            date: new Date().toISOString()
        };

        const updatedRequests = [...usedInventoryRequests, newRequest];
        setUsedInventoryRequests(updatedRequests);
        saveUsedInventoryRequests(updatedRequests);
        toast.success('Request sent to Admin for approval');
    };

    const handleApproveRequest = (request) => {
        // Verify stock is still available
        const currentItem = equipments.find(e => e.id === request.equipmentId);
        if (!currentItem || parseInt(currentItem.quantity) < request.quantity) {
            toast.error('Cannot approve: Insufficient stock in Main Inventory');
            return;
        }

        if (window.confirm(`Approve moving ${request.quantity} units of ${request.equipmentName} to Issue Counter?`)) {
            // 1. Deduct from Main
            const updatedEquipments = equipments.map(eq =>
                eq.id === request.equipmentId
                    ? { ...eq, quantity: parseInt(eq.quantity) - request.quantity }
                    : eq
            ).filter(eq => parseInt(eq.quantity) > 0);

            // 2. Add to Used
            // Check if item already exists in issue counter
            const existingUsedItem = usedEquipments.find(e => e.id === request.equipmentId);
            let updatedUsedEquipments;


            if (existingUsedItem) {
                updatedUsedEquipments = usedEquipments.map(eq =>
                    eq.id === request.equipmentId
                        ? { ...eq, quantity: parseInt(eq.quantity) + request.quantity }
                        : eq
                );
            } else {
                const newItem = { ...currentItem, quantity: request.quantity };
                updatedUsedEquipments = [...usedEquipments, newItem];
            }


            // 3. Update Request Status
            const updatedRequests = usedInventoryRequests.map(req =>
                req.id === request.id ? { ...req, status: 'approved' } : req
            );

            // Execute Updates
            setEquipments(updatedEquipments);
            saveEquipments(updatedEquipments);

            setUsedEquipments(updatedUsedEquipments);
            saveUsedEquipments(updatedUsedEquipments);

            setUsedInventoryRequests(updatedRequests);
            saveUsedInventoryRequests(updatedRequests);

            toast.success('Request approved and inventory updated');
        }
    };

    const handleRejectRequest = (request) => {
        if (window.confirm('Reject this request?')) {
            const updatedRequests = usedInventoryRequests.map(req =>
                req.id === request.id ? { ...req, status: 'rejected' } : req
            );
            setUsedInventoryRequests(updatedRequests);
            saveUsedInventoryRequests(updatedRequests);
            toast.success('Request rejected');
        }
    };

    // Student Request Handlers - REMOVED
    
    const resetForm = () => {
        setFormData({
            name: '',
            sportType: '',
            category: '',
            quantity: '',
            condition: 'Good',
            equipmentType: 'non-consumable',
        });
        setEditingId(null);
        setIsFormOpen(false);
    };

    // Handle changes to procurement inputs - REMOVED

    const handleRemoveFromProcurement = (itemId) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            const updatedEquipments = equipments.filter((eq) => eq.id !== itemId);
            setEquipments(updatedEquipments);
            saveEquipments(updatedEquipments);
            toast.success('Equipment deleted successfully!');
        }
    };

    // New function to add procurement inputs to the procurement list - REMOVED

    const handleExportProcurementToPDF = () => {
        const uniqueItems = getAllUniqueEquipments();

        // Filter items where Required Quantity is filled and greater than 0
        const itemsToExport = uniqueItems.filter(item => {
            const requiredQty = procurementInputs[item.id]?.requiredQty;
            return requiredQty && parseInt(requiredQty) > 0;
        });

        if (itemsToExport.length === 0) {
            toast.error('Please enter Required Quantity for at least one item to export.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Procurement List', 14, 20);

        // Add date
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Prepare table data
        const tableBody = itemsToExport.map((item, index) => {
            const prevYearPurchase = previousYearPurchases[item.id];
            const prevQty = prevYearPurchase ? prevYearPurchase.quantity : 0;
            const prevDate = prevYearPurchase ? new Date(prevYearPurchase.purchaseDate).toLocaleDateString('en-GB') : 'N/A';
            const mainQty = parseInt(equipments.find(e => e.id === item.id)?.quantity || 0);
            const usedQty = parseInt(usedEquipments.find(e => e.id === item.id)?.quantity || 0);

            const requiredQty = parseInt(procurementInputs[item.id]?.requiredQty || 0);
            const totalInventory = mainQty + usedQty;
            const totalToProcure = Math.max(0, requiredQty - totalInventory);
            const brand = procurementInputs[item.id]?.brand || '';

            return [
                index + 1,
                item.name,
                `${prevDate} (Qty: ${prevQty})`,
                mainQty,
                usedQty,
                requiredQty,
                brand,
                totalToProcure
            ];
        });

        // Add table
        doc.autoTable({
            head: [['#', 'Item Name', 'Previous Year (dd-mm-yyyy)', 'Main Inv', 'Used Inv', 'Required Qty', 'Brand', 'Total to Procure']],
            body: tableBody,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: {
                fillColor: [147, 51, 234], // Purple to match the theme
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 40 }
        });

        // Save the PDF
        const fileName = `Procurement_List_${new Date().getTime()}.pdf`;
        doc.save(fileName);
        toast.success('Procurement list exported successfully!');
    };

    const handleProcurementInputChange = (id, field, value) => {
        setProcurementInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleStudentRequest = (equipment) => {
        // Navigate to request equipment page with equipment pre-selected
        navigate('/request-equipment', { state: { selectedEquipment: equipment } });
    };

    const getAllUniqueEquipments = () => {
        const uniqueItems = new Map();
        [...equipments, ...usedEquipments].forEach(item => {
            if (!uniqueItems.has(item.id)) {
                uniqueItems.set(item.id, item);
            }
        });
        return Array.from(uniqueItems.values());
    };

    return (
        <div className="min-h-screen pt-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Equipment Management
                    </h1>
                    <div className="flex gap-3">
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setShowProcurementList(!showProcurementList)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {showProcurementList ? 'Hide Procurement' : 'Procurement'}
                            </button>
                        )}

                        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                            <button
                                onClick={() => setShowRequests(!showRequests)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 relative focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Approvals
                                {(usedInventoryRequests.filter(r => r.status === 'pending').length > 0) && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                                        {usedInventoryRequests.filter(r => r.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Removed Add Equipment button as requested */}
                    </div>
                </div>

                {(showRequests && (currentUser?.role === 'admin' || currentUser?.role === 'manager')) && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 overflow-hidden border-2 border-indigo-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-indigo-600">📋</span> Pending Approvals
                        </h2>

                        {/* Issue Counter Requests Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Internal Moves (Main - Used)</h3>
                            {usedInventoryRequests.filter(r => r.status === 'pending').length === 0 ? (
                                <p className="text-gray-500 italic">No pending move requests.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-indigo-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">Item</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-700 uppercase">Qty</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase">Requester</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-indigo-700 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {usedInventoryRequests.filter(r => r.status === 'pending').map((request) => (
                                                <tr key={request.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.equipmentName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{request.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.reason}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{request.requester}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleApproveRequest(request)}
                                                            className="text-green-600 hover:text-green-900 mx-2 font-bold"
                                                            title="Approve"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRequest(request)}
                                                            className="text-red-600 hover:text-red-900 mx-2 font-bold"
                                                            title="Reject"
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* Procurement List for Admin */}
                {currentUser?.role === 'admin' && showProcurementList && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Procurement List</h2>
                            <button
                                onClick={handleExportProcurementToPDF}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                📄 Export to PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Year (dd-mm-yyyy)</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Current Main Inv</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Current Used Inv</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Required Qty (This Year)</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Name (Optional)</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total to Procure</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(() => {
                                        const allItems = getAllUniqueEquipments();
                                        const indexOfLastItem = currentPage * itemsPerPage;
                                        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                        const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);
                                                                
                                        return currentItems.map((item) => {
                                            const prevYearPurchase = previousYearPurchases[item.id];
                                            const prevQty = prevYearPurchase ? prevYearPurchase.quantity : 0;
                                            const mainQty = parseInt(equipments.find(e => e.id === item.id)?.quantity || 0);
                                            const usedQty = parseInt(usedEquipments.find(e => e.id === item.id)?.quantity || 0);
                                                                    
                                            const requiredQty = parseInt(procurementInputs[item.id]?.requiredQty || 0);
                                            const totalInventory = mainQty + usedQty;
                                            const totalToProcure = Math.max(0, requiredQty - totalInventory);
                                                                    
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                                                                            {prevYearPurchase ? (
                                                                                                                <>
                                                                                                                    <div>{new Date(prevYearPurchase.purchaseDate).toLocaleDateString('en-GB')}</div>
                                                                                                                    <div>(Qty: {prevQty})</div>
                                                                                                                </>
                                                                                                            ) : 'N/A'}
                                                                                                        </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{mainQty}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{usedQty}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                                                            placeholder="0"
                                                            value={procurementInputs[item.id]?.requiredQty || ''}
                                                            onChange={(e) => handleProcurementInputChange(item.id, 'requiredQty', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        <input
                                                            type="text"
                                                            className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="Brand..."
                                                            value={procurementInputs[item.id]?.brand || ''}
                                                            onChange={(e) => handleProcurementInputChange(item.id, 'brand', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-center">{totalToProcure}</td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                            {getAllUniqueEquipments().length === 0 && (
                                <div className="text-center py-4 text-gray-500">No equipment found.</div>
                            )}
                                                    
                            {/* Pagination Controls */}
                            {(() => {
                                const allItems = getAllUniqueEquipments();
                                const totalPages = Math.ceil(allItems.length / itemsPerPage);
                                                        
                                if (totalPages > 1) {
                                    return (
                                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                            <div className="flex flex-1 justify-between sm:hidden">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, allItems.length)}</span> to{' '}
                                                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, allItems.length)}</span> of{' '}
                                                        <span className="font-medium">{allItems.length}</span> results
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            <span className="sr-only">Previous</span>
                                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                                                
                                                        {/* Page Numbers */}
                                                        {[...Array(totalPages)].map((_, index) => {
                                                            const pageNum = index + 1;
                                                            return (
                                                                <button
                                                                    key={pageNum}
                                                                    onClick={() => setCurrentPage(pageNum)}
                                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                                                                    aria-current={currentPage === pageNum ? 'page' : undefined}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            );
                                                        })}
                                                                                
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            disabled={currentPage === totalPages}
                                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            <span className="sr-only">Next</span>
                                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                )}

                {/* Add/Edit Form Modal - REMOVED as requested */}
                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    {/* Inventory Type Toggle - Hidden for students */}
                    {currentUser?.role !== 'student' && (
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-3">
                            Inventory Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setInventoryType('main')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${inventoryType === 'main'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Main Inventory (New)</span>
                                </div>
                                <div className="text-sm mt-1">{equipments.length} items</div>
                            </button>
                            <button
                                onClick={() => setInventoryType('used')}
                                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${inventoryType === 'used'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Issue Counter</span>
                                </div>
                                <div className="text-sm mt-1">{usedEquipments.length} items</div>
                            </button>
                        </div>
                    </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {sportTypes.map((sport) => (
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
                    </div>
                </div>

                {/* Equipment List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEquipments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 text-lg">No equipment found</p>
                        </div>
                    ) : (
                        filteredEquipments.map((equipment) => (
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

                                    {/* Action Buttons */}
                                    {/* Show request button for students or simplified buttons for managers */}
                                    {(currentUser?.role === 'student' || currentUser?.role === 'manager') && (
                                        <button
                                            onClick={() => {
                                                if (currentUser?.role === 'student') {
                                                    handleStudentRequest(equipment);
                                                } else if (inventoryType === 'used') {
                                                    handleMarkAsDamaged(equipment);
                                                } else {
                                                    handleRequestMoveToUsed(equipment);
                                                }
                                            }}
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
                                            {parseInt(equipment.quantity) === 0 
                                                ? 'Out of Stock' 
                                                : currentUser?.role === 'student' 
                                                    ? 'Request Equipment' 
                                                    : inventoryType === 'used' 
                                                        ? 'Mark Damaged' 
                                                        : 'Request Move to Used'}
                                        </button>
                                    )}

                                    {/* Edit and Delete buttons - hidden for admin users as per requirement */}
                                    {currentUser?.role === 'admin' && (
                                        <div className="hidden">
                                            <button
                                                onClick={() => handleEdit(equipment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(equipment.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Equipments;
