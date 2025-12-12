/**
 * LocalStorage Utility Functions
 * Manages all local storage operations for the inventory management system
 * Handles equipment, feedback, and transaction logs
 */


/**
 * Get selection feedback from localStorage
 */
export const getSelectionFeedback = () => {
  const data = localStorage.getItem('selectionFeedback');
  return data ? JSON.parse(data) : [];
};

/**
 * Save selection feedback to localStorage
 */
export const saveSelectionFeedback = (feedback) => {
  localStorage.setItem('selectionFeedback', JSON.stringify(feedback));
};

/**
 * Add a new selection feedback
 */
export const addSelectionFeedback = (feedback) => {
  const allFeedback = getSelectionFeedback();
  allFeedback.push(feedback);
  saveSelectionFeedback(allFeedback);
};


/**
 * Get equipments from localStorage
 */
export const getEquipments = () => {
  const data = localStorage.getItem('equipments');
  return data ? JSON.parse(data) : [];
};

/**
 * Save equipments to localStorage
 */
export const saveEquipments = (equipments) => {
  localStorage.setItem('equipments', JSON.stringify(equipments));
};

/**
 * Get used equipments from localStorage
 */
export const getUsedEquipments = () => {
  const data = localStorage.getItem('usedEquipments');
  return data ? JSON.parse(data) : [];
};

/**
 * Save used equipments to localStorage
 */
export const saveUsedEquipments = (usedEquipments) => {
  localStorage.setItem('usedEquipments', JSON.stringify(usedEquipments));
};

/**
 * Get damaged equipments from localStorage
 */
export const getDamagedEquipments = () => {
  const data = localStorage.getItem('damagedEquipments');
  return data ? JSON.parse(data) : [];
};

/**
 * Save damaged equipments to localStorage
 */
export const saveDamagedEquipments = (damagedEquipments) => {
  localStorage.setItem('damagedEquipments', JSON.stringify(damagedEquipments));
};

/**
 * Get issued equipments from localStorage
 */
export const getIssuedEquipments = () => {
  const data = localStorage.getItem('issuedEquipments');
  return data ? JSON.parse(data) : [];
};

/**
 * Save issued equipments to localStorage
 */
export const saveIssuedEquipments = (issuedEquipments) => {
  localStorage.setItem('issuedEquipments', JSON.stringify(issuedEquipments));
};

/**
 * Get overdue equipments from localStorage
 */
export const getOverdueEquipments = () => {
  const data = localStorage.getItem('overdueEquipments');
  return data ? JSON.parse(data) : [];
};

/**
 * Save overdue equipments to localStorage
 */
export const saveOverdueEquipments = (overdueEquipments) => {
  localStorage.setItem('overdueEquipments', JSON.stringify(overdueEquipments));
};

/**
 * Get logs from localStorage
 */
export const getLogs = () => {
  const data = localStorage.getItem('logs');
  return data ? JSON.parse(data) : [];
};

/**
 * Save logs to localStorage
 */
export const saveLogs = (logs) => {
  localStorage.setItem('logs', JSON.stringify(logs));
};

/**
 * Get students from localStorage
 */
export const getStudents = () => {
  const data = localStorage.getItem('students');
  return data ? JSON.parse(data) : [];
};

/**
 * Save students to localStorage
 */
export const saveStudents = (students) => {
  localStorage.setItem('students', JSON.stringify(students));
};

/**
 * Export data as PDF
 */
export const exportToPDF = (data, filename, title = 'Report') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a new jsPDF instance
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table data
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => row[header] || ''));

  // Add table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] }, // Primary color
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Save the PDF
  doc.save(filename);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get equipment requests from localStorage
 */
export const getEquipmentRequests = () => {
  const data = localStorage.getItem('equipmentRequests');
  return data ? JSON.parse(data) : [];
};

/**
 * Save equipment requests to localStorage
 */
export const saveEquipmentRequests = (requests) => {
  localStorage.setItem('equipmentRequests', JSON.stringify(requests));
};

/**
 * Format date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get previous year purchases from localStorage
 */
export const getPreviousYearPurchases = () => {
  const data = localStorage.getItem('previousYearPurchases');
  return data ? JSON.parse(data) : {};
};

/**
 * Save previous year purchases to localStorage
 */
export const savePreviousYearPurchases = (purchases) => {
  localStorage.setItem('previousYearPurchases', JSON.stringify(purchases));
};

/**
 * Add previous year purchase record
 */
export const addPreviousYearPurchase = (equipmentId, equipmentName, quantity, brand = '', purchaseDate = null) => {
  const purchases = getPreviousYearPurchases();
  purchases[equipmentId] = {
    equipmentId,
    equipmentName,
    quantity: parseInt(quantity),
    brand,
    purchaseDate: purchaseDate || new Date().toISOString()
  };
  savePreviousYearPurchases(purchases);
};

/**
 * Get previous year purchase for specific equipment
 */
export const getPreviousYearPurchase = (equipmentId) => {
  const purchases = getPreviousYearPurchases();
  return purchases[equipmentId] || null;
};

/**
 * Get used inventory requests from localStorage
 */
export const getUsedInventoryRequests = () => {
  const data = localStorage.getItem('usedInventoryRequests');
  return data ? JSON.parse(data) : [];
};

/**
 * Save used inventory requests to localStorage
 */
export const saveUsedInventoryRequests = (requests) => {
  localStorage.setItem('usedInventoryRequests', JSON.stringify(requests));
};

/**
 * Get student requests from localStorage
 */
export const getStudentRequests = () => {
  const data = localStorage.getItem('studentRequests');
  return data ? JSON.parse(data) : [];
};

/**
 * Save student requests to localStorage
 */
export const saveStudentRequests = (requests) => {
  localStorage.setItem('studentRequests', JSON.stringify(requests));
};
