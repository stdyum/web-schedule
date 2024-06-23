import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { ScheduleLesson } from '../../../../entities/schedule';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';

export interface DialogConfig {
  initial: ScheduleLesson,
  hideDateControls: boolean
}

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
  private registry = inject(RegistryService);
  private config = inject<DialogConfig | null>(MAT_DIALOG_DATA);
  private translation = inject(TranslationService);

  formConfig: FormConfig<any> = {
    controls: {
      subjectId: {
        type: Controls.select,
        label: this.translation.getTranslation('lesson_form_subject'),
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
        label: this.translation.getTranslation('lesson_form_teacher'),
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
        label: this.translation.getTranslation('lesson_form_group'),
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
        label: this.translation.getTranslation('lesson_form_room'),
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
        label: this.translation.getTranslation('lesson_form_primary_color'),
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
        label: this.translation.getTranslation('lesson_form_secondary_color'),
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
        label: this.translation.getTranslation('lesson_form_lesson_number'),
        validators: [Validators.required],
      },
      startTime: {
        type: Controls.datetime,
        label: this.translation.getTranslation('lesson_form_start_time'),
        hidden: !!this.config?.hideDateControls,
        validators: [Validators.required],
      },
      endTime: {
        type: Controls.datetime,
        label: this.translation.getTranslation('lesson_form_end_time'),
        hidden: !!this.config?.hideDateControls,
        validators: [Validators.required],
      },
    },
    initialValue: this.parseInitialData(this.config?.initial),
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: this.translation.getTranslation('lesson_form_submit'),
      onSubmit: e => {
        if (!e.valid) return;

        const value = this.parseFormBody(e.value);
        this.dialog.close(value);
      },
    },
  };

  private parseFormBody(body: any): any {
    body.lessonIndex--;
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
      startTime: data.startTime,
      endTime: data.endTime,
    };
  }

  private parseIndex(index?: number): number | null {
    if (index === undefined || index === null) return null;

    return index + 1;
  }
}
