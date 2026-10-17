import React, { useMemo } from 'react';

interface AnatomicalBodyFigureProps {
  grupoMuscularPrincipal?: string;
  zonasTrabajadas?: string[];
  className?: string;
}

export const AnatomicalBodyFigure: React.FC<AnatomicalBodyFigureProps> = ({
  grupoMuscularPrincipal = '',
  zonasTrabajadas = [],
  className = '',
}) => {
  // Normalizar términos para matching flexible e insensible a mayúsculas y acentos
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const terms = useMemo(() => {
    const list = [grupoMuscularPrincipal, ...zonasTrabajadas]
      .filter(Boolean)
      .map((t) => normalize(t));
    return list;
  }, [grupoMuscularPrincipal, zonasTrabajadas]);

  const matchesAny = (keywords: string[]) => {
    return keywords.some((kw) => {
      const nKw = normalize(kw);
      return terms.some((t) => t.includes(nKw) || nKw.includes(t));
    });
  };

  // Detección de zonas
  const isChest = matchesAny(['pecho', 'pectoral', 'pectorales', 'bench']);
  const isBack = matchesAny(['espalda', 'dorsal', 'dorsales', 'trapecio', 'espalda baja', 'lumbares', 'erectores', 'remo', 'pull-up', 'dominada']);
  const isShoulders = matchesAny(['hombro', 'hombros', 'deltoide', 'deltoides', 'militar', 'press militar']);
  const isBiceps = matchesAny(['biceps', 'brazo', 'brazos', 'curl']);
  const isTriceps = matchesAny(['triceps', 'fondos', 'dip']);
  const isForearms = matchesAny(['antebrazo', 'antebrazos', 'braquiorradial', 'agarre']);
  const isAbs = matchesAny(['core', 'abdomen', 'abdominal', 'abdominales', 'oblicuo', 'oblicuos', 'plank']);
  const isQuads = matchesAny(['cuadriceps', 'pierna', 'piernas', 'sentadilla', 'prensa', 'adductor', 'aductores']);
  const isGlutes = matchesAny(['gluteo', 'gluteos', 'cadera', 'hip thrust', 'peso muerto', 'gluteo mayor', 'gluteo medio']);
  const isHamstrings = matchesAny(['isquiotibial', 'isquiotibiales', 'femoral', 'femorales', 'peso muerto']);
  const isCalves = matchesAny(['gemelo', 'gemelos', 'pantorrilla', 'pantorrillas', 'soleo']);

  // Variables CSS: el mapa mantiene la misma paleta en ambos temas.
  const activeColor = 'var(--brand-petrol)';
  const activeStroke = 'var(--brand-beige)';
  const inactiveColor = 'var(--brand-burgundy)';
  const inactiveStroke = 'var(--brand-petrol)';

  const getColor = (isActive: boolean) => (isActive ? activeColor : inactiveColor);
  const getStroke = (isActive: boolean) => (isActive ? activeStroke : inactiveStroke);
  const getFilter = (isActive: boolean) => (isActive ? 'url(#glow-filter)' : undefined);

  return (
    <div className={`anatomic-figure-container ${className}`}>
      {/* Vista Anterior (Frente) y Posterior (Dorso) */}
      <div className="anatomic-views-wrapper">
        {/* SVG FRONT VIEW */}
        <div className="anatomic-single-view">
          <svg
            viewBox="0 0 100 190"
            className="anatomic-svg"
            role="img"
            aria-label="Vista frontal anatómica"
          >
            <defs>
              <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#207384" floodOpacity="0.85" />
              </filter>
            </defs>

            {/* Cabeza / Cuello */}
            <circle cx="50" cy="14" r="8" fill="#182030" stroke={inactiveStroke} strokeWidth="1.2" />
            <path d="M46 22 L46 29 L54 29 L54 22 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />

            {/* Trapecios frontales */}
            <path
              d="M44 26 L36 30 L38 34 L46 30 Z"
              fill={getColor(isBack || isShoulders)}
              stroke={getStroke(isBack || isShoulders)}
              strokeWidth="1"
            />
            <path
              d="M56 26 L64 30 L62 34 L54 30 Z"
              fill={getColor(isBack || isShoulders)}
              stroke={getStroke(isBack || isShoulders)}
              strokeWidth="1"
            />

            {/* Hombros (Deltoides anteriores/laterales) */}
            <path
              d="M32 30 C27 32 25 38 27 45 C30 46 34 43 35 38 C35 34 34 31 32 30 Z"
              fill={getColor(isShoulders)}
              stroke={getStroke(isShoulders)}
              strokeWidth="1.2"
              filter={getFilter(isShoulders)}
            />
            <path
              d="M68 30 C73 32 75 38 73 45 C70 46 66 43 65 38 C65 34 66 31 68 30 Z"
              fill={getColor(isShoulders)}
              stroke={getStroke(isShoulders)}
              strokeWidth="1.2"
              filter={getFilter(isShoulders)}
            />

            {/* Pecho (Pectorales) */}
            <path
              d="M36 34 C42 34 49 37 49 48 C43 49 37 47 34 44 C33 40 34 36 36 34 Z"
              fill={getColor(isChest)}
              stroke={getStroke(isChest)}
              strokeWidth="1.2"
              filter={getFilter(isChest)}
            />
            <path
              d="M64 34 C58 34 51 37 51 48 C57 49 63 47 66 44 C67 40 66 36 64 34 Z"
              fill={getColor(isChest)}
              stroke={getStroke(isChest)}
              strokeWidth="1.2"
              filter={getFilter(isChest)}
            />

            {/* Bíceps (Frontal brazos) */}
            <path
              d="M26 46 C24 49 23 58 25 64 C28 64 30 59 31 54 C31 50 29 47 26 46 Z"
              fill={getColor(isBiceps)}
              stroke={getStroke(isBiceps)}
              strokeWidth="1.2"
              filter={getFilter(isBiceps)}
            />
            <path
              d="M74 46 C76 49 77 58 75 64 C72 64 70 59 69 54 C69 50 71 47 74 46 Z"
              fill={getColor(isBiceps)}
              stroke={getStroke(isBiceps)}
              strokeWidth="1.2"
              filter={getFilter(isBiceps)}
            />

            {/* Antebrazos (Frontal) */}
            <path
              d="M24 65 C22 70 20 80 22 86 C25 86 28 78 28 72 C28 68 26 66 24 65 Z"
              fill={getColor(isForearms)}
              stroke={getStroke(isForearms)}
              strokeWidth="1.1"
              filter={getFilter(isForearms)}
            />
            <path
              d="M76 65 C78 70 80 80 78 86 C75 86 72 78 72 72 C72 68 74 66 76 65 Z"
              fill={getColor(isForearms)}
              stroke={getStroke(isForearms)}
              strokeWidth="1.1"
              filter={getFilter(isForearms)}
            />

            {/* Core / Abdominales & Oblicuos */}
            <path
              d="M38 50 C44 50 48 51 49 59 L49 76 C44 76 38 73 37 68 C36 62 36 54 38 50 Z"
              fill={getColor(isAbs)}
              stroke={getStroke(isAbs)}
              strokeWidth="1.2"
              filter={getFilter(isAbs)}
            />
            <path
              d="M62 50 C56 50 52 51 51 59 L51 76 C56 76 62 73 63 68 C64 62 64 54 62 50 Z"
              fill={getColor(isAbs)}
              stroke={getStroke(isAbs)}
              strokeWidth="1.2"
              filter={getFilter(isAbs)}
            />

            {/* Pelvis / Cadera frontal */}
            <path
              d="M37 77 C43 78 49 84 49 88 C44 89 39 85 37 80 Z"
              fill="#182030"
              stroke={inactiveStroke}
              strokeWidth="1"
            />
            <path
              d="M63 77 C57 78 51 84 51 88 C56 89 61 85 63 80 Z"
              fill="#182030"
              stroke={inactiveStroke}
              strokeWidth="1"
            />

            {/* Cuádriceps (Muslos frontales) */}
            <path
              d="M35 83 C40 85 47 92 46 116 C41 117 35 111 34 102 C33 94 33 87 35 83 Z"
              fill={getColor(isQuads)}
              stroke={getStroke(isQuads)}
              strokeWidth="1.2"
              filter={getFilter(isQuads)}
            />
            <path
              d="M65 83 C60 85 53 92 54 116 C59 117 65 111 66 102 C67 94 67 87 65 83 Z"
              fill={getColor(isQuads)}
              stroke={getStroke(isQuads)}
              strokeWidth="1.2"
              filter={getFilter(isQuads)}
            />

            {/* Rodillas */}
            <ellipse cx="40" cy="122" rx="4.5" ry="3.5" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
            <ellipse cx="60" cy="122" rx="4.5" ry="3.5" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />

            {/* Pantorrillas / Tibias frontales */}
            <path
              d="M36 127 C42 129 44 140 43 155 C39 156 36 150 35 142 C34 136 34 130 36 127 Z"
              fill={getColor(isCalves)}
              stroke={getStroke(isCalves)}
              strokeWidth="1.1"
              filter={getFilter(isCalves)}
            />
            <path
              d="M64 127 C58 129 56 140 57 155 C61 156 64 150 65 142 C66 136 66 130 64 127 Z"
              fill={getColor(isCalves)}
              stroke={getStroke(isCalves)}
              strokeWidth="1.1"
              filter={getFilter(isCalves)}
            />

            {/* Pies */}
            <path d="M34 157 L44 157 L42 165 L32 165 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
            <path d="M66 157 L56 157 L58 165 L68 165 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
          </svg>
          <span className="anatomic-view-label">Frente</span>
        </div>

        {/* SVG BACK VIEW */}
        <div className="anatomic-single-view">
          <svg
            viewBox="0 0 100 190"
            className="anatomic-svg"
            role="img"
            aria-label="Vista posterior anatómica"
          >
            {/* Cabeza / Cuello posterior */}
            <circle cx="50" cy="14" r="8" fill="#182030" stroke={inactiveStroke} strokeWidth="1.2" />
            <path d="M46 22 L46 29 L54 29 L54 22 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />

            {/* Trapecios y Espalda Alta */}
            <path
              d="M36 30 L50 25 L64 30 L58 45 L50 49 L42 45 Z"
              fill={getColor(isBack)}
              stroke={getStroke(isBack)}
              strokeWidth="1.2"
              filter={getFilter(isBack)}
            />

            {/* Deltoides Posterior (Hombros traseros) */}
            <path
              d="M32 30 C27 32 25 38 27 45 C30 46 34 43 35 38 C35 34 34 31 32 30 Z"
              fill={getColor(isShoulders)}
              stroke={getStroke(isShoulders)}
              strokeWidth="1.2"
              filter={getFilter(isShoulders)}
            />
            <path
              d="M68 30 C73 32 75 38 73 45 C70 46 66 43 65 38 C65 34 66 31 68 30 Z"
              fill={getColor(isShoulders)}
              stroke={getStroke(isShoulders)}
              strokeWidth="1.2"
              filter={getFilter(isShoulders)}
            />

            {/* Tríceps (Brazos posteriores) */}
            <path
              d="M26 46 C24 49 23 58 25 64 C28 64 30 59 31 54 C31 50 29 47 26 46 Z"
              fill={getColor(isTriceps)}
              stroke={getStroke(isTriceps)}
              strokeWidth="1.2"
              filter={getFilter(isTriceps)}
            />
            <path
              d="M74 46 C76 49 77 58 75 64 C72 64 70 59 69 54 C69 50 71 47 74 46 Z"
              fill={getColor(isTriceps)}
              stroke={getStroke(isTriceps)}
              strokeWidth="1.2"
              filter={getFilter(isTriceps)}
            />

            {/* Antebrazo Posterior */}
            <path
              d="M24 65 C22 70 20 80 22 86 C25 86 28 78 28 72 C28 68 26 66 24 65 Z"
              fill={getColor(isForearms)}
              stroke={getStroke(isForearms)}
              strokeWidth="1.1"
              filter={getFilter(isForearms)}
            />
            <path
              d="M76 65 C78 70 80 80 78 86 C75 86 72 78 72 72 C72 68 74 66 76 65 Z"
              fill={getColor(isForearms)}
              stroke={getStroke(isForearms)}
              strokeWidth="1.1"
              filter={getFilter(isForearms)}
            />

            {/* Dorsales y Lumbares (Mid/Lower Back) */}
            <path
              d="M38 46 C44 48 48 54 49 69 L39 65 C36 58 36 50 38 46 Z"
              fill={getColor(isBack)}
              stroke={getStroke(isBack)}
              strokeWidth="1.2"
              filter={getFilter(isBack)}
            />
            <path
              d="M62 46 C56 48 52 54 51 69 L61 65 C64 58 64 50 62 46 Z"
              fill={getColor(isBack)}
              stroke={getStroke(isBack)}
              strokeWidth="1.2"
              filter={getFilter(isBack)}
            />

            {/* Glúteos */}
            <path
              d="M35 70 C42 69 49 74 49 88 C43 89 36 85 34 78 C33 74 34 71 35 70 Z"
              fill={getColor(isGlutes)}
              stroke={getStroke(isGlutes)}
              strokeWidth="1.2"
              filter={getFilter(isGlutes)}
            />
            <path
              d="M65 70 C58 69 51 74 51 88 C57 89 64 85 66 78 C67 74 66 71 65 70 Z"
              fill={getColor(isGlutes)}
              stroke={getStroke(isGlutes)}
              strokeWidth="1.2"
              filter={getFilter(isGlutes)}
            />

            {/* Isquiotibiales (Femorales posteriores) */}
            <path
              d="M35 89 C41 90 47 98 46 116 C41 117 35 111 34 102 C33 97 33 92 35 89 Z"
              fill={getColor(isHamstrings)}
              stroke={getStroke(isHamstrings)}
              strokeWidth="1.2"
              filter={getFilter(isHamstrings)}
            />
            <path
              d="M65 89 C59 90 53 98 54 116 C59 117 65 111 66 102 C67 97 67 92 65 89 Z"
              fill={getColor(isHamstrings)}
              stroke={getStroke(isHamstrings)}
              strokeWidth="1.2"
              filter={getFilter(isHamstrings)}
            />

            {/* Hueco poplíteo (Detrás de rodilla) */}
            <ellipse cx="40" cy="122" rx="4" ry="2.5" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
            <ellipse cx="60" cy="122" rx="4" ry="2.5" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />

            {/* Gemelos / Pantorrillas posteriores */}
            <path
              d="M35 125 C42 127 45 137 44 153 C39 154 35 147 34 139 C33 133 34 128 35 125 Z"
              fill={getColor(isCalves)}
              stroke={getStroke(isCalves)}
              strokeWidth="1.2"
              filter={getFilter(isCalves)}
            />
            <path
              d="M65 125 C58 127 55 137 56 153 C61 154 65 147 66 139 C67 133 66 128 65 125 Z"
              fill={getColor(isCalves)}
              stroke={getStroke(isCalves)}
              strokeWidth="1.2"
              filter={getFilter(isCalves)}
            />

            {/* Talones y pies */}
            <path d="M34 155 L44 155 L42 163 L33 163 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
            <path d="M66 155 L56 155 L58 163 L67 163 Z" fill="#182030" stroke={inactiveStroke} strokeWidth="1" />
          </svg>
          <span className="anatomic-view-label">Dorso</span>
        </div>
      </div>
    </div>
  );
};
