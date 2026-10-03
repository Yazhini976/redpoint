/**
 * RedPoint - Participant Logic
 */

// --------------------------------------------------------------------------
// 1. PARTICIPANT DASHBOARD
// --------------------------------------------------------------------------
async function initParticipantDashboard() {
  try {
    const res = await window.RedPointAPI.stats.getParticipantStats();
    const stats = res.stats;

    // Stat Cards
    document.getElementById('pstat-registered').textContent = stats.registeredTournaments;
    document.getElementById('pstat-upcoming').textContent = stats.upcomingMatches;
    document.getElementById('pstat-completed').textContent = stats.completedMatches;
    document.getElementById('pstat-wins').textContent = stats.wins;

    // Upcoming Matches Cards
    const container = document.getElementById('upcoming-matches-container');
    if (container) {
      if (!stats.upcomingMatchesList || stats.upcomingMatchesList.length === 0) {
        container.innerHTML = `
          <div class="col-12">
            <div class="alert alert-light border text-center py-4 mb-0">
              <i class="bi bi-calendar-check text-muted fs-3 d-block mb-2"></i>
              <p class="text-muted mb-0">You have no upcoming scheduled matches at the moment.</p>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = stats.upcomingMatchesList.map(m => `
          <div class="col-md-6 mb-3">
            <div class="rp-card h-100 mb-0">
              <div class="card-header bg-light">
                <span class="badge bg-primary me-2">${m.sport}</span>
                <span class="fw-semibold text-truncate">${m.tournament_name}</span>
              </div>
              <div class="card-body">
                <h6 class="text-secondary mb-3">${m.category_name || 'General Category'}</h6>
                <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3">
                  <div class="text-center flex-fill">
                    <span class="d-block fw-bold text-primary">${m.player_a_name}</span>
                  </div>
                  <div class="badge bg-dark rounded-pill px-2 py-1 mx-2">VS</div>
                  <div class="text-center flex-fill">
                    <span class="d-block fw-bold text-danger">${m.player_b_name}</span>
                  </div>
                </div>
                <div class="text-muted small">
                  <div class="mb-1"><i class="bi bi-calendar-event me-2"></i>${window.RedPointCommon.formatDate(m.match_date)}</div>
                  <div class="mb-1"><i class="bi bi-clock me-2"></i>${m.match_time}</div>
                  <div><i class="bi bi-geo-alt me-2"></i>${m.venue}</div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // Recent Match Results
    const resultsTable = document.getElementById('recent-results-table');
    if (resultsTable) {
      if (!stats.recentResults || stats.recentResults.length === 0) {
        resultsTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No match results yet.</td></tr>';
      } else {
        resultsTable.innerHTML = stats.recentResults.map(r => `
          <tr>
            <td>
              <div class="fw-semibold">${r.tournament_name}</div>
              <small class="text-muted">${r.sport}</small>
            </td>
            <td>${r.player_a_name} vs ${r.player_b_name}</td>
            <td><span class="badge bg-dark px-2 py-1">${r.score_a} - ${r.score_b}</span></td>
            <td>
              <span class="fw-bold ${r.winner_id == window.RedPointAuth.getUser().id ? 'text-success' : 'text-secondary'}">
                <i class="bi bi-trophy-fill me-1"></i>${r.winner_name || 'Draw'}
              </span>
            </td>
            <td>${window.RedPointCommon.formatDate(r.match_date)}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load dashboard statistics.', 'danger');
  }
}

// --------------------------------------------------------------------------
// 2. TOURNAMENTS & REGISTRATION
// --------------------------------------------------------------------------
async function loadParticipantTournaments() {
  try {
    const [tRes, regRes] = await Promise.all([
      window.RedPointAPI.tournaments.getAll(),
      window.RedPointAPI.registrations.getMy()
    ]);

    const tournaments = tRes.tournaments;
    const registeredIds = new Set(regRes.registrations.map(r => r.tournament_id));

    const container = document.getElementById('tournaments-card-container');
    if (!container) return;

    if (tournaments.length === 0) {
      container.innerHTML = '<div class="col-12 text-center text-muted py-5">No tournaments available.</div>';
      return;
    }

    container.innerHTML = tournaments.map(t => {
      const isRegistered = registeredIds.has(t.id);
      const isCompleted = t.status === 'COMPLETED';

      let buttonHtml = '';
      if (isRegistered) {
        buttonHtml = `
          <button class="btn btn-outline-success w-100 disabled" disabled>
            <i class="bi bi-check-circle-fill me-1"></i> Already Registered
          </button>
        `;
      } else if (isCompleted) {
        buttonHtml = `
          <button class="btn btn-secondary w-100 disabled" disabled>
            <i class="bi bi-lock me-1"></i> Registration Closed
          </button>
        `;
      } else {
        buttonHtml = `
          <button class="btn btn-primary w-100" onclick="registerForTournament(${t.id})">
            <i class="bi bi-pencil-square me-1"></i> Register Now
          </button>
        `;
      }

      return `
        <div class="col-lg-4 col-md-6 mb-4">
          <div class="rp-card h-100 d-flex flex-column mb-0">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
              <span class="badge bg-light text-dark border px-2 py-1">${t.sport}</span>
              ${window.RedPointCommon.getStatusBadge(t.status)}
            </div>
            <div class="card-body flex-grow-1">
              <h5 class="fw-bold text-dark mb-2">${t.name}</h5>
              <p class="text-muted small mb-3" style="min-height: 40px;">
                ${t.description ? t.description : 'Official college championship tournament.'}
              </p>
              <ul class="list-unstyled small text-muted mb-0">
                <li class="mb-2"><i class="bi bi-geo-alt text-primary me-2"></i><strong>Venue:</strong> ${t.venue}</li>
                <li class="mb-2"><i class="bi bi-calendar-event text-primary me-2"></i><strong>Date:</strong> ${window.RedPointCommon.formatDate(t.event_date)}</li>
                <li class="mb-2"><i class="bi bi-hourglass-split text-danger me-2"></i><strong>Deadline:</strong> ${window.RedPointCommon.formatDate(t.registration_deadline)}</li>
              </ul>
            </div>
            <div class="card-footer bg-transparent border-top-0 pt-0 pb-3 px-3">
              ${buttonHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load tournaments.', 'danger');
  }
}

async function registerForTournament(tournamentId) {
  try {
    const res = await window.RedPointAPI.registrations.register(tournamentId);
    window.RedPointCommon.showToast(res.message || 'Registration Successful');
    loadParticipantTournaments();
  } catch (err) {
    if (err.data && err.data.alreadyRegistered) {
      window.RedPointCommon.showToast('You are already registered for this tournament.', 'warning');
    } else {
      window.RedPointCommon.showToast(err.message || 'Unable to register for tournament.', 'danger');
    }
  }
}

function initParticipantTournaments() {
  loadParticipantTournaments();
}

// --------------------------------------------------------------------------
// 3. MY REGISTRATIONS
// --------------------------------------------------------------------------
async function loadMyRegistrations() {
  try {
    const res = await window.RedPointAPI.registrations.getMy();
    const tbody = document.getElementById('my-registrations-table-body');
    if (!tbody) return;

    if (res.registrations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">You have not registered for any tournaments yet.</td></tr>';
      return;
    }

    tbody.innerHTML = res.registrations.map(r => `
      <tr>
        <td>
          <div class="fw-bold">${r.tournament_name}</div>
          <small class="text-muted">${r.description || ''}</small>
        </td>
        <td><span class="badge bg-light text-dark border">${r.sport}</span></td>
        <td>${window.RedPointCommon.formatDate(r.event_date)}</td>
        <td><small>${r.venue}</small></td>
        <td>${window.RedPointCommon.formatDate(r.registered_at)}</td>
        <td>${window.RedPointCommon.getStatusBadge(r.status)}</td>
        <td>
          ${r.status === 'UPCOMING' ? `
            <button class="btn btn-sm btn-outline-danger" title="Cancel Registration" onclick="cancelRegistration(${r.registration_id})">
              <i class="bi bi-x-circle me-1"></i> Cancel
            </button>
          ` : `
            <span class="text-muted small">Confirmed</span>
          `}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load registrations.', 'danger');
  }
}

async function cancelRegistration(id) {
  if (!confirm('Are you sure you want to cancel your registration for this tournament?')) return;

  try {
    const res = await window.RedPointAPI.registrations.cancel(id);
    window.RedPointCommon.showToast(res.message || 'Registration cancelled.');
    loadMyRegistrations();
  } catch (err) {
    window.RedPointCommon.showToast(err.message || 'Failed to cancel registration.', 'danger');
  }
}

function initParticipantRegistrations() {
  loadMyRegistrations();
}

// --------------------------------------------------------------------------
// 4. MATCH SCHEDULE
// --------------------------------------------------------------------------
let allScheduleMatches = [];

async function loadSchedule() {
  try {
    const sport = document.getElementById('filter-schedule-sport')?.value || 'ALL';
    const tournament = document.getElementById('filter-schedule-tournament')?.value || 'ALL';
    const status = document.getElementById('filter-schedule-status')?.value || 'ALL';
    const filterMyOnly = document.getElementById('filter-schedule-my-only')?.checked || false;

    const user = window.RedPointAuth.getUser();

    let filtered = [...allScheduleMatches];

    if (sport !== 'ALL') {
      filtered = filtered.filter(m => m.sport.toLowerCase() === sport.toLowerCase());
    }

    if (tournament !== 'ALL') {
      filtered = filtered.filter(m => String(m.tournament_id) === String(tournament));
    }

    if (status !== 'ALL') {
      filtered = filtered.filter(m => m.status === status);
    }

    if (filterMyOnly && user) {
      filtered = filtered.filter(m => m.participant_a === user.id || m.participant_b === user.id);
    }

    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No matches found for selected criteria.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(m => {
      const isMyMatch = user && (m.participant_a === user.id || m.participant_b === user.id);
      const rowClass = isMyMatch ? 'table-primary-subtle' : '';

      return `
        <tr class="${rowClass}">
          <td>
            <div class="fw-bold">${m.tournament_name}</div>
            <small class="badge bg-light text-dark border">${m.sport}</small>
          </td>
          <td><span class="badge bg-secondary">${m.category_name || 'General'}</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <span class="${user && m.participant_a === user.id ? 'fw-bold text-primary' : ''}">${m.player_a_name}</span>
              <span class="badge bg-dark rounded-pill px-2">VS</span>
              <span class="${user && m.participant_b === user.id ? 'fw-bold text-primary' : ''}">${m.player_b_name}</span>
            </div>
          </td>
          <td>${window.RedPointCommon.formatDate(m.match_date)}</td>
          <td><strong>${m.match_time}</strong></td>
          <td><small>${m.venue}</small></td>
          <td>${window.RedPointCommon.getStatusBadge(m.status)}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to filter schedule.', 'danger');
  }
}

async function initParticipantSchedule() {
  try {
    const res = await window.RedPointAPI.matches.getAll();
    allScheduleMatches = res.matches;

    // Populate tournament dropdown
    const tRes = await window.RedPointAPI.tournaments.getAll();
    const select = document.getElementById('filter-schedule-tournament');
    if (select) {
      select.innerHTML = '<option value="ALL">All Tournaments</option>' +
        tRes.tournaments.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    loadSchedule();

    document.getElementById('filter-schedule-sport')?.addEventListener('change', loadSchedule);
    document.getElementById('filter-schedule-tournament')?.addEventListener('change', loadSchedule);
    document.getElementById('filter-schedule-status')?.addEventListener('change', loadSchedule);
    document.getElementById('filter-schedule-my-only')?.addEventListener('change', loadSchedule);
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load match schedule.', 'danger');
  }
}

// --------------------------------------------------------------------------
// 5. RESULTS PAGE
// --------------------------------------------------------------------------
let allResultsData = [];

async function loadParticipantResults() {
  try {
    const search = document.getElementById('search-results')?.value.trim().toLowerCase() || '';
    const res = await window.RedPointAPI.results.getAll();
    allResultsData = res.results;

    let filtered = allResultsData;
    if (search) {
      filtered = allResultsData.filter(r =>
        r.tournament_name.toLowerCase().includes(search) ||
        r.sport.toLowerCase().includes(search) ||
        (r.category_name && r.category_name.toLowerCase().includes(search)) ||
        (r.player_a_name && r.player_a_name.toLowerCase().includes(search)) ||
        (r.player_b_name && r.player_b_name.toLowerCase().includes(search)) ||
        (r.winner_name && r.winner_name.toLowerCase().includes(search))
      );
    }

    const tbody = document.getElementById('results-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No completed match results found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(r => `
      <tr>
        <td>
          <div class="fw-bold">${r.tournament_name}</div>
          <small class="badge bg-light text-dark border">${r.sport}</small>
        </td>
        <td><span class="badge bg-secondary">${r.category_name || 'General'}</span></td>
        <td><strong>${r.player_a_name}</strong></td>
        <td>
          <span class="badge bg-dark fs-6 px-3 py-1">${r.score_a} - ${r.score_b}</span>
        </td>
        <td><strong>${r.player_b_name}</strong></td>
        <td>
          <span class="text-success fw-bold">
            <i class="bi bi-trophy-fill me-1"></i>${r.winner_name || 'Draw'}
          </span>
        </td>
        <td>${window.RedPointCommon.formatDate(r.match_date)}</td>
      </tr>
    `).join('');
  } catch (err) {
    window.RedPointCommon.showToast('Failed to load results.', 'danger');
  }
}

function initParticipantResults() {
  loadParticipantResults();
  document.getElementById('search-results')?.addEventListener('input', loadParticipantResults);
}

// --------------------------------------------------------------------------
// 6. LEADERBOARD
// --------------------------------------------------------------------------
async function loadParticipantLeaderboard(tournamentId = '') {
  try {
    const res = await window.RedPointAPI.leaderboard.get(tournamentId ? { tournament_id: tournamentId } : {});
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (res.leaderboard.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No match stats available for leaderboard.</td></tr>';
      return;
    }

    const currentUserId = window.RedPointAuth.getUser()?.id;

    tbody.innerHTML = res.leaderboard.map(item => {
      let rankBadge = `<span class="badge bg-secondary rounded-pill px-2">${item.rank}</span>`;
      if (item.rank === 1) rankBadge = `<span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-trophy-fill me-1"></i>1st</span>`;
      else if (item.rank === 2) rankBadge = `<span class="badge bg-secondary text-white px-2 py-1"><i class="bi bi-award-fill me-1"></i>2nd</span>`;
      else if (item.rank === 3) rankBadge = `<span class="badge bg-danger text-white px-2 py-1"><i class="bi bi-award me-1"></i>3rd</span>`;

      const isMe = currentUserId === item.user_id;

      return `
        <tr class="${isMe ? 'table-primary-subtle border-start border-primary border-4' : ''}">
          <td>${rankBadge}</td>
          <td>
            <div class="fw-bold">${item.participant_name} ${isMe ? '<span class="badge bg-primary ms-1">You</span>' : ''}</div>
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

async function initParticipantLeaderboard() {
  loadParticipantLeaderboard();

  // Populate tournament dropdown
  const tRes = await window.RedPointAPI.tournaments.getAll();
  const select = document.getElementById('filter-leaderboard-tournament');
  if (select) {
    select.innerHTML = '<option value="">All Tournaments (Combined)</option>' +
      tRes.tournaments.map(t => `<option value="${t.id}">${t.name} (${t.sport})</option>`).join('');

    select.addEventListener('change', () => {
      loadParticipantLeaderboard(select.value);
    });
  }
}

// --------------------------------------------------------------------------
// 7. PROFILE
// --------------------------------------------------------------------------
async function initParticipantProfile() {
  const user = window.RedPointAuth.getUser();
  if (user) {
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-role').textContent = user.role;
    document.getElementById('profile-avatar').textContent = user.name.charAt(0).toUpperCase();
  }

  const form = document.getElementById('changePasswordForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        window.RedPointCommon.showToast('New passwords do not match.', 'danger');
        return;
      }

      if (newPassword.length < 6) {
        window.RedPointCommon.showToast('Password must be at least 6 characters.', 'danger');
        return;
      }

      try {
        const res = await window.RedPointAPI.auth.changePassword(newPassword, currentPassword);
        window.RedPointCommon.showToast(res.message || 'Password updated successfully.');
        form.reset();
      } catch (err) {
        window.RedPointCommon.showToast(err.message || 'Failed to update password.', 'danger');
      }
    });
  }
}

window.RedPointParticipant = {
  initDashboard: initParticipantDashboard,
  initTournaments: initParticipantTournaments,
  initRegistrations: initParticipantRegistrations,
  initSchedule: initParticipantSchedule,
  initResults: initParticipantResults,
  initLeaderboard: initParticipantLeaderboard,
  initProfile: initParticipantProfile
};
