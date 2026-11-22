/**
 * Página de métricas: peso corporal, adherencia, fuerza y panel administrativo.
 * Se conserva su lógica actual durante la migración del módulo.
 */
import React, { useState, useEffect } from 'react';
import '../progress.css';
import {
  TrendingUp,
  Scale,
  Award,
  Calendar,
  User,
  Plus,
  Activity,
  CheckCircle2,
  AlertCircle,
  Shield,
  Users,
  Dumbbell,
  Zap,
  Flame,
  AlertTriangle,
  ChevronRight,
  Target,
  BarChart2,
  Clock,
  Filter,
  RefreshCw,
  Video,
  PlayCircle,
  Smartphone,
  Film,
  Search,
  PieChart as PieChartIcon,
  Check,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { progressService } from '../progress.service.js';
import { exercisesService } from '../../exercises/exercises.service.js';
import { authService } from '../../../shared/auth/auth.service.js';
import { useAuth } from '../../../shared/auth/AuthContext.js';
import { UserRole, type User as UserModel } from '../../../types/index.js';
import type { Exercise } from '../../exercises/exercises.types.js';
import type {
  BodyWeightRecord,
  AdherenceReport,
  StrengthProgress,
  AdminExecutiveOverview,
  AdminOverviewFilters,
} from '../progress.types.js';
import { BodyWeightModal } from '../components/BodyWeightModal.js';

export const ProgressPage: React.FC = () => {
  // La sesión actual determina si se muestra la vista individual o administrativa.
  const { user, role } = useAuth();
  const isAdmin = role === UserRole.ADMIN;

  // Pestaña activa para el administrador: 'car_overview' (visión global) o 'athlete_audit' (individual)
  const [activeTab, setActiveTab] = useState<'car_overview' | 'athlete_audit'>(
    isAdmin ? 'car_overview' : 'athlete_audit',
  );

  // Filtros interactivos del panel del Administrador
  const [adminPeriod, setAdminPeriod] = useState<'all' | '30d' | '90d' | '365d'>('all');
  const [adminTrainerId, setAdminTrainerId] = useState<string>('all');
  const [adminAdherenceRange, setAdminAdherenceRange] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [athleteSearchTerm, setAthleteSearchTerm] = useState<string>('');
  const [trainers, setTrainers] = useState<UserModel[]>([]);

  // Datos para la visión individual de atleta
  const [athletes, setAthletes] = useState<UserModel[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const [weightHistory, setWeightHistory] = useState<BodyWeightRecord[]>([]);
  const [adherenceData, setAdherenceData] = useState<AdherenceReport | null>(null);
  const [strengthData, setStrengthData] = useState<StrengthProgress | null>(null);

  // Datos para el panel ejecutivo del administrador
  const [adminOverview, setAdminOverview] = useState<AdminExecutiveOverview | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const selectedAthlete = athletes.find((athlete) => athlete.id === selectedAthleteId);
  const selectedAthleteAvatar =
    selectedAthlete?.avatarUrl ||
    (selectedAthlete
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAthlete.fullName)}&background=eed8c0&color=5a0505&bold=true`
      : '');

  useEffect(() => {
    initView();
  }, [user, role]);

  const initView = async () => {
    setIsLoading(true);
    try {
      // Si es administrador, cargamos además el reporte ejecutivo del CAR y lista de entrenadores
      if (isAdmin) {
        loadAdminOverview({ period: 'all', trainerId: 'all', adherenceRange: 'all' });
        authService.getTrainers().then(setTrainers).catch(console.error);
      }

      const exerciseList = await exercisesService.getExercises();
      setExercises(exerciseList);
      if (exerciseList.length > 0) {
        setSelectedExerciseId(exerciseList[0].id);
      }

      if (role === UserRole.ENTRENADOR || role === UserRole.ADMIN) {
        const athletesList = await authService.getAthletes();
        setAthletes(athletesList);
        if (athletesList.length > 0) {
          setSelectedAthleteId(athletesList[0].id);
          await loadAthleteMetrics(athletesList[0].id, exerciseList[0]?.id);
        }
      } else if (user) {
        setSelectedAthleteId(user.id);
        await loadAthleteMetrics(user.id, exerciseList[0]?.id);
      }
    } catch (e) {
      console.error('Error al inicializar panel de métricas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminOverview = async (filtersOverride?: AdminOverviewFilters) => {
    setIsLoadingAdmin(true);
    try {
      const filtersToUse: AdminOverviewFilters = filtersOverride || {
        period: adminPeriod,
        trainerId: adminTrainerId,
        adherenceRange: adminAdherenceRange,
      };
      const data = await progressService.getAdminOverview(filtersToUse);
      setAdminOverview(data);
    } catch (e) {
      console.error('Error al cargar métricas ejecutivas del CAR:', e);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handlePeriodChange = (newPeriod: 'all' | '30d' | '90d' | '365d') => {
    setAdminPeriod(newPeriod);
    loadAdminOverview({
      period: newPeriod,
      trainerId: adminTrainerId,
      adherenceRange: adminAdherenceRange,
    });
  };

  const handleTrainerFilterChange = (newTrainerId: string) => {
    setAdminTrainerId(newTrainerId);
    loadAdminOverview({
      period: adminPeriod,
      trainerId: newTrainerId,
      adherenceRange: adminAdherenceRange,
    });
  };

  const handleAdherenceFilterChange = (newRange: 'all' | 'green' | 'yellow' | 'red') => {
    setAdminAdherenceRange(newRange);
    loadAdminOverview({
      period: adminPeriod,
      trainerId: adminTrainerId,
      adherenceRange: newRange,
    });
  };

  const loadAthleteMetrics = async (athleteId: string, exerciseId?: string) => {
    if (!athleteId) return;
    try {
      const targetExerciseId = exerciseId || selectedExerciseId;
      const [weights, adherence, strength] = await Promise.all([
        progressService.getWeightHistory(athleteId),
        progressService.getAdherence(athleteId),
        targetExerciseId
          ? progressService.getStrengthProgress(athleteId, targetExerciseId)
          : Promise.resolve(null),
      ]);
      setWeightHistory(weights);
      setAdherenceData(adherence);
      setStrengthData(strength);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAthleteChange = async (newAthleteId: string) => {
    setSelectedAthleteId(newAthleteId);
    await loadAthleteMetrics(newAthleteId, selectedExerciseId);
  };

  const handleExerciseChange = async (newExId: string) => {
    setSelectedExerciseId(newExId);
    if (!selectedAthleteId) return;
    try {
      const strength = await progressService.getStrengthProgress(
        selectedAthleteId,
        newExId,
      );
      setStrengthData(strength);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper para renderizar gráfico SVG de fuerza
  const renderStrengthChart = () => {
    if (!strengthData || strengthData.history.length === 0) {
      return (
        <div className="chart-empty-state">
          <Activity size={32} className="text-muted" />
          <p>No hay registros históricos de cargas para este ejercicio aún.</p>
        </div>
      );
    }

    const data = strengthData.history;
    const maxVal = Math.max(...data.map((d: any) => d.maxWeightKg), 10);
    const minVal = Math.min(...data.map((d: any) => d.maxWeightKg), 0);
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 220;
    const padding = 40;

    const points = data.map((d: any, idx: number) => {
      const x =
        padding +
        (idx / (data.length - 1 || 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((d.maxWeightKg - minVal) / range) * (height - padding * 2);
      return { x, y, ...d };
    });

    const pathD = points
      .map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="analytics-svg">
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="var(--chart-grid)"
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="var(--chart-grid)"
            strokeDasharray="4"
          />

          <path
            d={pathD}
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {points.map((p: any, i: number) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="var(--chart-line)"
                stroke="var(--bg-card)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fill="var(--text-main)"
                fontSize="12"
                fontWeight="600"
              >
                {p.maxWeightKg} kg
              </text>
              <text
                x={p.x}
                y={height - padding + 18}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
              >
                {p.date.split('-').slice(1).join('/')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Helper para renderizar gráfico SVG de Peso Corporal
  const renderWeightChart = () => {
    if (weightHistory.length === 0) {
      return (
        <div className="chart-empty-state">
          <Scale size={32} className="text-muted" />
          <p>No se han registrado pesajes todavía.</p>
        </div>
      );
    }

    const data = weightHistory;
    const maxVal = Math.max(...data.map((d) => d.weightKg), 10);
    const minVal = Math.min(...data.map((d) => d.weightKg), 0);
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 220;
    const padding = 40;

    const points = data.map((d, idx) => {
      const x =
        padding +
        (idx / (data.length - 1 || 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((d.weightKg - minVal) / range) * (height - padding * 2);
      return { x, y, ...d };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return (
      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="analytics-svg">
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="var(--chart-grid)"
          />

          <path
            d={pathD}
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="var(--chart-line)"
                stroke="var(--bg-card)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fill="var(--text-main)"
                fontSize="12"
                fontWeight="600"
              >
                {p.weightKg} kg
              </text>
              <text
                x={p.x}
                y={height - padding + 18}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="11"
              >
                {new Date(p.date || p.recordedAt || Date.now()).toLocaleDateString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // =========================================================================
  // RENDER: DASHBOARD EJECUTIVO DE ALTO RENDIMIENTO (PARA ADMINISTRADOR)
  // =========================================================================
  const renderAdminExecutiveDashboard = () => {
    if (isLoadingAdmin) {
      return (
        <div className="car-loading-box">
          <div className="spinner"></div>
          <p>Cargando auditoría y métricas de alto rendimiento del centro...</p>
        </div>
      );
    }

    if (!adminOverview) {
      return (
        <div className="chart-empty-state card-glass">
          <AlertCircle size={36} className="text-accent" />
          <p>No se pudo sincronizar la información gerencial de la base de datos.</p>
          <button onClick={() => loadAdminOverview()} className="btn btn-secondary btn-sm mt-2">
            Reintentar
          </button>
        </div>
      );
    }

    const {
      adherenceAndCoverage,
      loadAndSportsPerformance,
      staffAndCatalogOperation,
    } = adminOverview;

    // Datos procesados para Recharts
    const adherenceRangesData = [
      {
        rango: 'Óptima (≥80%)',
        atletas: adherenceAndCoverage.adherenceRanges.green.count,
        porcentaje: adherenceAndCoverage.adherenceRanges.green.percentage,
        color: '#10b981',
      },
      {
        rango: 'Regular (50-79%)',
        atletas: adherenceAndCoverage.adherenceRanges.yellow.count,
        porcentaje: adherenceAndCoverage.adherenceRanges.yellow.percentage,
        color: '#f59e0b',
      },
      {
        rango: 'Crítica (<50%)',
        atletas: adherenceAndCoverage.adherenceRanges.red.count,
        porcentaje: adherenceAndCoverage.adherenceRanges.red.percentage,
        color: '#ef4444',
      },
    ];

    const planCoveragePieData = [
      {
        name: 'Planes Activos',
        value: adherenceAndCoverage.planCoverage.athletesWithActivePlan,
        color: '#10b981',
      },
      {
        name: 'Planes Vencidos',
        value: adherenceAndCoverage.planCoverage.athletesWithExpiredPlan,
        color: '#f59e0b',
      },
      {
        name: 'Sin Plan Asignado',
        value: adherenceAndCoverage.planCoverage.athletesWithoutPlan,
        color: '#ef4444',
      },
    ].filter((item) => item.value > 0);

    const rpeDistributionData = (loadAndSportsPerformance.fatigueAndLoad.rpeDistribution || []).map((item) => ({
      nivel: item.level.split('(')[0].trim(),
      rango: item.range,
      sesiones: item.count,
      porcentaje: item.percentage,
      color:
        item.range === '1-4'
          ? '#10b981'
          : item.range === '5-7'
          ? '#207384'
          : item.range === '8-9'
          ? '#f59e0b'
          : '#ef4444',
    }));

    const strengthEvolutionChartData = (
      loadAndSportsPerformance.strengthAndRecords.strengthEvolution || []
    ).map((m) => ({
      mes: m.monthYear,
      tonelajeTn: Math.round((m.tonnageKg / 1000) * 10) / 10,
      tonelajeKg: m.tonnageKg,
      sesiones: m.sessionsCount,
      prs: m.prsDetected,
      rpePromedio: m.averageRpe,
    }));

    // Filtrar atletas por buscador de texto
    const filteredAthletes = (adherenceAndCoverage.athletesList || []).filter((ath) => {
      if (!athleteSearchTerm.trim()) return true;
      const term = athleteSearchTerm.toLowerCase();
      return (
        ath.athleteName.toLowerCase().includes(term) ||
        ath.trainerName.toLowerCase().includes(term) ||
        ath.planName.toLowerCase().includes(term)
      );
    });

    // Tooltip personalizado para Recharts adaptado al tema
    const CustomRechartsTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="car-recharts-tooltip">
            <p className="tooltip-title">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} className="tooltip-item" style={{ color: entry.color || entry.fill }}>
                {entry.name || 'Valor'}: <strong>{entry.value}</strong>
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="car-admin-dashboard">
        {/* Banner Institucional del CAR */}
        <div className="car-institutional-badge-row">
          <div className="car-badge-pill">
            <Shield size={16} />
            <span>CENTRO DE ALTO RENDIMIENTO (CAR) — DIRECCIÓN TÉCNICA</span>
          </div>
          <div className="car-institutional-subtext">
            <span>Base de datos PostgreSQL en tiempo real • Métricas sin alcance comercial</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BARRA DE FILTROS ESTRATÉGICOS (PERÍODO, ENTRENADOR, ADHERENCIA) */}
        {/* ================================================================= */}
        <div className="car-filters-panel card-glass">
          <div className="car-filter-group">
            <Filter size={16} className="text-accent" />
            <span className="car-filter-label">Filtros de Auditoría:</span>
          </div>

          <div className="car-filter-controls">
            {/* Filtro por Período */}
            <div className="car-select-wrapper">
              <label htmlFor="periodFilter" className="visually-hidden">Período</label>
              <select
                id="periodFilter"
                value={adminPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as any)}
                className="form-input form-select-sm"
              >
                <option value="all">Todo el Historial</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días (Trimestre)</option>
                <option value="365d">Último Año (365 días)</option>
              </select>
            </div>

            {/* Filtro por Preparador Físico */}
            <div className="car-select-wrapper">
              <label htmlFor="trainerFilter" className="visually-hidden">Entrenador</label>
              <select
                id="trainerFilter"
                value={adminTrainerId}
                onChange={(e) => handleTrainerFilterChange(e.target.value)}
                className="form-input form-select-sm"
              >
                <option value="all">Todos los Entrenadores</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Entrenador: {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Rango de Adherencia */}
            <div className="car-select-wrapper">
              <label htmlFor="adherenceRangeFilter" className="visually-hidden">Rango de Adherencia</label>
              <select
                id="adherenceRangeFilter"
                value={adminAdherenceRange}
                onChange={(e) => handleAdherenceFilterChange(e.target.value as any)}
                className="form-input form-select-sm"
              >
                <option value="all">Todas las Adherencias</option>
                <option value="green">Óptima (≥ 80%) — Verde</option>
                <option value="yellow">Regular (50–79%) — Amarillo</option>
                <option value="red">Crítica (&lt; 50%) — Rojo</option>
              </select>
            </div>

            {/* Botón Refrescar */}
            <button
              type="button"
              onClick={() => loadAdminOverview()}
              className="btn btn-secondary btn-sm"
              title="Actualizar métricas en tiempo real"
            >
              <RefreshCw size={14} className={isLoadingAdmin ? 'spin-icon' : ''} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BLOQUE 1: ADHERENCIA Y COBERTURA DE PLANES                        */}
        {/* ================================================================= */}
        <div className="car-block-container">
          <div className="car-block-header">
            <div>
              <h2 className="car-block-title">
                <Target size={22} className="text-primary" />
                1. Adherencia y Cobertura de Planes
              </h2>
              <p className="car-block-subtitle">
                Supervisión de cumplimiento de entrenamientos planificados y cobertura de prescripciones activas.
              </p>
            </div>
          </div>

          {/* KPIs de Adherencia y Cobertura */}
          <div className="car-kpi-grid">
            {/* KPI: Adherencia Global */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Adherencia Institucional</span>
                <Award size={20} className="text-primary" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">{adherenceAndCoverage.overallAdherencePct}%</span>
                <span className="car-kpi-sub">cumplimiento medio</span>
              </div>
              <div className="adherence-progress-bar-track mt-2">
                <div
                  className="adherence-progress-bar-fill"
                  style={{
                    width: `${adherenceAndCoverage.overallAdherencePct}%`,
                    background:
                      adherenceAndCoverage.overallAdherencePct >= 80
                        ? '#10b981'
                        : adherenceAndCoverage.overallAdherencePct >= 50
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                ></div>
              </div>
              <div className="car-kpi-sub-badges mt-3">
                <span className="car-sub-badge status-moderado">
                  Verde: {adherenceAndCoverage.adherenceRanges.green.percentage}% ({adherenceAndCoverage.adherenceRanges.green.count})
                </span>
                <span className="car-sub-badge status-alerta">
                  Amarillo: {adherenceAndCoverage.adherenceRanges.yellow.percentage}% ({adherenceAndCoverage.adherenceRanges.yellow.count})
                </span>
                <span className="car-sub-badge status-critico">
                  Rojo: {adherenceAndCoverage.adherenceRanges.red.percentage}% ({adherenceAndCoverage.adherenceRanges.red.count})
                </span>
              </div>
            </div>

            {/* KPI: Cobertura de Planes Activos */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Cobertura de Planes Activos</span>
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {adherenceAndCoverage.planCoverage.activePlanCoveragePercentage}%
                </span>
                <span className="car-kpi-sub">
                  ({adherenceAndCoverage.planCoverage.athletesWithActivePlan} de {adherenceAndCoverage.planCoverage.totalAthletes} atletas)
                </span>
              </div>
              <div className="adherence-progress-bar-track mt-2">
                <div
                  className="adherence-progress-bar-fill"
                  style={{ width: `${adherenceAndCoverage.planCoverage.activePlanCoveragePercentage}%` }}
                ></div>
              </div>
              <div className="car-kpi-footnote mt-3">
                <CheckCircle2 size={13} className="text-success" />
                <span>
                  {adherenceAndCoverage.planCoverage.athletesWithActivePlan} con plan vigente •{' '}
                  {adherenceAndCoverage.planCoverage.athletesWithExpiredPlan} vencidos •{' '}
                  {adherenceAndCoverage.planCoverage.athletesWithoutPlan} sin plan
                </span>
              </div>
            </div>

            {/* KPI: Brecha de Prescripción */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Atletas Sin Plan / Vencido</span>
                <AlertTriangle size={20} className="text-coral" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {adherenceAndCoverage.planCoverage.athletesWithExpiredPlan +
                    adherenceAndCoverage.planCoverage.athletesWithoutPlan}
                </span>
                <span className="car-kpi-sub">requieren prescripción</span>
              </div>
              <div className="car-kpi-footnote mt-3">
                <AlertCircle size={13} className="text-coral" />
                <span>Atletas inactivos o con planes vencidos que necesitan renovación técnica.</span>
              </div>
            </div>
          </div>

          {/* Gráficos Recharts de Adherencia y Cobertura */}
          <div className="car-charts-grid mt-4">
            {/* Gráfico 1: Adherencia por Semáforo */}
            <div className="car-chart-card card-glass">
              <div className="car-chart-header">
                <h3 className="car-chart-title">
                  <BarChart2 size={18} className="text-accent" /> Distribución de Adherencia por Semáforo
                </h3>
                <p className="car-chart-desc">
                  Clasificación de constancia: Verde (≥80%), Amarillo (50–79%) y Rojo (&lt;50%).
                </p>
              </div>
              <div className="car-chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={adherenceRangesData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 216, 192, 0.15)" vertical={false} />
                    <XAxis dataKey="rango" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Bar dataKey="atletas" name="Atletas" radius={[6, 6, 0, 0]}>
                      {adherenceRangesData.map((entry, index) => (
                        <Cell key={`cell-adh-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Cobertura de Planes (Donut Chart) */}
            <div className="car-chart-card card-glass">
              <div className="car-chart-header">
                <h3 className="car-chart-title">
                  <PieChartIcon size={18} className="text-primary" /> Cobertura de Planes de Entrenamiento
                </h3>
                <p className="car-chart-desc">
                  Proporción de atletas con plan activo frente a vencidos o sin plan.
                </p>
              </div>
              <div className="car-chart-body">
                {planCoveragePieData.length === 0 ? (
                  <p className="text-muted text-center p-4">Sin datos de atletas para graficar.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Tooltip content={<CustomRechartsTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
                      />
                      <Pie
                        data={planCoveragePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {planCoveragePieData.map((entry, index) => (
                          <Cell key={`cell-cov-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Monitoreo Individual de Atletas */}
          <div className="car-card-block card-glass mt-4">
            <div className="car-card-header car-header-flex">
              <div>
                <h3 className="car-card-title">
                  <Users size={18} className="text-accent" /> Monitoreo de Atletas, Planes y Adherencia
                </h3>
                <p className="car-card-desc">
                  Tasa individual acotada a [0, 100]%, estado de prescripción y volumen movido.
                </p>
              </div>

              {/* Buscador de atletas */}
              <div className="car-table-search">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar atleta, entrenador o plan..."
                  value={athleteSearchTerm}
                  onChange={(e) => setAthleteSearchTerm(e.target.value)}
                  className="form-input form-input-sm"
                />
              </div>
            </div>

            {filteredAthletes.length === 0 ? (
              <p className="text-muted p-4 text-center">
                No se encontraron atletas que coincidan con los criterios de búsqueda o filtro.
              </p>
            ) : (
              <div className="car-table-wrapper">
                <table className="car-table">
                  <thead>
                    <tr>
                      <th>Atleta</th>
                      <th>Preparador</th>
                      <th>Estado del Plan</th>
                      <th>Plan Prescrito</th>
                      <th>Sesiones Realizadas / Plan</th>
                      <th>Adherencia</th>
                      <th>Carga Total</th>
                      <th>Última Sesión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAthletes.map((ath) => (
                      <tr key={ath.athleteId}>
                        <td className="font-semibold text-main">{ath.athleteName}</td>
                        <td className="text-muted">{ath.trainerName}</td>
                        <td>
                          <span
                            className={`car-status-pill ${
                              ath.planStatus === 'Activo'
                                ? 'status-moderado'
                                : ath.planStatus === 'Vencido'
                                ? 'status-alerta'
                                : 'status-critico'
                            }`}
                          >
                            {ath.planStatus}
                          </span>
                        </td>
                        <td className="text-muted-sm">{ath.planName}</td>
                        <td className="text-center font-semibold">
                          {ath.completedSessions} / {ath.plannedSessions}
                        </td>
                        <td>
                          <div className="car-inline-progress">
                            <span
                              className={`font-semibold ${
                                ath.range === 'green'
                                  ? 'text-success'
                                  : ath.range === 'yellow'
                                  ? 'text-warning'
                                  : 'text-danger'
                              }`}
                            >
                              {ath.adherencePercentage}%
                            </span>
                            <div className="car-mini-track">
                              <div
                                className="car-mini-fill"
                                style={{
                                  width: `${ath.adherencePercentage}%`,
                                  background:
                                    ath.range === 'green'
                                      ? '#10b981'
                                      : ath.range === 'yellow'
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-semibold">
                          {ath.tonnageKg >= 1000
                            ? `${(ath.tonnageKg / 1000).toFixed(1)} Tn`
                            : `${ath.tonnageKg} kg`}
                        </td>
                        <td className="text-muted-sm">{ath.lastSessionDate || 'Sin registro'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* BLOQUE 2: CARGA, FATIGA Y RENDIMIENTO DEPORTIVO                   */}
        {/* ================================================================= */}
        <div className="car-block-container mt-4">
          <div className="car-block-header">
            <div>
              <h2 className="car-block-title">
                <Dumbbell size={22} className="text-accent" />
                2. Carga, Fatiga y Rendimiento Deportivo
              </h2>
              <p className="car-block-subtitle">
                Auditoría del esfuerzo percibido (RPE 1-10), tonelaje total, plusmarcas registradas y antropometría.
              </p>
            </div>
          </div>

          {/* KPIs de Rendimiento Deportivo */}
          <div className="car-kpi-grid">
            {/* KPI: RPE y Fatiga */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Fatiga Media (RPE)</span>
                <Activity size={20} className="text-coral" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {loadAndSportsPerformance.fatigueAndLoad.averageRpe || '7.5'}
                </span>
                <span className="car-kpi-sub">/ 10 (Escala Foster)</span>
              </div>
              <div className="car-kpi-footnote mt-2">
                <Clock size={13} className="text-muted" />
                <span>
                  {loadAndSportsPerformance.fatigueAndLoad.totalCompletedSessions} sesiones analizadas •{' '}
                  {loadAndSportsPerformance.fatigueAndLoad.averageDurationMinutes} min promedio/sesión
                </span>
              </div>
            </div>

            {/* KPI: Tonelaje Acumulado */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Tonelaje Institucional</span>
                <Dumbbell size={20} className="text-accent" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {loadAndSportsPerformance.fatigueAndLoad.totalTonnageKg >= 1000
                    ? `${(loadAndSportsPerformance.fatigueAndLoad.totalTonnageKg / 1000).toFixed(1)} Tn`
                    : `${loadAndSportsPerformance.fatigueAndLoad.totalTonnageKg} kg`}
                </span>
                <span className="car-kpi-sub">volumen total</span>
              </div>
              <div className="car-kpi-footnote mt-2">
                <TrendingUp size={13} className="text-success" />
                <span>
                  Promedio de {loadAndSportsPerformance.fatigueAndLoad.averageSessionTonnageKg} kg por sesión completada
                </span>
              </div>
            </div>

            {/* KPI: Plusmarcas y Fuerza 1RM */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Récords y Fuerza Máxima</span>
                <Flame size={20} className="text-coral" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {loadAndSportsPerformance.strengthAndRecords.totalPRs}
                </span>
                <span className="car-kpi-sub">PRs detectados</span>
              </div>
              <div className="car-kpi-footnote mt-2">
                <Zap size={13} className="text-accent" />
                <span>
                  1RM estimado medio: {loadAndSportsPerformance.strengthAndRecords.averageEstimated1RM} kg en ejercicios principales
                </span>
              </div>
            </div>

            {/* KPI: Antropometría */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Control Antropométrico</span>
                <Scale size={20} className="text-primary" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {loadAndSportsPerformance.anthropometry.weighedAthletesCount}
                </span>
                <span className="car-kpi-sub">atletas con pesajes</span>
              </div>
              <div className="car-kpi-footnote mt-2">
                <Calendar size={13} className="text-muted" />
                <span>
                  {loadAndSportsPerformance.anthropometry.totalWeightRecords} registros de peso • Frecuencia media:{' '}
                  {loadAndSportsPerformance.anthropometry.weighInFrequencyPerAthlete} pesajes/atleta
                </span>
              </div>
            </div>
          </div>

          {/* Gráficos Recharts de Rendimiento: RPE y Evolución de Carga */}
          <div className="car-charts-grid mt-4">
            {/* Gráfico RPE y Niveles de Exigencia */}
            <div className="car-chart-card card-glass">
              <div className="car-chart-header">
                <h3 className="car-chart-title">
                  <Activity size={18} className="text-coral" /> Distribución de Fatiga y Exigencia (RPE)
                </h3>
                <p className="car-chart-desc">
                  Supervisión de zonas de intensidad para prevenir sobreentrenamiento y monitorear esfuerzo.
                </p>
              </div>
              <div className="car-chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rpeDistributionData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 216, 192, 0.15)" vertical={false} />
                    <XAxis dataKey="nivel" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomRechartsTooltip />} />
                    <Bar dataKey="sesiones" name="Sesiones" radius={[6, 6, 0, 0]}>
                      {rpeDistributionData.map((entry, index) => (
                        <Cell key={`cell-rpe-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico Evolución Mensual de Tonelaje */}
            <div className="car-chart-card card-glass">
              <div className="car-chart-header">
                <h3 className="car-chart-title">
                  <TrendingUp size={18} className="text-accent" /> Evolución Temporal de Carga (Tonelaje Tn)
                </h3>
                <p className="car-chart-desc">
                  Progresión acumulada del volumen de entrenamiento a lo largo de los períodos evaluados.
                </p>
              </div>
              <div className="car-chart-body">
                {strengthEvolutionChartData.length === 0 ? (
                  <p className="text-muted text-center p-4">Sin datos temporales registrados aún.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={strengthEvolutionChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#207384" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#207384" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 216, 192, 0.15)" vertical={false} />
                      <XAxis dataKey="mes" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                      <Tooltip content={<CustomRechartsTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="tonelajeTn"
                        name="Tonelaje (Tn)"
                        stroke="#207384"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#tonnageGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Distribución Biomecánica por Grupo Muscular */}
          <div className="car-card-block card-glass mt-4">
            <div className="car-card-header">
              <h3 className="car-card-title">
                <PieChartIcon size={18} className="text-accent" /> Balance y Carga Biomecánica por Grupo Muscular
              </h3>
              <p className="car-card-desc">
                Distribución del total de series ejecutadas para auditar equilibrio funcional en la plantilla.
              </p>
            </div>

            {loadAndSportsPerformance.biomechanicalDistribution.length === 0 ? (
              <p className="text-muted p-4">Sin series registradas aún para análisis anatómico.</p>
            ) : (
              <div className="car-biomechanical-list">
                {loadAndSportsPerformance.biomechanicalDistribution.map((item) => (
                  <div key={item.muscleGroup} className="car-bio-item">
                    <div className="car-bio-header">
                      <span className="car-bio-name">{item.muscleGroup}</span>
                      <span className="car-bio-pct">
                        {item.percentage}% ({item.totalSets} series registradas)
                      </span>
                    </div>
                    <div className="car-bio-track">
                      <div
                        className="car-bio-fill"
                        style={{ width: `${Math.max(4, item.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* BLOQUE 3: OPERACIÓN DEL STAFF TÉCNICO Y CATÁLOGO DE EJERCICIOS     */}
        {/* ================================================================= */}
        <div className="car-block-container mt-4">
          <div className="car-block-header">
            <div>
              <h2 className="car-block-title">
                <Users size={22} className="text-primary" />
                3. Operación del Staff y Catálogo de Ejercicios
              </h2>
              <p className="car-block-subtitle">
                Supervisión del equipo técnico, plantillas de rutinas y cobertura multimedia pedagógica del catálogo.
              </p>
            </div>
          </div>

          {/* KPIs de Staff y Catálogo */}
          <div className="car-kpi-grid">
            {/* KPI: Usuarios por Rol */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Usuarios por Rol</span>
                <Users size={20} className="text-accent" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {staffAndCatalogOperation.usersByRole.totalUsers}
                </span>
                <span className="car-kpi-sub">cuentas registradas</span>
              </div>
              <div className="car-kpi-sub-badges mt-3">
                <span className="car-sub-badge status-moderado">
                  Atletas: {staffAndCatalogOperation.usersByRole.athleteCount}
                </span>
                <span className="car-sub-badge status-alerta">
                  Entrenadores: {staffAndCatalogOperation.usersByRole.trainerCount}
                </span>
                <span className="car-sub-badge">
                  Admins: {staffAndCatalogOperation.usersByRole.adminCount}
                </span>
              </div>
            </div>

            {/* KPI: Catálogo de Ejercicios */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Catálogo de Ejercicios</span>
                <Dumbbell size={20} className="text-primary" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {staffAndCatalogOperation.catalogMetrics.totalExercises}
                </span>
                <span className="car-kpi-sub">ejercicios registrados</span>
              </div>
              <div className="car-kpi-footnote mt-3">
                <CheckCircle2 size={13} className="text-success" />
                <span>
                  {staffAndCatalogOperation.catalogMetrics.exercisesWithVideo} con demostración técnica en video
                </span>
              </div>
            </div>

            {/* KPI: Cobertura Multimedia */}
            <div className="car-kpi-card card-glass">
              <div className="car-kpi-header">
                <span className="car-kpi-title">Cobertura Multimedia</span>
                <Video size={20} className="text-coral" />
              </div>
              <div className="car-kpi-metric">
                <span className="car-kpi-big">
                  {staffAndCatalogOperation.catalogMetrics.videoCoveragePercentage}%
                </span>
                <span className="car-kpi-sub">con video pedagógico</span>
              </div>
              <div className="adherence-progress-bar-track mt-2">
                <div
                  className="adherence-progress-bar-fill"
                  style={{ width: `${staffAndCatalogOperation.catalogMetrics.videoCoveragePercentage}%` }}
                ></div>
              </div>
              <div className="car-kpi-footnote mt-3">
                <Video size={13} />
                <span>
                  {staffAndCatalogOperation.catalogMetrics.exercisesWithoutVideo} ejercicios pendientes de video demostrativo
                </span>
              </div>
            </div>
          </div>

          {/* Tarjetas de Desglose Multimedia */}
          <div className="car-multimedia-grid mt-4">
            <div className="car-multi-card card-glass">
              <div className="car-multi-icon youtube-color">
                <PlayCircle size={22} />
              </div>
              <div className="car-multi-info">
                <span className="car-multi-val">
                  {staffAndCatalogOperation.catalogMetrics.videoTypes.youtubeStandard}
                </span>
                <span className="car-multi-label">YouTube Estándar</span>
              </div>
            </div>

            <div className="car-multi-card card-glass">
              <div className="car-multi-icon shorts-color">
                <Smartphone size={22} />
              </div>
              <div className="car-multi-info">
                <span className="car-multi-val">
                  {staffAndCatalogOperation.catalogMetrics.videoTypes.youtubeShorts}
                </span>
                <span className="car-multi-label">YouTube Shorts</span>
              </div>
            </div>

            <div className="car-multi-card card-glass">
              <div className="car-multi-icon mp4-color">
                <Film size={22} />
              </div>
              <div className="car-multi-info">
                <span className="car-multi-val">
                  {staffAndCatalogOperation.catalogMetrics.videoTypes.directMp4}
                </span>
                <span className="car-multi-label">Video Directo MP4</span>
              </div>
            </div>

            <div className="car-multi-card card-glass">
              <div className="car-multi-icon pending-color">
                <AlertCircle size={22} />
              </div>
              <div className="car-multi-info">
                <span className="car-multi-val">
                  {staffAndCatalogOperation.catalogMetrics.exercisesWithoutVideo}
                </span>
                <span className="car-multi-label">Sin Video</span>
              </div>
            </div>
          </div>

          {/* Tabla de Carga y Eficiencia por Entrenador */}
          <div className="car-card-block card-glass mt-4">
            <div className="car-card-header">
              <h3 className="car-card-title">
                <Users size={18} className="text-accent" /> Carga y Desempeño por Entrenador
              </h3>
              <p className="car-card-desc">
                Supervisión de atletas asignados, planes prescritos, uso de plantillas (RoutineTemplate) y adherencia alcanzada.
              </p>
            </div>

            {staffAndCatalogOperation.coachesPerformance.length === 0 ? (
              <p className="text-muted p-4">No hay entrenadores registrados en el sistema actualmente.</p>
            ) : (
              <div className="car-table-wrapper">
                <table className="car-table">
                  <thead>
                    <tr>
                      <th>Preparador Físico</th>
                      <th>Contacto</th>
                      <th>Atletas Asignados</th>
                      <th>Planes Prescritos</th>
                      <th>Planes Activos</th>
                      <th>Plantillas Creadas</th>
                      <th>Adherencia Media</th>
                      <th>Sesiones Supervisadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffAndCatalogOperation.coachesPerformance.map((coach) => (
                      <tr key={coach.trainerId}>
                        <td className="font-semibold text-main">{coach.trainerName}</td>
                        <td className="text-muted-sm">{coach.email}</td>
                        <td>
                          <span className="car-tag">{coach.assignedAthletesCount} atletas</span>
                        </td>
                        <td>{coach.prescribedPlansCount} planes</td>
                        <td>
                          <span className="font-semibold text-success">{coach.activePlansCount} activos</span>
                        </td>
                        <td>{coach.templatesCreatedCount} plantillas</td>
                        <td>
                          <div className="car-inline-progress">
                            <span className="font-semibold">{coach.avgAdherencePct}%</span>
                            <div className="car-mini-track">
                              <div
                                className="car-mini-fill"
                                style={{
                                  width: `${coach.avgAdherencePct}%`,
                                  background:
                                    coach.avgAdherencePct >= 80
                                      ? '#10b981'
                                      : coach.avgAdherencePct >= 50
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-semibold">{coach.completedSessionsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="progress-page-layout">
      {/* Header Principal */}
      <div className="progress-header-row">
        <div>
          <h1 className="page-main-title">
            {isAdmin ? 'Dirección Técnica & Métricas CAR' : 'Panel de Métricas y Evolución'}
          </h1>
          <p className="page-main-subtitle">
            {isAdmin
              ? 'Auditoría macro-institucional de rendimiento, carga biomecánica y efectividad del staff técnico.'
              : 'Análisis objetivo de progresión de cargas máximas, constancia y composición física.'}
          </p>
        </div>

        <div className="progress-top-actions">
          {/* Si es Admin, selector de pestañas entre Visión Global CAR y Ficha por Atleta */}
          {isAdmin && (
            <div className="car-tabs-nav">
              <button
                type="button"
                className={`car-tab-btn ${activeTab === 'car_overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('car_overview')}
              >
                <Shield size={16} />
                <span>Rendimiento Global CAR</span>
              </button>
              <button
                type="button"
                className={`car-tab-btn ${activeTab === 'athlete_audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('athlete_audit')}
              >
                <User size={16} />
                <span>Auditoría por Atleta</span>
              </button>
            </div>
          )}

          {/* Selector de alumno cuando se está en la auditoría individual (para entrenador o admin en pestaña atleta) */}
          {(role === UserRole.ENTRENADOR || (isAdmin && activeTab === 'athlete_audit')) &&
            athletes.length > 0 && (
              <div className="athlete-filter-box athlete-filter-with-avatar">
                <User size={16} />
                <label htmlFor="athleteFilterSelect" className="visually-hidden">
                  Filtrar por Atleta:
                </label>
                <select
                  id="athleteFilterSelect"
                  className="form-input form-select-sm"
                  value={selectedAthleteId}
                  onChange={(e) => handleAthleteChange(e.target.value)}
                >
                  {athletes.length === 0 ? (
                    <option value="">Sin atletas asignados</option>
                  ) : (
                    athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        Atleta: {a.fullName}
                      </option>
                    ))
                  )}
                </select>
                {selectedAthlete && (
                  <img
                    className="selected-athlete-avatar"
                    src={selectedAthleteAvatar}
                    alt={`Foto de ${selectedAthlete.fullName}`}
                    title={selectedAthlete.fullName}
                  />
                )}
              </div>
            )}

          {/* Botón registrar peso si es atleta */}
          {role === UserRole.ATLETA && (
            <button
              onClick={() => setIsWeightModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Registrar Peso</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER CONDICIONAL SEGÚN PESTAÑA / ROL */}
      {isAdmin && activeTab === 'car_overview' ? (
        renderAdminExecutiveDashboard()
      ) : (
        /* VISTA INDIVIDUAL POR ATLETA (Para Atleta, Entrenador o Admin auditando a un atleta específico) */
        <>
          {/* KPI Cards Row Individual */}
          <div className="kpi-grid">
            {/* KPI 1: Tasa de Adherencia */}
            <div className="kpi-card adherence-kpi">
              <div className="kpi-top">
                <span className="kpi-label">Adherencia al Plan</span>
                <Award size={20} className="text-accent" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-number">
                  {adherenceData?.adherencePercentage ?? 0}%
                </span>
                <span className="kpi-unit">cumplimiento</span>
              </div>

              <div className="adherence-progress-bar-track">
                <div
                  className="adherence-progress-bar-fill"
                  style={{
                    width: `${adherenceData?.adherencePercentage ?? 0}%`,
                  }}
                ></div>
              </div>

              <div className="kpi-footer-note">
                <CheckCircle2 size={14} className="text-success" />
                <span>
                  {adherenceData?.completedSessions ?? 0} de{' '}
                  {adherenceData?.plannedSessions ?? 0} sesiones planificadas
                </span>
              </div>
              <p className="kpi-incentive-msg">{adherenceData?.message}</p>
            </div>

            {/* KPI 2: Último Peso Corporal */}
            <div className="kpi-card weight-kpi">
              <div className="kpi-top">
                <span className="kpi-label">Último Peso Corporal</span>
                <Scale size={20} className="text-cyan" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-number">
                  {weightHistory.length > 0
                    ? weightHistory[weightHistory.length - 1].weightKg
                    : '--'}
                </span>
                <span className="kpi-unit">kg</span>
              </div>
              <p className="kpi-footer-note">
                {weightHistory.length > 0
                  ? `Último registro: ${new Date(
                      weightHistory[weightHistory.length - 1].date ||
                        weightHistory[weightHistory.length - 1].recordedAt ||
                        Date.now(),
                    ).toLocaleDateString()}`
                  : 'Aún no registras pesajes'}
              </p>
            </div>

            {/* KPI 3: Total Sesiones Registradas */}
            <div className="kpi-card sessions-kpi">
              <div className="kpi-top">
                <span className="kpi-label">Sesiones Completadas</span>
                <Calendar size={20} className="text-primary" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-number">
                  {adherenceData?.completedSessions ?? 0}
                </span>
                <span className="kpi-unit">entrenamientos</span>
              </div>
              <p className="kpi-footer-note">
                Plan:{' '}
                <strong>
                  {adherenceData?.planName || 'Sin plan activo asignado'}
                </strong>
              </p>
            </div>
          </div>

          {/* Gráficos Principales */}
          <div className="charts-main-grid">
            {/* Gráfico 1: Progresión de Cargas Máximas */}
            <div className="card-glass chart-box-card">
              <div className="chart-card-header">
                <div>
                  <h2 className="chart-box-title">
                    <TrendingUp size={20} className="text-accent" /> Evolución de Carga Máxima
                  </h2>
                  <p className="chart-box-subtitle">
                    Peso máximo levantado (kg) por sesión a lo largo del tiempo.
                  </p>
                </div>

                {/* Selector de Ejercicio */}
                <select
                  className="form-input form-select-sm"
                  value={selectedExerciseId}
                  onChange={(e) => handleExerciseChange(e.target.value)}
                >
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chart-render-area">{renderStrengthChart()}</div>
            </div>

            {/* Gráfico 2: Evolución de Peso Corporal */}
            <div className="card-glass chart-box-card">
              <div className="chart-card-header">
                <div>
                  <h2 className="chart-box-title">
                    <Scale size={20} className="text-cyan" /> Evolución de Peso Corporal
                  </h2>
                  <p className="chart-box-subtitle">
                    Historial antropométrico de pesajes corporales en kg.
                  </p>
                </div>
              </div>

              <div className="chart-render-area">{renderWeightChart()}</div>

              {/* Tabla histórica de pesajes */}
              {weightHistory.length > 0 && (
                <div className="weight-history-table-box">
                  <table className="mini-history-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Peso (kg)</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weightHistory
                        .slice()
                        .reverse()
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              {new Date(
                                item.date || item.recordedAt || Date.now(),
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              <strong>{item.weightKg} kg</strong>
                            </td>
                            <td className="text-muted">{item.notes || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal para registrar nuevo peso corporal */}
      <BodyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onSuccess={() => {
          if (selectedAthleteId) {
            loadAthleteMetrics(selectedAthleteId, selectedExerciseId);
          }
        }}
      />
    </div>
  );
};

