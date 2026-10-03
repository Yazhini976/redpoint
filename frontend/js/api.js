/**
 * RedPoint - API Client
 * Provides structured REST API calls to the Express backend.
 */

const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('redpoint_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// Authentication APIs
const authApi = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  getMe: () => apiRequest('/auth/me'),
  changePassword: (newPassword, currentPassword) => apiRequest('/auth/change-password', {
    method: 'POST',
    body: { newPassword, currentPassword }
  })
};

// Tournament APIs
const tournamentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tournaments${query ? '?' + query : ''}`);
  },
  getById: (id) => apiRequest(`/tournaments/${id}`),
  create: (data) => apiRequest('/tournaments', {
    method: 'POST',
    body: data
  }),
  update: (id, data) => apiRequest(`/tournaments/${id}`, {
    method: 'PUT',
    body: data
  }),
  delete: (id) => apiRequest(`/tournaments/${id}`, {
    method: 'DELETE'
  })
};

// Category APIs
const categoryApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/categories${query ? '?' + query : ''}`);
  },
  getByTournament: (tournamentId) => apiRequest(`/categories/tournament/${tournamentId}`),
  getById: (id) => apiRequest(`/categories/${id}`),
  create: (data) => apiRequest('/categories', {
    method: 'POST',
    body: data
  }),
  update: (id, data) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: data
  }),
  delete: (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE'
  })
};

// Participant APIs (Admin management of student accounts)
const participantApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/participants${query ? '?' + query : ''}`);
  },
  getById: (id) => apiRequest(`/participants/${id}`),
  create: (data) => apiRequest('/participants', {
    method: 'POST',
    body: data
  }),
  delete: (id) => apiRequest(`/participants/${id}`, {
    method: 'DELETE'
  })
};

// Registration APIs
const registrationApi = {
  register: (tournamentId) => apiRequest('/registrations', {
    method: 'POST',
    body: { tournament_id: tournamentId }
  }),
  getMy: () => apiRequest('/registrations/my'),
  getByTournament: (tournamentId) => apiRequest(`/registrations/tournament/${tournamentId}`),
  cancel: (registrationId) => apiRequest(`/registrations/${registrationId}`, {
    method: 'DELETE'
  })
};

// Match APIs
const matchApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/matches${query ? '?' + query : ''}`);
  },
  getById: (id) => apiRequest(`/matches/${id}`),
  create: (data) => apiRequest('/matches', {
    method: 'POST',
    body: data
  }),
  update: (id, data) => apiRequest(`/matches/${id}`, {
    method: 'PUT',
    body: data
  }),
  delete: (id) => apiRequest(`/matches/${id}`, {
    method: 'DELETE'
  })
};

// Result APIs
const resultApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/results${query ? '?' + query : ''}`);
  },
  createOrUpdate: (data) => apiRequest('/results', {
    method: 'POST',
    body: data
  }),
  update: (id, data) => apiRequest(`/results/${id}`, {
    method: 'PUT',
    body: data
  }),
  delete: (id) => apiRequest(`/results/${id}`, {
    method: 'DELETE'
  })
};

// Leaderboard API
const leaderboardApi = {
  get: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/leaderboard${query ? '?' + query : ''}`);
  }
};

// Stats APIs
const statsApi = {
  getAdminStats: () => apiRequest('/stats/admin'),
  getParticipantStats: () => apiRequest('/stats/participant')
};

window.RedPointAPI = {
  auth: authApi,
  tournaments: tournamentApi,
  categories: categoryApi,
  participants: participantApi,
  registrations: registrationApi,
  matches: matchApi,
  results: resultApi,
  leaderboard: leaderboardApi,
  stats: statsApi
};
