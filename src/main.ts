import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppConfig } from './app/app.config';  // Configuració de les rutes

platformBrowserDynamic()
  .bootstrapModule(AppConfig)
  .catch((err) => console.error(err));
