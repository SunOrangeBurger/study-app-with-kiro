// Group view component with tabs
import { api } from '../api';
import type { Group, ProgressEntry, CountdownData } from '../types';
import { getPriorityMap, getPriorityColor, getPriorityLabel } from '../priority';
import { CountdownManager } from '../countdown';
import { websocket } from '../websocket';

let currentGroup: Group | null = null;
let userProgress: ProgressEntry[] = [];
let completedConcepts: Set<string> = new Set();
let countdownManager: CountdownManager | null = null;
let currentTab: string = 'syllabus';

export function renderGroup(_groupId: string): string {
  return `
    <div class="main">
      <div class="container">
        <div id="group-header">
          <div class="loading">
            <div class="spinner"></div>
            <span style="margin-left: 1rem;">Loading group...</span>
          </div>
        </div>
        <div id="group-content" style="display: none;">
          <div class="tabs">
            <button class="tab active" data-tab="syllabus">Syllabus</button>
            <button class="tab" data-tab="tests">Tests</button>
            <button class="tab" data-tab="resources">Resources</button>
            <button class="tab" data-tab="members">Members</button>
          </div>
          <div id="countdown-container"></div>
          <div id="tab-content"></div>
        </div>
      </div>
    </div>
  `;
}

export async function setupGroup(groupId: string): Promise<void> {
  try {
    // Load group data and user progress
    const [group, progress] = await Promise.all([
      api.getGroup(groupId),
      api.getProgress(groupId)
    ]);

    currentGroup = group;
    userProgress = progress;
    completedConcepts = new Set(progress.map(p => p.concept));

    // Setup WebSocket
    websocket.joinGroup(groupId);
    websocket.on('progress_update', handleProgressUpdate);

    // Setup countdown manager
    countdownManager = new CountdownManager(group, completedConcepts);

    // Render group header
    renderGroupHeader();

    // Setup tabs
    setupTabs();

    // Show initial tab
    showTab('syllabus');

    // Show group content
    const groupContent = document.getElementById('group-content');
    if (groupContent) {
      groupContent.style.display = 'block';
    }

  } catch (error) {
    const headerDiv = document.getElementById('group-header');
    if (headerDiv) {
      headerDiv.innerHTML = `
        <div class="error">
          Failed to load group. Please try again.
        </div>
      `;
    }
  }
}

function renderGroupHeader(): void {
  if (!currentGroup) return;

  const headerDiv = document.getElementById('group-header');
  if (headerDiv) {
    headerDiv.innerHTML = `
      <h1 class="page-title">${currentGroup.name}</h1>
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="color: var(--text-secondary);">
          Invite Code: 
          <code style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; margin: 0 0.5rem;">${currentGroup.invite_code}</code>
          <button class="btn btn-small" id="copy-invite-btn">Copy</button>
        </span>
      </div>
    `;

    // Setup copy invite button
    const copyBtn = document.getElementById('copy-invite-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(currentGroup!.invite_code);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        } catch (error) {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = currentGroup!.invite_code;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        }
      });
    }
  }
}

function setupTabs(): void {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = (e.target as HTMLElement).dataset.tab;
      if (tabName) {
        showTab(tabName);
      }
    });
  });
}

function showTab(tabName: string): void {
  currentTab = tabName;

  // Update tab buttons
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', (tab as HTMLElement).dataset.tab === tabName);
  });

  // Update countdown visibility
  const countdownContainer = document.getElementById('countdown-container');
  if (countdownContainer) {
    if (tabName === 'syllabus' || tabName === 'tests') {
      startCountdown();
    } else {
      stopCountdown();
      countdownContainer.innerHTML = '';
    }
  }

  // Render tab content
  const tabContent = document.getElementById('tab-content');
  if (tabContent) {
    switch (tabName) {
      case 'syllabus':
        tabContent.innerHTML = renderSyllabusTab();
        setupSyllabusTab();
        break;
      case 'tests':
        tabContent.innerHTML = renderTestsTab();
        setupTestsTab();
        break;
      case 'resources':
        tabContent.innerHTML = renderResourcesTab();
        setupResourcesTab();
        break;
      case 'members':
        tabContent.innerHTML = renderMembersTab();
        break;
    }
  }
}

function startCountdown(): void {
  if (!countdownManager) return;

  const countdownContainer = document.getElementById('countdown-container');
  if (!countdownContainer) return;

  countdownManager.start((data: CountdownData | null) => {
    if (data) {
      countdownContainer.innerHTML = renderCountdownWidget(data);
      setupCountdownWidget(data);
    } else {
      countdownContainer.innerHTML = '';
    }
  });
}

function stopCountdown(): void {
  if (countdownManager) {
    countdownManager.stop();
  }
}

function renderCountdownWidget(data: CountdownData): string {
  const timeRemaining = CountdownManager.formatTimeRemaining(data);
  const message = CountdownManager.formatCountdown(data);

  return `
    <div class="countdown-widget">
      <div class="countdown-title">${data.test.name} (${data.test.type})</div>
      <div class="countdown-time">${timeRemaining}</div>
      <div class="countdown-message">${message}</div>
      ${data.urgentTopics.length > 0 ? `
        <div class="urgent-topics">
          <h4>Priority Topics to Review:</h4>
          ${data.urgentTopics.map(topic => `
            <div class="urgent-topic-item">
              <div class="neon-checkbox">
                <input type="checkbox" id="urgent-${topic}" data-concept="${findConceptKey(topic)}">
                <label class="neon-checkbox-label" for="urgent-${topic}">${topic}</label>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function setupCountdownWidget(_data: CountdownData): void {
  // Setup urgent topic checkboxes
  const urgentCheckboxes = document.querySelectorAll('#countdown-container input[type="checkbox"]');
  urgentCheckboxes.forEach(checkbox => {
    const conceptKey = (checkbox as HTMLInputElement).dataset.concept;
    if (conceptKey) {
      (checkbox as HTMLInputElement).checked = completedConcepts.has(conceptKey);
      
      checkbox.addEventListener('change', async (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        await updateProgress(conceptKey, isChecked);
      });
    }
  });
}

function renderSyllabusTab(): string {
  if (!currentGroup) return '';

  const priorityMap = getPriorityMap(currentGroup, userProgress);

  return `
    <div class="syllabus-tree">
      ${currentGroup.syllabus.map(subject => `
        <div class="subject-item">
          <div class="subject-header">${subject.subject_name}</div>
          ${subject.units.map(unit => `
            <div class="unit-item">
              <div class="unit-header">${unit.unit_name}</div>
              ${unit.concepts.map(concept => {
                const conceptKey = `${subject.subject_name}||${unit.unit_name}||${concept}`;
                const priority = priorityMap[conceptKey];
                const priorityClass = priority ? `priority-${priority.replace('-', '-')}` : '';
                const isCompleted = completedConcepts.has(conceptKey);
                
                return `
                  <div class="concept-item ${priorityClass}">
                    <div class="neon-checkbox">
                      <input type="checkbox" id="concept-${conceptKey}" data-concept="${conceptKey}" ${isCompleted ? 'checked' : ''}>
                      <label class="neon-checkbox-label" for="concept-${conceptKey}">
                        ${concept}
                        ${priority ? `<span style="color: ${getPriorityColor(priority)}; margin-left: 0.5rem; font-size: 0.8rem;">(${getPriorityLabel(priority)})</span>` : ''}
                      </label>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function setupSyllabusTab(): void {
  const checkboxes = document.querySelectorAll('#tab-content input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const conceptKey = (e.target as HTMLInputElement).dataset.concept;
      const isChecked = (e.target as HTMLInputElement).checked;
      
      if (conceptKey) {
        await updateProgress(conceptKey, isChecked);
      }
    });
  });
}

function renderTestsTab(): string {
  if (!currentGroup) return '';

  return `
    <div>
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 2rem;">
        <h2>Upcoming Tests</h2>
        <button class="btn btn-secondary" id="add-test-btn">Add Test</button>
      </div>
      ${currentGroup.tests.length === 0 ? `
        <div class="card">
          <div class="card-content" style="text-align: center;">
            <p>No tests scheduled yet.</p>
          </div>
        </div>
      ` : `
        ${currentGroup.tests.map(test => `
          <div class="card">
            <div class="card-title">${test.name} (${test.type})</div>
            <div class="card-content">
              <p><strong>Date:</strong> ${new Date(test.date).toLocaleDateString()}</p>
              <p><strong>Subject:</strong> ${test.subject_name}</p>
              <p><strong>Portion:</strong> ${test.portion}</p>
              <p><strong>Topics:</strong> ${test.covered_topics.join(', ')}</p>
            </div>
          </div>
        `).join('')}
      `}
    </div>
  `;
}

function setupTestsTab(): void {
  // Add test functionality would go here
  // For now, just a placeholder
  console.log('Tests tab setup complete');
}

function renderResourcesTab(): string {
  if (!currentGroup) return '';

  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Study Resources</h2>
        <button class="btn btn-secondary" id="add-resource-btn">Add Resource</button>
      </div>
      ${currentGroup.resources.length === 0 ? `
        <div class="card">
          <div class="card-content" style="text-align: center;">
            <p>No resources shared yet.</p>
          </div>
        </div>
      ` : `
        ${currentGroup.resources.map(resource => `
          <div class="card">
            <div class="card-title">${resource.title}</div>
            <div class="card-content">
              <p>${resource.description}</p>
              <p><strong>Type:</strong> ${resource.type}</p>
              <p><strong>Added by:</strong> ${resource.added_by}</p>
              <a href="${resource.link}" target="_blank" class="btn btn-small">View Resource</a>
            </div>
          </div>
        `).join('')}
      `}
    </div>
  `;
}

function setupResourcesTab(): void {
  // Add resource functionality would go here
  // For now, just a placeholder
  console.log('Resources tab setup complete');
}

function renderMembersTab(): string {
  if (!currentGroup) return '';

  return `
    <div>
      <h2>Group Members</h2>
      <div class="card">
        <div class="card-content">
          <p><strong>Total Members:</strong> ${currentGroup.members.length}</p>
          <p>Member management features coming soon...</p>
        </div>
      </div>
    </div>
  `;
}

async function updateProgress(conceptKey: string, isCompleted: boolean): Promise<void> {
  if (!currentGroup) return;

  try {
    await api.updateProgress(currentGroup._id, conceptKey, isCompleted);
    
    // Update local state
    if (isCompleted) {
      completedConcepts.add(conceptKey);
      userProgress.push({ concept: conceptKey, at: new Date() });
    } else {
      completedConcepts.delete(conceptKey);
      userProgress = userProgress.filter(p => p.concept !== conceptKey);
    }

    // Update countdown manager
    if (countdownManager) {
      countdownManager.updateCompletedConcepts(completedConcepts);
    }

    // Re-render current tab to update priorities
    if (currentTab === 'syllabus') {
      const tabContent = document.getElementById('tab-content');
      if (tabContent) {
        tabContent.innerHTML = renderSyllabusTab();
        setupSyllabusTab();
      }
    }

  } catch (error) {
    console.error('Failed to update progress:', error);
    // Revert checkbox state on error
    const checkbox = document.querySelector(`input[data-concept="${conceptKey}"]`) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !isCompleted;
    }
  }
}

function handleProgressUpdate(_data: any): void {
  // Handle real-time progress updates from other users
  console.log('Progress update received');
  // Could show notifications or update UI here
}

function findConceptKey(conceptName: string): string | null {
  if (!currentGroup) return null;

  for (const subject of currentGroup.syllabus) {
    for (const unit of subject.units) {
      for (const concept of unit.concepts) {
        if (concept === conceptName) {
          return `${subject.subject_name}||${unit.unit_name}||${concept}`;
        }
      }
    }
  }
  return null;
}

// Cleanup function
export function cleanupGroup(): void {
  if (countdownManager) {
    countdownManager.stop();
    countdownManager = null;
  }
  
  if (currentGroup) {
    websocket.leaveGroup(currentGroup._id);
  }
  
  websocket.off('progress_update', handleProgressUpdate);
  
  currentGroup = null;
  userProgress = [];
  completedConcepts.clear();
}