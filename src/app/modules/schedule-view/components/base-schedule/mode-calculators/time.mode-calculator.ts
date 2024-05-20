import { IModeCalculator, MarkupEntry, Row } from './base-mode-calculator';
import { GeneralSchedule, Schedule, ScheduleGeneralLesson, ScheduleLesson } from '../../../../../entities/schedule';
import { groupBy } from '../../../../../../utils/groupBy';
import { datesDiff, dateUnits } from '../../../../../../utils/dates';

export class TimeModeCalculator implements IModeCalculator {
  private static scale = 2.25;

  rows!: Row[];
  days!: string[];
  markup!: MarkupEntry[];
  instantRouting = false;

  private start!: Date;
  private yOffset!: number;

  initSchedule(schedule: Schedule): void {
    schedule.info.startDate = new Date(schedule.info.startDate);
    schedule.info.endDate = new Date(schedule.info.endDate);

    schedule.lessons.forEach(l => {
      l.endTime = new Date(l.endTime);
      l.startTime = new Date(l.startTime);
    });

    const dates = schedule.lessons.flatMap(v => [
      new Date(v.endTime),
      new Date(v.startTime),
    ]).map(d => {
      d.setFullYear(0, 0, 0);
      return d;
    });

    this.start = schedule.info.startDate;
    this.yOffset = this.yTime(
      dates.reduce((a, b) => (a < b ? a : b), schedule.lessons[0].startTime),
    );

    this.days = [];
    const amount = datesDiff(schedule.info.endDate, schedule.info.startDate, dateUnits.day) + 1;
    for (let i = 0; i < amount; i++) {
      const date = new Date(schedule.info.startDate);
      date.setDate(date.getDate() + i);
      this.days.push(date.toDateString());
    }

    this.init(schedule, dates);
  }

  initGeneralSchedule(schedule: GeneralSchedule): void {
    schedule.lessons.forEach(l => {
      l.endTime = new Date(l.endTime);
      l.startTime = new Date(l.startTime);
    });

    const dates = schedule.lessons.flatMap(v => [
      new Date(v.endTime),
      new Date(v.startTime),
    ]).map(d => {
      d.setFullYear(0, 0, 0);
      return d;
    });

    const dayIndexes = schedule.lessons.map(l => l.dayIndex);
    const weekday = (Math.min(...dayIndexes) - 1);
    this.start = new Date(0);
    this.start.setDate(this.start.getDate() + (weekday - this.start.getDay()));

    this.yOffset = this.yTime(
      dates.reduce((a, b) => (a < b ? a : b), schedule.lessons[0].startTime),
    );

    this.days = [];
    for (let i = Math.min(...dayIndexes) - 1; i < Math.max(...dayIndexes); i++) {
      this.days.push(this.getWeekdayByDayIndex(i));
    }

    this.init(schedule, dates);
  }

  groupLessons(lessons: ScheduleLesson[]): ScheduleLesson[][] {
    return Object.values(
      groupBy(
        lessons,
        (lesson: ScheduleLesson) => `${lesson.startTime.toString()}-${lesson.endTime.toString()}`,
      ),
    );
  }

  init(schedule: Schedule | GeneralSchedule, dates: Date[]): void {
    const timeOffset = 15;

    this.rows = [...new Set(dates)].map(
      d => <Row>{
        title: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        y: this.yTime(d) - timeOffset - this.yOffset,
      },
    );

    this.markup = this.rows.map(r => <MarkupEntry>{ y: r.y + timeOffset });
  }

  height(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]): number {
    const start = lessons[0].startTime;
    const end = lessons[0].endTime;

    return datesDiff(end, start, dateUnits.minute) * TimeModeCalculator.scale;
  }

  width(_: ScheduleLesson[]): number {
    return 200;
  }

  y(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]): number {
    const date = lessons[0].startTime;
    return this.yTime(date) - this.yOffset;
  }

  x(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]): number {
    const date = lessons[0].startTime;
    return datesDiff(date, this.start, dateUnits.day) + 1;
  }

  styles(_: ScheduleLesson[]): any {
    return {};
  }

  private yTime(date: Date): number {
    return (date.getHours() * 60 + date.getMinutes()) * TimeModeCalculator.scale;
  }

  private getWeekdayByDayIndex(index: number): string {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + index);
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
}
