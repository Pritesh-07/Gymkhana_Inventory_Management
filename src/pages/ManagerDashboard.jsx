import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole, logout } from '../utils/auth';
import { getEquipments, getUsedEquipments, getDamagedEquipments, getIssuedEquipments, getOverdueEquipments, getLogs, getEquipmentRequests, getSelectionFeedback } from '../utils/localStorage';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalEquipments: 0,
    currentlyIssued: 0,
    overdueCount: 0,
    logsCount: 0,
    pendingRequests: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    pendingFeedback: 0,
    mainInventoryCount: 0,
    usedInventoryCount: 0,
    consumableCount: 0,
    nonConsumableCount: 0,
    damagedCount: 0,
  });

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('manager')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadStats();
  }, [navigate]);

  const loadStats = () => {
    const equipments = getEquipments();
    const usedEquipments = getUsedEquipments();
    const damagedEquipments = getDamagedEquipments();
    const issued = getIssuedEquipments();
    const overdue = getOverdueEquipments();
    const logs = getLogs();
    const requests = getEquipmentRequests();
    const feedback = getSelectionFeedback();

    const mainQty = equipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const usedQty = usedEquipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const totalQty = mainQty + usedQty;
    const pendingRequests = requests.filter(req => req.status === 'pending').length;
    const pendingFeedback = feedback.filter(item => item.status === 'pending').length;

    // Count consumable vs non-consumable equipment
    const allEquipment = [...equipments, ...usedEquipments];
    const consumableCount = allEquipment.filter(eq => eq.equipmentType === 'consumable').length;
    const nonConsumableCount = allEquipment.filter(eq => eq.equipmentType === 'non-consumable' || !eq.equipmentType).length;

    setStats({
      totalEquipments: equipments.length,
      currentlyIssued: issued.length,
      overdueCount: overdue.length,
      logsCount: logs.length,
      pendingRequests: pendingRequests,
      totalQuantity: totalQty,
      availableQuantity: totalQty,
      pendingFeedback: pendingFeedback,
      mainInventoryCount: equipments.length,
      usedInventoryCount: usedEquipments.length,
      consumableCount: consumableCount,
      nonConsumableCount: nonConsumableCount,
      damagedCount: damagedEquipments.length,
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!currentUser) return null;

  const statsCards = [
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subtext: 'Awaiting approval',
      gradient: 'from-yellow-500 to-yellow-700',
      link: '/manager-requests'
    },
    {
      title: 'Total Equipments',
      value: stats.totalEquipments,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      subtext: 'Items in inventory',
      gradient: 'from-blue-500 to-blue-700',
      link: '/equipments'
    },
    {
      title: 'Currently Issued',
      value: stats.currentlyIssued,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      subtext: 'Items in use',
      gradient: 'from-orange-500 to-orange-700',
      link: '/issued'
    },
    {
      title: 'Overdue Items',
      value: stats.overdueCount,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subtext: 'Past return time',
      gradient: 'from-red-500 to-red-700',
      link: '/overdue'
    },
    {
      title: 'Total Transactions',
      value: stats.logsCount,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subtext: 'Complete history',
      gradient: 'from-purple-500 to-purple-700',
      link: '/logs'
    },
    {
      title: 'Pending Feedback',
      value: stats.pendingFeedback,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      subtext: 'Student feedback',
      gradient: 'from-red-500 to-red-700',
      link: '/admin-feedback'
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
              <p className="text-gray-100">Welcome back, {currentUser.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {statsCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white`}>
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-800">
                      {card.value}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.subtext}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/manager-requests"
              className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-lg">Review Requests</h3>
              <p className="text-sm text-yellow-100 mt-1">Approve/deny equipment requests</p>
            </Link>

            <Link
              to="/equipments"
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="font-bold text-lg">Manage Equipments</h3>
              <p className="text-sm text-blue-100 mt-1">Add, edit, view inventory</p>
            </Link>

            <Link
              to="/issued"
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="font-bold text-lg">View Issued</h3>
              <p className="text-sm text-orange-100 mt-1">Track issued items</p>
            </Link>

            <Link
              to="/overdue"
              className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-lg">Overdue Items</h3>
              <p className="text-sm text-red-100 mt-1">Manage overdue returns</p>
            </Link>

            <Link
              to="/damaged-equipment"
              className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-lg">Damaged Equipment</h3>
              <p className="text-sm text-yellow-100 mt-1">View damaged inventory</p>
            </Link>

            <Link
              to="/logs"
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="font-bold text-lg">View Logs</h3>
              <p className="text-sm text-purple-100 mt-1">Complete transaction history</p>
            </Link>

            <Link
              to="/procurement-list"
              className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
            >
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="font-bold text-lg">Procurement List</h3>
              <p className="text-sm text-green-100 mt-1">Add new equipment to inventory</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
