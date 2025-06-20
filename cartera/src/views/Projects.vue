<template>
  <div class="projects-view">
    <!-- El componente Lista recibirá los proyectos enriquecidos con la información de académicos -->
    <Lista :proyectos="proyectos" :loading="loading" :error="error" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Lista from '../components/proyectos/lista.vue'; // Asumiendo que 'lista.vue' es el componente Lista

const proyectosUrl = 'https://elysia-bunbackend-production.up.railway.app/funciones/data';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';

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
        // 1. Obtener los proyectos
        const proyectosResponse = await fetch(proyectosUrl);
        let proyectosData = await proyectosResponse.json();

        // Normalizar la data de proyectos (manejar { success, data } o array directo)
        if (proyectosData.success && Array.isArray(proyectosData.data)) {
          proyectosData = proyectosData.data;
        } else if (!Array.isArray(proyectosData)) {
          throw new Error('Formato de respuesta de proyectos no reconocido');
        }

        // 2. Obtener los académicos por proyecto
        const academicosResponse = await fetch(urlAcademicos);
        const academicosData = await academicosResponse.json();

        // Asegurarse de que academicosData sea un array
        if (!Array.isArray(academicosData)) {
          throw new Error('Formato de respuesta de académicos no reconocido');
        }

        // 3. Fusionar la información de académicos en los proyectos
        const proyectosConAcademicos = proyectosData.map(proyecto => {
          // Buscar la entrada de académicos para el proyecto actual por id_proyecto
          const academicosDelProyecto = academicosData.find(
            academicoEntry => academicoEntry.id_proyecto === proyecto.id_proyecto
          );

          // Si se encuentran académicos, agregarlos al objeto proyecto
          return {
            ...proyecto,
            profesores: academicosDelProyecto ? academicosDelProyecto.profesores : []
          };
        });

        proyectos.value = proyectosConAcademicos;

      } catch (err) {
        error.value = `Error al cargar datos: ${err.message}`;
        console.error('Error fetching data:', err);
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