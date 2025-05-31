<template>
  <div class="responses-view">
    <h2 class="page-title">📋 Respuestas de Cuestionarios</h2>

    <!-- Filtros mejorados -->
    <div class="filters">
      <div class="filter-group">
        <label for="tipoFiltro">🔍 Filtrar por:</label>
        <select id="tipoFiltro" v-model="tipoFiltro" @change="resetFiltroValor">
          <option value="nombre">Académico</option>
          <option value="escuela">Escuela</option>
          <option value="fecha">Fecha</option>
        </select>
      </div>

      <div class="filter-group" v-if="tipoFiltro === 'nombre'">
        <label for="academicoFilter">Académico:</label>
        <select id="academicoFilter" v-model="filtroValor">
          <option value="">Todos los académicos</option>
          <option v-for="academico in academicos" :key="academico.id_academico" :value="academico.id_academico">
            {{ academico.nombre }}
          </option>
        </select>
      </div>

      <div class="filter-group" v-if="tipoFiltro === 'escuela'">
        <label for="escuelaFilter">Escuela:</label>
        <select id="escuelaFilter" v-model="filtroValor">
          <option value="">Todas las escuelas</option>
          <option v-for="unidad in unidades" :key="unidad.id_unidad" :value="unidad.id_unidad">
            {{ unidad.nombre }}
          </option>
        </select>
      </div>

      <div class="filter-group" v-if="tipoFiltro === 'fecha'">
        <label for="fechaFilter">Fecha:</label>
        <input id="fechaFilter" v-model="filtroValor" type="date">
      </div>

      <button @click="limpiarFiltros" class="clear-filters">🔄 Limpiar filtros</button>
      
      <!-- Botón para generar PDF -->
      <button 
        @click="generarPDF" 
        class="generate-pdf"
        :disabled="!respuestaSeleccionada"
      >
        📄 Generar PDF
      </button>
    </div>

    <div class="responses-layout">
      <!-- Columna izquierda - Lista de respuestas -->
      <div class="responses-list">
        <h3>Lista de respuestas</h3>
        <div class="response-cards-container">
          <button 
            v-for="respuesta in respuestasFiltradas" 
            :key="respuesta.id"
            @click="seleccionarRespuesta(respuesta)"
            :class="['response-card', { 
              'active': respuestaSeleccionada?.id === respuesta.id,
              'today': esHoy(respuesta.fecha_creacion)
            }]"
          >
            <div class="card-header">
              <div style="color: black;" class="investigator">{{ obtenerNombreAcademico(respuesta.nombre_investigador) }}</div>
              <span v-if="esHoy(respuesta.fecha_creacion)" class="today-badge">Hoy</span>
            </div>
            <div class="school">🏫 Escuela: {{ obtenerNombreEscuela(respuesta.escuela) }}</div>
            <div class="date">📅 {{ formatDate(respuesta.fecha_creacion) }}</div>
          </button>
        </div>
      </div>

      <!-- Columna derecha - Detalles de la respuesta seleccionada -->
      <div class="response-details" v-if="respuestaSeleccionada">
        <div class="detail-header">
          <h3>📝 Detalles de la Respuesta</h3>
          <!-- <div class="response-id">ID Respuesta: <strong>{{ respuestaSeleccionada.id }}</strong></div> -->
        </div>

        <div class="investigator-info">
          <div class="info-item">
            <span style="color: black;" class="label">👤 Investigador:</span>
            <span class="value">{{ obtenerNombreAcademico(respuestaSeleccionada.nombre_investigador) }}</span>
          </div>
          <div class="info-item">
            <span class="label">🏫 Escuela:</span>
            <span class="value">{{ obtenerNombreEscuela(respuestaSeleccionada.escuela) }}</span>
          </div>
          <div class="info-item">
            <span class="label">📆 Fecha:</span>
            <span class="value">{{ formatDate(respuestaSeleccionada.fecha_creacion) }}</span>
          </div>
        </div>

        <div class="answers-section">
          <h4>📖 Respuestas del Cuestionario</h4>
          <div class="answers-container">
            <div 
              class="question-answer-pair" 
              v-for="(respuesta, index) in respuestasNumeradas" 
              :key="index"
            >
              <div class="question-section">
                <div class="question-number">Pregunta {{ index + 1 }}</div>
                <div class="question-text">{{ obtenerPregunta(index + 1) }}</div>
              </div>
              <div class="answer-section">
                <div class="answer-content">{{ respuesta || 'Sin respuesta' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-content">
          <p>👈 Selecciona una respuesta de la lista para ver sus detalles</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/Proyecto_styles/respuestas_formu.css'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import '../assets/Proyecto_styles/respuestas_formu.css'
const respuestasUrl = import.meta.env.VITE_API_URL_RESPUESTAS
const academicosUrl = import.meta.env.VITE_API_URL_ACADEMICOS
const unidadesUrl = import.meta.env.VITE_API_URL_UA
const cuestionariosUrl = import.meta.env.VITE_API_URL_CUESTIONARIOS

export default {
  data() {
    return {
       respuestas: [],
      respuestaSeleccionada: null,
      academicos: [],
      unidades: [],
      preguntas: [],
      tipoFiltro: 'nombre', // 'nombre', 'escuela' o 'fecha'
      filtroValor: ''
    }
  },
  computed: {
    respuestasNumeradas() {
      if (!this.respuestaSeleccionada) return []
      return [
        this.respuestaSeleccionada.respuesta_1,
        this.respuestaSeleccionada.respuesta_2,
        this.respuestaSeleccionada.respuesta_3,
        this.respuestaSeleccionada.respuesta_4,
        this.respuestaSeleccionada.respuesta_5,
        this.respuestaSeleccionada.respuesta_6,
        this.respuestaSeleccionada.respuesta_7,
        this.respuestaSeleccionada.respuesta_8,
        this.respuestaSeleccionada.respuesta_9
      ]
    },
   respuestasFiltradas() {
      let filtered = this.respuestas;
      
      if (!this.filtroValor) return filtered;
      
      switch (this.tipoFiltro) {
        case 'nombre':
          return filtered.filter(r => r.nombre_investigador == this.filtroValor);
        case 'escuela':
          return filtered.filter(r => r.escuela == this.filtroValor);
        case 'fecha':
          return filtered.filter(r => {
            const respuestaDate = new Date(r.fecha_creacion).toISOString().split('T')[0];
            return respuestaDate === this.filtroValor;
          });
        default:
          return filtered;
      }
    }
  },
  methods: {
    async cargarDatos() {
      try {
        const [respuestasRes, academicosRes, unidadesRes, preguntasRes] = await Promise.all([
          fetch(respuestasUrl),
          fetch(academicosUrl),
          fetch(unidadesUrl),
          fetch(cuestionariosUrl)
        ])

        const respuestasJson = await respuestasRes.json()
        const academicosJson = await academicosRes.json()
        const unidadesJson = await unidadesRes.json()
        const preguntasJson = await preguntasRes.json()

        this.respuestas = respuestasJson.data || []
        this.academicos = academicosJson.data || []
        this.unidades = unidadesJson.data || []
        this.preguntas = preguntasJson.data || []
      } catch (e) {
        console.error('Error cargando datos:', e)
      }
    },
    seleccionarRespuesta(respuesta) {
      this.respuestaSeleccionada = respuesta
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    obtenerNombreAcademico(id) {
      const academico = this.academicos.find(a => a.id_academico === id)
      return academico ? academico.nombre : `ID ${id}`
    },
    obtenerNombreEscuela(id) {
      const unidad = this.unidades.find(u => u.id_unidad === id)
      return unidad ? unidad.nombre : `ID ${id}`
    },
    obtenerPregunta(numeroPregunta) {
      const pregunta = this.preguntas.find(p => p.id_cuestionario === numeroPregunta)
      return pregunta ? pregunta.pregunta : `Pregunta ${numeroPregunta}`
    },
    esHoy(dateString) {
      if (!dateString) return false
      const fechaRespuesta = new Date(dateString).toDateString()
      const hoy = new Date().toDateString()
      return fechaRespuesta === hoy
    },
    resetFiltroValor() {
      this.filtroValor = '';
    },
    
    limpiarFiltros() {
      this.tipoFiltro = 'nombre';
      this.filtroValor = '';
    },
    
generarPDF() {
  if (!this.respuestaSeleccionada) return;

  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Configuración de estilos
  const titleFontSize = 18;
  const subtitleFontSize = 12;
  const textFontSize = 10;
  const lineHeight = 7;
  const questionSpacing = 15;

  // Título del documento
  doc.setFontSize(titleFontSize);
  doc.setTextColor(40, 53, 147); // Azul oscuro
  doc.setFont('helvetica', 'bold');
  doc.text('RESPUESTAS DE CUESTIONARIO', pageWidth / 2, yPos, { align: 'center' });
  yPos += lineHeight * 1.5;

  // Línea decorativa
  doc.setDrawColor(40, 53, 147);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Información del investigador
  doc.setFontSize(subtitleFontSize);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL INVESTIGADOR', margin, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'normal');
  doc.text(`• Investigador: ${this.obtenerNombreAcademico(this.respuestaSeleccionada.nombre_investigador)}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`• Escuela: ${this.obtenerNombreEscuela(this.respuestaSeleccionada.escuela)}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`• Fecha: ${this.formatDate(this.respuestaSeleccionada.fecha_creacion)}`, margin, yPos);
  yPos += questionSpacing;

  // Encabezado de sección de respuestas
  doc.setFont('helvetica', 'bold');
  doc.text('RESPUESTAS DETALLADAS', margin, yPos);
  yPos += lineHeight;
  doc.setFont('helvetica', 'normal');

  // Preguntas y respuestas en formato lista
  this.respuestasNumeradas.forEach((respuesta, index) => {
    const pregunta = this.obtenerPregunta(index + 1);
    const numeroPregunta = index + 1;

    // Agregar pregunta
    const preguntaLines = doc.splitTextToSize(pregunta, pageWidth - margin * 2);

    // Salto de página si es necesario para la pregunta
    preguntaLines.forEach(line => {
      if (yPos + lineHeight > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      if (line === preguntaLines[0]) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 53, 147);
        doc.text(`Pregunta ${numeroPregunta}:`, margin, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      }

      doc.text(line, margin + 5, yPos);
      yPos += lineHeight;
    });

    // Agregar respuesta
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(66, 133, 244);
    if (yPos + lineHeight > pageHeight - 20) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('Respuesta:', margin, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const respuestaText = respuesta || 'No respondida';
    const respuestaLines = doc.splitTextToSize(respuestaText, pageWidth - margin * 2);

    respuestaLines.forEach(line => {
      if (yPos + lineHeight > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin + 5, yPos);
      yPos += lineHeight;
    });

    // Línea divisoria y espaciado
    yPos += questionSpacing;
    if (yPos + 5 < pageHeight - 10) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    }
  });

  // Pie de página en la última página
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Documento generado el ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Guardar el PDF
  doc.save(`Respuestas-Cuestionario-${this.obtenerNombreAcademico(this.respuestaSeleccionada.nombre_investigador).replace(/\s+/g, '-')}.pdf`);
}

  },
  created() {
    this.cargarDatos();
  }
}
</script>


<style scoped>
/* Estilos para los nuevos elementos */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.filter-group select,
.filter-group input[type="date"] {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.clear-filters, .generate-pdf {
  padding: 8px 15px;
  background-color: #354577f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-filters:hover {
  background-color: #e0e0e0;
}

.generate-pdf {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.generate-pdf:hover {
  background-color: #45a049;
}

.generate-pdf:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Ajustes para responsividad */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
}
</style>