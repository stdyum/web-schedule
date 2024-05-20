import { GeneralSchedule, Schedule, ScheduleLesson } from '../../../../../entities/schedule';

export interface Row {
  title: string;
  y: number;
  height?: number;
}

export interface MarkupEntry {
  y: number;
}

export interface IModeCalculator {
  rows: Row[];
  days: string[];
  markup: MarkupEntry[];
  instantRouting: boolean;

  initSchedule(schedule: Schedule): void;
  initGeneralSchedule(schedule: GeneralSchedule): void;

  groupLessons(lessons: ScheduleLesson[]): ScheduleLesson[][];

  height(lessons: ScheduleLesson[]): number;

  width(lessons: ScheduleLesson[]): number;

  y(lessons: ScheduleLesson[]): number;

  x(lessons: ScheduleLesson[]): number;

  styles(lessons: ScheduleLesson[]): any;
}
