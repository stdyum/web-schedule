import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { ScheduleAddLessonService } from './schedule-add-lesson-dialog.service';
import { ScheduleLesson } from '../../../../entities/schedule';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService } from '@likdan/studyum-core';

@Component({
  selector: 'app-schedule-add-lesson-dialog',
  templateUrl: './schedule-add-lesson-dialog.component.html',
  styleUrls: ['./schedule-add-lesson-dialog.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormBuilderComponent,
  ],
})
export class ScheduleAddLessonDialogComponent {
  private dialog = inject(MatDialogRef);
  private registryService = inject(RegistryService);
  private service = inject(ScheduleAddLessonService);
  private config = inject<ScheduleLesson | null>(MAT_DIALOG_DATA);
  formConfig: FormConfig<any> = {
    controls: {
      subjectId: {
        type: Controls.select,
        label: 'Subject',
        additionalFields: {
          searchable: false,
          items: this.registryService.getSubjectsPaginatedForSelect(),
        },
        validators: [Validators.required],
      },
      teacherId: {
        type: Controls.select,
        label: 'Teacher',
        additionalFields: {
          searchable: false,
          items: this.registryService.getTeachersPaginatedForSelect(),
        },
        validators: [Validators.required],
      },
      groupId: {
        type: Controls.select,
        label: 'Group',
        additionalFields: {
          searchable: false,
          items: this.registryService.getGroupsPaginatedForSelect(),
        },
        validators: [Validators.required],
      },
      roomId: {
        type: Controls.select,
        label: 'Room',
        additionalFields: {
          searchable: false,
          items: this.registryService.getRoomsPaginatedForSelect(),
        },
        validators: [Validators.required],
      },
      primaryColor: {
        type: Controls.colorSelect,
        label: 'Primary color',
        additionalFields: {
          searchable: false,
          items: this.service.primaryColors$,
        },
        validators: [Validators.required],
      },
      secondaryColor: {
        type: Controls.colorSelect,
        label: 'Secondary color',
        additionalFields: {
          searchable: false,
          items: this.service.secondaryColors$,
        },
        validators: [Validators.required],
      },
      lessonIndex: {
        type: Controls.numberInput,
        label: 'Lesson number',
        validators: [Validators.required],
      },
      startTime: {
        type: Controls.datetime,
        label: 'Start time',
        validators: [Validators.required],
      },
      endTime: {
        type: Controls.datetime,
        label: 'End time',
        validators: [Validators.required],
      },
    },
    initialValue: this.parseInitialData(this.config),
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: 'Submit',
      onSubmit: e => {
        if (!e.valid) return;

        const value = this.parseFormBody(e.value);
        this.dialog.close(value);
      },
    },
  };

  private parseFormBody(body: any): any {
    body.lessonIndex--;

    const startTime = body.startTime.time;
    body.startTime = new Date(body.startTime.date);
    body.startTime.setHours(startTime.hour, startTime.minute);

    const endTime = body.endTime.time;
    body.endTime = new Date(body.endTime.date);
    body.endTime.setHours(endTime.hour, endTime.minute);

    return body;
  }

  private parseInitialData(data: any): any {
    if (!data) return null;

    return {
      subjectId: data.subject?.id,
      teacherId: data.teacher?.id,
      groupId: data.group?.id,
      roomId: data.room?.id,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      lessonIndex: this.parseIndex(data.lessonIndex),
      startTime: this.parseDateToFormValue(data.startTime),
      endTime: this.parseDateToFormValue(data.endTime),
    };
  }

  private parseIndex(index?: number): number | null {
    if (!index) return null;

    return index + 1;
  }

  private parseDateToFormValue(date?: Date): { date: Date, time: { minute: number, hour: number } } | null {
    if (!date) return null;

    return {
      date: date,
      time: {
        hour: date.getHours(),
        minute: date.getMinutes(),
      },
    };
  }
}
