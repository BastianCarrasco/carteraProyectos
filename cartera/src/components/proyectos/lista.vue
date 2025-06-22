<template>
  <div class="projects-container">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Cargando proyectos...</p>
    </div>

    <!-- Estado de error -->
    <div v-if="error" class="error-state">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
    </div>

    <!-- Sección de Filtros -->
    <div v-if="!loading && !error" class="filters-section">
      <input type="text" v-model="searchTerm" placeholder="Buscar por nombre de proyecto..." class="filter-input" />

      <select v-model="selectedThematic" class="filter-select">
        <option value="">Todas las temáticas</option>
        <option v-for="thematic in uniqueThematics" :key="thematic" :value="thematic">
          {{ thematic }}
        </option>
      </select>

      <!-- NUEVO FILTRO: Institución -->
      <select v-model="selectedInstitution" class="filter-select">
        <option value="">Todas las instituciones</option>
        <option v-for="institution in uniqueInstitutions" :key="institution" :value="institution">
          {{ institution }}
        </option>
      </select>

      <!-- NUEVO FILTRO: Estatus -->
      <select v-model="selectedStatus" class="filter-select">
        <option value="">Todos los estados</option>
        <option v-for="status in uniqueStatuses" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>

    <!-- Lista de proyectos (Ahora usa `filteredProjects`) -->
    <div v-if="!loading && !error" class="projects-grid">
      <article v-for="proyecto in filteredProjects" :key="proyecto.id_proyecto" class="project-card"
        @click="openModal(proyecto)">
        <header class="card-header">
          <h3 class="project-title" :title="proyecto.nombre">{{ proyecto.nombre }}.</h3>
        </header>

        <!-- Contenido principal de la tarjeta -->
        <div class="card-content">
          <div class="project-meta">
            <span class="badge theme">
              <img v-if="getThematicImage(proyecto.tematica)" :src="getThematicImage(proyecto.tematica)"
                alt="Ícono de temática" class="icon-image" />
              <i v-else class="icon fas fa-tag"></i>
              {{ proyecto.tematica || 'Sin temática' }}
            </span>
            <span class="badge institution">
              <img v-if="getInstitutionImage(proyecto.institucion)" :src="getInstitutionImage(proyecto.institucion)"
                alt="Logo de institución" class="icon-image" />
              <i v-else class="icon fas fa-university"></i>
              {{ proyecto.institucion || 'Sin institución' }}
            </span>
          </div>

          <p v-if="proyecto.profesores && proyecto.profesores.length > 0" class="project-professors">
            <img :src="professorIcon" alt="Ícono de Profesor" class="icon" />
            <span class="professors-list">
              {{proyecto.profesores.map(p => p.nombre_completo).join(', ')}}
            </span>
          </p>
          <p v-else class="project-professors">
            <img :src="professorIcon" alt="Ícono de Profesor" class="icon" />
            <span class="professors-list">
              Sin académicos asignados
            </span>
          </p>
        </div>

        <footer class="card-footer">
          <span class="footer-item">
            <i class="fas fa-calendar-alt"></i>
            {{ formatShortDate(proyecto.fecha_postulacion) }}
          </span>
          <span class="footer-item status" :class="getStatusClass(proyecto.estatus)">
            {{ proyecto.estatus || 'Estado desconocido' }}
          </span>
        </footer>
      </article>

      <!-- Mensaje si no hay proyectos que coincidan con los filtros -->
      <div v-if="filteredProjects.length === 0 && !loading && !error" class="no-results">
        <p>No se encontraron proyectos que coincidan con los filtros aplicados.</p>
      </div>
    </div>

    <!-- El modal, pasando las funciones de imagen como props -->
    <ProjectModal v-if="modalProject" :proyecto="modalProject" :getThematicImage="getThematicImage"
      :getInstitutionImage="getInstitutionImage" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ProjectModal from '../proyectos/ProjectModal.vue';

import '../../assets/Proyecto_styles/vistaProyectos.css';
import professorIcon from '../../assets/iconos/profesor.png';

// Importa SÓLO las imágenes que tienes por el momento
import hidrogenoIcon from '../../assets/tematicas/hidrogeno.png';
import litioIcon from '../../assets/tematicas/Litio.png';
import luxicon from '../../assets/tematicas/luz.png';
import miner from '../../assets/tematicas/miner.png'
import energyIcon from '../../assets/tematicas/energy.png';
import biotech from '../../assets/tematicas/bio.png';

// Importa SÓLO las imágenes de instituciones/fondos que tienes por el momento
import corfoLogo from '../../assets/fondos/corfo.png';
import sqm from '../../assets/fondos/sqm_logo.jpg';
import codelogo from '../../assets/fondos/logo-codesser.png';
import anidlogo from '../../assets/fondos/anid.jpg';

const props = defineProps({
  proyectos: Array,
  loading: Boolean,
  error: String,
});

const modalProject = ref(null);

// Variables de estado para los filtros
const searchTerm = ref('');
const selectedThematic = ref('');
const selectedInstitution = ref(''); // Nuevo filtro
const selectedStatus = ref('');     // Nuevo filtro

// Propiedades computadas para obtener opciones únicas para los selects
const uniqueThematics = computed(() => {
  if (!props.proyectos) return [];
  const thematics = new Set();
  props.proyectos.forEach(p => {
    if (p.tematica) {
      thematics.add(p.tematica);
    }
  });
  return [...thematics].sort();
});

const uniqueInstitutions = computed(() => { // Nueva propiedad computada
  if (!props.proyectos) return [];
  const institutions = new Set();
  props.proyectos.forEach(p => {
    if (p.institucion) {
      institutions.add(p.institucion);
    }
  });
  return [...institutions].sort();
});

const uniqueStatuses = computed(() => { // Nueva propiedad computada
  if (!props.proyectos) return [];
  const statuses = new Set();
  props.proyectos.forEach(p => {
    if (p.estatus) {
      statuses.add(p.estatus);
    }
  });
  return [...statuses].sort((a, b) => {
    // Ordenar estados de una manera lógica (ej. Postulado, En Proceso, Aprobado, Rechazado, Perfil)
    const order = ['postulado', 'adjudicado', 'aprobado', 'rechazado', 'perfil'];
    return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
  });
});


// Propiedad computada para filtrar proyectos
const filteredProjects = computed(() => {
  let projectsToFilter = props.proyectos;

  // 1. Filtrar por término de búsqueda (nombre del proyecto)
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
    projectsToFilter = projectsToFilter.filter(proyecto =>
      proyecto.nombre.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  // 2. Filtrar por temática seleccionada
  if (selectedThematic.value) {
    projectsToFilter = projectsToFilter.filter(proyecto =>
      proyecto.tematica && proyecto.tematica.toLowerCase() === selectedThematic.value.toLowerCase()
    );
  }

  // 3. Filtrar por institución seleccionada (Nuevo)
  if (selectedInstitution.value) {
    projectsToFilter = projectsToFilter.filter(proyecto =>
      proyecto.institucion && proyecto.institucion.toLowerCase() === selectedInstitution.value.toLowerCase()
    );
  }

  // 4. Filtrar por estatus seleccionado (Nuevo)
  if (selectedStatus.value) {
    projectsToFilter = projectsToFilter.filter(proyecto =>
      proyecto.estatus && proyecto.estatus.toLowerCase() === selectedStatus.value.toLowerCase()
    );
  }

  return projectsToFilter;
});


// Mapa de imágenes para temáticas
const thematicImages = {
  'hidrogeno': hidrogenoIcon,
  'hidrógeno': hidrogenoIcon,
  'litio': litioIcon,
  'contaminación lumínica': luxicon,
  'minería': miner,
  'almacenamiento energía': energyIcon,
  'biotecnología': biotech,
  // Asegúrate de que las claves aquí coincidan con las temáticas exactas que vienen de tu API
};

// Mapa de imágenes para instituciones
const institutionImages = {
  'corfo': corfoLogo,
  'sqm': sqm,
  'codesser': codelogo,
  'anid': anidlogo,
  // Asegúrate de que las claves aquí coincidan con los nombres exactos que vienen de tu API
};

const openModal = (proyecto) => {
  modalProject.value = proyecto;
};

const closeModal = () => {
  modalProject.value = null;
};

const formatShortDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  const options = { month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-CL', options);
};

// Dentro de tu <script setup>
const getStatusClass = (status) => {
  if (!status) return 'unknown';
  const statusMap = {
    'aprobado': 'approved',
    'postulado': 'submitted',
    'rechazado': 'rejected',
    'perfil': 'draft',
    'en proceso': 'in-progress',
    'adjudicado': 'adjudicado', // AÑADIDO: Mapea el estado 'adjudicado' a la clase 'adjudicado'
  };
  return statusMap[status.toLowerCase()] || 'unknown';
};

// Función para obtener la imagen de la temática
const getThematicImage = (thematic) => {
  const normalizedThematic = thematic ? thematic.toLowerCase() : '';
  return thematicImages[normalizedThematic] || null;
};

// Función para obtener la imagen de la institución
const getInstitutionImage = (institution) => {
  const normalizedInstitution = institution ? institution.toLowerCase() : '';
  return institutionImages[normalizedInstitution] || null;
};
</script>
<style scoped>
/* Estilos existentes de ProjectCard, ajustados si es necesario */
.project-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 15px 15px 0;
  margin-bottom: 0;
}

.project-title {
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1.3;
  height: calc(1.3em * 2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 0.5em;
  color: #333;
}

.card-content {
  flex-grow: 1;
  padding: 0 15px 15px;
  color: #555;
  font-size: 0.9em;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  padding-top: 5px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;
}

.badge.theme {
  background-color: #e0f7fa;
  color: #00796b;
}

.badge.institution {
  background-color: #e3f2fd;
  color: #1976d2;
}

.project-professors {
  margin-top: 5px;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: #666;
  line-height: 1.4;
}

.project-professors .professors-list {
  flex-grow: 1;
}

.project-professors .icon {
  width: 1.2em;
  height: 1.2em;
  object-fit: contain;
  font-size: 1.1em;
  color: #777;
  flex-shrink: 0;
}

.card-footer {
  margin-top: auto;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  font-size: 0.85em;
  color: #777;
}

.footer-item i {
  margin-right: 5px;
  color: #999;
}

.footer-item.status {
  padding: 3px 8px;
  border-radius: 5px;
  font-weight: 600;
}

/* Estilos para los estados del proyecto (ya existían) */
.footer-item.status.approved {
  background-color: #e6ffe6;
  color: #28a745;
}

.footer-item.status.submitted {
  background-color: #fff3cd;
  color: #ffc107;
}

.footer-item.status.rejected {
  background-color: #f8d7da;
  color: #dc3545;
}

.footer-item.status.draft {
  background-color: #e2e3e5;
  color: #6c757d;
}

.footer-item.status.in-progress {
  background-color: #d1ecf1;
  color: #17a2b8;
}

.footer-item.status.unknown {
  background-color: #aaaaaa;
  color: #999;
}

.badge .icon-image {
  width: 2em;
  height: 2em;
  vertical-align: middle;
  margin-right: 5px;
  object-fit: contain;
}

.badge .icon {
  margin-right: 5px;
}

/* --- Nuevos estilos para los filtros --- */
.filters-section {
  display: flex;
  flex-wrap: wrap;
  /* Permite que los filtros se apilen en pantallas pequeñas */
  gap: 15px;
  /* Espacio entre los elementos del filtro */
  margin-bottom: 30px;
  /* Margen inferior para separarlo de la cuadrícula de proyectos */
  padding: 15px;
  background-color: #f0f4f8;
  /* Un fondo suave para la sección de filtros */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-input,
.filter-select {
  flex: 1;
  /* Permite que ocupen el espacio disponible */
  min-width: 200px;
  /* Ancho mínimo para cada filtro */
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  color: #333;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-input::placeholder {
  color: #888;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.filter-select {
  /* Añadir una flecha personalizada si no te gusta la nativa */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 40px;
  /* Para hacer espacio para la flecha */
}

/* Mensaje de no resultados */
.no-results {
  grid-column: 1 / -1;
  /* Ocupa todas las columnas en la cuadrícula */
  text-align: center;
  padding: 40px 20px;
  background-color: #fef0f0;
  color: #e74c3c;
  border-radius: 8px;
  border: 1px solid #fccdcd;
  font-size: 1.1em;
  margin-top: 30px;
}

/* Media Query para pantallas más pequeñas (opcional, pero útil) */
@media (max-width: 900px) {

  /* A partir de 900px, los filtros pueden empezar a apilarse para no apretarse */
  .filters-section {
    flex-direction: column;
  }

  .filter-input,
  .filter-select {
    min-width: unset;
    width: 100%;
  }
}

/* Si quieres que se apilen antes de los 600px, ajusta el breakpoint. */
/* Por ejemplo, para que pasen de 4 a 2 por fila, y luego a 1 por fila */
@media (max-width: 1200px) {

  .filter-input,
  .filter-select {
    flex: 1 1 calc(50% - 15px);
    /* Dos por fila con espacio entre ellos */
  }
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #7f8c8d;
  border-top: 1px solid #f0f0f0;
  /* Borde superior para separarlo del contenido */
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-item i {
  margin-right: 0;
  /* Ya hay gap, no se necesita margin-right */
  color: #999;
  font-size: 1em;
  /* Asegura que los íconos no sean demasiado grandes */
}

.footer-item.status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  /* Redondeado como un badge */
  font-weight: 500;
  text-transform: capitalize;
  /* Para que el estado luzca mejor (ej. "Postulado") */
}

/* Colores para los estados de proyecto */
.footer-item.status.approved,
.footer-item.status.adjudicado

/* AÑADIDO: Incluye .adjudicado aquí */
  {
  background-color: #e8f5e9;
  /* Verde claro de fondo */
  color: #27ae60;
  /* Verde oscuro de texto */
}

.footer-item.status.submitted {
  background-color: #e3f2fd;
  color: #2980b9;
}

/* Azul */
.footer-item.status.rejected {
  background-color: #ffebee;
  color: #e74c3c;
}

/* Rojo */
.footer-item.status.draft {
  background-color: #fff8e1;
  color: #f39c12;
}

/* Naranja */
.footer-item.status.in-progress {
  background-color: #f3e5f5;
  color: #9b59b6;
}

/* Morado */
.footer-item.status.unknown {
  background-color: #eceff1;
  color: #95a5a6;
}

/* Gris */

@media (max-width: 768px) {

  .filter-input,
  .filter-select {
    flex: 1 1 100%;
    /* Uno por fila */
  }

  .filters-section {
    flex-direction: column;
  }
}
</style>