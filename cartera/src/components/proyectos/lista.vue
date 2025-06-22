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

    <!-- Lista de proyectos -->
    <div v-if="!loading && !error" class="projects-grid">
      <article v-for="proyecto in proyectos" :key="proyecto.id_proyecto" class="project-card"
        @click="openModal(proyecto)">
        <header class="card-header">
          <h3 class="project-title" :title="proyecto.nombre">{{ proyecto.nombre }}.</h3>
        </header>

        <!-- Contenido principal de la tarjeta -->
        <div class="card-content">
          <!-- MOVIMIENTO AQUÍ: Las insignias ahora están dentro de card-content -->
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
          <!-- FIN DEL MOVIMIENTO -->

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
          <!-- Puedes añadir más campos aquí si es necesario -->
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
    </div>

    <!-- El modal, pasando las funciones de imagen como props -->
    <ProjectModal v-if="modalProject" :proyecto="modalProject" :getThematicImage="getThematicImage"
      :getInstitutionImage="getInstitutionImage" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProjectModal from '../proyectos/ProjectModal.vue';
import '../../assets/Proyecto_styles/vistaProyectos.css';
import professorIcon from '../../assets/iconos/profesor.png';

// Importa SÓLO las imágenes que tienes por el momento
import hidrogenoIcon from '../../assets/tematicas/hidrogeno.png';
import litioIcon from '../../assets/tematicas/Litio.png';
import luxicon from '../../assets/tematicas/luz.png';
import miner from '../../assets/tematicas/miner.png'
import energyIcon from '../../assets/tematicas/energy.png';

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

// Mapa de imágenes para temáticas
const thematicImages = {
  'hidrogeno': hidrogenoIcon,
  'hidrógeno': hidrogenoIcon,
  'litio': litioIcon,
  'contaminación lumínica': luxicon,
  'minería': miner,
  'almacenamiento energía': energyIcon,
};

// Mapa de imágenes para instituciones
const institutionImages = {
  'corfo': corfoLogo,
  'sqm': sqm,
  'codesser': codelogo,
  'anid': anidlogo,
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

const getStatusClass = (status) => {
  if (!status) return 'unknown';
  const statusMap = {
    'aprobado': 'approved',
    'postulado': 'submitted',
    'rechazado': 'rejected',
    'perfil': 'draft',
    'en proceso': 'in-progress',
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
/*
   IMPORTANTE: Se asume que estos estilos son un complemento a los de
   '../../assets/Proyecto_styles/vistaProyectos.css' o son los únicos
   estilos específicos de este componente. Si el CSS del modal fue movido
   completamente al modal, entonces aquí solo debería haber estilos
   para la lista de proyectos en sí.
*/

/* Tus estilos de project-card y related elements deberían estar aquí o en el CSS importado */

.project-card {
  display: flex;
  flex-direction: column;
  /* Añade aquí estilos base de la tarjeta si no están en vistaProyectos.css */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  /* Asegura que el border-radius se aplique bien */
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}


.card-header {
  padding: 15px 15px 0;
  /* Ajusta el padding si el título está pegado al borde superior */
  margin-bottom: 0;
  /* Ya no hay margen inferior aquí, lo manejaremos en project-meta */
}

/* Estilos para el título del proyecto (truncado a 2 líneas) */
.project-title {
  font-size: 1.2em;
  font-weight: 600;
  /* Dale un poco más de peso */
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
  /* Ajusta este padding si el badge quedaba muy pegado arriba */
  color: #555;
  font-size: 0.9em;
  line-height: 1.4;
  display: flex;
  /* Para flexionar las insignias y los profesores si es necesario */
  flex-direction: column;
  /* Organizar verticalmente los elementos internos */
}

/* Nuevo estilo para el contenedor de las insignias */
.project-meta {
  display: flex;
  /* Para que las insignias se coloquen una al lado de la otra */
  flex-wrap: wrap;
  /* Permite que las insignias se envuelvan a la siguiente línea si no hay espacio */
  gap: 8px;
  /* Espacio entre las insignias */
  margin-bottom: 15px;
  /* Margen inferior para separarlo de los profesores */
  padding-top: 5px;
  /* Pequeño padding si lo necesitas para despegarlos del título */
}

.badge {
  display: inline-flex;
  /* Usar inline-flex para alinear contenido dentro del badge */
  align-items: center;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  white-space: nowrap;
  /* Evita que el texto de la insignia se rompa */
}

.badge.theme {
  background-color: #e0f7fa;
  /* Un color suave para temáticas */
  color: #00796b;
  /* Color de texto para temáticas */
}

.badge.institution {
  background-color: #e3f2fd;
  /* Un color suave para instituciones */
  color: #1976d2;
  /* Color de texto para instituciones */
}


.project-professors {
  margin-top: 5px;
  /* Mantenemos este margen superior respecto a lo que tiene encima */
  display: flex;
  align-items: flex-start;
  gap: 5px;
  color: #666;
  line-height: 1.4;
}

/* Contenedor para la lista de profesores para manejar el wrap y la altura */
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

/* Estilos para los estados del proyecto */
.footer-item.status.approved {
  background-color: #e6ffe6;
  color: #28a745;
}

/* Verde */
.footer-item.status.submitted {
  background-color: #fff3cd;
  color: #ffc107;
}

/* Amarillo */
.footer-item.status.rejected {
  background-color: #f8d7da;
  color: #dc3545;
}

/* Rojo */
.footer-item.status.draft {
  background-color: #e2e3e5;
  color: #6c757d;
}

/* Gris */
.footer-item.status.in-progress {
  background-color: #d1ecf1;
  color: #17a2b8;
}

/* Azul claro */
.footer-item.status.unknown {
  background-color: #f2f2f2;
  color: #999;
}


.badge .icon-image {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
  margin-right: 5px;
  object-fit: contain;
}

.badge .icon {
  margin-right: 5px;
}
</style>