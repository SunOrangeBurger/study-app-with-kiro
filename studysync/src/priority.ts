// Smart Priority Logic Implementation
import type { Group, ProgressEntry, PriorityMap, PriorityLevel } from './types';

export function getPriorityMap(group: Group, userHistory: ProgressEntry[]): PriorityMap {
  const now = new Date();
  const priorityMap: PriorityMap = {};

  // 1. Identify Urgent Topics (tests within 7 days)
  const urgentTopics = new Set<string>();
  for (const test of group.tests) {
    const testDate = new Date(test.date);
    const daysDiff = Math.ceil((testDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 0 && daysDiff <= 7) {
      test.covered_topics.forEach(topic => urgentTopics.add(topic));
    }
  }

  // 2. Create ordered list of all concepts
  const allOrderedKeys: string[] = [];
  const conceptToKey = new Map<string, string>();
  
  for (const subject of group.syllabus) {
    for (const unit of subject.units) {
      for (const concept of unit.concepts) {
        const fullKey = `${subject.subject_name}||${unit.unit_name}||${concept}`;
        allOrderedKeys.push(fullKey);
        conceptToKey.set(concept, fullKey);
      }
    }
  }

  // 3. Split finished vs unfinished
  const finishedKeys = new Set(userHistory.map(entry => entry.concept));
  const unfinishedKeys = allOrderedKeys.filter(key => !finishedKeys.has(key));

  // 4. Apply Priority Rules

  // a) Urgent Test Topics
  for (const topic of urgentTopics) {
    const fullKey = conceptToKey.get(topic);
    if (fullKey) {
      if (finishedKeys.has(fullKey)) {
        priorityMap[fullKey] = 'revision-old';
      } else {
        priorityMap[fullKey] = 'critical';
      }
    }
  }

  // b) Remaining Unfinished (non-urgent)
  const nonUrgentUnfinished = unfinishedKeys.filter(key => {
    const concept = key.split('||')[2];
    return !urgentTopics.has(concept);
  });

  const halfPoint = Math.ceil(nonUrgentUnfinished.length / 2);
  for (let i = 0; i < nonUrgentUnfinished.length; i++) {
    const key = nonUrgentUnfinished[i];
    if (!priorityMap[key]) { // Don't override urgent topics
      priorityMap[key] = i < halfPoint ? 'critical' : 'high';
    }
  }

  // c) Finished (for revision) - non-urgent
  const finishedArray = userHistory
    .filter(entry => {
      const concept = entry.concept.split('||')[2];
      return !urgentTopics.has(concept);
    })
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()); // Earliest first

  const finishedHalfPoint = Math.ceil(finishedArray.length / 2);
  for (let i = 0; i < finishedArray.length; i++) {
    const entry = finishedArray[i];
    if (!priorityMap[entry.concept]) { // Don't override urgent topics
      priorityMap[entry.concept] = i < finishedHalfPoint ? 'revision-old' : 'revision-recent';
    }
  }

  return priorityMap;
}

export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'critical': return '#ff4757'; // Red
    case 'high': return '#ffa502'; // Orange
    case 'revision-old': return '#3742fa'; // Blue
    case 'revision-recent': return '#2ed573'; // Green
    default: return '#747d8c'; // Gray
  }
}

export function getPriorityLabel(priority: PriorityLevel): string {
  switch (priority) {
    case 'critical': return 'Critical';
    case 'high': return 'High Priority';
    case 'revision-old': return 'Review (Old)';
    case 'revision-recent': return 'Review (Recent)';
    default: return 'Normal';
  }
}