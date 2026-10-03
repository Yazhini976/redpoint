/**
 * RedPoint - Common Utilities & UI Helpers
 */

// Show modern Bootstrap toast
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const toastId = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success text-white' :
                  type === 'danger' || type === 'error' ? 'bg-danger text-white' :
                  type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

  const icon = type === 'success' ? 'bi-check-circle-fill' :
               type === 'danger' || type === 'error' ? 'bi-exclamation-triangle-fill' :
               type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHtml);
  const toastElem = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastElem, { delay: 4000 });
  bsToast.show();

  toastElem.addEventListener('hidden.bs.toast', () => {
    toastElem.remove();
  });
}

// Format date string to readable format (e.g. 15 Oct 2026)
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Format status badge HTML
function getStatusBadge(status) {
  if (!status) return '';
  const s = status.toUpperCase();
  if (s === 'UPCOMING') {
    return `<span class="badge-status badge-upcoming"><i class="bi bi-calendar-event"></i> Upcoming</span>`;
  } else if (s === 'ONGOING') {
    return `<span class="badge-status badge-ongoing"><i class="bi bi-play-circle"></i> Ongoing</span>`;
  } else if (s === 'COMPLETED') {
    return `<span class="badge-status badge-completed"><i class="bi bi-check-circle"></i> Completed</span>`;
  } else if (s === 'SCHEDULED') {
    return `<span class="badge-status badge-scheduled"><i class="bi bi-clock"></i> Scheduled</span>`;
  }
  return `<span class="badge bg-secondary">${status}</span>`;
}

// Setup common layout (sidebar, header, mobile toggle, user info, active link)
function setupLayout(activePage, role = 'ADMIN') {
  // Mobile sidebar toggle
  const toggleBtn = document.querySelector('.header-toggle-btn');
  const sidebar = document.querySelector('.app-sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (toggleBtn && sidebar) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });
  }

  // Populate user info in sidebar & header
  const user = window.RedPointAuth.getUser();
  if (user) {
    const userNameEls = document.querySelectorAll('.js-user-name');
    userNameEls.forEach(el => { el.textContent = user.name; });

    const userEmailEls = document.querySelectorAll('.js-user-email');
    userEmailEls.forEach(el => { el.textContent = user.email; });

    const userAvatarEls = document.querySelectorAll('.js-user-avatar');
    userAvatarEls.forEach(el => {
      el.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    });
  }

  // Logout button bindings
  const logoutBtns = document.querySelectorAll('.js-logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.RedPointAuth.logout();
    });
  });

  // Active navigation highlight
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === activePage) {
      link.classList.add('active');
    }
  });
}

window.RedPointCommon = {
  showToast,
  formatDate,
  getStatusBadge,
  setupLayout
};
