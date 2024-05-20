import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { ScheduleGeneralLesson } from '../../../../entities/schedule';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { ScheduleAddGeneralLessonService } from './schedule-add-general-lesson-dialog.service';
import { RegistryService } from '@likdan/studyum-core';


@Component({
  selector: 'app-schedule-add-general-lesson-dialog',
  templateUrl: './schedule-add-general-lesson-dialog.component.html',
  styleUrls: ['./schedule-add-general-lesson-dialog.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormBuilderComponent,
  ],
})
export class ScheduleAddGeneralLessonDialogComponent {
  private dialog = inject(MatDialogRef);
  private registryService = inject(RegistryService);
  private service = inject(ScheduleAddGeneralLessonService);
  private config = inject<ScheduleGeneralLesson | null>(MAT_DIALOG_DATA);

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
      dayIndex: {
        type: Controls.numberInput,
        label: 'Day number',
        validators: [Validators.required],
      },
      startTime: {
        type: Controls.time,
        label: 'Start time',
        validators: [Validators.required],
      },
      endTime: {
        type: Controls.time,
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
    body.dayIndex--;

    body.startTime = body.startTime.hour * 60 + body.startTime.minute;
    body.endTime = body.endTime.hour * 60 + body.endTime.minute;

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
      dayIndex: this.parseIndex(data.dayIndex),
      startTime: this.parseDateToFormValue(data.startTime),
      endTime: this.parseDateToFormValue(data.endTime),
    };
  }

  private parseIndex(index?: number): number | null {
    if (!index) return null;

    return index + 1;
  }

  private parseDateToFormValue(date?: Date): { minute: number, hour: number } | null {
    if (!date) return null;

    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }
}
