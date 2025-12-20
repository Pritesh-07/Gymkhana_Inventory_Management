import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole, logout } from '../utils/auth';
import { getEquipments, getUsedEquipments, getDamagedEquipments, getIssuedEquipments, getOverdueEquipments, getLogs, getEquipmentRequests } from '../utils/localStorage';

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
    pendingFeedback: 0, // Removed student feedback count
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
    const mainQty = equipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const usedQty = usedEquipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const totalQty = mainQty + usedQty;
    const pendingRequests = requests.filter(req => req.status === 'pending').length;

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
      pendingFeedback: 0, // Removed student feedback count
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
      gradient: 'from-red-500 to-red-600',
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subtext: 'Complete history',
      gradient: 'from-purple-500 to-purple-700',
      link: '/logs'
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Refined Red Header */}
      <div className="bg-red-100 border-b border-red-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div>
            <h1 className="text-2xl font-bold text-red-800">Manager Dashboard</h1>
            <p className="text-red-600">Welcome back, {currentUser.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              to="/manager-requests"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-amber-100 p-3 rounded-full mb-4 group-hover:bg-amber-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Review Requests</h3>
              <p className="text-sm text-gray-600">Approve/deny equipment requests</p>
            </Link>

            <Link
              to="/equipments"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-blue-100 p-3 rounded-full mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Manage Equipments</h3>
              <p className="text-sm text-gray-600">Add, edit, view inventory</p>
            </Link>

            <Link
              to="/issued"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-orange-100 p-3 rounded-full mb-4 group-hover:bg-orange-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">View Issued</h3>
              <p className="text-sm text-gray-600">Track issued items</p>
            </Link>

            <Link
              to="/overdue"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-red-100 p-3 rounded-full mb-4 group-hover:bg-red-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Overdue Items</h3>
              <p className="text-sm text-gray-600">Manage overdue returns</p>
            </Link>

            <Link
              to="/damaged-equipment"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-amber-100 p-3 rounded-full mb-4 group-hover:bg-amber-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Damaged Equipment</h3>
              <p className="text-sm text-gray-600">View damaged inventory</p>
            </Link>

            <Link
              to="/logs"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-purple-100 p-3 rounded-full mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">View Logs</h3>
              <p className="text-sm text-gray-600">Complete transaction history</p>
            </Link>

            <Link
              to="/procurement-list"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 flex flex-col items-center text-center group"
            >
              <div className="bg-green-100 p-3 rounded-full mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Procurement List</h3>
              <p className="text-sm text-gray-600">Add new equipment to inventory</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
