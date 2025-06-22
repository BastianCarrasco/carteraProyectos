<template>
  <div class="home">
    <h1>Bienvenido a la Gestión de Proyectos</h1>
    <p class="subtitle">Una herramienta para organizar y monitorear tus proyectos</p>

    <div class="features">
      <!-- Tarjeta 1: Proyectos -->
      <div class="feature-card">
        <h2>📋 Proyectos</h2>
        <p>Visualiza y gestiona todos tus proyectos en un solo lugar.</p>
        <router-link to="/projects" class="action-button">Ver proyectos</router-link>
      </div>

      <!-- Tarjeta 2: Crear -->
      <div class="feature-card">
        <h2>✨ Crear</h2>
        <p>Agrega nuevos proyectos con un formulario sencillo.</p>
        <router-link to="/create" class="action-button">Crear proyecto</router-link>
      </div>

      <!-- Tarjeta 3: Formularios Académicos -->
      <div class="feature-card">
        <h2>📚 Formularios Académicos</h2>
        <p>
          Revisa y gestiona los formularios enviados por el personal académico.
        </p>
        <router-link to="/formularios" class="action-button">Ver formularios</router-link>
      </div>

      <!-- Tarjeta 4: Estadísticas -->
      <div class="feature-card">
        <h2>📊 Estadísticas</h2>
        <p>Métricas y gráficos para analizar tu productividad.</p>
        <router-link to="/statistics" class="action-button">Ver estadísticas</router-link>
      </div>
    </div>

    <!-- Sección de Exportación -->
    <div class="export-section">
      <h2>Descargar Informes y Datos</h2>
      <p>Exporta la información de tus proyectos en diferentes formatos.</p>

      <div class="export-buttons">
        <button @click="handleGeneratePDF" class="export-button pdf-button">
          <span v-if="loadingExportPDF" class="spinner"></span>
          <template v-else>
            <img src="@/assets/iconos/pdf.png" alt="PDF Icon" class="button-icon" />
            <span>Generar PDF</span>
          </template>
        </button>

        <!-- <button @click="handleExportCSV" class="export-button csv-button">
          <span v-if="loadingExportCSV" class="spinner"></span>
          <template v-else>
            <img src="@/assets/iconos/csv.png" alt="CSV Icon" class="button-icon" />
            <span>Exportar CSV</span>
          </template>
        </button> -->

        <button @click="handleExportExcel" class="export-button excel-button">
          <span v-if="loadingExportExcel" class="spinner"></span>
          <template v-else>
            <img src="@/assets/iconos/exel.png" alt="Excel Icon" class="button-icon" />
            <span>Exportar Excel</span>
          </template>
        </button>

        <!-- <button @click="handleExportTXT" class="export-button txt-button">
          <span v-if="loadingExportTXT" class="spinner"></span>
          <template v-else>
            <img src="@/assets/iconos/txt.png" alt="TXT Icon" class="button-icon" />
            <span>Exportar TXT</span>
          </template>
        </button> -->
        <!-- 
        <button @click="handleExportJSON" class="export-button json-button">
          <span v-if="loadingExportJSON" class="spinner"></span>
          <template v-else>
            <img src="@/assets/iconos/json.png" alt="JSON Icon" class="button-icon" />
            <span>Exportar JSON</span>
          </template>
        </button> -->
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useExportFunctions } from '../plugins/exportFunctions';

export default {
  name: 'HomeView',
  setup() {
    const proyectos = ref([]);
    const academicosPorProyecto = ref([]);
    const loadingData = ref(false);
    const error = ref(null);

    const loadingExportPDF = ref(false);
    const loadingExportCSV = ref(false);
    const loadingExportExcel = ref(false);
    const loadingExportTXT = ref(false);
    const loadingExportJSON = ref(false);

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date)) return 'Fecha Inválida';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-CL', options);
      } catch (e) {
        console.error("Error formatting date:", e);
        return 'Fecha Inválida';
      }
    };

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return '$0';
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const getProyectosData = async () => proyectos.value;
    const getAcademicosXProyecto = async () => academicosPorProyecto.value;

    const {
      generarPDF,
      exportarCSV,
      exportarExcel,
      exportarTXT,
      exportarJSON,
    } = useExportFunctions(getProyectosData, getAcademicosXProyecto, formatDate, formatCurrency, error);

    const fetchProjectData = async () => {
      loadingData.value = true;
      error.value = null;
      try {
        const [projectsRes, academicsRes] = await Promise.all([
          fetch('https://elysia-bunbackend-production.up.railway.app/funciones/data'),
          fetch('https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto')
        ]);

        if (!projectsRes.ok) throw new Error(`HTTP error! status: ${projectsRes.status} for projects`);
        if (!academicsRes.ok) throw new Error(`HTTP error! status: ${academicsRes.status} for academics`);

        proyectos.value = await projectsRes.json();
        academicosPorProyecto.value = await academicsRes.json();
      } catch (err) {
        console.error("Error fetching data:", err);
        error.value = `Error al cargar datos: ${err.message}`;
      } finally {
        loadingData.value = false;
      }
    };

    const handleGeneratePDF = async () => {
      loadingExportPDF.value = true;
      error.value = null;
      try {
        await generarPDF();
      } finally {
        loadingExportPDF.value = false;
      }
    };

    const handleExportCSV = async () => {
      loadingExportCSV.value = true;
      error.value = null;
      try {
        await exportarCSV();
      } finally {
        loadingExportCSV.value = false;
      }
    };

    const handleExportExcel = async () => {
      loadingExportExcel.value = true;
      error.value = null;
      try {
        await exportarExcel();
      } finally {
        loadingExportExcel.value = false;
      }
    };

    const handleExportTXT = async () => {
      loadingExportTXT.value = true;
      error.value = null;
      try {
        await exportarTXT();
      } finally {
        loadingExportTXT.value = false;
      }
    };

    const handleExportJSON = async () => {
      loadingExportJSON.value = true;
      error.value = null;
      try {
        await exportarJSON();
      } finally {
        loadingExportJSON.value = false;
      }
    };

    onMounted(() => {
      fetchProjectData();
    });

    return {
      error,
      loadingData,
      loadingExportPDF,
      loadingExportCSV,
      loadingExportExcel,
      loadingExportTXT,
      loadingExportJSON,
      handleGeneratePDF,
      handleExportCSV,
      handleExportExcel,
      handleExportTXT,
      handleExportJSON,
    };
  },
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.subtitle {
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h2 {
  margin-top: 0;
  color: #2c3e50;
}

.feature-card p {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.action-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.action-button:hover {
  background: #3aa876;
}

.export-section {
  margin-top: 4rem;
  padding: 2rem;
  background: #f8f8f8;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.export-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.export-section p {
  color: #666;
  margin-bottom: 2rem;
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.export-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  color: white;
  display: flex;
  align-items: center;
  /* Alinea verticalmente los elementos internos (icono y texto) */
  justify-content: center;
  gap: 0.5rem;
  min-width: 150px;
}

.export-button:hover {
  transform: translateY(-2px);
}

/* Estilo para los íconos dentro de los botones */
.button-icon {
  width: 24px;
  /* Ajusta el tamaño del ícono */
  height: 24px;
  /* Ajusta el tamaño del ícono */
  vertical-align: middle;
  /* Ayuda a alinear con el texto */
  /* margin-right: 0.5rem; -- Esto se maneja mejor con 'gap' en el flexbox del botón */
}


.pdf-button {
  background-color: #e74c3c;
}

.pdf-button:hover {
  background-color: #c0392b;
}

.csv-button {
  background-color: #2ecc71;
}

.csv-button:hover {
  background-color: #27ae60;
}

.excel-button {
  background-color: #27ae60;
}

.excel-button:hover {
  background-color: #229954;
}

.txt-button {
  background-color: #f39c12;
}

.txt-button:hover {
  background-color: #e67e22;
}

.json-button {
  background-color: #9b59b6;
}

.json-button:hover {
  background-color: #8e44ad;
}

.error-message {
  color: #e74c3c;
  margin-top: 1.5rem;
  font-weight: bold;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>