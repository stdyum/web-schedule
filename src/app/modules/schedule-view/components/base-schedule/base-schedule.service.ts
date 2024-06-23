import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IModeCalculator } from './mode-calculators/base-mode-calculator';
import { ScheduleMode, ScheduleService } from '../../../../services/schedule.service';
import { ExtendedTableModeCalculator } from './mode-calculators/extended-table.mode-calculator';
import { GeneralSchedule, Schedule } from '../../../../entities/schedule';
import { TableModeCalculator } from './mode-calculators/table.mode-calculator';
import { TimeModeCalculator } from './mode-calculators/time.mode-calculator';

@Injectable({
  providedIn: 'root',
})
export class BaseScheduleService {
  modeCalculator$!: Observable<IModeCalculator>;

  private service = inject(ScheduleService);
  private modeCalculators: { [key: string]: IModeCalculator } = {};

  constructor() {
    this.modeCalculator$ = this.service.mode$.pipe(map(this.getModeCalculator.bind(this)));
  }

  reset(): void {
    this.modeCalculators = {};
  }

  private getModeCalculator(mode: ScheduleMode): IModeCalculator {
    if (this.modeCalculators[mode]) return this.modeCalculators[mode];

    let calculator!: IModeCalculator;
    switch (mode) {
      case 'time':
        calculator = new TimeModeCalculator();
        break;
      case 'table':
        calculator = new TableModeCalculator();
        break;
      case 'tableExpanded':
        calculator = new ExtendedTableModeCalculator();
        break;
    }
    if (this.service.schedule) {
      const schedule = this.service.schedule;
      this.getScheduleType(schedule) === 'current'
        ? calculator.initSchedule(schedule as Schedule)
        : calculator.initGeneralSchedule(schedule as GeneralSchedule);
    }

    return (this.modeCalculators[mode] = calculator);
  }

  private getScheduleType(schedule: Schedule | GeneralSchedule): 'current' | 'general' {
    return 'startDate' in schedule.info && new Date(schedule.info.startDate).getFullYear() !== 1 ? 'current' : 'general';
  }
}
