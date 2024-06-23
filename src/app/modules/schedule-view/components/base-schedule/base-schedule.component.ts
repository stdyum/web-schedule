import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Schedule } from '../../../../entities/schedule';
import { IModeCalculator } from './mode-calculators/base-mode-calculator';
import { BaseScheduleService } from './base-schedule.service';
import { AsyncPipe } from '@angular/common';
import { ScheduleCellComponent } from '../schedule-cell/schedule-cell.component';
import { ScheduleCellPositionDirective } from './schedule-cell-position.directive';
import { ScheduleModeGroupLessonsPipe } from './mode-calculators/pipes/schedule-mode-group-lessons.pipe';
import { TranslationPipe } from '@likdan/studyum-core';

@Component({
  selector: 'base-schedule',
  templateUrl: './base-schedule.component.html',
  styleUrls: ['./base-schedule.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ScheduleCellComponent,
    ScheduleCellPositionDirective,
    ScheduleModeGroupLessonsPipe,
    TranslationPipe,
  ],
})
export class BaseScheduleComponent implements OnInit {
  @Input({ required: true }) schedule!: Schedule;
  modeCalculator$!: Observable<IModeCalculator>;

  private service = inject(BaseScheduleService);

  ngOnInit(): void {
    this.service.reset();
    this.modeCalculator$ = this.service.modeCalculator$;
  }
}
