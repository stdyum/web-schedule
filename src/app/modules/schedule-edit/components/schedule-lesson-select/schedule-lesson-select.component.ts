import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { ScheduleLesson } from '../../../../entities/schedule';
import { TextInputComponent } from '@likdan/form-builder-material/src/components';
import { ScheduleLessonComponent } from '../../../../components/schedule-lesson/schedule-lesson.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TranslationPipe } from '@likdan/studyum-core';

@Component({
  selector: 'schedule-lesson-select',
  templateUrl: './schedule-lesson-select.component.html',
  styleUrls: ['./schedule-lesson-select.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextInputComponent,
    ReactiveFormsModule,
    ScheduleLessonComponent,
    MatIcon,
    MatIconButton,
    TranslationPipe,
  ],
})
export class ScheduleLessonSelectComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) lessons: ScheduleLesson[] = [];
  @Output() onSelect = new EventEmitter<ScheduleLesson | null>();

  searchFormControl = new FormControl<string>('');

  searchedLessons$ = signal<ScheduleLesson[] | null>(null);

  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.searchFormControl.valueChanges
      .pipe(map(() => this.lessons.filter(this.isLessonInSearch.bind(this))))
      .subscribe(l => this.searchedLessons$.set(l));
  }

  ngAfterViewInit(): void {
    this.searchFormControl.updateValueAndValidity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lessons']) this.searchFormControl.updateValueAndValidity();
  }

  select(lesson: ScheduleLesson | null = null): void {
    this.onSelect.emit(lesson);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private isLessonInSearch(lesson: ScheduleLesson): boolean {
    const search = this.searchFormControl.value?.toLowerCase();
    if (!search) return true;

    return (
      lesson.subject.name.toLowerCase().indexOf(search) !== -1 ||
      lesson.teacher.name.toLowerCase().indexOf(search) !== -1 ||
      lesson.room.name.toLowerCase().indexOf(search) !== -1 ||
      lesson.group.name.toLowerCase().indexOf(search) !== -1
    );
  }
}
