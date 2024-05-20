import { Directive, ElementRef, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScheduleLesson } from '../../../../entities/schedule';
import { BaseScheduleService } from './base-schedule.service';

@Directive({
  selector: '[scheduleCellPosition]',
  standalone: true,
})
export class ScheduleCellPositionDirective implements OnChanges, OnDestroy {
  @Input({ required: true }) lessons!: ScheduleLesson[];
  @Input({ required: true }) startTime!: Date;

  private service = inject(BaseScheduleService);

  private host = inject(ElementRef<HTMLElement>);
  private modeSubscription?: Subscription;

  ngOnChanges(): void {
    this.modeSubscription = this.service.modeCalculator$.subscribe(c => {
      this.host.nativeElement.style.marginTop = `${c.y(this.lessons)}px`;
      this.host.nativeElement.style.gridColumn = `${c.x(this.lessons)}`;
      this.host.nativeElement.style.height = `${c.height(this.lessons)}px`;
      this.host.nativeElement.style.width = `${c.width(this.lessons)}px`;

      const styles = c.styles(this.lessons);
      for (const stylesKey in styles) {
        this.host.nativeElement.style[stylesKey] = styles[stylesKey];
      }
    });
  }

  ngOnDestroy(): void {
    this.modeSubscription?.unsubscribe();
  }
}
