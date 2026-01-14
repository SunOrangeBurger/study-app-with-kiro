// Join Group component
import { api } from '../api';
import { router } from '../router';

export function renderJoinGroup(): string {
  return `
    <div class="main">
      <div class="container">
        <h1 class="page-title">Join Study Group</h1>
        <form class="form" id="join-group-form">
          <div class="form-group">
            <label class="form-label" for="invite-code">Invite Code</label>
            <input class="form-input" type="text" id="invite-code" name="invite-code" placeholder="Enter the group invite code" required>
            <small style="color: var(--text-muted); margin-top: 0.5rem; display: block;">
              Ask your group admin for the invite code to join their study group.
            </small>
          </div>
          <button class="btn btn-full" type="submit">Join Group</button>
          <div class="form-group" style="text-align: center; margin-top: 1rem;">
            <a href="/dashboard" class="nav-link">Back to Dashboard</a>
          </div>
          <div id="join-group-error" class="error" style="display: none;"></div>
          <div id="join-group-success" class="success" style="display: none;"></div>
        </form>
      </div>
    </div>
  `;
}

export function setupJoinGroup(): void {
  const form = document.getElementById('join-group-form') as HTMLFormElement;
  const errorDiv = document.getElementById('join-group-error') as HTMLDivElement;
  const successDiv = document.getElementById('join-group-success') as HTMLDivElement;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';

      const formData = new FormData(form);
      const inviteCode = formData.get('invite-code') as string;

      if (!inviteCode.trim()) {
        errorDiv.textContent = 'Please enter an invite code.';
        errorDiv.style.display = 'block';
        return;
      }

      try {
        const result = await api.joinGroup(inviteCode.trim());
        if (result.success) {
          successDiv.textContent = 'Successfully joined the group! Redirecting...';
          successDiv.style.display = 'block';
          setTimeout(() => {
            router.navigate(`/group/${result.group_id}`);
          }, 2000);
        }
      } catch (error) {
        errorDiv.textContent = 'Failed to join group. Please check the invite code and try again.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // Setup back link
  const backLink = document.querySelector('a[href="/dashboard"]');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/dashboard');
    });
  }
}