<template>
  <div class="projects">
    <h1>Lista de Proyectos</h1>
    <div v-if="loading">Cargando proyectos...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ul>
        <li v-for="proyecto in proyectos" :key="proyecto.id_proyecto">
          <h2>{{ proyecto.nombre || 'Sin nombre' }}</h2>
          <p>Monto: {{ proyecto.monto ? `$${proyecto.monto}` : 'No especificado' }}</p>
          <p>Fecha: {{ proyecto.fecha_postulacion ? new Date(proyecto.fecha_postulacion).toLocaleDateString() : 'No especificada' }}</p>
          <p>Comentarios: {{ proyecto.comentarios || 'Sin comentarios' }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'ProjectsView',
  setup() {
    const proyectos = ref([]);
    const loading = ref(true);
    const error = ref(null);

    onMounted(async () => {
      try {
        const response = await fetch('https://kth2025backend-production.up.railway.app/proyectos');
        if (!response.ok) {
          throw new Error('Error al obtener los proyectos');
        }
        const data = await response.json();
        if (data.success) {
          proyectos.value = data.data;
        } else {
          throw new Error('La respuesta no fue exitosa');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    });

    return { proyectos, loading, error };
  }
}
</script>

<style scoped>
.projects {
  padding: 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>