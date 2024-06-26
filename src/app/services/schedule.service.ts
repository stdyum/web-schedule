import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GeneralSchedule, Schedule, ScheduleGeneralLesson, ScheduleLesson } from '../entities/schedule';
import { GetScheduleDTO } from '../entities/schedule.dto';
import { ToggleSubject } from '../../utils/toggle.subject';
import { httpContextWithStudyPlace } from '@likdan/studyum-core';
import { ActivatedRoute, Router } from '@angular/router';

export type ScheduleMode = 'time' | 'table' | 'tableExpanded';
export type ScheduleDisplay = 'current' | 'general';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  mode$ = new ToggleSubject<ScheduleMode>(['time', 'table', 'tableExpanded'], 'table');
  display$ = new ToggleSubject<ScheduleDisplay>(['current', 'general']);

  isGeneral = false;

  private http = inject(HttpClient);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.display$
      .pipe(switchMap(d =>
        this.router.navigate([], {
          queryParams: { 'display': d },
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        }),
      ))
      .subscribe();
  }

  private _schedule$ = new BehaviorSubject<Schedule | GeneralSchedule | null>(null);

  get schedule$(): Observable<Schedule | GeneralSchedule> {
    return this._schedule$
      .pipe(filter(v => !!v))
      .pipe(map(v => v!));
  }

  get schedule(): Schedule | GeneralSchedule | null {
    return this._schedule$.value;
  }

  get lessons(): (ScheduleLesson | ScheduleGeneralLesson)[] {
    return this._schedule$.value?.lessons ?? [];
  }

  set lessons(lessons: (ScheduleLesson | ScheduleGeneralLesson)[]) {
    if (!this.schedule) return;
    const schedule = this.schedule;
    schedule.lessons = lessons as any;
    this._schedule$.next(schedule);
  }

  getSchedule(dto: GetScheduleDTO): Observable<Schedule> {
    return this.http
      .get<Schedule>('api/schedule/v1/schedule', {
        params: dto ?? {},
        context: httpContextWithStudyPlace(),
      })
      .pipe(map(s => this.processSchedule(s)))
      .pipe(tap(s => this._schedule$.next(s)))
      .pipe(tap(() => (this.isGeneral = false)));
  }

  getGeneralSchedule(dto: GetScheduleDTO): Observable<GeneralSchedule> {
    return this.http
      .get<GeneralSchedule>('api/schedule/v1/schedule/general', {
        params: dto ?? {},
        context: httpContextWithStudyPlace(),
      })
      .pipe(map(s => this.processGeneralSchedule(s)))
      .pipe(tap(s => this._schedule$.next(s)))
      .pipe(tap(() => (this.isGeneral = true)));
  }

  private processSchedule(schedule: Schedule): Schedule {
    schedule.info.startDate = new Date(schedule.info.startDate);
    schedule.info.endDate = new Date(schedule.info.endDate);

    schedule.lessons.forEach(l => {
      l.startTime = new Date(l.startTime);
      l.endTime = new Date(l.endTime);
    });

    return schedule;
  }

  private processGeneralSchedule(schedule: GeneralSchedule): GeneralSchedule {
    const timezoneOffset = new Date().getTimezoneOffset();
    schedule.lessons.forEach(l => {
      l.startTime = new Date((l.startTime as any as number) / 1_000_000);
      l.endTime = new Date((l.endTime as any as number) / 1_000_000);

      l.startTime.setMinutes(l.startTime.getMinutes() + timezoneOffset);
      l.endTime.setMinutes(l.endTime.getMinutes() + timezoneOffset);

      l.startTime.setDate(l.startTime.getDate() - l.startTime.getDay() + l.dayIndex);
      l.endTime.setDate(l.endTime.getDate() - l.endTime.getDay() + l.dayIndex);
    });

    return schedule;
  }
}
