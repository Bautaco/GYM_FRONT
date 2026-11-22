import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders.js';
import { AppRoutes } from './AppRoutes.js';

/** Punto de composición de router, providers y rutas de la aplicación. */
export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
