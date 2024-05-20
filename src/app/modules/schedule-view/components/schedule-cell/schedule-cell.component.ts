import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../../../entities/schedule';
import { IModeCalculator } from '../base-schedule/mode-calculators/base-mode-calculator';
import { WrappedCarouselComponent } from '../../../../components/wrapped-carousel/wrapped-carousel.component';
import { ScheduleLessonComponent } from '../../../../components/schedule-lesson/schedule-lesson.component';
import {
  ScheduleLessonActionsComponent
} from '../../../schedule-edit/components/schedule-lesson-actions/schedule-lesson-actions.component';
import { CarouselItemDirective } from '../../../../components/wrapped-carousel/carousel-item.directive';
import { HasPermissionDirective } from '@likdan/studyum-core';

@Component({
  selector: 'schedule-cell',
  templateUrl: './schedule-cell.component.html',
  styleUrls: ['./schedule-cell.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WrappedCarouselComponent,
    ScheduleLessonComponent,
    ScheduleLessonActionsComponent,
    CarouselItemDirective,
    HasPermissionDirective,
  ],
})
export class ScheduleCellComponent implements OnInit {
  @Input({ required: false }) lessons!: (ScheduleLesson | ScheduleGeneralLesson)[];
  @Input() isEditMode: boolean = true;

  @Output() delete = new EventEmitter<null>();
  @Output() edit = new EventEmitter<null>();

  instantRouting = signal(false);

  @Input({ required: true, alias: 'modeCalculator' }) set _modeCalculator(c: IModeCalculator) {
    this.instantRouting.set(c.instantRouting);
  }

  ngOnInit(): void {
  }

  lessonTooltip(): string {
    const lesson = this.lessons[0];
    return 'dayIndex' in lesson
      ? this.scheduleGeneralLessonTooltip(lesson)
      : this.scheduleLessonTooltip(lesson);
  }

  scheduleLessonTooltip(lesson: ScheduleLesson): string {
    const f = 'h:mm a';
    return `${lesson.startTime}-${lesson.endTime}`;
  }

  scheduleGeneralLessonTooltip(lesson: ScheduleGeneralLesson): string {
    const f = 'h:mm a';
    return `${lesson.endTime}-${lesson.startTime}`;
  }
}
