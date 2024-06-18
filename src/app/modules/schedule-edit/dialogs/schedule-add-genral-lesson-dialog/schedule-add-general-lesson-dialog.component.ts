import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { ScheduleGeneralLesson } from '../../../../entities/schedule';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';


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
  private registry = inject(RegistryService);
  private config = inject<ScheduleGeneralLesson | null>(MAT_DIALOG_DATA);
  private translation = inject(TranslationService);

  formConfig: FormConfig<any> = {
    controls: {
      subjectId: {
        type: Controls.select,
        label: this.translation.getTranslation('general_lesson_form_subject'),
        additionalFields: {
          searchable: true,
          searchInputText: this.translation.getTranslation('controls_select_search'),
          loadNextButtonText: this.translation.getTranslation('controls_select_load_next'),
          ...this.registry.getSubjectsPaginatedSelectConfig(),
        },
        validators: [Validators.required],
      },
      teacherId: {
        type: Controls.select,
        label: this.translation.getTranslation('general_lesson_form_teacher'),
        additionalFields: {
          searchable: true,
          searchInputText: this.translation.getTranslation('controls_select_search'),
          loadNextButtonText: this.translation.getTranslation('controls_select_load_next'),
          ...this.registry.getTeachersPaginatedSelectConfig(),
        },
        validators: [Validators.required],
      },
      groupId: {
        type: Controls.select,
        label: this.translation.getTranslation('general_lesson_form_group'),
        additionalFields: {
          searchable: true,
          searchInputText: this.translation.getTranslation('controls_select_search'),
          loadNextButtonText: this.translation.getTranslation('controls_select_load_next'),
          ...this.registry.getGroupsPaginatedSelectConfig(),
        },
        validators: [Validators.required],
      },
      roomId: {
        type: Controls.select,
        label: this.translation.getTranslation('general_lesson_form_room'),
        additionalFields: {
          searchable: true,
          searchInputText: this.translation.getTranslation('controls_select_search'),
          loadNextButtonText: this.translation.getTranslation('controls_select_load_next'),
          ...this.registry.getRoomsPaginatedSelectConfig(),
        },
        validators: [Validators.required],
      },
      primaryColor: {
        type: Controls.colorSelect,
        label: this.translation.getTranslation('general_lesson_form_primary_color'),
        additionalFields: {
          searchable: false,
          items: computed(() => [
            {
              value: '#ffffff',
              display: this.translation.getTranslation('colors_white')(),
            },
            {
              value: '#99ff99',
              display: this.translation.getTranslation('colors_lime')(),
            },
            {
              value: '#9999ff',
              display: this.translation.getTranslation('colors_purple')(),
            },
          ]),
        },
        validators: [Validators.required],
      },
      secondaryColor: {
        type: Controls.colorSelect,
        label: this.translation.getTranslation('general_lesson_form_secondary_color'),
        additionalFields: {
          searchable: false,
          items: computed(() => [
            {
              value: '#ffffff',
              display: this.translation.getTranslation('colors_white')(),
            },
            {
              value: '#99ff99',
              display: this.translation.getTranslation('colors_lime')(),
            },
            {
              value: '#9999ff',
              display: this.translation.getTranslation('colors_purple')(),
            },
          ]),
        },
        validators: [Validators.required],
      },
      lessonIndex: {
        type: Controls.numberInput,
        label: this.translation.getTranslation('general_lesson_form_lesson_number'),
        validators: [Validators.required],
      },
      dayIndex: {
        type: Controls.select,
        label: this.translation.getTranslation('general_lesson_form_day'),
        additionalFields: {
          items: computed(() => [
            {
              value: 0,
              display: this.translation.getTranslation('weekdays_sunday')(),
            },
            {
              value: 1,
              display: this.translation.getTranslation('weekdays_monday')(),
            },
            {
              value: 2,
              display: this.translation.getTranslation('weekdays_tuesday')(),
            },
            {
              value: 3,
              display: this.translation.getTranslation('weekdays_wednesday')(),
            },
            {
              value: 4,
              display: this.translation.getTranslation('weekdays_thursday')(),
            },
            {
              value: 5,
              display: this.translation.getTranslation('weekdays_friday')(),
            },
            {
              value: 6,
              display: this.translation.getTranslation('weekdays_saturday')(),
            },
          ]),
        },
        validators: [Validators.required],
      },
      startTime: {
        type: Controls.time,
        label: this.translation.getTranslation('general_lesson_form_start_time'),
        validators: [Validators.required],
      },
      endTime: {
        type: Controls.time,
        label: this.translation.getTranslation('general_lesson_form_end_time'),
        validators: [Validators.required],
      },
    },
    initialValue: this.parseInitialData(this.config),
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: this.translation.getTranslation('general_lesson_form_submit'),
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
