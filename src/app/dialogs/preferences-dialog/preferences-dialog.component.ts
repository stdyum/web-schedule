import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilderComponent, FormConfig } from '@likdan/form-builder-core';
import { Buttons, Controls } from '@likdan/form-builder-material';
import { RegistryService, TranslationService } from '@likdan/studyum-core';
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  selectedColumnItems = signal<Object>([]);

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
          const config = this.registry.getByNamePaginatedSelectConfig(c);
          ((config as any)["items"] as Observable<any[]>)
            .pipe(takeUntilDestroyed())
            .subscribe(i => this.selectedColumnItems.set({ ...config, items: i }))
        },
        validators: [Validators.required],
      },
      columnId: {
        type: Controls.select,
        label: this.translation.getTranslation('preferences_form_column_name'),
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
