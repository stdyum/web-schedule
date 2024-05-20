import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { SearchScheduleFormData } from './search-schedule-dialog.dto';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService } from '@likdan/studyum-core';
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
  formConfig: FormConfig<any> = {
    controls: {
      column: {
        type: Controls.select,
        label: 'Column',
        additionalFields: {
          searchable: false,
          items: [
            { value: 'group', display: 'Group' },
            { value: 'teacher', display: 'Teacher' },
            { value: 'subject', display: 'Subject' },
            { value: 'room', display: 'Room' },
          ],
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
        label: 'Column name',
        additionalFields: {
          items: this.columnItems,
          searchable: false,
        },
        validators: [Validators.required],
      },
      range: {
        type: Controls.dateRange,
        label: 'Range',
      },
    },
    initialValue: this.parseInitialData(this.config),
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: 'Search',
      onSubmit: e => {
        if (!e.valid) return;

        const value = this.parseFormBody(e.value)
        this.dialog.close(value);
      },
    },
  };

  private parseFormBody(body: any): SearchScheduleFormData {
    body.startDate = body.range.start.toISOString()
    body.endDate = body.range.end.toISOString()

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
