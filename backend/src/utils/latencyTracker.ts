export interface LatencyMark {
  label: string;
  elapsedMs: number;
}

export type LatencyReport = LatencyMark[] & { totalMs: number };

export class LatencyTracker {
  private startTime: number;
  private marks: LatencyMark[] = [];

  constructor() {
    this.startTime = performance.now();
  }

  public mark(label: string): void {
    const elapsedMs =
      Math.round((performance.now() - this.startTime) * 100) / 100;
    this.marks.push({ label, elapsedMs });
  }

  public getReport(): LatencyReport {
    const lastMark = this.marks[this.marks.length - 1];
    const totalMs = lastMark
      ? lastMark.elapsedMs
      : Math.round((performance.now() - this.startTime) * 100) / 100;

    const report = [...this.marks] as LatencyReport;
    report.totalMs = totalMs;
    return report;
  }
}
