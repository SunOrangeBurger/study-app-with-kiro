// Dashboard component
import { api } from '../api';
import type { Group } from '../types';
import { router } from '../router';

export function renderDashboard(): string {
  return `
    <div class="main">
      <div class="container">
        <h1 class="page-title">Your Study Groups</h1>
        <div id="groups-container">
          <div class="loading">
            <div class="spinner"></div>
            <span style="margin-left: 1rem;">Loading your groups...</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="/create-group" class="btn">Create New Group</a>
          <a href="/join-group" class="btn btn-secondary" style="margin-left: 1rem;">Join Group</a>
        </div>
      </div>
    </div>
  `;
}

export async function setupDashboard(): Promise<void> {
  const container = document.getElementById('groups-container');
  if (!container) return;

  try {
    const groups = await api.getUserGroups();
    
    if (groups.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center;">
          <div class="card-content">
            <h3>No Groups Yet</h3>
            <p>Create your first study group or join an existing one to get started!</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = groups.map(group => renderGroupCard(group)).join('');
    setupGroupCards();
  } catch (error) {
    container.innerHTML = `
      <div class="error">
        Failed to load groups. Please try again.
      </div>
    `;
  }
}

function renderGroupCard(group: Group): string {
  const memberCount = group.members.length;
  const testCount = group.tests.length;
  const resourceCount = group.resources.length;

  return `
    <div class="card group-card" data-group-id="${group._id}">
      <div class="card-title">${group.name}</div>
      <div class="card-content">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <span><strong>${memberCount}</strong> members</span>
          <span><strong>${testCount}</strong> tests</span>
          <span><strong>${resourceCount}</strong> resources</span>
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>Invite Code:</strong> 
          <code style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">${group.invite_code}</code>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-small enter-group-btn" data-group-id="${group._id}">Enter Group</button>
          <button class="btn btn-secondary btn-small copy-invite-btn" data-invite-code="${group.invite_code}">Copy Invite</button>
        </div>
      </div>
    </div>
  `;
}

function setupGroupCards(): void {
  // Enter group buttons
  const enterButtons = document.querySelectorAll('.enter-group-btn');
  enterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const groupId = (e.target as HTMLElement).dataset.groupId;
      if (groupId) {
        router.navigate(`/group/${groupId}`);
      }
    });
  });

  // Copy invite buttons
  const copyButtons = document.querySelectorAll('.copy-invite-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const inviteCode = (e.target as HTMLElement).dataset.inviteCode;
      if (inviteCode) {
        try {
          await navigator.clipboard.writeText(inviteCode);
          const originalText = (e.target as HTMLElement).textContent;
          (e.target as HTMLElement).textContent = 'Copied!';
          setTimeout(() => {
            (e.target as HTMLElement).textContent = originalText;
          }, 2000);
        } catch (error) {
          // Fallback for browsers that don't support clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = inviteCode;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          const originalText = (e.target as HTMLElement).textContent;
          (e.target as HTMLElement).textContent = 'Copied!';
          setTimeout(() => {
            (e.target as HTMLElement).textContent = originalText;
          }, 2000);
        }
      }
    });
  });
}