import { IModeCalculator, MarkupEntry, Row } from './base-mode-calculator';
import { GeneralSchedule, Schedule, ScheduleGeneralLesson, ScheduleLesson } from '../../../../../entities/schedule';
import { groupBy } from '../../../../../../utils/groupBy';
import { datesDiff, dateUnits } from '../../../../../../utils/dates';

export class TableModeCalculator implements IModeCalculator {
  rows!: Row[];
  days!: string[];
  markup!: MarkupEntry[];
  instantRouting = false;

  private start!: Date;
  private rowIndent = 10;
  private rowHeight = 100;

  initSchedule(schedule: Schedule): void {
    this.start = schedule.info.startDate;

    this.days = [];
    const amount = datesDiff(schedule.info.endDate, schedule.info.startDate, dateUnits.day) + 1;
    for (let i = 0; i < amount; i++) {
      const date = new Date(schedule.info.startDate);
      date.setDate(date.getDate() + i);
      this.days.push(date.toDateString());
    }

    this.init(schedule);
  }

  initGeneralSchedule(schedule: GeneralSchedule): void {
    const dayIndexes = schedule.lessons.map(l => l.dayIndex);
    this.start = new Date(0);
    this.start.setDate(this.start.getDate() - this.start.getDay());

    this.days = [];
    for (let i = 0; i <= Math.max(...dayIndexes); i++) {
      this.days.push(this.getWeekdayByDayIndex(i));
    }

    this.init(schedule);
  }

  init(schedule: Schedule | GeneralSchedule): void {
    if (schedule.lessons.length === 0) return;
    this.rows = new Array(Math.max(...schedule.lessons.map(l => l.lessonIndex)) + 1).fill(0).map(
      (_, i) =>
        <Row>{
          title: `${i + 1}`,
          height: this.rowHeight,
          y: (this.rowHeight + this.rowIndent * 2) * i,
        },
    );

    this.markup = this.rows.map(r => <MarkupEntry>{ y: r.y + this.rowHeight + this.rowIndent });
    this.markup.pop();
  }

  groupLessons(lessons: ScheduleLesson[]): ScheduleLesson[][] {
    return Object.values(
      groupBy(
        lessons,
        (lesson: ScheduleLesson) => `${lesson.startTime.getDay()}-${lesson.lessonIndex}`,
      ),
    );
  }

  height(_: ScheduleLesson[]): number {
    return this.rowHeight;
  }

  width(_: ScheduleLesson[]): number {
    return 200;
  }

  y(lessons: ScheduleLesson[]): number {
    return lessons[0].lessonIndex * (this.rowHeight + this.rowIndent * 2);
  }

  x(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]): number {
    const date = lessons[0].endTime;
    return datesDiff(date, this.start, dateUnits.day) + 1;
  }

  styles(_: ScheduleLesson[]): any {
    return {};
  }

  private getWeekdayByDayIndex(index: number): string {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + index);
    const weekday =  date.toLocaleDateString(undefined, { weekday: 'long' });
    return `weekdays_${weekday.toLowerCase()}`
  }
}
