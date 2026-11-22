/**
 * Tipos del módulo de progreso.
 *
 * Se reexportan durante la migración porque otras pantallas aún los consumen
 * desde src/types/index.ts. Así no se duplican contratos.
 */
export type {
  AdherenceReport,
  AdminExecutiveOverview,
  AdminOverviewFilters,
  BodyWeightRecord,
  StrengthProgress,
} from '../../types/index.js';
