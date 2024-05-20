import { ChangeDetectionStrategy, Component, inject, Input, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ScheduleGeneralLesson, ScheduleLesson } from '../../entities/schedule';

@Component({
  selector: 'schedule-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './schedule-lesson.component.html',
  styleUrls: ['./schedule-lesson.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleLessonComponent {
  @Input() editable: boolean = false;
  @Input() showForeground: boolean = true;
  @Input() routing: boolean = false;
  @Input() preview: boolean = false;

  query = {
    studyPlaceID: '',
  };

  lesson!: ScheduleLesson | ScheduleGeneralLesson;

  private zone = inject(NgZone);
  private router = inject(Router);

  @Input({ required: true, alias: 'lesson' })
  set _lesson(value: ScheduleLesson | ScheduleGeneralLesson) {
    this.query = {
      studyPlaceID: value.studyPlaceId ?? '',
    };
    this.lesson = value;
  }

  routerLink(type: string): string {
    const lesson: { [key: string]: any } = this.lesson;
    return `/schedule/${type}/${lesson[`${type}ID`]}`;
  }

  navigate(url: string): void {
    this.zone.run(() => this.router.navigate([url], { queryParams: this.query })).then();
  }
}
