import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { SearchScheduleFormData } from './search-schedule-dialog.dto';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-schedule-dialog',
  standalone: true,
  imports: [CommonModule, FormBuilderComponent],
  templateUrl: './search-schedule-dialog.component.html',
  styleUrls: ['./search-schedule-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchScheduleDialogComponent {
  selectedColumnItems = signal<Object>([]);

  private dialog = inject(MatDialogRef);
  private registry = inject(RegistryService);
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
          const config = this.registry.getByNamePaginatedSelectConfig(c);
          ((config as any)['items'] as Observable<any[]>)
            .pipe(takeUntilDestroyed())
            .subscribe(i => this.selectedColumnItems.set({ ...config, items: i }));
        },
        validators: [Validators.required],
      },
      columnId: {
        type: Controls.select,
        label: this.translation.getTranslation('search_form_column_name'),
        additionalFields: {
          searchable: true,
          searchInputText: this.translation.getTranslation('controls_select_search'),
          loadNextButtonText: this.translation.getTranslation('controls_select_load_next'),
          items: computed(() => (this.selectedColumnItems() as any)['items']),
          next: computed(() => (this.selectedColumnItems() as any)['next']),
          reload: computed(() => (this.selectedColumnItems() as any)['reload']),
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
      buttonText: this.translation.getTranslation('search_form_search'),
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
