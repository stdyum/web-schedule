import { ChangeDetectionStrategy, Component, inject, Input, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, switchMap } from 'rxjs';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../../../entities/schedule';
import { ScheduleAddLessonViewService } from './schedule-add-lesson-view.service';
import {
  DialogConfig as LessonDialogConfig,
  ScheduleAddLessonDialogComponent,
} from '../../dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.component';
import { ScheduleLessonSelectComponent } from '../schedule-lesson-select/schedule-lesson-select.component';
import {
  DialogConfig as GeneralLessonDialogConfig,
  ScheduleAddGeneralLessonDialogComponent,
} from '../../dialogs/schedule-add-genral-lesson-dialog/schedule-add-general-lesson-dialog.component';

@Component({
  selector: 'schedule-add-lesson-view',
  templateUrl: './schedule-add-lesson-view.component.html',
  styleUrls: ['./schedule-add-lesson-view.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ScheduleLessonSelectComponent,
  ],
})
export class ScheduleAddLessonViewComponent {
  @Input({ required: true }) availableLessons: ScheduleLesson[] = [];

  private dialogService = inject(MatDialog);
  private service = inject(ScheduleAddLessonViewService);

  addLesson(template: ScheduleLesson | null): void {
    this.dialogService
      .open(this.dialogComponent(), { data: this.dialogConfig(template, false) })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => v!))
      .pipe(switchMap(data => this.service.addLesson(data)))
      .subscribe();
  }

  private dialogComponent(): Type<any> {
    return this.service.isGeneral
      ? ScheduleAddGeneralLessonDialogComponent
      : ScheduleAddLessonDialogComponent;
  }

  private dialogConfig(initial: ScheduleLesson | ScheduleGeneralLesson | null, isEditMode: boolean): LessonDialogConfig | GeneralLessonDialogConfig | null {
    if (!initial) return null;

    return this.service.isGeneral
      ? <GeneralLessonDialogConfig>{
        initial: initial,
        hideDayControls: isEditMode,
      }
      : <LessonDialogConfig>{
        initial: initial,
        hideDateControls: isEditMode,
      };
  }
}
