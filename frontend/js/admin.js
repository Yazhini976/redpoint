/**
 * RedPoint - Admin Management Logic
 */

// --------------------------------------------------------------------------
// 1. ADMIN DASHBOARD
// --------------------------------------------------------------------------
async function initAdminDashboard() {
  try {
    const res = await window.RedPointAPI.stats.getAdminStats();
    const stats = res.stats;

    // Stat Cards
    document.getElementById('stat-total-tournaments').textContent = stats.totalTournaments;
    document.getElementById('stat-upcoming-tournaments').textContent = stats.upcomingTournaments;
    document.getElementById('stat-total-participants').textContent = stats.totalParticipants;
    document.getElementById('stat-total-matches').textContent = stats.totalMatches;

    // Chart.js - Participation
    const ctx = document.getElementById('participationChart');
    if (ctx && stats.chartData && stats.chartData.labels.length > 0) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: stats.chartData.labels,
          datasets: [{
            label: 'Registered Participants',
            data: stats.chartData.data,
            backgroundColor: '#0D6EFD',
            borderRadius: 6,
            barThickness: 24
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }

    // Upcoming Tournaments Table
    const upcomingContainer = document.getElementById('upcoming-tournaments-table');
    if (upcomingContainer) {
      if (!stats.upcomingTournamentsList || stats.upcomingTournamentsList.length === 0) {
        upcomingContainer.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No upcoming tournaments.</td></tr>';
      } else {
        upcomingContainer.innerHTML = stats.upcomingTournamentsList.map(t => `
          <tr>
            <td><strong>${t.name}</strong></td>
            <td><span class="badge bg-light text-dark border">${t.sport}</span></td>
            <td>${window.RedPointCommon.formatDate(t.event_date)}</td>
            <td><span class="badge bg-primary rounded-pill">${t.participant_count || 0}</span></td>
            <td>${window.RedPointCommon.getStatusBadge(t.status)}</td>
          </tr>
        `).join('');
      }
    }

    // Recent Results Table
    const recentResultsContainer = document.getElementById('recent-results-table');
    if (recentResultsContainer) {
      if (!stats.recentResults || stats.recentResults.length === 0) {
        recentResultsContainer.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No recent results recorded.</td></tr>';
      } else {
        recentResultsContainer.innerHTML = stats.recentResults.map(r => `
          <tr>
            <td>
              <div class="fw-semibold">${r.tournament_name}</div>
              <small class="text-muted">${r.category_name || r.sport}</small>
            </td>
            <td>${r.player_a_name || 'Player A'}</td>
            <td>
              <span class="badge bg-dark px-2 py-1">${r.score_a} - ${r.score_b}</span>
            </td>
            <td>${r.player_b_name || 'Player B'}</td>
            <td>
              <span class="text-success fw-bold"><i class="bi bi-trophy-fill me-1"></i>${r.winner_name || 'Draw'}</span>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load dashboard data.', 'danger');
  }
}

// --------------------------------------------------------------------------
// 2. TOURNAMENT MANAGEMENT
// --------------------------------------------------------------------------
let allTournamentsCache = [];

async function loadTournaments() {
  try {
    const sport = document.getElementById('filter-sport')?.value || 'ALL';
    const status = document.getElementById('filter-status')?.value || 'ALL';
    const search = document.getElementById('filter-search')?.value.trim() || '';

    const res = await window.RedPointAPI.tournaments.getAll({ sport, status, search });
    allTournamentsCache = res.tournaments;

    const tbody = document.getElementById('tournaments-table-body');
    if (!tbody) return;

    if (res.tournaments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No tournaments found.</td></tr>';
      return;
    }

    tbody.innerHTML = res.tournaments.map(t => `
      <tr>
        <td>
          <div class="fw-bold">${t.name}</div>
          <small class="text-muted">${t.venue}</small>
        </td>
        <td><span class="badge bg-light text-dark border">${t.sport}</span></td>
        <td>${window.RedPointCommon.formatDate(t.event_date)}</td>
        <td>${window.RedPointCommon.formatDate(t.registration_deadline)}</td>
        <td><span class="badge bg-info text-dark">${t.category_count} categories</span></td>
        <td><span class="badge bg-primary">${t.participant_count} participants</span></td>
        <td>${window.RedPointCommon.getStatusBadge(t.status)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-info" title="View Details" onclick="viewTournamentDetails(${t.id})">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-primary" title="Edit" onclick="openEditTournamentModal(${t.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" title="Delete" onclick="deleteTournament(${t.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load tournaments.', 'danger');
  }
}

async function viewTournamentDetails(id) {
  try {
    const res = await window.RedPointAPI.tournaments.getById(id);
    const t = res.tournament;

    document.getElementById('view-tournament-title').textContent = t.name;
    document.getElementById('view-tournament-sport').textContent = t.sport;
    document.getElementById('view-tournament-venue').textContent = t.venue;
    document.getElementById('view-tournament-date').textContent = window.RedPointCommon.formatDate(t.event_date);
    document.getElementById('view-tournament-deadline').textContent = window.RedPointCommon.formatDate(t.registration_deadline);
    document.getElementById('view-tournament-status').innerHTML = window.RedPointCommon.getStatusBadge(t.status);
    document.getElementById('view-tournament-desc').textContent = t.description || 'No description provided.';

    // Categories list
    const catList = document.getElementById('view-tournament-categories');
    catList.innerHTML = t.categories.length === 0
      ? '<li class="list-group-item text-muted">No categories created yet.</li>'
      : t.categories.map(c => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            ${c.name}
            <span class="badge bg-secondary">${c.gender} - ${c.format}</span>
          </li>
        `).join('');

    // Participants list
    const partList = document.getElementById('view-tournament-participants');
    partList.innerHTML = t.participants.length === 0
      ? '<li class="list-group-item text-muted">No participants registered yet.</li>'
      : t.participants.map(p => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${p.name}</strong> <small class="text-muted">(${p.email})</small>
            </div>
            <small class="text-muted">${window.RedPointCommon.formatDate(p.registered_at)}</small>
          </li>
        `).join('');

    const modal = new bootstrap.Modal(document.getElementById('viewTournamentModal'));
    modal.show();
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load tournament details.', 'danger');
  }
}

function openEditTournamentModal(id) {
  const t = allTournamentsCache.find(item => item.id === id);
  if (!t) return;

  document.getElementById('edit-tournament-id').value = t.id;
  document.getElementById('edit-tournament-name').value = t.name;
  document.getElementById('edit-tournament-sport').value = t.sport;
  document.getElementById('edit-tournament-venue').value = t.venue;
  document.getElementById('edit-tournament-event-date').value = t.event_date.split('T')[0];
  document.getElementById('edit-tournament-deadline').value = t.registration_deadline.split('T')[0];
  document.getElementById('edit-tournament-status').value = t.status;
  document.getElementById('edit-tournament-description').value = t.description || '';

  const modal = new bootstrap.Modal(document.getElementById('editTournamentModal'));
  modal.show();
}

async function deleteTournament(id) {
  if (!confirm('Are you sure you want to delete this tournament? All associated categories, matches, and results will also be deleted.')) {
    return;
  }

  try {
    const res = await window.RedPointAPI.tournaments.delete(id);
    window.RedPointCommon.showToast(res.message || 'Tournament deleted successfully.');
    loadTournaments();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to delete tournament.', 'danger');
  }
}

function initAdminTournaments() {
  loadTournaments();

  // Create Tournament form
  const createForm = document.getElementById('createTournamentForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('create-tournament-name').value,
        sport: document.getElementById('create-tournament-sport').value,
        venue: document.getElementById('create-tournament-venue').value,
        event_date: document.getElementById('create-tournament-event-date').value,
        registration_deadline: document.getElementById('create-tournament-deadline').value,
        status: document.getElementById('create-tournament-status').value,
        description: document.getElementById('create-tournament-description').value
      };

      try {
        const res = await window.RedPointAPI.tournaments.create(data);
        window.RedPointCommon.showToast(res.message || 'Tournament created successfully.');
        createForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('createTournamentModal')).hide();
        loadTournaments();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Unable to create tournament.', 'danger');
      }
    });
  }

  // Edit Tournament form
  const editForm = document.getElementById('editTournamentForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-tournament-id').value;
      const data = {
        name: document.getElementById('edit-tournament-name').value,
        sport: document.getElementById('edit-tournament-sport').value,
        venue: document.getElementById('edit-tournament-venue').value,
        event_date: document.getElementById('edit-tournament-event-date').value,
        registration_deadline: document.getElementById('edit-tournament-deadline').value,
        status: document.getElementById('edit-tournament-status').value,
        description: document.getElementById('edit-tournament-description').value
      };

      try {
        const res = await window.RedPointAPI.tournaments.update(id, data);
        window.RedPointCommon.showToast(res.message || 'Tournament updated successfully.');
        bootstrap.Modal.getInstance(document.getElementById('editTournamentModal')).hide();
        loadTournaments();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to update tournament.', 'danger');
      }
    });
  }

  // Filters
  document.getElementById('filter-sport')?.addEventListener('change', loadTournaments);
  document.getElementById('filter-status')?.addEventListener('change', loadTournaments);
  document.getElementById('filter-search')?.addEventListener('input', loadTournaments);
}

// --------------------------------------------------------------------------
// 3. CATEGORY MANAGEMENT
// --------------------------------------------------------------------------
let allCategoriesCache = [];

async function loadCategories() {
  try {
    const tournamentId = document.getElementById('filter-category-tournament')?.value || '';
    const res = await window.RedPointAPI.categories.getAll(tournamentId ? { tournament_id: tournamentId } : {});
    allCategoriesCache = res.categories;

    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    if (res.categories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No categories found.</td></tr>';
      return;
    }

    tbody.innerHTML = res.categories.map(c => `
      <tr>
        <td>
          <div class="fw-bold">${c.tournament_name}</div>
          <small class="text-muted">${c.tournament_sport}</small>
        </td>
        <td><strong>${c.name}</strong></td>
        <td><span class="badge bg-light text-dark border">${c.gender}</span></td>
        <td><span class="badge bg-secondary">${c.format}</span></td>
        <td><span class="badge bg-info text-dark">${c.match_count || 0} matches</span></td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" title="Edit" onclick="openEditCategoryModal(${c.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" title="Delete" onclick="deleteCategory(${c.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load categories.', 'danger');
  }
}

async function populateTournamentDropdowns() {
  try {
    const res = await window.RedPointAPI.tournaments.getAll();
    const tournaments = res.tournaments;

    const filterSelect = document.getElementById('filter-category-tournament');
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Tournaments</option>' +
        tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');
    }

    const createSelect = document.getElementById('create-category-tournament');
    if (createSelect) {
      createSelect.innerHTML = '<option value="">Select Tournament</option>' +
        tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');
    }

    const editSelect = document.getElementById('edit-category-tournament');
    if (editSelect) {
      editSelect.innerHTML = '<option value="">Select Tournament</option>' +
        tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to populate tournament dropdowns:', err);
  }
}

function openEditCategoryModal(id) {
  const c = allCategoriesCache.find(item => item.id === id);
  if (!c) return;

  document.getElementById('edit-category-id').value = c.id;
  document.getElementById('edit-category-tournament').value = c.tournament_id;
  document.getElementById('edit-category-name').value = c.name;
  document.getElementById('edit-category-gender').value = c.gender;
  document.getElementById('edit-category-format').value = c.format;

  const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
  modal.show();
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category? Matches linked to it may be affected.')) {
    return;
  }

  try {
    const res = await window.RedPointAPI.categories.delete(id);
    window.RedPointCommon.showToast(res.message || 'Category deleted successfully.');
    loadCategories();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to delete category.', 'danger');
  }
}

function initAdminCategories() {
  populateTournamentDropdowns();
  loadCategories();

  // Filter change
  document.getElementById('filter-category-tournament')?.addEventListener('change', loadCategories);

  // Create form
  const createForm = document.getElementById('createCategoryForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        tournament_id: document.getElementById('create-category-tournament').value,
        name: document.getElementById('create-category-name').value,
        gender: document.getElementById('create-category-gender').value,
        format: document.getElementById('create-category-format').value
      };

      try {
        const res = await window.RedPointAPI.categories.create(data);
        window.RedPointCommon.showToast(res.message || 'Category created successfully.');
        createForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('createCategoryModal')).hide();
        loadCategories();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Unable to create category.', 'danger');
      }
    });
  }

  // Edit form
  const editForm = document.getElementById('editCategoryForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-category-id').value;
      const data = {
        tournament_id: document.getElementById('edit-category-tournament').value,
        name: document.getElementById('edit-category-name').value,
        gender: document.getElementById('edit-category-gender').value,
        format: document.getElementById('edit-category-format').value
      };

      try {
        const res = await window.RedPointAPI.categories.update(id, data);
        window.RedPointCommon.showToast(res.message || 'Category updated successfully.');
        bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
        loadCategories();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to update category.', 'danger');
      }
    });
  }
}

// --------------------------------------------------------------------------
// 4. PARTICIPANT MANAGEMENT
// --------------------------------------------------------------------------
async function loadParticipants() {
  try {
    const search = document.getElementById('search-participants')?.value.trim() || '';
    const res = await window.RedPointAPI.participants.getAll({ search });

    const tbody = document.getElementById('participants-table-body');
    if (!tbody) return;

    if (res.participants.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No participants found.</td></tr>';
      return;
    }

    tbody.innerHTML = res.participants.map(p => {
      const tournaments = p.tournaments && p.tournaments.length > 0
        ? p.tournaments.map(t => `<span class="badge bg-light text-dark border me-1 mb-1">${t.tournament_name}</span>`).join('')
        : '<span class="text-muted small">None</span>';

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem;">
                ${p.name.charAt(0).toUpperCase()}
              </div>
              <strong>${p.name}</strong>
            </div>
          </td>
          <td>${p.email}</td>
          <td>${tournaments}</td>
          <td>${window.RedPointCommon.formatDate(p.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" title="Delete" onclick="deleteParticipant(${p.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load participants.', 'danger');
  }
}

async function deleteParticipant(id) {
  if (!confirm('Are you sure you want to delete this participant account? Their registrations and match records will also be deleted.')) {
    return;
  }

  try {
    const res = await window.RedPointAPI.participants.delete(id);
    window.RedPointCommon.showToast(res.message || 'Participant deleted successfully.');
    loadParticipants();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to delete participant.', 'danger');
  }
}

function initAdminParticipants() {
  loadParticipants();

  document.getElementById('search-participants')?.addEventListener('input', loadParticipants);

  // Add Participant Form
  const addForm = document.getElementById('addParticipantForm');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('add-participant-name').value,
        email: document.getElementById('add-participant-email').value,
        password: document.getElementById('add-participant-password').value
      };

      try {
        const res = await window.RedPointAPI.participants.create(data);
        window.RedPointCommon.showToast(res.message || 'Participant added successfully.');
        addForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('addParticipantModal')).hide();
        loadParticipants();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Unable to add participant.', 'danger');
      }
    });
  }
}

// --------------------------------------------------------------------------
// 5. MATCH MANAGEMENT
// --------------------------------------------------------------------------
let allMatchesCache = [];

async function loadMatches() {
  try {
    const tournament_id = document.getElementById('filter-match-tournament')?.value || '';
    const status = document.getElementById('filter-match-status')?.value || '';
    const search = document.getElementById('filter-match-search')?.value.trim() || '';

    const params = {};
    if (tournament_id) params.tournament_id = tournament_id;
    if (status) params.status = status;
    if (search) params.search = search;

    const res = await window.RedPointAPI.matches.getAll(params);
    allMatchesCache = res.matches;

    const tbody = document.getElementById('matches-table-body');
    if (!tbody) return;

    if (res.matches.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No matches found.</td></tr>';
      return;
    }

    tbody.innerHTML = res.matches.map(m => `
      <tr>
        <td>
          <div class="fw-bold">${m.tournament_name}</div>
          <small class="text-muted">${m.sport}</small>
        </td>
        <td><span class="badge bg-light text-dark border">${m.category_name || 'General'}</span></td>
        <td><strong class="text-primary">${m.player_a_name || 'Player A'}</strong></td>
        <td><strong class="text-danger">${m.player_b_name || 'Player B'}</strong></td>
        <td>${window.RedPointCommon.formatDate(m.match_date)}</td>
        <td>${m.match_time}</td>
        <td><small>${m.venue}</small></td>
        <td>${window.RedPointCommon.getStatusBadge(m.status)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            ${m.status === 'SCHEDULED' ? `
              <button class="btn btn-outline-success" title="Enter Result" onclick="openEnterResultFromMatch(${m.id})">
                <i class="bi bi-award"></i>
              </button>
            ` : `
              <button class="btn btn-outline-secondary" title="View Result" onclick="openEditResultModal(${m.result_id || 0}, ${m.id})">
                <i class="bi bi-eye"></i>
              </button>
            `}
            <button class="btn btn-outline-primary" title="Edit" onclick="openEditMatchModal(${m.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" title="Delete" onclick="deleteMatch(${m.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load matches.', 'danger');
  }
}

async function populateMatchModalDropdowns(prefix = 'create') {
  try {
    const tRes = await window.RedPointAPI.tournaments.getAll();
    const tSelect = document.getElementById(`${prefix}-match-tournament`);
    if (tSelect) {
      tSelect.innerHTML = '<option value="">Select Tournament</option>' +
        tRes.tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');

      tSelect.onchange = async () => {
        const tournamentId = tSelect.value;
        const cSelect = document.getElementById(`${prefix}-match-category`);
        const pASelect = document.getElementById(`${prefix}-match-player-a`);
        const pBSelect = document.getElementById(`${prefix}-match-player-b`);

        if (!tournamentId) {
          if (cSelect) cSelect.innerHTML = '<option value="">Select Category</option>';
          if (pASelect) pASelect.innerHTML = '<option value="">Select Participant A</option>';
          if (pBSelect) pBSelect.innerHTML = '<option value="">Select Participant B</option>';
          return;
        }

        // Fetch categories for tournament
        const catRes = await window.RedPointAPI.categories.getByTournament(tournamentId);
        if (cSelect) {
          cSelect.innerHTML = '<option value="">Select Category</option>' +
            catRes.categories.map(c => `<option value="${c.id}">${c.name} (${c.gender})</option>`).join('');
        }

        // Fetch participants for tournament or all participants if none registered yet
        const regRes = await window.RedPointAPI.registrations.getByTournament(tournamentId);
        let participantsList = regRes.participants;

        if (!participantsList || participantsList.length < 2) {
          const allPartRes = await window.RedPointAPI.participants.getAll();
          participantsList = allPartRes.participants;
        }

        const optionsHtml = participantsList.map(p => `<option value="${p.user_id || p.id}">${p.name} (${p.email})</option>`).join('');
        if (pASelect) pASelect.innerHTML = '<option value="">Select Participant A</option>' + optionsHtml;
        if (pBSelect) pBSelect.innerHTML = '<option value="">Select Participant B</option>' + optionsHtml;
      };
    }
  } catch (err) {
    console.error('Error populating match dropdowns:', err);
  }
}

function openEditMatchModal(id) {
  const m = allMatchesCache.find(item => item.id === id);
  if (!m) return;

  document.getElementById('edit-match-id').value = m.id;
  document.getElementById('edit-match-date').value = m.match_date.split('T')[0];
  document.getElementById('edit-match-time').value = m.match_time;
  document.getElementById('edit-match-venue').value = m.venue;
  document.getElementById('edit-match-status').value = m.status;

  const modal = new bootstrap.Modal(document.getElementById('editMatchModal'));
  modal.show();
}

async function deleteMatch(id) {
  if (!confirm('Are you sure you want to delete this match?')) return;

  try {
    const res = await window.RedPointAPI.matches.delete(id);
    window.RedPointCommon.showToast(res.message || 'Match deleted successfully.');
    loadMatches();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to delete match.', 'danger');
  }
}

function openEnterResultFromMatch(matchId) {
  const m = allMatchesCache.find(item => item.id === matchId);
  if (!m) return;

  document.getElementById('result-match-id').value = m.id;
  document.getElementById('result-match-title').textContent = `${m.tournament_name} - ${m.category_name || ''}`;
  document.getElementById('result-player-a-name').textContent = m.player_a_name;
  document.getElementById('result-player-b-name').textContent = m.player_b_name;

  const winnerSelect = document.getElementById('result-winner');
  winnerSelect.innerHTML = `
    <option value="">Auto-Detect / Select Winner</option>
    <option value="${m.participant_a}">${m.player_a_name} (Player A)</option>
    <option value="${m.participant_b}">${m.player_b_name} (Player B)</option>
    <option value="">Draw / Tie</option>
  `;

  document.getElementById('result-score-a').value = '';
  document.getElementById('result-score-b').value = '';

  const modal = new bootstrap.Modal(document.getElementById('enterResultModal'));
  modal.show();
}

function initAdminMatches() {
  populateMatchModalDropdowns('create');
  loadMatches();

  // Populate tournament filter
  window.RedPointAPI.tournaments.getAll().then(res => {
    const select = document.getElementById('filter-match-tournament');
    if (select) {
      select.innerHTML = '<option value="">All Tournaments</option>' +
        res.tournaments.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }
  });

  document.getElementById('filter-match-tournament')?.addEventListener('change', loadMatches);
  document.getElementById('filter-match-status')?.addEventListener('change', loadMatches);
  document.getElementById('filter-match-search')?.addEventListener('input', loadMatches);

  // Create Match form
  const createForm = document.getElementById('createMatchForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pA = document.getElementById('create-match-player-a').value;
      const pB = document.getElementById('create-match-player-b').value;

      if (pA === pB) {
        window.RedPointCommon.showToast('Participant A and Participant B cannot be the same.', 'danger');
        return;
      }

      const data = {
        tournament_id: document.getElementById('create-match-tournament').value,
        category_id: document.getElementById('create-match-category').value || null,
        participant_a: pA,
        participant_b: pB,
        match_date: document.getElementById('create-match-date').value,
        match_time: document.getElementById('create-match-time').value,
        venue: document.getElementById('create-match-venue').value,
        status: document.getElementById('create-match-status').value
      };

      try {
        const res = await window.RedPointAPI.matches.create(data);
        window.RedPointCommon.showToast(res.message || 'Match created successfully.');
        createForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('createMatchModal')).hide();
        loadMatches();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Unable to create match.', 'danger');
      }
    });
  }

  // Edit Match form
  const editForm = document.getElementById('editMatchForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-match-id').value;
      const data = {
        match_date: document.getElementById('edit-match-date').value,
        match_time: document.getElementById('edit-match-time').value,
        venue: document.getElementById('edit-match-venue').value,
        status: document.getElementById('edit-match-status').value
      };

      try {
        const res = await window.RedPointAPI.matches.update(id, data);
        window.RedPointCommon.showToast(res.message || 'Match updated successfully.');
        bootstrap.Modal.getInstance(document.getElementById('editMatchModal')).hide();
        loadMatches();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to update match.', 'danger');
      }
    });
  }

  // Enter Result form (modal)
  const resultForm = document.getElementById('enterResultModalForm');
  if (resultForm) {
    resultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const matchId = document.getElementById('result-match-id').value;
      const scoreA = parseInt(document.getElementById('result-score-a').value, 10);
      const scoreB = parseInt(document.getElementById('result-score-b').value, 10);
      let winner = document.getElementById('result-winner').value;

      // Auto detect winner if not manually selected
      if (!winner) {
        const m = allMatchesCache.find(item => item.id == matchId);
        if (m) {
          if (scoreA > scoreB) winner = m.participant_a;
          else if (scoreB > scoreA) winner = m.participant_b;
        }
      }

      try {
        const res = await window.RedPointAPI.results.createOrUpdate({
          match_id: matchId,
          score_a: scoreA,
          score_b: scoreB,
          winner: winner || null
        });

        window.RedPointCommon.showToast(res.message || 'Result saved successfully.');
        bootstrap.Modal.getInstance(document.getElementById('enterResultModal')).hide();
        loadMatches();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to save result.', 'danger');
      }
    });
  }
}

// --------------------------------------------------------------------------
// 6. RESULT MANAGEMENT
// --------------------------------------------------------------------------
async function loadResults() {
  try {
    const tournament_id = document.getElementById('filter-result-tournament')?.value || '';
    const search = document.getElementById('filter-result-search')?.value.trim() || '';

    const params = {};
    if (tournament_id) params.tournament_id = tournament_id;
    if (search) params.search = search;

    const res = await window.RedPointAPI.results.getAll(params);
    const tbody = document.getElementById('results-table-body');
    if (!tbody) return;

    if (res.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No match results recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = res.results.map((r, index) => {
      const matchCode = `M${String(r.match_id).padStart(3, '0')}`;
      return `
        <tr>
          <td><span class="badge bg-secondary font-monospace">${matchCode}</span></td>
          <td>
            <div class="fw-bold">${r.tournament_name}</div>
            <small class="text-muted">${r.category_name || r.sport}</small>
          </td>
          <td><strong>${r.player_a_name || 'Player A'}</strong></td>
          <td>
            <span class="badge bg-dark fs-6 px-3 py-1">${r.score_a} - ${r.score_b}</span>
          </td>
          <td><strong>${r.player_b_name || 'Player B'}</strong></td>
          <td>
            <span class="text-success fw-bold">
              <i class="bi bi-trophy-fill me-1"></i>${r.winner_name || 'Draw'}
            </span>
          </td>
          <td>${window.RedPointCommon.formatDate(r.match_date)}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" title="Delete Result" onclick="deleteResultRecord(${r.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load results.', 'danger');
  }
}

async function deleteResultRecord(id) {
  if (!confirm('Are you sure you want to delete this result? The match status will revert to SCHEDULED.')) {
    return;
  }

  try {
    const res = await window.RedPointAPI.results.delete(id);
    window.RedPointCommon.showToast(res.message || 'Result deleted successfully.');
    loadResults();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to delete result.', 'danger');
  }
}

async function initAdminResults() {
  loadResults();

  // Populate tournament filter
  const tRes = await window.RedPointAPI.tournaments.getAll();
  const select = document.getElementById('filter-result-tournament');
  if (select) {
    select.innerHTML = '<option value="">All Tournaments</option>' +
      tRes.tournaments.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  // Populate matches dropdown in Create Result modal
  const matchesRes = await window.RedPointAPI.matches.getAll();
  const matchSelect = document.getElementById('new-result-match-select');
  if (matchSelect) {
    matchSelect.innerHTML = '<option value="">Select a Match</option>' +
      matchesRes.matches.map(m => `
        <option value="${m.id}" data-pa-id="${m.participant_a}" data-pb-id="${m.participant_b}" data-pa="${m.player_a_name}" data-pb="${m.player_b_name}">
          #${m.id} ${m.tournament_name}: ${m.player_a_name} vs ${m.player_b_name} (${m.status})
        </option>
      `).join('');

    matchSelect.onchange = () => {
      const selectedOpt = matchSelect.options[matchSelect.selectedIndex];
      const pa = selectedOpt.getAttribute('data-pa');
      const pb = selectedOpt.getAttribute('data-pb');
      const paId = selectedOpt.getAttribute('data-pa-id');
      const pbId = selectedOpt.getAttribute('data-pb-id');

      document.getElementById('new-result-player-a-label').textContent = pa || 'Player A';
      document.getElementById('new-result-player-b-label').textContent = pb || 'Player B';

      const winnerSelect = document.getElementById('new-result-winner');
      winnerSelect.innerHTML = `
        <option value="">Auto-Detect / Select Winner</option>
        <option value="${paId}">${pa} (Player A)</option>
        <option value="${pbId}">${pb} (Player B)</option>
        <option value="">Draw / Tie</option>
      `;
    };
  }

  document.getElementById('filter-result-tournament')?.addEventListener('change', loadResults);
  document.getElementById('filter-result-search')?.addEventListener('input', loadResults);

  // New Result Form Submit
  const newResultForm = document.getElementById('newResultForm');
  if (newResultForm) {
    newResultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const matchId = document.getElementById('new-result-match-select').value;
      const scoreA = parseInt(document.getElementById('new-result-score-a').value, 10);
      const scoreB = parseInt(document.getElementById('new-result-score-b').value, 10);
      let winner = document.getElementById('new-result-winner').value;

      if (!matchId) {
        window.RedPointCommon.showToast('Please select a match.', 'warning');
        return;
      }

      if (!winner) {
        const matchOpt = document.getElementById('new-result-match-select').selectedOptions[0];
        const paId = matchOpt.getAttribute('data-pa-id');
        const pbId = matchOpt.getAttribute('data-pb-id');
        if (scoreA > scoreB) winner = paId;
        else if (scoreB > scoreA) winner = pbId;
      }

      try {
        const res = await window.RedPointAPI.results.createOrUpdate({
          match_id: matchId,
          score_a: scoreA,
          score_b: scoreB,
          winner: winner || null
        });

        window.RedPointCommon.showToast(res.message || 'Result saved successfully.');
        newResultForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('newResultModal')).hide();
        loadResults();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to save result.', 'danger');
      }
    });
  }
}

// --------------------------------------------------------------------------
// 7. LEADERBOARD
// --------------------------------------------------------------------------
async function loadLeaderboard(tournamentId = '') {
  try {
    const res = await window.RedPointAPI.leaderboard.get(tournamentId ? { tournament_id: tournamentId } : {});
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (res.leaderboard.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No completed match stats available for leaderboard.</td></tr>';
      return;
    }

    tbody.innerHTML = res.leaderboard.map(item => {
      let rankBadge = `<span class="badge bg-secondary rounded-pill px-2">${item.rank}</span>`;
      if (item.rank === 1) rankBadge = `<span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-trophy-fill me-1"></i>1st</span>`;
      else if (item.rank === 2) rankBadge = `<span class="badge bg-secondary text-white px-2 py-1"><i class="bi bi-award-fill me-1"></i>2nd</span>`;
      else if (item.rank === 3) rankBadge = `<span class="badge bg-danger text-white px-2 py-1"><i class="bi bi-award me-1"></i>3rd</span>`;

      return `
        <tr>
          <td>${rankBadge}</td>
          <td>
            <div class="fw-bold">${item.participant_name}</div>
            <small class="text-muted">${item.participant_email}</small>
          </td>
          <td><strong>${item.matches_played}</strong></td>
          <td class="text-success fw-bold">${item.wins}</td>
          <td class="text-danger">${item.losses}</td>
          <td class="text-muted">${item.draws}</td>
          <td><span class="badge bg-primary fs-6 px-3 py-1">${item.points} pts</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load leaderboard.', 'danger');
  }
}

async function initAdminLeaderboard() {
  loadLeaderboard();

  // Populate tournament dropdown
  const tRes = await window.RedPointAPI.tournaments.getAll();
  const select = document.getElementById('filter-leaderboard-tournament');
  if (select) {
    select.innerHTML = '<option value="">All Tournaments (Combined)</option>' +
      tRes.tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');

    select.addEventListener('change', () => {
      loadLeaderboard(select.value);
    });
  }
}

window.RedPointAdmin = {
  initDashboard: initAdminDashboard,
  initTournaments: initAdminTournaments,
  initCategories: initAdminCategories,
  initParticipants: initAdminParticipants,
  initMatches: initAdminMatches,
  initResults: initAdminResults,
  initLeaderboard: initAdminLeaderboard
};
