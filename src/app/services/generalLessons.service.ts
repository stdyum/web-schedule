import { inject, Injectable } from '@angular/core';
import { filter, map, take } from 'rxjs';
import { CrudService } from '../../utils/crud.service';
import { ScheduleGeneralLesson, ScheduleLesson } from '../entities/schedule';
import {
  ScheduleAddLessonFormData,
} from '../modules/schedule-edit/dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.dto';
import { ScheduleService } from './schedule.service';
import { Enrollment, EnrollmentsService } from '@likdan/studyum-core';
import { LoadedState } from '@likdan/state-mapper';

@Injectable({ providedIn: 'root' })
export class GeneralLessonsService extends CrudService<ScheduleLesson, ScheduleAddLessonFormData> {
  private enrollmentsService = inject(EnrollmentsService);
  private service = inject(ScheduleService);

  constructor() {
    super('api/schedule/v1/lessons/general');
    this.enrollmentsService.currentEnrollmentState
      .pipe(filter(s => s.state === 'loaded'))
      .pipe(take(1))
      .pipe(map(s => (s as LoadedState<Enrollment>).data))
      .subscribe(e => (this.query = { studyPlaceId: e.studyPlaceId }));

    this.onAction = {
      POST: (response, _, data) => {
        const lessons = [...this.service.lessons];
        lessons.push({
          ...response.list[0],
          ...data,
          startTime: this.parseTime(response.list[0].startTime, response.list[0].dayIndex),
          endTime: this.parseTime(response.list[0].endTime, response.list[0].dayIndex),
        });
        this.service.lessons = lessons;
      },
      PUT: (_, request, data) => {
        const lessons = [...this.service.lessons];
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i] as ScheduleGeneralLesson
          if (lesson.id !== request.id) continue;

          lessons[i] = {
            ...lesson,
            ...data,
            startTime: this.parseTime(lesson.startTime as any as number, lesson.dayIndex),
            endTime: this.parseTime(lesson.endTime as any as number, lesson.dayIndex),
          };
        }
        this.service.lessons = lessons;
      },
      DELETE: (_, request) => {
        this.service.lessons = this.service.lessons.filter(l => l.id !== request.id);
      },
    };
  }

  private parseTime(timeMills: number, dayIndex: number): Date {
    const timezoneOffset = new Date().getTimezoneOffset();

    const time = new Date(timeMills / 1_000_000);
    time.setMinutes(time.getMinutes() + timezoneOffset);
    time.setDate(time.getDate() - time.getDay() + dayIndex);

    return time;
  }
}
