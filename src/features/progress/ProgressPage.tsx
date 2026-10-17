import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService.js';
import { trainingService } from '../../services/trainingService.js';
import { authService } from '../../services/authService.js';
import { useAuth } from '../auth/AuthContext.js';
import {
  UserRole,
  User as UserModel,
  BodyWeightRecord,
  AdherenceReport,
  StrengthProgress,
  Exercise,
} from '../../types/index.js';
import { BodyWeightModal } from '../../components/BodyWeightModal.js';

export const ProgressPage: React.FC = () => {
  const { user, role } = useAuth();
  const [athletes, setAthletes] = useState<UserModel[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const [weightHistory, setWeightHistory] = useState<BodyWeightRecord[]>([]);
  const [adherenceData, setAdherenceData] = useState<AdherenceReport | null>(null);
  const [strengthData, setStrengthData] = useState<StrengthProgress | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // El selector nativo muestra texto; la foto al costado identifica al atleta elegido.
  const selectedAthlete = athletes.find((athlete) => athlete.id === selectedAthleteId);
  const selectedAthleteAvatar = selectedAthlete?.avatarUrl ||
    (selectedAthlete
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAthlete.fullName)}&background=eed8c0&color=5a0505&bold=true`
      : '');

  // Cargar atletas si es entrenador, o usar ID propio si es atleta
  useEffect(() => {
    initView();
  }, [user, role]);

  const initView = async () => {
    setIsLoading(true);
    try {
      const exerciseList = await trainingService.getExercises();
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
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAthleteMetrics = async (athleteId: string, exerciseId?: string) => {
    if (!athleteId) return;
    try {
      const targetExerciseId = exerciseId || selectedExerciseId;
      const [weights, adherence, strength] = await Promise.all([
        trainingService.getWeightHistory(athleteId),
        analyticsService.getAdherence(athleteId),
        targetExerciseId
          ? analyticsService.getStrengthProgress(athleteId, targetExerciseId)
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
      const strength = await analyticsService.getStrengthProgress(
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
          {/* Ejes y líneas de fondo */}
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

          {/* Curva de progresión */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Puntos y etiquetas */}
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

  return (
    <div className="progress-page-layout">
      {/* Header */}
      <div className="progress-header-row">
        <div>
          <h1 className="page-main-title">Panel de Métricas y Evolución</h1>
          <p className="page-main-subtitle">
            Análisis objetivo de progresión de cargas máximas, constancia y composición
            física.
          </p>
        </div>

        <div className="progress-top-actions">
          {/* Selector de alumno para el entrenador o administrador */}
          {(role === UserRole.ENTRENADOR || role === UserRole.ADMIN) && athletes.length > 0 && (
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
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    Atleta: {a.fullName}
                  </option>
                ))}
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

      {/* KPI Cards Row */}
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
                        <td>{new Date(item.date || item.recordedAt || Date.now()).toLocaleDateString()}</td>
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
