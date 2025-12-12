import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCurrentUser, hasRole } from '../utils/auth';
import { addSelectionFeedback, generateId } from '../utils/localStorage';

/**
 * Sport Team Selection Feedback Form
 * Allows students to provide feedback on the sports team selection process
 */
const SportSelectionFeedback = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    // Student info (auto-filled)
    name: '',
    branch: '',
    semester: '',
    email: '',
    contactNumber: '',
    collegeName: '',
    gameParticipated: '',
    // Rating questions (1-5 scale)
    noticeAdvance: 3,
    rulesExplanation: 'Average',
    facilityPreparation: 3,
    skillOpportunities: 'Average',
    timeLimit: 'Adequate',
    communication: 'Average',
    // Open-ended
    additionalSuggestions: ''
  });

  useEffect(() => {
    // Check authentication and role
    const user = getCurrentUser();
    if (!user || !hasRole('student')) {
      toast.error('Unauthorized access! Only students can submit feedback.');
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    
    // Auto-fill student information
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      branch: user.branch || '',
      semester: user.semester || '',
      contactNumber: user.contactNumber || user.phone || ''
    }));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.collegeName.trim()) {
      toast.error('Please enter your college name');
      return;
    }
    if (!formData.gameParticipated.trim()) {
      toast.error('Please specify the game you participated in');
      return;
    }

    const feedbackData = {
      id: generateId(),
      ...formData,
      studentId: currentUser.id,
      registrationNumber: currentUser.registrationNumber,
      submittedAt: new Date().toISOString(),
      type: 'sport-selection'
    };

    try {
      addSelectionFeedback(feedbackData);
      toast.success('Thank you! Your feedback has been submitted successfully.');
      
      // Reset form
      setFormData({
        name: currentUser.name || '',
        branch: currentUser.branch || '',
        semester: currentUser.semester || '',
        email: currentUser.email || '',
        contactNumber: currentUser.contactNumber || currentUser.phone || '',
        collegeName: '',
        gameParticipated: '',
        noticeAdvance: 3,
        rulesExplanation: 'Average',
        facilityPreparation: 3,
        skillOpportunities: 'Average',
        timeLimit: 'Adequate',
        communication: 'Average',
        additionalSuggestions: ''
      });
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Sport Team Selection Feedback</h1>
          <p className="text-gray-100">Help us improve future selection processes with your valuable feedback</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Student Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary">
              Student Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto-filled fields (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-gray-500">(Auto-filled)</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Manual input fields */}
              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name of the College <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="Enter college name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="gameParticipated" className="block text-sm font-medium text-gray-700 mb-1">
                  Game in which you participated <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="gameParticipated"
                  name="gameParticipated"
                  value={formData.gameParticipated}
                  onChange={handleInputChange}
                  placeholder="e.g., Cricket, Football, Basketball, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Feedback Questions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-primary">
              Feedback Questions
            </h2>

            <div className="space-y-8">
              {/* Question 1: Notice Advance (1-5 scale) */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  1. How far in advance did you receive notice of the selection trials? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 min-w-[80px]">Very Late</span>
                  <div className="flex gap-3 flex-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="noticeAdvance"
                          value={value}
                          checked={formData.noticeAdvance === value}
                          onChange={(e) => setFormData({ ...formData, noticeAdvance: parseInt(e.target.value) })}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{value}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 min-w-[100px] text-right">Well in Advance</span>
                </div>
              </div>

              {/* Question 2: Rules Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  2. How would you rate the explanation of rules provided to participants? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Below Average', 'Average', 'Good', 'Very Good', 'Excellent'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rulesExplanation"
                        value={option}
                        checked={formData.rulesExplanation === option}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3: Facility Preparation (1-5 scale) */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  3. How would you rate the ground/facility preparation for selection trials? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 min-w-[80px]">Poor</span>
                  <div className="flex gap-3 flex-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="facilityPreparation"
                          value={value}
                          checked={formData.facilityPreparation === value}
                          onChange={(e) => setFormData({ ...formData, facilityPreparation: parseInt(e.target.value) })}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{value}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 min-w-[80px] text-right">Excellent</span>
                </div>
              </div>

              {/* Question 4: Skill Opportunities */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  4. How would you rate the opportunities provided to showcase your skills? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Below Average', 'Average', 'Good', 'Very Good', 'Excellent'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="skillOpportunities"
                        value={option}
                        checked={formData.skillOpportunities === option}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  5. How appropriate was the time limit given for the selection process? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Very Less', 'Less', 'Adequate', 'More', 'More than Enough'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeLimit"
                        value={option}
                        checked={formData.timeLimit === option}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 6: Communication */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  6. How would you rate the communication from selection committee members? <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Below Average', 'Average', 'Good', 'Very Good', 'Excellent'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="communication"
                        value={option}
                        checked={formData.communication === option}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 7: Additional Suggestions */}
              <div>
                <label htmlFor="additionalSuggestions" className="block text-sm font-medium text-gray-800 mb-3">
                  7. Any additional suggestions to improve the organization?
                </label>
                <textarea
                  id="additionalSuggestions"
                  name="additionalSuggestions"
                  value={formData.additionalSuggestions}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Share your thoughts and suggestions here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/student-dashboard')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SportSelectionFeedback;
