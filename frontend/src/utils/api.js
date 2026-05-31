const BASE_URL =  import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const getToken = () => localStorage.getItem('lms_token');

const request = async (method, endpoint, data = null, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `HTTP ${response.status}`);
  }

  return result;
};

export const api = {
  get: (endpoint, options) => request('GET', endpoint, null, options),
  post: (endpoint, data, options) => request('POST', endpoint, data, options),
  put: (endpoint, data, options) => request('PUT', endpoint, data, options),
  delete: (endpoint, options) => request('DELETE', endpoint, null, options),
};

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

// Courses
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my-courses'),
};

// Enrollments
export const enrollmentAPI = {
  getMyEnrollments: () => api.get('/enrollments'),
  pay: (data) => api.post('/enrollments/pay', data),
  check: (courseId) => api.get(`/enrollments/check/${courseId}`),
};

// Materials
export const materialAPI = {
  getByCourse: (courseId) => api.get(`/materials/course/${courseId}`),
  add: (data) => api.post('/materials', data),
  delete: (id) => api.delete(`/materials/${id}`),
};

// Attendance
export const attendanceAPI = {
  getAll: () => api.get('/attendance/my'),
  getByCourse: (courseId) => api.get(`/attendance/course/${courseId}`),
  joinSession: (courseId) => api.post('/attendance/join-session', { courseId }),
  completeMaterial: (courseId, materialId) =>
    api.post('/attendance/complete-material', { courseId, materialId }),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: (search) => api.get(`/admin/students${search ? `?search=${search}` : ''}`),
  getEnrollments: () => api.get('/admin/enrollments'),
  getTeacherStats: () => api.get('/admin/teacher-stats'),
};
