<template>
  <div class="projects-view">

    <Lista 
      :proyectos="proyectos" 
      :loading="loading" 
      :error="error" 
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Lista from '@/components/proyectos/lista.vue';
const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS

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
.projects-view {
  padding: 20px;
  width: 100%; /* Ocupa todo el ancho */
  margin: 0;
  max-width: none; /* Elimina el límite máximo de ancho */
}

.projects-view h1 {
  max-width: 1200px;
  margin: 0 auto 20px auto; /* Centra solo el título */
}
</style>