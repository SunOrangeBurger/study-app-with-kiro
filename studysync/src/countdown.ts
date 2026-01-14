// Countdown Widget Implementation
import type { Group, Test, CountdownData } from './types';

export class CountdownManager {
  private intervalId: number | null = null;
  private callback: ((data: CountdownData | null) => void) | null = null;
  private group: Group;
  private completedConcepts: Set<string>;

  constructor(group: Group, completedConcepts: Set<string>) {
    this.group = group;
    this.completedConcepts = completedConcepts;
  }

  start(callback: (data: CountdownData | null) => void): void {
    this.callback = callback;
    this.update();
    this.intervalId = window.setInterval(() => this.update(), 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callback = null;
  }

  updateCompletedConcepts(completedConcepts: Set<string>): void {
    this.completedConcepts = completedConcepts;
    if (this.callback) {
      this.update();
    }
  }

  private update(): void {
    if (!this.callback) return;

    const countdownData = this.getCountdownData();
    this.callback(countdownData);
  }

  private getCountdownData(): CountdownData | null {
    const now = new Date();
    let nearestTest: Test | null = null;
    let minDays = Infinity;

    // Find the nearest test within 7 days
    for (const test of this.group.tests) {
      const testDate = new Date(test.date);
      const diffMs = testDate.getTime() - now.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (days >= 0 && days <= 7 && days < minDays) {
        nearestTest = test;
        minDays = days;
      }
    }

    if (!nearestTest) return null;

    const testDate = new Date(nearestTest.date);
    const diffMs = testDate.getTime() - now.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    // Find urgent topics that are not completed
    const urgentTopics = nearestTest.covered_topics.filter(topic => {
      // Convert plain topic name to full key
      const fullKey = this.findConceptKey(topic);
      return fullKey && !this.completedConcepts.has(fullKey);
    });

    return {
      test: nearestTest,
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
      urgentTopics
    };
  }

  private findConceptKey(conceptName: string): string | null {
    for (const subject of this.group.syllabus) {
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

  static formatCountdown(data: CountdownData): string {
    const { days, hours, minutes, seconds } = data;
    
    if (days === 0 && hours === 0 && minutes === 0) {
      return `Exam in ${seconds} seconds!`;
    } else if (days === 0 && hours === 0) {
      return `Exam in ${minutes} minutes!`;
    } else if (days === 0) {
      return `Today at 8 AM!`;
    } else if (days === 1) {
      return `Tomorrow at 8 AM!`;
    } else {
      return `${days} days away`;
    }
  }

  static formatTimeRemaining(data: CountdownData): string {
    const { days, hours, minutes, seconds } = data;
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
}