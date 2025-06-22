<template>
  <div class="projects-view">
    <!-- El componente Lista recibirá los proyectos enriquecidos con la información de académicos e imagen -->
    <Lista :proyectos="proyectos" :loading="loading" :error="error" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Lista from '../components/proyectos/lista.vue'; // Asumiendo que 'lista.vue' es el componente Lista

const proyectosUrl = 'https://elysia-bunbackend-production.up.railway.app/funciones/data';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';
const urlFotosAcademicoBase = 'https://elysia-bunbackend-production.up.railway.app/academicos';

export default {
  name: 'ProjectsView',
  components: {
    Lista
  },
  setup() {
    const proyectos = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // Función para obtener la URL de la foto de un académico
    // Ahora, esta función devolverá UN SOLO link de foto por académico,
    // o null si no se encuentra.
    const fetchFotoAcademico = async (idAcademico) => {
      if (!idAcademico) {
        // console.log(`No hay ID de académico para buscar fotos.`);
        return null;
      }
      // console.log(`Buscando fotos para el académico ID: ${idAcademico}`);
      try {
        const response = await fetch(`${urlFotosAcademicoBase}/${idAcademico}/fotos`);
        if (!response.ok) {
          console.warn(`No se pudieron cargar fotos para el académico ${idAcademico}: ${response.statusText}`);
          return null;
        }
        const data = await response.json();
        // Asumiendo que data es un array de objetos { link: string }
        // y queremos el primer link válido
        const fotoLink = data.find(foto => foto.link)?.link;
        return fotoLink || null;
      } catch (err) {
        console.error(`Error al obtener foto para el académico ${idAcademico}:`, err);
        return null;
      }
    };


    onMounted(async () => {
      try {
        // 1. Obtener los proyectos
        const proyectosResponse = await fetch(proyectosUrl);
        let proyectosData = await proyectosResponse.json();

        // Normalizar la data de proyectos
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

        // Crear un mapa para acceder rápidamente a los académicos por id_proyecto
        const academicosMap = new Map();
        academicosData.forEach(entry => {
          academicosMap.set(entry.id_proyecto, entry.profesores);
        });

        // Array para almacenar todas las promesas de procesamiento de proyectos
        const projectProcessingPromises = [];

        // 3. Fusionar la información y preparar la búsqueda de imágenes para CADA ACADÉMICO
        proyectosData.forEach(proyecto => {
          const profesores = academicosMap.get(proyecto.id_proyecto) || [];

          // Para cada proyecto, creamos una promesa que obtendrá las fotos de todos sus profesores
          const projectPromise = (async () => {
            const academicImageLinks = [];
            const professorPromises = profesores.map(async (profesor) => {
              if (profesor.id_academico) {
                const imageLink = await fetchFotoAcademico(profesor.id_academico);
                if (imageLink) {
                  academicImageLinks.push(imageLink);
                }
              }
            });

            await Promise.all(professorPromises); // Esperar a que se carguen todas las fotos de los profesores

            return {
              ...proyecto,
              profesores, // Asegurarse de que los profesores están incluidos como objetos
              academicImageLinks: academicImageLinks // ¡Nuevo campo para el arreglo de URLs de imágenes!
            };
          })();
          projectProcessingPromises.push(projectPromise);
        });

        // Esperar a que todas las promesas de procesamiento de proyectos se resuelvan
        proyectos.value = await Promise.all(projectProcessingPromises);

        // Opcional: console.log de los proyectos finales con las imágenes cargadas
        console.log("Proyectos finales con imágenes de académicos:", proyectos.value);

      } catch (err) {
        error.value = `Error al cargar datos: ${err.message}`;
        console.error('Error fetching data in ProjectsView:', err);
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