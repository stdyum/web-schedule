import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '@likdan/form-builder-material/src/components';

@Injectable({
  providedIn: 'root',
})
export class ScheduleAddGeneralLessonService {
  //todo get from backend
  get primaryColors$(): Observable<Item[]> {
    return of([
      {
        value: '#ffffff',
        display: 'white',
      },
      {
        value: '#99ff99',
        display: 'lime',
      },
      {
        value: '#9999ff',
        display: 'purple',
      },
    ] as Item[]);
  }

  //todo
  get secondaryColors$(): Observable<Item[]> {
    return of([
      {
        value: '#ffffff',
        display: 'white',
      },
      {
        value: '#99ff99',
        display: 'lime',
      },
      {
        value: '#9999ff',
        display: 'purple',
      },
    ] as Item[]);
  }
}
