import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { SearchScheduleFormData } from './search-schedule-dialog.dto';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';
import { take } from 'rxjs';

@Component({
  selector: 'app-search-schedule-dialog',
  standalone: true,
  imports: [CommonModule, FormBuilderComponent],
  templateUrl: './search-schedule-dialog.component.html',
  styleUrls: ['./search-schedule-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchScheduleDialogComponent {
  private dialog = inject(MatDialogRef);
  private registryService = inject(RegistryService);

  private columnItems = signal<any[]>([]);
  private config = inject<SearchScheduleFormData>(MAT_DIALOG_DATA);
  private translation = inject(TranslationService);

  formConfig: FormConfig<any> = {
    controls: {
      column: {
        type: Controls.select,
        label: this.translation.getTranslation('search_form_column'),
        additionalFields: {
          searchable: false,
          items: computed(() => [
            { value: 'group', display: this.translation.getTranslation('search_form_column_group')() },
            { value: 'room', display: this.translation.getTranslation('search_form_column_room')() },
            { value: 'subject', display: this.translation.getTranslation('search_form_column_subject')() },
            { value: 'teacher', display: this.translation.getTranslation('search_form_column_teacher')() },
          ]),
        },
        valueChanges: c => {
          this.registryService.getByNameForSelect(c)
            .pipe(take(1))
            .subscribe(this.columnItems.set.bind(this.columnItems));
        },
        validators: [Validators.required],
      },
      columnId: {
        type: Controls.select,
        label: this.translation.getTranslation('search_form_column_name'),
        additionalFields: {
          items: this.columnItems,
          searchable: false,
        },
        validators: [Validators.required],
      },
      range: {
        type: Controls.dateRange,
        label: this.translation.getTranslation('search_form_range'),
      },
    },
    initialValue: this.parseInitialData(this.config),
    submit: {
      button: Buttons.Submit.Flat,
      buttonText:  this.translation.getTranslation('search_form_search'),
      onSubmit: e => {
        if (!e.valid) return;

        const value = this.parseFormBody(e.value);
        this.dialog.close(value);
      },
    },
  };

  private parseFormBody(body: any): SearchScheduleFormData {
    body.startDate = body.range.start.toISOString();
    body.endDate = body.range.end.toISOString();

    return body;
  }

  private parseInitialData(data: SearchScheduleFormData): any {
    if (!data) return null;

    return {
      column: data.column,
      columnId: data.columnId,
      range: {
        start: data.startDate,
        end: data.endDate,
      },
    };
  }
}
