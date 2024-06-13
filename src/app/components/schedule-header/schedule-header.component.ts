import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { GeneralSchedule, Schedule } from '../../entities/schedule';
import { ScheduleMode, ScheduleService } from '../../services/schedule.service';
import { SearchScheduleFormData } from '../../dialogs/search-schedule-dialog/search-schedule-dialog.dto';
import { SearchScheduleDialogComponent } from '../../dialogs/search-schedule-dialog/search-schedule-dialog.component';
import { AsyncPipe } from '@angular/common';
import { BreadcrumbsViewComponent } from '../breadcrumbs-view/breadcrumbs-view.component';

@Component({
  selector: 'schedule-header',
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    AsyncPipe,
    BreadcrumbsViewComponent,
  ],
  templateUrl: './schedule-header.component.html',
  styleUrls: ['./schedule-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleHeaderComponent implements OnInit, OnDestroy {
  schedule$!: Observable<Schedule | GeneralSchedule>;
  mode$!: Observable<ScheduleMode>;

  private service = inject(ScheduleService);
  private dialogService = inject(MatDialog);
  private router = inject(Router);

  private navigateSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.schedule$ = this.service.schedule$;
    this.mode$ = this.service.mode$;
  }

  showSearchDialog(): void {
    const info = this.service.schedule?.info;
    const data: SearchScheduleFormData = info
      ? {
        column: info.column,
        columnId: info.columnId,
        startDate: 'startDate' in info ? info.startDate : null,
        endDate: 'endDate' in info ? info.endDate : null,
      }
      : {};

    this.navigateSubscription = this.dialogService
      .open(SearchScheduleDialogComponent, { data: data })
      .afterClosed()
      .pipe(filter(v => !!v))
      .pipe(map(v => <SearchScheduleFormData>v))
      .pipe(
        switchMap(data =>
          this.router.navigate([data.column, data.columnId], {
            queryParams: {
              startDate: data.startDate,
              endDate: data.endDate,
            },
          }),
        ),
      )
      .pipe(take(1))
      .subscribe();
  }

  toggleViewType(): void {
    this.service.mode$.toggle(['time', 'table']);
  }

  toggleExpand(): void {
    this.service.mode$.toggle(['table', 'tableExpanded']);
  }

  toggleViewMode(): void {
    this.service.display$.toggle();
  }

  breadcrumbs(schedule: Schedule | GeneralSchedule): string[] {
    const base = [
      `schedule_breadcrumbs_${schedule.info.column}`,
      schedule.info.columnName,
      this.getDisplayBreadcrumb(this.service.display$.value),
      this.getModeBreadcrumb(this.service.mode$.value),
    ];

    if ('startDate' in schedule.info && new Date(schedule.info.startDate).getMilliseconds() !== 0) {
      const start = schedule.info.startDate.toLocaleDateString();
      const end = schedule.info.endDate.toLocaleDateString();
      base.push(`${start}-${end}`);
    }

    return base;
  }

  ngOnDestroy(): void {
    this.navigateSubscription?.unsubscribe();
  }

  private getDisplayBreadcrumb(value: string): string {
    switch (value) {
      case 'current':
        return 'schedule_breadcrumbs_current';
      case 'general':
        return 'schedule_breadcrumbs_general';
    }

    return '';
  }

  private getModeBreadcrumb(value: string): string {
    switch (value) {
      case 'time':
        return 'schedule_breadcrumbs_time';
      case 'table':
        return 'schedule_breadcrumbs_table';
      case 'tableExpanded':
        return 'schedule_breadcrumbs_table_expanded';
    }

    return '';
  }
}
