import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';
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
  private translation = inject(TranslationService);

  config = <FormConfig<any>>{
    controls: {
      column: {
        type: Controls.select,
        label: this.translation.getTranslation('preferences_form_column'),
        additionalFields: {
          searchable: false,
          items: computed(() => [
            { value: 'group', display: this.translation.getTranslation('preferences_form_column_group')() },
            { value: 'room', display: this.translation.getTranslation('preferences_form_column_room')() },
            { value: 'subject', display: this.translation.getTranslation('preferences_form_column_subject')() },
            { value: 'teacher', display: this.translation.getTranslation('preferences_form_column_teacher')() },
          ]),
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
        label: this.translation.getTranslation('preferences_form_column_name'),
        additionalFields: {
          searchable: false,
          items: this.selectedColumnItems,
        },
        validators: [Validators.required],
      },
    },
    submit: {
      button: Buttons.Submit.Flat,
      buttonText: this.translation.getTranslation('preferences_form_submit'),
      onSubmit: e => {
        if (!e.valid) return;

        this.dialog.close(e.value);
      },
    },
  };
}
