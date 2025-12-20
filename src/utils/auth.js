/**
 * Authentication and Authorization Utilities
 * Handles user authentication, session management, and role-based access control
 */

import { USER_ROLES } from './constants';

// Predefined Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  role: USER_ROLES.ADMIN,
  name: 'System Administrator',
  email: 'admin@kletech.ac.in'
};

/**
 * Get all users from localStorage
 */
export const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

/**
 * Save users to localStorage
 */
export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

/**
 * Get current logged-in user session
 */
export const getCurrentUser = () => {
  const session = localStorage.getItem('currentUser');
  return session ? JSON.parse(session) : null;
};

/**
 * Save current user session
 */
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

/**
 * Clear current user session (logout)
 */
export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Check if current user has specific role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

/**
 * Admin Login
 */
export const loginAdmin = (username, password) => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const adminUser = {
      id: 'admin_001',
      username: ADMIN_CREDENTIALS.username,
      role: ADMIN_CREDENTIALS.role,
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }
  return { success: false, message: 'Invalid admin credentials' };
};

/**
 * Manager/Issuer Login
 * Authenticates manager credentials against stored users
 */
export const loginManager = (username, password) => {
  const users = getUsers();
  const manager = users.find(
    u => u.username === username && u.password === password && u.role === USER_ROLES.MANAGER
  );
  
  if (manager) {
    const managerUser = {
      id: manager.id,
      username: manager.username,
      role: manager.role,
      name: manager.name,
      email: manager.email,
      loginTime: new Date().toISOString()
    };
    setCurrentUser(managerUser);
    return { success: true, user: managerUser };
  }
  return { success: false, message: 'Invalid manager credentials' };
};

/**
 * Student Registration
 * Creates new student account with validation
 */
export const registerStudent = (studentData) => {
  const users = getUsers();
  
  // Check if registration number already exists
  const exists = users.find(u => u.registrationNumber === studentData.registrationNumber);
  if (exists) {
    return { success: false, message: 'Registration number already exists' };
  }
  
  // Check if email already exists
  const emailExists = users.find(u => u.email === studentData.email);
  if (emailExists) {
    return { success: false, message: 'Email already registered' };
  }
  
  // Check if email belongs to kletech.ac.in domain
  if (!studentData.email.endsWith('@kletech.ac.in')) {
    return { success: false, message: 'Email must be from kletech.ac.in domain' };
  }
  
  const newStudent = {
    id: `student_${Date.now()}`,
    role: USER_ROLES.STUDENT,
    ...studentData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newStudent);
  saveUsers(users);
  
  return { success: true, message: 'Registration successful! You can now login.' };
};

/**
 * Student Login
 * Authenticates student using registration number and password
 */
export const loginStudent = (registrationNumber, password) => {
  const users = getUsers();
  const student = users.find(
    u => u.registrationNumber === registrationNumber && u.password === password && u.role === USER_ROLES.STUDENT
  );
  
  if (student) {
    const studentUser = {
      id: student.id,
      registrationNumber: student.registrationNumber,
      role: student.role,
      name: student.name,
      email: student.email,
      branch: student.branch,
      semester: student.semester,
      phone: student.phone, // Include phone number in session data
      loginTime: new Date().toISOString()
    };
    setCurrentUser(studentUser);
    return { success: true, user: studentUser };
  }
  return { success: false, message: 'Invalid student credentials' };
};

/**
 * Admin creates Manager/Issuer account
 * Only accessible by admin users
 */
export const createManagerAccount = (managerData) => {
  const users = getUsers();
  
  // Check if username already exists
  const exists = users.find(u => u.username === managerData.username);
  if (exists) {
    return { success: false, message: 'Username already exists' };
  }
  
  // Check if email already exists
  const emailExists = users.find(u => u.email === managerData.email);
  if (emailExists) {
    return { success: false, message: 'Email already registered' };
  }
  
  // Check if email belongs to kletech.ac.in domain
  if (!managerData.email.endsWith('@kletech.ac.in')) {
    return { success: false, message: 'Email must be from kletech.ac.in domain' };
  }
  
  const newManager = {
    id: `manager_${Date.now()}`,
    role: USER_ROLES.MANAGER,
    ...managerData,
    createdAt: new Date().toISOString(),
    createdBy: USER_ROLES.ADMIN
  };
  
  users.push(newManager);
  saveUsers(users);
  
  return { success: true, message: 'Manager account created successfully!', manager: newManager };
};

/**
 * Get all managers
 * Returns list of all manager/issuer accounts
 */
export const getManagers = () => {
  const users = getUsers();
  return users.filter(u => u.role === USER_ROLES.MANAGER);
};

/**
 * Get all students
 * Returns list of all student accounts
 */
export const getStudents = () => {
  const users = getUsers();
  return users.filter(u => u.role === USER_ROLES.STUDENT);
};

/**
 * Delete user account
 * Admin-only function to remove user from system
 */
export const deleteUser = (userId) => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  saveUsers(filteredUsers);
  return { success: true, message: 'User deleted successfully' };
};

/**
 * Logout current user
 */
export const logout = () => {
  clearCurrentUser();
  return { success: true, message: 'Logged out successfully' };
};

/**
 * Generate random password
 */
export const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
