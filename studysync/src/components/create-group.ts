// Create Group component
import { api } from '../api';
import type { Subject } from '../types';
import { router } from '../router';

export function renderCreateGroup(): string {
  return `
    <div class="main">
      <div class="container">
        <h1 class="page-title">Create Study Group</h1>
        <form class="form" id="create-group-form" style="max-width: 800px;">
          <div class="form-group">
            <label class="form-label" for="group-name">Group Name</label>
            <input class="form-input" type="text" id="group-name" name="group-name" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Syllabus</label>
            <div id="syllabus-builder">
              <div class="subject-builder" data-subject-index="0">
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                  <input class="form-input subject-name" placeholder="Subject Name (e.g., Physics)" required style="flex: 1;">
                  <button type="button" class="btn btn-danger btn-small remove-subject-btn" style="display: none;">Remove Subject</button>
                </div>
                <div class="units-container">
                  <div class="unit-builder" data-unit-index="0">
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; margin-left: 2rem;">
                      <input class="form-input unit-name" placeholder="Unit Name (e.g., Mechanics)" required style="flex: 1;">
                      <button type="button" class="btn btn-danger btn-small remove-unit-btn" style="display: none;">Remove Unit</button>
                    </div>
                    <div class="concepts-container" style="margin-left: 4rem;">
                      <div class="concept-builder" data-concept-index="0">
                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                          <input class="form-input concept-name" placeholder="Concept Name (e.g., Newton's Laws)" required style="flex: 1;">
                          <button type="button" class="btn btn-danger btn-small remove-concept-btn" style="display: none;">Remove</button>
                        </div>
                      </div>
                      <button type="button" class="btn btn-secondary btn-small add-concept-btn">Add Concept</button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-secondary btn-small add-unit-btn" style="margin-left: 2rem; margin-top: 0.5rem;">Add Unit</button>
                </div>
              </div>
              <button type="button" class="btn btn-secondary add-subject-btn" style="margin-top: 1rem;">Add Subject</button>
            </div>
          </div>
          
          <button class="btn btn-full" type="submit">Create Group</button>
          <div id="create-group-error" class="error" style="display: none;"></div>
          <div id="create-group-success" class="success" style="display: none;"></div>
        </form>
      </div>
    </div>
  `;
}

export function setupCreateGroup(): void {
  setupSyllabusBuilder();
  setupCreateGroupForm();
}

function setupSyllabusBuilder(): void {
  const syllabusBuilder = document.getElementById('syllabus-builder');
  if (!syllabusBuilder) return;

  // Add Subject button
  const addSubjectBtn = syllabusBuilder.querySelector('.add-subject-btn');
  addSubjectBtn?.addEventListener('click', () => {
    const subjectIndex = syllabusBuilder.querySelectorAll('.subject-builder').length;
    const subjectHtml = createSubjectBuilder(subjectIndex);
    addSubjectBtn.insertAdjacentHTML('beforebegin', subjectHtml);
    updateRemoveButtons();
    setupNewSubjectEvents(subjectIndex);
  });

  // Setup initial events
  setupSubjectEvents(0);
  updateRemoveButtons();
}

function createSubjectBuilder(subjectIndex: number): string {
  return `
    <div class="subject-builder" data-subject-index="${subjectIndex}">
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
        <input class="form-input subject-name" placeholder="Subject Name (e.g., Physics)" required style="flex: 1;">
        <button type="button" class="btn btn-danger btn-small remove-subject-btn">Remove Subject</button>
      </div>
      <div class="units-container">
        <div class="unit-builder" data-unit-index="0">
          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; margin-left: 2rem;">
            <input class="form-input unit-name" placeholder="Unit Name (e.g., Mechanics)" required style="flex: 1;">
            <button type="button" class="btn btn-danger btn-small remove-unit-btn" style="display: none;">Remove Unit</button>
          </div>
          <div class="concepts-container" style="margin-left: 4rem;">
            <div class="concept-builder" data-concept-index="0">
              <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                <input class="form-input concept-name" placeholder="Concept Name (e.g., Newton's Laws)" required style="flex: 1;">
                <button type="button" class="btn btn-danger btn-small remove-concept-btn" style="display: none;">Remove</button>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-small add-concept-btn">Add Concept</button>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-small add-unit-btn" style="margin-left: 2rem; margin-top: 0.5rem;">Add Unit</button>
      </div>
    </div>
  `;
}

function setupNewSubjectEvents(subjectIndex: number): void {
  setupSubjectEvents(subjectIndex);
}

function setupSubjectEvents(subjectIndex: number): void {
  const subjectBuilder = document.querySelector(`[data-subject-index="${subjectIndex}"]`);
  if (!subjectBuilder) return;

  // Remove subject button
  const removeSubjectBtn = subjectBuilder.querySelector('.remove-subject-btn');
  removeSubjectBtn?.addEventListener('click', () => {
    subjectBuilder.remove();
    updateRemoveButtons();
  });

  // Add unit button
  const addUnitBtn = subjectBuilder.querySelector('.add-unit-btn');
  addUnitBtn?.addEventListener('click', () => {
    const unitsContainer = subjectBuilder.querySelector('.units-container');
    const unitIndex = unitsContainer?.querySelectorAll('.unit-builder').length || 0;
    const unitHtml = createUnitBuilder(unitIndex);
    addUnitBtn.insertAdjacentHTML('beforebegin', unitHtml);
    updateRemoveButtons();
    setupNewUnitEvents(subjectBuilder, unitIndex);
  });

  // Setup initial unit events
  setupUnitEvents(subjectBuilder, 0);
}

function createUnitBuilder(unitIndex: number): string {
  return `
    <div class="unit-builder" data-unit-index="${unitIndex}">
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; margin-left: 2rem;">
        <input class="form-input unit-name" placeholder="Unit Name (e.g., Mechanics)" required style="flex: 1;">
        <button type="button" class="btn btn-danger btn-small remove-unit-btn">Remove Unit</button>
      </div>
      <div class="concepts-container" style="margin-left: 4rem;">
        <div class="concept-builder" data-concept-index="0">
          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
            <input class="form-input concept-name" placeholder="Concept Name (e.g., Newton's Laws)" required style="flex: 1;">
            <button type="button" class="btn btn-danger btn-small remove-concept-btn" style="display: none;">Remove</button>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-small add-concept-btn">Add Concept</button>
      </div>
    </div>
  `;
}

function setupNewUnitEvents(subjectBuilder: Element, unitIndex: number): void {
  setupUnitEvents(subjectBuilder, unitIndex);
}

function setupUnitEvents(subjectBuilder: Element, unitIndex: number): void {
  const unitBuilder = subjectBuilder.querySelector(`[data-unit-index="${unitIndex}"]`);
  if (!unitBuilder) return;

  // Remove unit button
  const removeUnitBtn = unitBuilder.querySelector('.remove-unit-btn');
  removeUnitBtn?.addEventListener('click', () => {
    unitBuilder.remove();
    updateRemoveButtons();
  });

  // Add concept button
  const addConceptBtn = unitBuilder.querySelector('.add-concept-btn');
  addConceptBtn?.addEventListener('click', () => {
    const conceptsContainer = unitBuilder.querySelector('.concepts-container');
    const conceptIndex = conceptsContainer?.querySelectorAll('.concept-builder').length || 0;
    const conceptHtml = createConceptBuilder(conceptIndex);
    addConceptBtn.insertAdjacentHTML('beforebegin', conceptHtml);
    updateRemoveButtons();
    setupNewConceptEvents(unitBuilder, conceptIndex);
  });

  // Setup initial concept events
  setupConceptEvents(unitBuilder, 0);
}

function createConceptBuilder(conceptIndex: number): string {
  return `
    <div class="concept-builder" data-concept-index="${conceptIndex}">
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
        <input class="form-input concept-name" placeholder="Concept Name (e.g., Newton's Laws)" required style="flex: 1;">
        <button type="button" class="btn btn-danger btn-small remove-concept-btn">Remove</button>
      </div>
    </div>
  `;
}

function setupNewConceptEvents(unitBuilder: Element, conceptIndex: number): void {
  setupConceptEvents(unitBuilder, conceptIndex);
}

function setupConceptEvents(unitBuilder: Element, conceptIndex: number): void {
  const conceptBuilder = unitBuilder.querySelector(`[data-concept-index="${conceptIndex}"]`);
  if (!conceptBuilder) return;

  // Remove concept button
  const removeConceptBtn = conceptBuilder.querySelector('.remove-concept-btn');
  removeConceptBtn?.addEventListener('click', () => {
    conceptBuilder.remove();
    updateRemoveButtons();
  });
}

function updateRemoveButtons(): void {
  const syllabusBuilder = document.getElementById('syllabus-builder');
  if (!syllabusBuilder) return;

  // Update subject remove buttons
  const subjects = syllabusBuilder.querySelectorAll('.subject-builder');
  subjects.forEach((subject) => {
    const removeBtn = subject.querySelector('.remove-subject-btn') as HTMLElement;
    if (removeBtn) {
      removeBtn.style.display = subjects.length > 1 ? 'block' : 'none';
    }
  });

  // Update unit remove buttons
  subjects.forEach(subject => {
    const units = subject.querySelectorAll('.unit-builder');
    units.forEach((unit) => {
      const removeBtn = unit.querySelector('.remove-unit-btn') as HTMLElement;
      if (removeBtn) {
        removeBtn.style.display = units.length > 1 ? 'block' : 'none';
      }
    });
  });

  // Update concept remove buttons
  const units = syllabusBuilder.querySelectorAll('.unit-builder');
  units.forEach(unit => {
    const concepts = unit.querySelectorAll('.concept-builder');
    concepts.forEach((concept) => {
      const removeBtn = concept.querySelector('.remove-concept-btn') as HTMLElement;
      if (removeBtn) {
        removeBtn.style.display = concepts.length > 1 ? 'block' : 'none';
      }
    });
  });
}

function setupCreateGroupForm(): void {
  const form = document.getElementById('create-group-form') as HTMLFormElement;
  const errorDiv = document.getElementById('create-group-error') as HTMLDivElement;
  const successDiv = document.getElementById('create-group-success') as HTMLDivElement;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';

      try {
        const formData = new FormData(form);
        const groupName = formData.get('group-name') as string;
        const syllabus = extractSyllabusData();

        if (syllabus.length === 0) {
          errorDiv.textContent = 'Please add at least one subject with units and concepts.';
          errorDiv.style.display = 'block';
          return;
        }

        const result = await api.createGroup(groupName, syllabus);
        if (result.success) {
          successDiv.textContent = 'Group created successfully! Redirecting...';
          successDiv.style.display = 'block';
          setTimeout(() => {
            router.navigate(`/group/${result.group_id}`);
          }, 2000);
        }
      } catch (error) {
        errorDiv.textContent = 'Failed to create group. Please try again.';
        errorDiv.style.display = 'block';
      }
    });
  }
}

function extractSyllabusData(): Subject[] {
  const syllabusBuilder = document.getElementById('syllabus-builder');
  if (!syllabusBuilder) return [];

  const subjects: Subject[] = [];
  const subjectBuilders = syllabusBuilder.querySelectorAll('.subject-builder');

  subjectBuilders.forEach(subjectBuilder => {
    const subjectNameInput = subjectBuilder.querySelector('.subject-name') as HTMLInputElement;
    const subjectName = subjectNameInput?.value.trim();

    if (!subjectName) return;

    const units: any[] = [];
    const unitBuilders = subjectBuilder.querySelectorAll('.unit-builder');

    unitBuilders.forEach(unitBuilder => {
      const unitNameInput = unitBuilder.querySelector('.unit-name') as HTMLInputElement;
      const unitName = unitNameInput?.value.trim();

      if (!unitName) return;

      const concepts: string[] = [];
      const conceptBuilders = unitBuilder.querySelectorAll('.concept-builder');

      conceptBuilders.forEach(conceptBuilder => {
        const conceptNameInput = conceptBuilder.querySelector('.concept-name') as HTMLInputElement;
        const conceptName = conceptNameInput?.value.trim();

        if (conceptName) {
          concepts.push(conceptName);
        }
      });

      if (concepts.length > 0) {
        units.push({
          unit_name: unitName,
          concepts: concepts
        });
      }
    });

    if (units.length > 0) {
      subjects.push({
        subject_name: subjectName,
        units: units
      });
    }
  });

  return subjects;
}