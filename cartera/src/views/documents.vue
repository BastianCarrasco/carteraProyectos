<!-- Vista de Proyectos (ProjectsView.vue) -->
<template>
  <div class="projects">
    <h1>Formatos de documentos</h1>
    <div class="button-group">  <!-- Contenedor para los botones -->
      <button @click="generarPDFDesdeOtroComponente" class="pdf-button">
        <img src="@/assets/iconos/pdf.png" alt="PDF" class="button-icon-large" />
        <span>Generar Reporte PDF</span>
      </button>

      <button @click="exportarCSV" class="csv-button">
        <img src="@/assets/iconos/csv.png" alt="CSV" class="button-icon-large" />
        <span>Exportar CSV</span>
      </button>
      <button @click="exportarExcel" class="excel-button">
        <img src="@/assets/iconos/exel.png" alt="Excel" class="button-icon-large" />
        <span>Exportar Excel</span>
      </button>
      <button @click="exportarTXT" class="txt-button">
        <img src="@/assets/iconos/txt.png" alt="TXT" class="button-icon-large" />
        <span>Exportar TXT</span>
      </button>
      <button @click="exportarJSON" class="json-button">
        <img src="@/assets/iconos/json.png" alt="JSON" class="button-icon-large" />
        <span>Exportar JSON</span>
      </button>
    </div>

    <div v-if="loading" class="loading">Cargando proyectos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="project-list">
      <!-- Tu lista de proyectos aquí -->
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useExportFunctions } from "../plugins/exportFunctions.js"; // Importa las funciones de exportación
const proyectosUrl = import.meta.env.VITE_API_URL_AllPROYECTOS;

export default {
  name: "ProjectsView",
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
          throw new Error("Error al obtener los proyectos");
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CL");
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
    };

    // 🚀 Obtener las funciones de exportación, pasando las dependencias
    const {
      unificarAcademicosPorNombre,
      generarPDF,
      exportarCSV: exportarCSVFn,
      exportarExcel: exportarExcelFn,
      exportarTXT: exportarTXTFn,
      exportarJSON: exportarJSONFn,
    } = useExportFunctions(projects, formatDate, formatCurrency, error);

    const generarPDFDesdeOtroComponente = () => {
      try {
        if (!projects.value || projects.value.length === 0) {
          error.value = "No hay proyectos para generar el PDF.";
          return;
        }

        // Unificar académicos antes de generar el PDF
        const proyectosParaPDF = unificarAcademicosPorNombre(projects.value);

        // Llama a la función importada y pasa los datos de proyectos
        generarPDF(proyectosParaPDF); // Ahora llama a la función local.
      } catch (err) {
        console.error("Error al generar PDF:", err);
        error.value = "Error al generar el documento";
      }
    };

    //Reemplazo la llamadas para usar las funciones importadas y pasarle la data
    const exportarCSV = () => {
      const proyectosParaCSV = unificarAcademicosPorNombre(projects.value);
      exportarCSVFn(proyectosParaCSV);
    };
    const exportarExcel = () => {
      const proyectosParaExcel = unificarAcademicosPorNombre(projects.value);
      exportarExcelFn(proyectosParaExcel);
    };

    const exportarTXT = () => {
      const proyectosParaTXT = unificarAcademicosPorNombre(projects.value);
      exportarTXTFn(proyectosParaTXT);
    };
    const exportarJSON = () => {
      const proyectosParaJSON = unificarAcademicosPorNombre(projects.value);
      exportarJSONFn(proyectosParaJSON);
    };

    onMounted(fetchProjects);

    return {
      projects,
      loading,
      error,
      generarPDFDesdeOtroComponente,
      exportarCSV,
      exportarExcel,
      exportarTXT,
      exportarJSON,
      formatDate,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.projects {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}
.button-group {
    display: flex;
    flex-wrap: wrap; /* Permite que los botones se envuelvan a la siguiente línea */
    justify-content: center; /* Centra horizontalmente los botones */
    gap: 10px; /* Espacio entre los botones */
    
}

.pdf-button,
.csv-button,
.excel-button,
.txt-button,
.json-button {
  background-color: #ff2504; /* Color por defecto, se cambiará con las clases individuales */
  color: white;
  padding: 10px; /* Menos padding vertical para que se vea mejor */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; /* Fuente un poco más pequeña */
  text-align: center; /* Centra el texto */
  width: 120px; /* Ancho fijo para los botones */
  display: flex;
  flex-direction: column; /* Apila el icono y el texto verticalmente */
  align-items: center;  /* Centra horizontalmente el contenido */
  justify-content: center;  /* Centra verticalmente el contenido */
  transition: background-color 0.3s;
}

/* Estilos específicos para los botones, usando las clases*/
.pdf-button { background-color: #ff2504; margin-right: 45px;  }
.pdf-button:hover { background-color: #cc1f03; }

.csv-button { background-color: #4a9a52; margin-right: 45px; } 
.csv-button:hover { background-color: #3e8e45; }

.excel-button { background-color: #16a085; margin-right: 45px; }
.excel-button:hover { background-color: #18c9a4; }

.txt-button { background-color: #3498db; margin-right: 45px; }
.txt-button:hover { background-color: #2980b9; }

.json-button { background-color: #f39c12; margin-right: 45px; }
.json-button:hover { background-color: #e67e22; }


.button-icon-large {  /* Clase para el icono más grande */
  width: 48px; /* Ajusta el tamaño según tus necesidades */
  height: 48px; /* Ajusta el tamaño según tus necesidades */
  margin-bottom: 5px; /* Espacio entre el icono y el texto */
}

/* Opcional:  Ajustar el texto si es necesario */
.pdf-button span,
.csv-button span,
.excel-button span,
.txt-button span,
.json-button span {
  font-size: 12px; /* Tamaño de fuente para el texto */
}
</style>