/**
 * Application Constants
 * Centralized configuration for sports types, conditions, and other reusable values
 */

// Sport Types available in the inventory system
export const SPORT_TYPES = [
  'Athletics',
  'Badminton',
  'Basketball',
  'Carrom',
  'Chess',
  'Cricket',
  'Fitness / General Training',
  'Football',
  'Handball',
  'Hockey',
  'Lagori (Seven Stones)',
  'Lawn Tennis',
  'Netball',
  'Table Tennis',
  'Throwball',
  'Volleyball',
  'Others',
];

// Equipment Conditions
export const EQUIPMENT_CONDITIONS = ['New', 'Good'];

// Inventory Types
export const INVENTORY_TYPES = {
  MAIN: 'main',
  USED: 'used',
};

// Equipment Usage Status
export const EQUIPMENT_USAGE_STATUS = {
  NEW: 'new',          // Never been issued
  USED: 'used',        // Has been issued at least once
};

// Equipment Types - Categorization by Consumption
export const EQUIPMENT_TYPES = {
  CONSUMABLE: 'consumable',         // Items that can be used up or worn out (balls, shuttlecocks, protective gear)
  NON_CONSUMABLE: 'non-consumable', // Durable gym materials and equipment (weights, benches, machines)
};

// Equipment Type Labels for UI
export const EQUIPMENT_TYPE_LABELS = {
  consumable: 'Consumable',
  'non-consumable': 'Non-Consumable',
};

// Examples for each equipment type
export const EQUIPMENT_TYPE_EXAMPLES = {
  consumable: 'Balls, shuttlecocks, protective gear, grips, tape, etc.',
  'non-consumable': 'Weights, benches, machines, rackets, bats, nets, etc.',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STUDENT: 'student',
};

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Issue Status
export const ISSUE_STATUS = {
  ISSUED: 'issued',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
};

// Application Theme Colors
export const THEME_COLORS = {
  primary: '#B71C1C',
  primaryDark: '#8B0000',
  primaryLight: '#D32F2F',
};

// App Configuration
export const APP_CONFIG = {
  appName: 'KLE Tech Gymkhana',
  appTitle: 'Sports Inventory Management',
  contactEmail: 'gymkhana@kletech.ac.in',
  contactPhone: '+91 836 247 7833',
  location: 'KLE Technological University, Hubballi, Karnataka',
};
