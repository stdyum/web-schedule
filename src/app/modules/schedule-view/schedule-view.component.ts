import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { combineLatest, debounceTime, map, merge, Observable, of, pipe, switchMap, tap, zip } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { DefaultStateDirective, LoadedStateDirective, state, State, StateMapperComponent } from '@likdan/state-mapper';
import { GeneralSchedule, Schedule } from '../../entities/schedule';
import { ScheduleService } from '../../services/schedule.service';
import { HasPermissionDirective, PreferencesService } from '@likdan/studyum-core';
import { GetScheduleDTO } from '../../entities/schedule.dto';
import { SchedulePlugComponent } from './components/schedule-plug/schedule-plug.component';
import { BaseScheduleComponent } from './components/base-schedule/base-schedule.component';
import {
  ScheduleAddLessonViewComponent,
} from '../schedule-edit/components/schedule-add-lesson-view/schedule-add-lesson-view.component';

@Component({
  selector: 'schedule-view',
  templateUrl: './schedule-view.component.html',
  styleUrls: ['./schedule-view.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StateMapperComponent,
    SchedulePlugComponent,
    BaseScheduleComponent,
    LoadedStateDirective,
    DefaultStateDirective,
    ScheduleAddLessonViewComponent,
    HasPermissionDirective,
  ],
})
export class ScheduleViewComponent implements OnInit {
  schedule$!: Observable<State<Schedule | GeneralSchedule | null>>;

  protected readonly SchedulePlugComponent = SchedulePlugComponent;

  private route = inject(ActivatedRoute);
  private service = inject(ScheduleService);
  private preferencesService = inject(PreferencesService);

  ngOnInit(): void {
    const schedule$ = combineLatest([this.route.params, this.route.queryParams])
      .pipe(map(v => <Params>{ ...v[0], ...v[1] }))
      .pipe(debounceTime(50))
      .pipe(
        state(
          pipe(
            map(this.parseParams.bind(this)),
            switchMap(p => p ?? this.getParamsFromStorage()),
            tap(p => this.saveParamsToStorage(p)),
            switchMap(p =>
              p?.general ? this.service.getGeneralSchedule(p) : this.service.getSchedule(p),
            ),
            map(s => (s?.lessons ? s : null)),
            tap({ error: () => this.removeParamsFromStorage() }),
          ),
        ),
      );

    this.schedule$ = merge(
      schedule$,
      this.service.schedule$.pipe(
        map(
          s =>
            <State<Schedule>>{
              state: 'loaded',
              data: s,
            },
        ),
      ),
    );
  }

  private getParamsFromStorage(): GetScheduleDTO {
    const params = JSON.parse(localStorage.getItem('schedule') ?? 'null');
    params['general'] = this.service.display$.value === 'general';
    return params;
  }

  private saveParamsToStorage(p: GetScheduleDTO): void {
    localStorage.setItem('schedule', JSON.stringify(p));
  }

  private removeParamsFromStorage(): void {
    localStorage.removeItem('schedule');
  }

  private parseParams(root: Params): Observable<GetScheduleDTO> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const to = new Date(startOfWeek);
    to.setDate(to.getDate() + 7);

    const preferences = this.preferencesService.schedule()!;

    return of({
      column: root['column'] ?? preferences.column,
      columnId: root['columnId'] ?? preferences.columnId,
      general: root['display'] === 'general',
      from: root['startDate'] ?? startOfWeek.toISOString(),
      to: root['endDate'] ?? to.toISOString(),
    });
  }
}
