// Authentication components
import { AuthManager } from '../auth';

export function renderLoginPage(): string {
  return `
    <div class="main">
      <div class="container">
        <h1 class="page-title">Welcome to StudySync</h1>
        <form class="form" id="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input class="form-input" type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input class="form-input" type="password" id="password" name="password" required>
          </div>
          <button class="btn btn-full" type="submit">Login</button>
          <div class="form-group" style="text-align: center; margin-top: 1rem;">
            <a href="/register" class="nav-link">Don't have an account? Register</a>
          </div>
          <div id="login-error" class="error" style="display: none;"></div>
        </form>
      </div>
    </div>
  `;
}

export function renderRegisterPage(): string {
  return `
    <div class="main">
      <div class="container">
        <h1 class="page-title">Join StudySync</h1>
        <form class="form" id="register-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input class="form-input" type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input class="form-input" type="password" id="password" name="password" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="confirm-password">Confirm Password</label>
            <input class="form-input" type="password" id="confirm-password" name="confirm-password" required>
          </div>
          <button class="btn btn-full" type="submit">Register</button>
          <div class="form-group" style="text-align: center; margin-top: 1rem;">
            <a href="/login" class="nav-link">Already have an account? Login</a>
          </div>
          <div id="register-error" class="error" style="display: none;"></div>
          <div id="register-success" class="success" style="display: none;"></div>
        </form>
      </div>
    </div>
  `;
}

export function setupLoginForm(): void {
  console.log('🔧 Setting up login form');
  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorDiv = document.getElementById('login-error') as HTMLDivElement;

  if (!form) {
    console.error('❌ Login form not found');
    return;
  }

  // Note: Form submission is now handled in main.ts
  console.log('✅ Login form setup complete');
}

export function setupRegisterForm(): void {
  console.log('🔧 Setting up register form');
  const form = document.getElementById('register-form') as HTMLFormElement;

  if (!form) {
    console.error('❌ Register form not found');
    return;
  }

  // Note: Form submission is now handled in main.ts
  console.log('✅ Register form setup complete');
}