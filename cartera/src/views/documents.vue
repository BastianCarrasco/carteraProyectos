<template>
  <div class="projects">
    <h1>Lista de Proyectos</h1>
    <button @click="generatePDF" class="pdf-button">
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
const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS

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

const generatePDF = () => {
  try {
    // Configurar documento en tamaño carta (letter)
    const doc = new jsPDF({
      unit: 'mm',
      format: 'letter'
    });

    // Establecer márgenes (izquierdo, derecho, superior, inferior)
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginLeft - marginRight;

    // Estilo general
    doc.setFont('helvetica');
    doc.setTextColor(40);
    
    // Título centrado
    doc.setFontSize(16);
    doc.setTextColor(0, 60, 120);
    doc.text('INFORME DETALLADO DE PROYECTOS', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, 27, { align: 'center' });
    
    let yPosition = 35; // Posición vertical inicial después del título
    
    projects.value.forEach((proyecto, index) => {
      // Verificar espacio disponible (tamaño carta: 279.4 mm de altura)
      if (yPosition > 260) { // Dejar margen inferior de ~20mm
        doc.addPage('letter');
        yPosition = 20; // Reiniciar posición en nueva página
      }
      
      // Encabezado del proyecto con splitText para manejo de texto largo
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      
      const titleLines = doc.splitTextToSize(proyecto.nombre, maxWidth);
      titleLines.forEach(line => {
        doc.text(line, marginLeft, yPosition);
        yPosition += 7;
      });
      
      // Datos del proyecto
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPosition += 5;
      
      const datos = [
        `• Facultad: ${proyecto.UA || 'N/A'}`,
        `• Académico responsable: ${proyecto.Academico || 'N/A'} ${proyecto.jefe ? '(Jefe de proyecto)' : ''}`,
        `• Monto adjudicado: ${formatCurrency(proyecto.monto)}`,
        `• Fecha de postulación: ${formatDate(proyecto.fecha_postulacion)}`,
        `• Tipo de convocatoria: ${proyecto.Tipo_Convo || 'N/A'}`,
        `• Institución convocante: ${proyecto.Institucion_convocatoria || 'N/A'}`,
        `• Nombre convocatoria: ${proyecto.Convocatoria || 'N/A'}`,
        `• Comentarios: ${proyecto.comentarios || 'Ninguno'}`
      ];
      
      // Procesar cada línea con splitText si es necesario
      datos.forEach(linea => {
        const lines = doc.splitTextToSize(linea, maxWidth);
        lines.forEach(line => {
          if (yPosition > 260) {
            doc.addPage('letter');
            yPosition = 20;
          }
          doc.text(line, marginLeft + 5, yPosition);
          yPosition += 7;
        });
      });
      
      // Separador entre proyectos
      doc.setDrawColor(200);
      doc.line(marginLeft, yPosition + 3, pageWidth - marginRight, yPosition + 3);
      yPosition += 10;
    });
    
    // Estadísticas finales en nueva página
    doc.addPage('letter');
    doc.setFontSize(14);
    doc.setTextColor(0, 60, 120);
    doc.text('RESUMEN ESTADÍSTICO', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    
    // Función auxiliar para agregar texto con manejo de páginas
    const addTextWithPageCheck = (text, x, y) => {
      if (y > 260) {
        doc.addPage('letter');
        return 20; // Nueva posición Y
      }
      doc.text(text, x, y);
      return y + 7;
    };
    
    yPosition = addTextWithPageCheck(`• Total de proyectos: ${projects.value.length}`, marginLeft, 30);
    yPosition = addTextWithPageCheck(`• Inversión total: ${formatCurrency(projects.value.reduce((sum, p) => sum + (p.monto || 0), 0))}`, marginLeft, yPosition);
    
    // Conteo por facultad
    const facultades = {};
    projects.value.forEach(p => {
      facultades[p.UA] = (facultades[p.UA] || 0) + 1;
    });
    
    yPosition = addTextWithPageCheck('• Proyectos por facultad:', marginLeft, yPosition);
    
    Object.entries(facultades).forEach(([fac, count]) => {
      yPosition = addTextWithPageCheck(`   - ${fac}: ${count} proyectos`, marginLeft + 5, yPosition);
    });
    
    doc.save('informe_detallado_proyectos.pdf');
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
      generatePDF,
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