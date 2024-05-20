import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService } from '@likdan/studyum-core';
import { Validators } from '@angular/forms';
import { take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-preferences-dialog',
  standalone: true,
  imports: [
    FormBuilderComponent,
  ],
  templateUrl: './preferences-dialog.component.html',
  styleUrl: './preferences-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesDialogComponent {
  selectedColumnItems = signal<any[]>([]);

  private registry = inject(RegistryService);
  private dialog = inject(MatDialogRef);

  config = <FormConfig<any>>{
    controls: {
      column: {
        type: Controls.select,
        label: 'Column',
        additionalFields: {
          searchable: false,
          items: [
            { value: 'group', display: 'Group' },
            { value: 'room', display: 'Room' },
            { value: 'subject', display: 'Subject' },
            { value: 'teacher', display: 'Teacher' },
          ],
        },
        valueChanges: c => {
          this.registry.getByNameForSelect(c)
            .pipe(take((1)))
            .subscribe(this.selectedColumnItems.set.bind(this.selectedColumnItems));
        },
        validators: [Validators.required],
      },
      columnId: {
        type: Controls.select,
        label: 'Column value',
        additionalFields: {
          searchable: false,
          items: this.selectedColumnItems,
        },
        validators: [Validators.required],
      },
    },
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: 'Submit',
      onSubmit: e => {
        if (!e.valid) return;

        this.dialog.close(e.value);
      },
    },
  };
}
