//Va en components/ porque representa una parte de la pantalla, no una pantalla completa.
// Muestra el buscador y los botones
// Avisa cuando la persona cambia un filtro.

//ExcersiceCatalogPage.tsx: La página mantiene los datos y conecta las acciones.
// ExerciseFilters: muestra los controles y comunica las interacciones.

import { Search } from 'lucide-react';
//Datos y funciones que la página debe entregar a este componente: 
//Las props son la forma en que un componente recibe información del componente que lo utiliza.
interface ExerciseFiltersProps { //define qué debe recibir el componente.
  searchTerm: string;// Texto que actualmente aparece en el buscador.
  selectedMuscle: string;// Grupo muscular seleccionado, o "TODOS".
  categories: string[];// Opciones que se mostrarán como botones de filtrado.
  onSearchChange: (value: string) => void; // Función que ejecutamos para avisar que cambió el texto.
  //recibe un texto, llamado value;
  // se ejecuta para realizar una acción;
  // no devuelve un resultado que el componente necesite utilizar: eso expresa void
  onMuscleChange: (value: string) => void;// Función que ejecutamos para avisar que se eligió otro grupo.
}

// Muestra los controles de búsqueda y filtro del catálogo.
// Recibe sus valores desde la página y comunica los cambios mediante las funciones recibidas.
// El estado y el filtrado de ejercicios se gestionan fuera de este componente.
export function ExerciseFilters({
  searchTerm,
  selectedMuscle,
  categories,
  onSearchChange,
  onMuscleChange,
}: ExerciseFiltersProps) {
  return (
    <div className="filter-search-container">
      {/* Buscador: muestra el texto recibido desde la página. */}
      <div className="search-input-box">
        <Search size={18} className="search-icon" />

        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre, zona muscular o descripción..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {/* Cada categoría se convierte en un botón de filtro. */}
      <div className="muscle-filter-pills">
        {categories.map((muscle) => (
          <button
            key={muscle}
            type="button"
            onClick={() => onMuscleChange(muscle)}
            className={`filter-pill-btn ${
              selectedMuscle === muscle ? 'active' : ''
            }`}
          >
            {muscle}
          </button>
        ))}
      </div>
    </div>
  );
}