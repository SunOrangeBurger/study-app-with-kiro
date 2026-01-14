// Header component
import { AuthManager } from '../auth';
import { router } from '../router';

export function renderHeader(): string {
  const username = AuthManager.getUsername();
  const currentRoute = router.getCurrentRoute();

  if (!AuthManager.isAuthenticated()) {
    return '';
  }

  return `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">StudySync</div>
          <nav class="nav">
            <a href="/dashboard" class="nav-link ${currentRoute === '/dashboard' ? 'active' : ''}">Dashboard</a>
            <a href="/create-group" class="nav-link ${currentRoute === '/create-group' ? 'active' : ''}">Create Group</a>
            <a href="/join-group" class="nav-link ${currentRoute === '/join-group' ? 'active' : ''}">Join Group</a>
          </nav>
          <div class="user-info">
            <span>Welcome, ${username}</span>
            <button class="logout-btn" id="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function setupHeader(): void {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await AuthManager.logout();
      router.navigate('/login');
    });
  }

  // Setup navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute('href');
      if (href) {
        router.navigate(href);
      }
    });
  });
}