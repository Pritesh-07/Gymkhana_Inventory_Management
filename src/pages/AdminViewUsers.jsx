import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole, getManagers, getStudents, deleteUser } from '../utils/auth';

const AdminViewUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType || 'students'; // 'students' or 'managers'
  
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('admin')) {
      toast.error('Unauthorized access!');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadUsers();
  }, [navigate, userType]);

  const loadUsers = () => {
    if (userType === 'managers') {
      const managers = getManagers();
      setAllUsers(managers);
      setFilteredUsers(managers);
    } else {
      const students = getStudents();
      setAllUsers(students);
      setFilteredUsers(students);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterBranch, allUsers]);

  const filterUsers = () => {
    let filtered = allUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.registrationNumber && user.registrationNumber.toLowerCase().includes(searchLower)) ||
          (user.username && user.username.toLowerCase().includes(searchLower)) ||
          (user.phone && user.phone.includes(searchTerm))
        );
      });
    }

    // Branch filter (only for students)
    if (userType === 'students' && filterBranch !== 'all') {
      filtered = filtered.filter(user => user.branch === filterBranch);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = (userId, userName, role) => {
    if (window.confirm(`Are you sure you want to delete ${role} account: ${userName}?`)) {
      const result = deleteUser(userId);
      if (result.success) {
        toast.success(result.message);
        loadUsers();
      }
    }
  };

  const getBranches = () => {
    if (userType === 'students') {
      const branches = [...new Set(allUsers.map(user => user.branch))];
      return branches.sort();
    }
    return [];
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Refined Red Header */}
      <div className="bg-red-100 border-b border-red-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="text-red-800 hover:bg-red-200 p-2 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-red-800">
                {userType === 'managers' ? 'All Managers' : 'All Students'}
              </h1>
              <p className="text-red-600">
                Total {userType}: {allUsers.length} | Showing: {filteredUsers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search by name, ${userType === 'students' ? 'registration number' : 'username'}, email, or phone...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {userType === 'students' && (
              <div className="w-full md:w-64">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Branches</option>
                  {getBranches().map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {searchTerm || filterBranch !== 'all' ? 'No matching users found' : `No ${userType} registered yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h3>
                    {userType === 'managers' ? (
                      <>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          @{user.username}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 font-semibold">{user.registrationNumber}</p>
                        <p className="text-sm text-gray-600">{user.branch} - Semester {user.semester}</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name, userType === 'managers' ? 'manager' : 'student')}
                    className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg"
                    title="Delete user"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="break-all">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.yearOfStudy && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Year {user.yearOfStudy}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewUsers;
