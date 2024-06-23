import { inject, Injectable } from '@angular/core';
import { filter, map, take } from 'rxjs';
import { CrudService } from '../../utils/crud.service';
import { ScheduleLesson } from '../entities/schedule';
import {
  ScheduleAddLessonFormData,
} from '../modules/schedule-edit/dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.dto';
import { Enrollment, EnrollmentsService } from '@likdan/studyum-core';
import { ScheduleService } from './schedule.service';
import { LoadedState } from '@likdan/state-mapper';

@Injectable({ providedIn: 'root' })
export class LessonsService extends CrudService<ScheduleLesson, ScheduleAddLessonFormData> {
  private enrollmentsService = inject(EnrollmentsService);
  private service = inject(ScheduleService);

  constructor() {
    super('api/schedule/v1/lessons');
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
          startTime: new Date(response.list[0].startTime),
          endTime: new Date(response.list[0].endTime),
        });
        this.service.lessons = lessons;
      },
      PUT: (_, request, data) => {
        const lessons = [...this.service.lessons];
        for (let i = 0; i < lessons.length; i++) {
          if (lessons[i].id !== request.id) continue;

          lessons[i] = {
            ...lessons[i],
            ...data,
            startTime: new Date(lessons[i].startTime),
            endTime: new Date(lessons[i].endTime)
          };
        }
        this.service.lessons = lessons;
      },
      DELETE: (_, request) => {
        this.service.lessons = this.service.lessons.filter(l => l.id !== request.id);
      },
    };
  }
}
