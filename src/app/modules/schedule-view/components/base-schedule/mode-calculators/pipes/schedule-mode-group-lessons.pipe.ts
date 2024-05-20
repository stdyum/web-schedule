import { Pipe, PipeTransform } from '@angular/core';
import { ScheduleLesson } from '../../../../../../entities/schedule';
import { IModeCalculator } from '../base-mode-calculator';

@Pipe({
  name: 'scheduleModeGroupLessons',
  standalone: true,
})
export class ScheduleModeGroupLessonsPipe implements PipeTransform {
  transform(lessons: ScheduleLesson[], mode: IModeCalculator): ScheduleLesson[][] {
    return mode.groupLessons(lessons);
  }
}
