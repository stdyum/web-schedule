import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'schedule-plug',
  templateUrl: './schedule-plug.component.html',
  styleUrls: ['./schedule-plug.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePlugComponent {
}
