<!-- Vista de Proyectos (ProjectsView.vue) -->
<template>
  <div class="projects">
    <h1>Lista de Proyectos</h1>
    <button @click="generarPDFDesdeOtroComponente" class="pdf-button">
      Generar Reporte PDF
    </button>

    <button @click="exportarCSV" class="csv-button">Exportar CSV</button>
    <button @click="exportarExcel" class="excel-button">Exportar Excel</button>
    <button @click="exportarTXT" class="txt-button">Exportar TXT</button>  <!-- Nuevo botón -->
    <button @click="exportarJSON" class="json-button">Exportar JSON</button> <!-- Nuevo botón -->

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
import { generarInformeProyectos } from "../plugins/pdfGenerator.js"; // Importa la función del otro componente
import ExcelJS from "exceljs"; // Importa exceljs - IMPORTANTE
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

    const unificarAcademicosPorNombre = (proyectos) => {
      const proyectosUnificados = [];
      const nombresProcesados = new Set();

      proyectos.forEach((proyecto) => {
        if (!nombresProcesados.has(proyecto.nombre)) {
          nombresProcesados.add(proyecto.nombre);
          const proyectosMismoNombre = proyectos.filter(
            (p) => p.nombre === proyecto.nombre
          );
          const academicosUnidos = new Set();

          proyectosMismoNombre.forEach((p) => {
            if (p.academico) {
              p.academico.split(",").forEach((acad) => {
                academicosUnidos.add(acad.trim());
              });
            }
          });

          // Crea un nuevo objeto proyecto con los académicos unidos
          proyectosUnificados.push({
            ...proyecto, // Copia las propiedades del primer proyecto
            academico: Array.from(academicosUnidos).join(", "), // Reemplaza los académicos
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
        console.error("Error al generar PDF:", err);
        error.value = "Error al generar el documento";
      }
    };

    // Función para exportar a CSV (CORREGIDA Y DENTRO DEL COMPONENTE)
    const exportarCSV = () => {
      try {
        if (!projects.value || projects.value.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        // Unificar académicos antes de exportar CSV
        const proyectosParaCSV = unificarAcademicosPorNombre(projects.value);

        // Obtener los campos de los objetos
        const campos = Object.keys(proyectosParaCSV[0]);

        // Crear encabezado CSV
        const csvHeader = campos.join(",") + "\n";

        // Crear filas CSV
        const csvRows = proyectosParaCSV.map((proyecto) =>
          campos.map((campo) => {
            const valor = proyecto[campo];
            if (valor === null || valor === undefined) return "";
            // Escapar comillas y comas
            const valorString = String(valor).replace(/"/g, '""');
            return `"${valorString}"`;
          }).join(",")
        ).join("\n");

        // Combinar header + rows
        const csvContent = csvHeader + csvRows;

        // Crear un blob
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        // Crear un enlace temporal y hacer click para descargar
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error al exportar CSV:", err);
        error.value = "Error al exportar el CSV.";
      }
    };

    // 🚀 Función para exportar a Excel
    const exportarExcel = async () => {
      try {
        if (!projects.value || projects.value.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        // Unificar académicos antes de exportar Excel
        const proyectosParaExcel = unificarAcademicosPorNombre(projects.value);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Proyectos");

        // Agregar encabezados
        const campos = Object.keys(proyectosParaExcel[0]);
        worksheet.addRow(campos);

        // Agregar datos
        proyectosParaExcel.forEach(proyecto => {
          const fila = campos.map(campo => {
            let valor = proyecto[campo];
            if (valor === null || valor === undefined) {
              valor = ''; // O puedes asignar un valor por defecto
            }
            return valor;
          });
          worksheet.addRow(fila);
        });

        // Ajustar el ancho de las columnas (opcional)
        worksheet.columns.forEach(column => {
          column.width = 20;
        });

        // Generar el archivo y descargarlo
        const buffer = await workbook.xlsx.writeBuffer();
        // Bun no tiene  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // el mimetype es un poco diferente
        const blob = new Blob([buffer], {
           type: "application/octet-stream", // O el que funcione mejor en tu entorno.  Prueba con "application/vnd.ms-excel"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a Excel:", err);
        error.value = "Error al exportar a Excel.";
      }
    };

    // 🚀 Función para exportar a TXT
    const exportarTXT = () => {
      try {
        if (!projects.value || projects.value.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        // Unificar académicos antes de exportar TXT
        const proyectosParaTXT = unificarAcademicosPorNombre(projects.value);

        const txtContent = proyectosParaTXT.map(proyecto => {
          return Object.entries(proyecto)
            .map(([key, value]) => `${key}: ${value !== null && value !== undefined ? value : ''}`) // Manejo de null/undefined
            .join('\n');
        }).join('\n\n'); // Doble salto de línea entre proyectos

        const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a TXT:", err);
        error.value = "Error al exportar el TXT.";
      }
    };

    // 🚀 Función para exportar a JSON
    const exportarJSON = () => {
      try {
        if (!projects.value || projects.value.length === 0) {
          error.value = "No hay proyectos para exportar.";
          return;
        }

        // Unificar académicos antes de exportar JSON
        const proyectosParaJSON = unificarAcademicosPorNombre(projects.value);

        const jsonContent = JSON.stringify(proyectosParaJSON, null, 2); // 2 espacios de indentación

        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Error al exportar a JSON:", err);
        error.value = "Error al exportar a JSON.";
      }
    };

    onMounted(fetchProjects);

    return {
      projects,
      loading,
      error,
      generarPDFDesdeOtroComponente,
      exportarCSV,
      exportarExcel,
      exportarTXT, // ✅  Función para exportar TXT
      exportarJSON, // ✅  Función para exportar JSON
      formatDate,
      formatCurrency,
    };
  },
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

.loading,
.error {
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
.csv-button {
  background-color: #27ae60;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.csv-button:hover {
  background-color: #2ecc71;
}
.excel-button {
  background-color: #16a085;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.excel-button:hover {
  background-color: #18c9a4;
}

.txt-button {
    background-color: #3498db;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 10px;
    margin-bottom: 20px;
    transition: background-color 0.3s;
  }

  .txt-button:hover {
    background-color: #2980b9;
  }

.json-button {
    background-color: #f39c12;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 10px;
    margin-bottom: 20px;
    transition: background-color 0.3s;
  }

  .json-button:hover {
    background-color: #f5b041;
  }
</style>