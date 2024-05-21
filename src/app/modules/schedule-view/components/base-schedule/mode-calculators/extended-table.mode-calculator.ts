import { IModeCalculator, MarkupEntry, Row } from './base-mode-calculator';
import { GeneralSchedule, Schedule, ScheduleGeneralLesson, ScheduleLesson } from '../../../../../entities/schedule';
import { groupBy } from '../../../../../../utils/groupBy';
import { datesDiff, dateUnits } from '../../../../../../utils/dates';

export class ExtendedTableModeCalculator implements IModeCalculator {
  rows!: Row[];
  days!: string[];
  markup!: MarkupEntry[];
  instantRouting = true;

  private start!: Date;
  private maxLessonsInRow: { [rowIndex: number]: { amount: number; acc: number } } = {};
  private rowIndent = 10;
  private cellHeight = 100;

  initSchedule(schedule: Schedule): void {
    schedule.info.startDate = new Date(schedule.info.startDate);
    schedule.info.endDate = new Date(schedule.info.endDate);
    this.start = schedule.info.startDate;

    const groupedLessons: { [day: string]: { [rowIndex: number]: number } } = {};
    schedule.lessons.forEach(l => {
      l.endTime = new Date(l.endTime)
      l.startTime = new Date(l.startTime)

      const key = l.startTime.toDateString();
      groupedLessons[key] ??= {};
      groupedLessons[key][l.lessonIndex] ??= 0;
      groupedLessons[key][l.lessonIndex]++;
    });

    this.days = [];

    const amount = datesDiff(schedule.info.endDate, schedule.info.startDate, dateUnits.day) + 1;
    for (let i = 0; i < amount; i++) {
      const newDate = new Date(schedule.info.startDate);
      newDate.setDate(newDate.getDate() + i);
      this.days.push(newDate.toDateString());
    }

    this.init(schedule, groupedLessons);
  }

  initGeneralSchedule(schedule: GeneralSchedule): void {
    const groupedLessons: { [day: number]: { [rowIndex: number]: number } } = {};
    schedule.lessons.forEach(l => {
      const key = l.dayIndex;
      groupedLessons[key] ??= {};
      groupedLessons[key][l.lessonIndex] ??= 0;
      groupedLessons[key][l.lessonIndex]++;
    });

    const dayIndexes = schedule.lessons.map(l => l.dayIndex);
    const weekday = (Math.min(...dayIndexes) - 1);
    this.start = new Date(0);
    this.start.setDate(this.start.getDate() + (weekday - this.start.getDay()));

    this.days = [];
    for (let i = Math.min(...dayIndexes) - 1; i < Math.max(...dayIndexes); i++) {
      this.days.push(this.getWeekdayByDayIndex(i));
    }

    this.init(schedule, groupedLessons);
  }

  groupLessons(lessons: ScheduleLesson[]): ScheduleLesson[][] {
    return Object.values(groupBy(lessons, (lesson: ScheduleLesson) => `${lesson.startTime.toDateString()}-${lesson.lessonIndex}`));
  }

  init(
    schedule: Schedule | GeneralSchedule,
    groupedLessons: {
      [key: string | number]: { [rowIndex: number]: number };
    },
  ): void {
    const maxIndex = Math.max(...schedule.lessons.map(l => l.lessonIndex));

    Object.values(groupedLessons).forEach(d => {
      for (let i = 0; i <= maxIndex; i++) {
        this.maxLessonsInRow[i] ??= { amount: 0, acc: -1 };
        if (!d[i] || this.maxLessonsInRow[i].amount >= d[i]) continue;
        this.maxLessonsInRow[i].amount = d[i];
      }
    });

    Object.values(this.maxLessonsInRow).reduce((acc, i) => {
      i.amount ??= 0;
      i.acc = acc;
      return acc + i.amount;
    }, 0);

    this.rows = Object.values(this.maxLessonsInRow).map(
      (v, i) =>
        <Row>{
          title: `${i + 1}`,
          height: this.cellHeight * v.amount,
          y: this.cellHeight * v.acc + i * this.rowIndent * 2,
        },
    );

    this.markup = this.rows.map(r => <MarkupEntry>{ y: r.y + r.height! + this.rowIndent });
    this.markup.pop();
  }

  height(lessons: ScheduleLesson[]): number {
    return lessons.length * this.cellHeight;
  }

  width(_: ScheduleLesson[]): number {
    return 200;
  }

  y(lessons: ScheduleLesson[]): number {
    const acc = this.maxLessonsInRow[lessons[0].lessonIndex].acc;
    return acc * this.cellHeight + lessons[0].lessonIndex * this.rowIndent * 2;
  }

  x(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]): number {
    if ('dayIndex' in lessons[0]) return lessons[0].dayIndex + 1
    return datesDiff(lessons[0].endTime, this.start, dateUnits.day) + 1;
  }

  styles(_: ScheduleLesson[]): any {
    return {};
  }

  private getWeekdayByDayIndex(index: number): string {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + index);
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
}
