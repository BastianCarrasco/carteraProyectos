<template>
  <div class="projects-view">
    <Lista :proyectos="proyectos" :loading="loading" :error="error" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Lista from '../components/proyectos/lista.vue';

const proyectosUrl = 'https://elysia-bunbackend-production.up.railway.app/funciones/data';

export default {
  name: 'ProjectsView',
  components: {
    Lista
  },
  setup() {
    const proyectos = ref([]);
    const loading = ref(true);
    const error = ref(null);

    onMounted(async () => {
      try {
        const response = await fetch(proyectosUrl);
        const data = await response.json();

        // Manejo de respuesta directa (sin propiedad 'success')
        if (Array.isArray(data)) {
          proyectos.value = data;
        }
        // Manejo de respuesta con estructura {success, data}
        else if (data.success && Array.isArray(data.data)) {
          proyectos.value = data.data;
        }
        // Respuesta inesperada
        else {
          throw new Error('Formato de respuesta no reconocido');
        }
      } catch (err) {
        error.value = `Error al cargar proyectos: ${err.message}`;
        console.error('Error fetching projects:', err);
      } finally {
        loading.value = false;
      }
    });

    return { proyectos, loading, error };
  }
}
</script>

<style scoped>
.projects-view {
  padding: 20px;
  width: 100%;
  margin: 0 auto;
  max-width: 1400px;
}

.projects-view h1 {
  margin: 0 0 30px 0;
  color: #2c3e50;
  text-align: center;
  font-size: 2.2rem;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}
</style>