import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ScheduleService } from '../../../../services/schedule.service';
import { LessonsService } from '../../../../services/lessons.service';
import { GeneralLessonsService } from '../../../../services/generalLessons.service';
import { CrudService } from '../../../../../utils/crud.service';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../../../entities/schedule';
import { ScheduleAddLessonFormData } from '../../dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.dto';
import {
  ScheduleAddGeneralLessonFormData,
} from '../../dialogs/schedule-add-genral-lesson-dialog/schedule-add-general-lesson-dialog.dto';
import { EnrollmentsService, RegistryService } from '@likdan/studyum-core';

@Injectable({
  providedIn: 'root',
})
export class ScheduleLessonActionsService {
  private service = inject(ScheduleService);
  private registryService = inject(RegistryService);
  private lessonsService = inject(LessonsService);
  private generalLessonsService = inject(GeneralLessonsService);
  private enrollmentsService = inject(EnrollmentsService);

  get isGeneral(): boolean {
    return this.service.isGeneral;
  }

  get crudService(): CrudService<
    ScheduleLesson | ScheduleGeneralLesson,
    ScheduleAddLessonFormData | ScheduleAddGeneralLessonFormData
  > {
    return this.isGeneral ? this.generalLessonsService : this.lessonsService;
  }

  addLesson(data: ScheduleAddLessonFormData | ScheduleAddGeneralLessonFormData): Observable<ScheduleLesson | ScheduleGeneralLesson> {
    const lesson = this.associateDataWithModels(data);
    return this.crudService.postList([data], {}, lesson);
  }

  editLesson(
    id: string,
    data: ScheduleAddLessonFormData | ScheduleAddGeneralLessonFormData,
  ): Observable<ScheduleLesson | ScheduleGeneralLesson> {
    const lesson = this.associateDataWithModels(data);
    return this.crudService.put(id, data, {}, lesson);
  }

  deleteLesson(lesson: ScheduleLesson | ScheduleGeneralLesson): Observable<void> {
    const query = 'dayIndex' in lesson ? { dayIndex: lesson.dayIndex } : { date: lesson.startTime };

    return this.crudService.delete(lesson.id!, query, lesson);
  }

  private associateDataWithModels(data: ScheduleAddLessonFormData | ScheduleAddGeneralLessonFormData): ScheduleLesson {
    const subject = this.registryService.getLoadedSubjects()?.items.find(i => i.id === data.subjectId) || null;
    const teacher = this.registryService.getLoadedTeachers()?.items.find(i => i.id === data.teacherId) || null;
    const room = this.registryService.getLoadedRooms()?.items.find(i => i.id === data.roomId) || null;
    const group = this.registryService.getLoadedGroups()?.items.find(i => i.id === data.groupId) || null;

    return <ScheduleLesson>{
      id: '',
      studyPlaceId: this.enrollmentsService.currentStudyplaceId(),
      type: 'dayIndex' in data ? 'general' : 'current',
      group: group,
      room: room,
      subject: subject,
      teacher: teacher,
      startTime: data.startTime,
      endTime: data.endTime,
      lessonIndex: data.lessonIndex,
      dayIndex: 'dayIndex' in data ? data.dayIndex : undefined,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
    };
  }
}
