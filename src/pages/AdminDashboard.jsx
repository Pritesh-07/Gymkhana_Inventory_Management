import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getCurrentUser,
  hasRole,
  logout,
  createManagerAccount,
  getManagers,
  getStudents,
  deleteUser,
  generatePassword
} from '../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [managers, setManagers] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalStudents: 0
  });
  const [showCreateManager, setShowCreateManager] = useState(false);
  const [managerForm, setManagerForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('admin')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [navigate]);

  const loadData = () => {
    const managersList = getManagers();
    const studentsList = getStudents();

    setManagers(managersList);
    setStudents(studentsList);
    setFilteredManagers(managersList);
    setFilteredStudents(studentsList);
    setStats({
      totalManagers: managersList.length,
      totalStudents: studentsList.length
    });
  };

  useEffect(() => {
    filterUsers();
  }, [searchTerm, managers, students]);

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredManagers(managers);
      setFilteredStudents(students);
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    // Filter managers
    const filteredMgrs = managers.filter(manager =>
      manager.name.toLowerCase().includes(searchLower) ||
      manager.email.toLowerCase().includes(searchLower) ||
      manager.username.toLowerCase().includes(searchLower) ||
      (manager.phone && manager.phone.includes(searchTerm))
    );

    // Filter students
    const filteredStds = students.filter(student =>
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.registrationNumber.toLowerCase().includes(searchLower) ||
      student.branch.toLowerCase().includes(searchLower)
    );

    setFilteredManagers(filteredMgrs);
    setFilteredStudents(filteredStds);
  };

  const handleViewAllUsers = (userType) => {
    navigate('/admin-view-users', { state: { userType } });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setManagerForm({ ...managerForm, password: newPassword });
    toast.success('Password generated!');
  };

  const handleCreateManager = (e) => {
    e.preventDefault();
    const result = createManagerAccount(managerForm);
    if (result.success) {
      toast.success(result.message);
      setShowCreateManager(false);
      setManagerForm({ name: '', username: '', email: '', phone: '', password: '' });
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteUser = (userId, userName, role) => {
    if (window.confirm(`Are you sure you want to delete ${role} account: ${userName}?`)) {
      const result = deleteUser(userId);
      if (result.success) {
        toast.success(result.message);
        loadData();
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Refined Red Header */}
      <div className="bg-red-100 border-b border-red-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-red-800">Admin Dashboard</h1>
              <p className="text-red-600">Welcome back, {currentUser.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Managers Card - Clickable */}
          <div 
            onClick={() => handleViewAllUsers('managers')}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-5 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Total Managers</p>
                <p className="text-3xl font-bold">{stats.totalManagers}</p>
                <p className="text-red-100 text-xs mt-1 flex items-center gap-1">
                  Click to view all
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Students Card - Clickable */}
          <div 
            onClick={() => handleViewAllUsers('students')}
            className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg p-5 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-red-100 text-xs mt-1 flex items-center gap-1">
                  Click to view all
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search managers or students by name, email, registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-0 focus:outline-none focus:ring-0 text-gray-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Managers Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Manager Accounts</h2>
              <button
                onClick={() => setShowCreateManager(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                + Create Manager
              </button>
            </div>

            {managers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No managers created yet</p>
            ) : filteredManagers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No managers match your search</p>
            ) : (
              <div className="space-y-3">
                {filteredManagers.slice(0, 5).map((manager) => (
                  <div key={manager.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{manager.name}</h3>
                        <p className="text-sm text-gray-600">@{manager.username}</p>
                        <p className="text-sm text-gray-600">{manager.email}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(manager.id, manager.name, 'manager')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {filteredManagers.length > 5 && (
                  <button
                    onClick={() => handleViewAllUsers('managers')}
                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  >
                    View All {filteredManagers.length} Managers
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Registered Students</h2>
            
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students registered yet</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students match your search</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStudents.slice(0, 5).map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.registrationNumber}</p>
                        <p className="text-sm text-gray-600">{student.branch} - Sem {student.semester}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(student.id, student.name, 'student')}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {filteredStudents.length > 5 && (
                  <button
                    onClick={() => handleViewAllUsers('students')}
                    className="w-full py-3 bg-green-50 text-green-600 rounded-lg font-semibold hover:bg-green-100 transition flex items-center justify-center gap-2 sticky bottom-0"
                  >
                    View All {filteredStudents.length} Students
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Manager Modal */}
      {showCreateManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create Manager Account</h2>
            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={managerForm.name}
                  onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={managerForm.username}
                  onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="user@kletech.ac.in"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Must be a KLE Tech email (@kletech.ac.in)</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={managerForm.phone}
                  onChange={(e) => setManagerForm({ ...managerForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={managerForm.password}
                    onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateManager(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
