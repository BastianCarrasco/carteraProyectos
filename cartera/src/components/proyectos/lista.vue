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
          <h3 class="project-title">{{ proyecto.nombre }}</h3>
          <div class="project-meta">
            <span class="badge theme">
              <!-- Lógica para mostrar imagen de temática o icono por defecto -->
              <img v-if="getThematicImage(proyecto.tematica)" :src="getThematicImage(proyecto.tematica)"
                alt="Ícono de temática" class="icon-image" />
              <i v-else class="icon fas fa-tag"></i>
              {{ proyecto.tematica || 'Sin temática' }}
            </span>
            <span class="badge institution">
              <!-- Lógica para mostrar imagen de institución o icono por defecto -->
              <img v-if="getInstitutionImage(proyecto.institucion)" :src="getInstitutionImage(proyecto.institucion)"
                alt="Logo de institución" class="icon-image" />
              <i v-else class="icon fas fa-university"></i>
              {{ proyecto.institucion || 'Sin institución' }}
            </span>
          </div>
        </header>

        <!-- Contenido principal de la tarjeta -->
        <div class="card-content">
          <p v-if="proyecto.profesores && proyecto.profesores.length > 0" class="project-professors">
            <!-- Ícono de profesor personalizado -->
            <img :src="professorIcon" alt="Ícono de Profesor" class="icon" />
            {{ proyecto.profesores.join(', ') }}
            <!-- Une todos los nombres con coma y espacio -->
          </p>
          <p v-else class="project-professors">
            <!-- Ícono de profesor personalizado cuando no hay asignados -->
            <img :src="professorIcon" alt="Ícono de Profesor" class="icon" />
            Sin académicos asignados
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
// Cambiado de 'profeosr' a 'professorIcon' para mayor claridad
import professorIcon from '../../assets/iconos/profesor.png';

// Importa SÓLO las imágenes que tienes por el momento
import hidrogenoIcon from '../../assets/tematicas/hidrogeno.png';
import litioIcon from '../../assets/tematicas/Litio.png';
import luxicon from '../../assets/tematicas/luz.png';

// Importa SÓLO las imágenes de instituciones/fondos que tienes por el momento
import corfoLogo from '../../assets/fondos/corfo.png';
import sqm from '../../assets/fondos/sqm_logo.jpg';

const props = defineProps({
  proyectos: Array,
  loading: Boolean,
  error: String,
});

const modalProject = ref(null);

// Mapa de imágenes para temáticas - SÓLO CON LAS TEMÁTICAS EXISTENTES
const thematicImages = {
  'hidrogeno': hidrogenoIcon,
  'hidrógeno': hidrogenoIcon,
  'litio': litioIcon,
  'contaminación lumínica': luxicon // <-- Make this key lowercase to match normalized input
};

// Mapa de imágenes para instituciones - SÓLO CON LAS INSTITUCIONES EXISTENTES
const institutionImages = {
  // Asegúrate de que esta clave 'corfo' coincida con el valor exacto de proyecto.institucion (en minúsculas)
  'corfo': corfoLogo,
  'sqm': sqm,
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
  return institutionImages[normalizedInstitution] || null; // Retorna null si no hay imagen
};
</script>

<style scoped>
/* Asegúrate de que estos estilos estén en vistaProyectos.css o déjalos aquí con 'scoped' */

/* ... Tus estilos existentes ... */

.project-card {
  /* ... tus estilos de tarjeta ... */
  display: flex;
  flex-direction: column;
  /* Para que el contenido fluya verticalmente */
}

.card-header {
  /* ... tus estilos del encabezado de la tarjeta ... */
  margin-bottom: 10px;
  /* Espacio debajo del encabezado */
}

.card-content {
  flex-grow: 1;
  /* Permite que esta sección ocupe el espacio disponible */
  padding: 0 15px 15px;
  /* Padding para el contenido principal */
  color: #555;
  font-size: 0.9em;
  line-height: 1.4;
  overflow: hidden;
  /* Oculta el desbordamiento si el texto es muy largo */
  text-overflow: ellipsis;
  /* Añade puntos suspensivos */
  /* white-space: nowrap; // Considera esto si siempre quieres una sola línea y ellipsis */
}

.project-professors {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

/* Modifica esta regla para que aplique tanto a Font Awesome como a tus imágenes */
.project-professors .icon {
  width: 1.2em;
  /* Ajusta el tamaño según necesites */
  height: 1.2em;
  /* Ajusta el tamaño según necesites */
  object-fit: contain;
  /* Para asegurar que la imagen se vea bien */
  font-size: 1.1em;
  /* Esto es para los íconos de Font Awesome si los llegaras a usar aquí */
  color: #777;
  /* Esto es para los íconos de Font Awesome si los llegaras a usar aquí */
  vertical-align: middle;
  /* Para alinear con el texto */
}

.card-footer {
  /* ... tus estilos del pie de la tarjeta ... */
  margin-top: auto;
  /* Empuja el footer hacia abajo */
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