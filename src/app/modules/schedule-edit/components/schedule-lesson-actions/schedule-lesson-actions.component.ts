import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  Input,
  Type,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, switchMap } from 'rxjs';
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
  ],
})
export class ScheduleLessonActionsComponent {
  @Input({ required: true }) lesson!: ScheduleLesson | ScheduleGeneralLesson;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private dialogService = inject(MatDialog);
  private service = inject(ScheduleLessonActionsService);
  private cdr = inject(ChangeDetectorRef);
  private injector = inject(Injector);

  private dialogInjector = Injector.create({ parent: this.injector, providers: [] });

  editLesson(): void {
    this.closeMenu();

    this.dialogService
      .open(this.dialogComponent(), { data: this.lesson, injector: this.dialogInjector })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => v!))
      .pipe(switchMap(data => this.service.editLesson(this.lesson.id!, data)))
      .subscribe();
  }

  duplicateLesson(): void {
    this.closeMenu();

    this.dialogService
      .open(this.dialogComponent(), { data: this.lesson, injector: this.dialogInjector })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => v!))
      .pipe(switchMap(data => this.service.addLesson(data)))
      .subscribe();
  }

  deleteLesson(): void {
    this.closeMenu();

    //todo implement in core
    //
    // const data: ConfirmationDialogData = {
    //   title: 'confirmDeletionTitle',
    //   description: 'confirmDeletionDescription',
    //   icon: 'delete',
    //   color: 'danger',
    // };
    // this.dialogService
    //   .open(ConfirmationDialogComponent, { data: data, injector: this.dialogInjector })
    //   .afterClosed()
    //   .pipe(filterNotNull())
    //   .pipe(switchMap(() => this.service.deleteLesson(this.lesson as ScheduleLesson)))
    //   .subscribe();

    this.service.deleteLesson(this.lesson as ScheduleLesson).subscribe();
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
