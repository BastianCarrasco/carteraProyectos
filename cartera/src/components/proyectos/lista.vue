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
              <i class="icon fas fa-tag"></i>
              {{ proyecto.tematica || 'Sin temática' }}
            </span>
            <span class="badge institution">
              <i class="icon fas fa-university"></i>
              {{ proyecto.institucion || 'Sin institución' }}
            </span>
          </div>
        </header>

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

    <!-- Modal del proyecto -->
    <ProjectModal v-if="modalProject" :proyecto="modalProject" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProjectModal from '../proyectos/ProjectModal.vue'; // Ajusta esta ruta según tu estructura
import '../../assets/Proyecto_styles/vistaProyectos.css';

const props = defineProps({
  proyectos: Array,
  loading: Boolean,
  error: String
});

const modalProject = ref(null);

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
    'en proceso': 'in-progress'
  };
  return statusMap[status.toLowerCase()] || 'unknown';
};
</script>

<style scoped></style>
