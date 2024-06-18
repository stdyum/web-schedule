import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, Type, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, switchMap, take } from 'rxjs';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../../../entities/schedule';
import { ScheduleLessonActionsService } from './schedule-lesson-actions.service';
import {
  ScheduleAddLessonDialogComponent,
} from '../../dialogs/schedule-add-lesson-dialog/schedule-add-lesson-dialog.component';
import {
  ScheduleAddGeneralLessonDialogComponent,
} from '../../dialogs/schedule-add-genral-lesson-dialog/schedule-add-general-lesson-dialog.component';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialog, TranslationPipe } from '@likdan/studyum-core';

@Component({
  selector: 'schedule-lesson-actions',
  templateUrl: './schedule-lesson-actions.component.html',
  styleUrls: ['./schedule-lesson-actions.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatMenu,
    MatMenuItem,
    MatIcon,
    MatMenuTrigger,
    TranslationPipe,
  ],
})
export class ScheduleLessonActionsComponent {
  @Input({ required: true }) lesson!: ScheduleLesson | ScheduleGeneralLesson;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private dialogService = inject(MatDialog);
  private service = inject(ScheduleLessonActionsService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  editLesson(): void {
    this.closeMenu();

    this.dialogService
      .open(this.dialogComponent(), { data: this.lesson })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => v!))
      .pipe(switchMap(data => this.service.editLesson(this.lesson.id!, data)))
      .subscribe();
  }

  duplicateLesson(): void {
    this.closeMenu();

    this.dialogService
      .open(this.dialogComponent(), { data: this.lesson })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => v!))
      .pipe(switchMap(data => this.service.addLesson(data)))
      .subscribe();
  }

  deleteLesson(): void {
    this.closeMenu();

    this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'dialogs_delete_confirmation_title',
        body: 'dialogs_delete_confirmation_body',
        confirmButtonText: 'dialogs_delete_confirmation_confirm_button',
        confirmButtonColor: 'error',
        cancelButtonText: 'dialogs_delete_confirmation_cancel_button',
      },
    })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(switchMap(() => this.service.deleteLesson(this.lesson as ScheduleLesson)))
      .pipe(take(1))
      .subscribe();
  }

  private dialogComponent(): Type<any> {
    return this.service.isGeneral
      ? ScheduleAddGeneralLessonDialogComponent
      : ScheduleAddLessonDialogComponent;
  }

  private closeMenu(): void {
    this.menuTrigger.closeMenu();
    this.cdr.detectChanges();
  }
}
