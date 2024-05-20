import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LessonsService } from '../../../../services/lessons.service';
import { ScheduleAddLessonFormData } from '../../dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.dto';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../../../entities/schedule';
import { EnrollmentsService, RegistryService } from '@likdan/studyum-core';
import { ScheduleService } from '../../../../services/schedule.service';
import { CrudService } from '../../../../../utils/crud.service';
import {
  ScheduleAddGeneralLessonFormData
} from '../../dialogs/schedule-add-genral-lesson-dialog/schedule-add-general-lesson-dialog.dto';
import { GeneralLessonsService } from '../../../../services/generalLessons.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduleAddLessonViewService {
  private service = inject(ScheduleService);
  private lessonsService = inject(LessonsService);
  private registryService = inject(RegistryService);
  private enrollmentsService = inject(EnrollmentsService);
  private generalLessonsService = inject(GeneralLessonsService);

  get isGeneral(): boolean {
    return this.service.isGeneral;
  }

  get crudService(): CrudService<
    ScheduleLesson | ScheduleGeneralLesson,
    ScheduleAddLessonFormData | ScheduleAddGeneralLessonFormData
  > {
    return this.isGeneral ? this.generalLessonsService : this.lessonsService;
  }

  addLesson(data: ScheduleAddLessonFormData): Observable<ScheduleLesson | ScheduleGeneralLesson> {
    const lesson = this.associateDataWithModels(data)
    return this.crudService.postList([data], {}, lesson);
  }

  private associateDataWithModels(data: ScheduleAddLessonFormData): ScheduleLesson {
    const subject = this.registryService.getLoadedSubjects()?.items.find(i => i.id === data.subjectId) || null
    const teacher = this.registryService.getLoadedTeachers()?.items.find(i => i.id === data.teacherId) || null
    const room = this.registryService.getLoadedRooms()?.items.find(i => i.id === data.roomId) || null
    const group = this.registryService.getLoadedGroups()?.items.find(i => i.id === data.groupId) || null

    return <ScheduleLesson> {
      id: "",
      studyPlaceId: this.enrollmentsService.currentStudyplaceId(),
      type: 'current',
      group: group,
      room: room,
      subject: subject,
      teacher: teacher,
      startTime: data.startTime,
      endTime: data.endTime,
      lessonIndex: data.lessonIndex,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
    }
  }
}
