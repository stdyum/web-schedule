import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScheduleHeaderComponent } from './components/schedule-header/schedule-header.component';
import { ScheduleViewComponent } from './modules/schedule-view/schedule-view.component';
import { PreferencesService, SchedulePreferences } from '@likdan/studyum-core';
import { map, Observable, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PreferencesDialogComponent } from './dialogs/preferences-dialog/preferences-dialog.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ScheduleHeaderComponent, ScheduleViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private preferencesService = inject(PreferencesService);

  preferences = toSignal(
    this.preferencesService.load()
      .pipe(switchMap(p => p?.schedule ? of(p.schedule) : this.createPreferences())),
  );

  private dialog = inject(MatDialog);

  private createPreferences(): Observable<SchedulePreferences> {
    return this.openPreferencesDialog()
      .pipe(switchMap(p =>
        this.preferencesService.save('schedule', p)
          .pipe(map(() => p))),
      );
  }

  private openPreferencesDialog(): Observable<SchedulePreferences> {
    return this.dialog.open(PreferencesDialogComponent, {
      disableClose: true,
    }).afterClosed();
  }
}
