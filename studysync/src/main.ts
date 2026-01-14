// StudySync Main Application
import './style.css';
import { AuthManager } from './auth';
import { websocket } from './websocket';
import { renderHeader, setupHeader } from './components/header';
import { renderLoginPage, renderRegisterPage, setupLoginForm, setupRegisterForm } from './components/auth';
import { renderDashboard, setupDashboard } from './components/dashboard';
import { renderCreateGroup, setupCreateGroup } from './components/create-group';
import { renderJoinGroup, setupJoinGroup } from './components/join-group';
import { renderGroup, setupGroup, cleanupGroup } from './components/group';

class StudySyncApp {
  private currentGroupId: string | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      console.log('🚀 Initializing StudySync App...');
      
      // Setup navigation event listeners
      this.setupNavigation();
      
      // Handle initial route
      await this.handleCurrentRoute();
      
      console.log('✅ StudySync App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      // Fallback to login page
      this.showLoginPage();
    }
  }

  private setupNavigation(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleCurrentRoute();
    });

    // Handle link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });
  }

  private navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.handleCurrentRoute();
  }

  private async handleCurrentRoute(): Promise<void> {
    const path = window.location.pathname;
    console.log('🔄 Handling route:', path);

    try {
      // Handle dynamic group routes
      const groupMatch = path.match(/^\/group\/(.+)$/);
      if (groupMatch) {
        await this.showGroupPage(groupMatch[1]);
        return;
      }

      // Handle static routes
      switch (path) {
        case '/':
          await this.handleHome();
          break;
        case '/login':
          this.showLoginPage();
          break;
        case '/register':
          this.showRegisterPage();
          break;
        case '/dashboard':
          await this.showDashboard();
          break;
        case '/create-group':
          await this.showCreateGroup();
          break;
        case '/join-group':
          await this.showJoinGroup();
          break;
        default:
          this.showLoginPage();
          break;
      }
    } catch (error) {
      console.error('❌ Route handling error:', error);
      this.showLoginPage();
    }
  }

  private async handleHome(): Promise<void> {
    if (AuthManager.isAuthenticated()) {
      this.navigate('/dashboard');
    } else {
      this.navigate('/login');
    }
  }

  private showLoginPage(): void {
    console.log('📝 Showing login page');
    this.render('', renderLoginPage());
    setupLoginForm();
    this.setupLoginNavigation();
  }

  private showRegisterPage(): void {
    console.log('📝 Showing register page');
    this.render('', renderRegisterPage());
    setupRegisterForm();
    this.setupRegisterNavigation();
  }

  private async showDashboard(): Promise<void> {
    if (!AuthManager.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    console.log('📊 Showing dashboard');
    this.render(renderHeader(), renderDashboard());
    setupHeader();
    await setupDashboard();
    this.setupHeaderNavigation();
  }

  private async showCreateGroup(): Promise<void> {
    if (!AuthManager.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    console.log('➕ Showing create group page');
    this.render(renderHeader(), renderCreateGroup());
    setupHeader();
    setupCreateGroup();
    this.setupHeaderNavigation();
  }

  private async showJoinGroup(): Promise<void> {
    if (!AuthManager.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    console.log('🔗 Showing join group page');
    this.render(renderHeader(), renderJoinGroup());
    setupHeader();
    setupJoinGroup();
    this.setupHeaderNavigation();
  }

  private async showGroupPage(groupId: string): Promise<void> {
    if (!AuthManager.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    console.log('👥 Showing group page:', groupId);

    // Cleanup previous group if switching
    if (this.currentGroupId && this.currentGroupId !== groupId) {
      cleanupGroup();
    }

    this.currentGroupId = groupId;
    this.render(renderHeader(), renderGroup(groupId));
    setupHeader();
    await setupGroup(groupId);
    this.setupHeaderNavigation();
  }

  private setupLoginNavigation(): void {
    // Override form submission to use navigation
    const form = document.getElementById('login-form') as HTMLFormElement;
    if (form) {
      const originalHandler = form.onsubmit;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
          const success = await AuthManager.login(username, password);
          if (success) {
            websocket.connect();
            this.navigate('/dashboard');
          } else {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
              errorDiv.textContent = 'Invalid username or password';
              errorDiv.style.display = 'block';
            }
          }
        } catch (error) {
          const errorDiv = document.getElementById('login-error');
          if (errorDiv) {
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
          }
        }
      });
    }
  }

  private setupRegisterNavigation(): void {
    const form = document.getElementById('register-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirm-password') as string;

        const errorDiv = document.getElementById('register-error');
        const successDiv = document.getElementById('register-success');

        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';

        if (password !== confirmPassword) {
          if (errorDiv) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
          }
          return;
        }

        try {
          const success = await AuthManager.register(username, password);
          if (success) {
            if (successDiv) {
              successDiv.textContent = 'Registration successful! You can now login.';
              successDiv.style.display = 'block';
            }
            form.reset();
            setTimeout(() => this.navigate('/login'), 2000);
          } else {
            if (errorDiv) {
              errorDiv.textContent = 'Registration failed. Username may already exist.';
              errorDiv.style.display = 'block';
            }
          }
        } catch (error) {
          if (errorDiv) {
            errorDiv.textContent = 'Registration failed. Please try again.';
            errorDiv.style.display = 'block';
          }
        }
      });
    }
  }

  private setupHeaderNavigation(): void {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await AuthManager.logout();
        websocket.disconnect();
        this.navigate('/login');
      });
    }
  }

  private render(header: string, content: string): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = header + content;
      console.log('✅ Page rendered successfully');
    } else {
      console.error('❌ App container not found');
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM loaded, starting StudySync...');
  new StudySyncApp();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // DOMContentLoaded will fire
} else {
  // DOM is already ready
  console.log('🌟 DOM already ready, starting StudySync...');
  new StudySyncApp();
}