<!-- Vista de Proyectos (ProjectsView.vue) -->
<template>
  <div class="projects">
    <h1>Lista de Proyectos</h1>
    <button @click="generarPDFDesdeOtroComponente" class="pdf-button">
      Generar Reporte PDF
    </button>
    
    <div v-if="loading" class="loading">Cargando proyectos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="project-list">
      <!-- Tu lista de proyectos aquí -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { generarInformeProyectos } from '../plugins/pdfGenerator.js'; // Importa la función del otro componente
const proyectosUrl = import.meta.env.VITE_API_URL_AllPROYECTOS

export default {
  name: 'ProjectsView',
  setup() {
    const projects = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchProjects = async () => {
      try {
        const response = await fetch(proyectosUrl);
        const data = await response.json();
        
        if (data.success) {
          projects.value = data.data;
        } else {
          throw new Error('Error al obtener los proyectos');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL');
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(amount);
    };

    const unificarAcademicosPorNombre = (proyectos) => {
      const proyectosUnificados = [];
      const nombresProcesados = new Set();

      proyectos.forEach(proyecto => {
        if (!nombresProcesados.has(proyecto.nombre)) {
          nombresProcesados.add(proyecto.nombre);
          const proyectosMismoNombre = proyectos.filter(p => p.nombre === proyecto.nombre);
          const academicosUnidos = new Set();

          proyectosMismoNombre.forEach(p => {
            if (p.academico) {
              p.academico.split(',').forEach(acad => {
                academicosUnidos.add(acad.trim());
              });
            }
          });

          // Crea un nuevo objeto proyecto con los académicos unidos
          proyectosUnificados.push({
            ...proyecto, // Copia las propiedades del primer proyecto
            academico: Array.from(academicosUnidos).join(', ') // Reemplaza los académicos
          });
        }
      });
        
      return proyectosUnificados;
    };


    const generarPDFDesdeOtroComponente = () => {
      try {
        if (!projects.value || projects.value.length === 0) {
            error.value = "No hay proyectos para generar el PDF.";
            return;
        }

        // Unificar académicos antes de generar el PDF
        const proyectosParaPDF = unificarAcademicosPorNombre(projects.value);

        // Llama a la función importada y pasa los datos de proyectos
        generarInformeProyectos(proyectosParaPDF, formatDate, formatCurrency);

      } catch (err) {
        console.error('Error al generar PDF:', err);
        error.value = 'Error al generar el documento';
      }
    };

    onMounted(fetchProjects);

    return {
      projects,
      loading,
      error,
      generarPDFDesdeOtroComponente, // Cambiado a la función que usa el otro componente
      formatDate,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.projects {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.pdf-button {
  background-color: #2980b9;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.pdf-button:hover {
  background-color: #3498db;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.project-list {
  margin-top: 20px;
}
</style>