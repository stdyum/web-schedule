import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { PageWrapperComponent } from '@likdan/studyum-core';

bootstrapApplication(PageWrapperComponent, appConfig)
  .catch((err) => console.error(err));
