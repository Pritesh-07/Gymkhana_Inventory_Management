import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEquipments, getUsedEquipments, getDamagedEquipments, getIssuedEquipments, getOverdueEquipments, getLogs } from '../utils/localStorage';

/**
 * Home Page Component
 * Displays welcome message, statistics dashboard, and upcoming events
 */
const Home = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    currentlyIssued: 0,
    overdueCount: 0,
    logsCount: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    mainInventoryCount: 0,
    usedInventoryCount: 0,
    consumableCount: 0,
    nonConsumableCount: 0,
    damagedCount: 0,
  });
  
  useEffect(() => {
    // Calculate statistics from localStorage
    const equipments = getEquipments();
    const usedEquipments = getUsedEquipments();
    const damagedEquipments = getDamagedEquipments();
    const issuedEquipments = getIssuedEquipments();
    const overdueEquipments = getOverdueEquipments();
    const logs = getLogs();

    const mainQuantity = equipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const usedQuantity = usedEquipments.reduce((sum, eq) => sum + parseInt(eq.quantity || 0), 0);
    const totalQuantity = mainQuantity + usedQuantity;

    // Count consumable vs non-consumable equipment
    const allEquipment = [...equipments, ...usedEquipments];
    const consumableCount = allEquipment.filter(eq => eq.equipmentType === 'consumable').length;
    const nonConsumableCount = allEquipment.filter(eq => eq.equipmentType === 'non-consumable' || !eq.equipmentType).length;

    setStats({
      totalEquipment: equipments.length,
      currentlyIssued: issuedEquipments.length,
      overdueCount: overdueEquipments.length,
      logsCount: logs.length,
      totalQuantity: totalQuantity,
      availableQuantity: totalQuantity,
      mainInventoryCount: equipments.length,
      usedInventoryCount: usedEquipments.length,
      consumableCount: consumableCount,
      nonConsumableCount: nonConsumableCount,
      damagedCount: damagedEquipments.length,
    });
  }, []);

  const statsCards = [
    {
      title: 'Total Equipment Types',
      value: stats.totalEquipment,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      subtext: `${stats.totalQuantity} total items`,
      gradient: 'from-red-500 to-red-600',
      link: '/equipments',
    },
    {
      title: 'Items Available',
      value: stats.availableQuantity,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subtext: 'Ready to issue',
      gradient: 'from-red-600 to-red-700',
      link: '/equipments',
    },
    {
      title: 'Currently Issued',
      value: stats.currentlyIssued,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      subtext: 'Items in use',
      gradient: 'from-orange-500 to-orange-700',
      link: '/issued',
    },
    {
      title: 'Overdue Items',
      value: stats.overdueCount,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subtext: 'Past return date',
      gradient: 'from-red-500 to-red-700',
      link: '/overdue',
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
      link: '/logs',
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: 'Easy Equipment Management',
      description: 'Add, edit, and track all your sports equipment in one place with intuitive controls.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Student Tracking',
      description: 'Keep track of who has which equipment with detailed student records and issue history.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Comprehensive Reports',
      description: 'Generate detailed logs and export transaction history to PDF for analysis.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Lightning Fast',
      description: 'Local storage ensures instant access to all your data without any server delays.',
    },
  ];
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-red-700 to-primary-dark text-white">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/background.png")',
            opacity: '0.75'
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
              KLE Tech Gymkhana
              <span className="block text-yellow-300">Inventory Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto">
              Streamline your sports equipment tracking with powerful, intuitive tools designed for efficiency
            </p>
          </div>
        </div>
      </div>



    </div>
  );
};

export default Home;