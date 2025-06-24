<template>
  <div class="responses-view">
    <h2 class="page-title">📋 Respuestas de Cuestionarios</h2>

    <!-- Filtros mejorados -->
    <div class="filters">
      <div class="filter-group">
        <label for="tipoFiltro">🔍 Filtrar por:</label>
        <select id="tipoFiltro" v-model="tipoFiltro" @change="resetFiltroValor">
          <option value="academico">Académico</option>
          <option value="escuela">Escuela</option>
          <option value="fecha">Fecha</option>
        </select>
      </div>

      <div class="filter-group" v-if="tipoFiltro === 'academico'">
        <label for="academicoFilter">Académico:</label>
        <select id="academicoFilter" v-model="filtroValor">
          <option value="">Todos los académicos</option>
          <option v-for="academico in academicos" :key="academico.id_academico" :value="academico.id_academico">
            {{ academico.nombre + ' ' + academico.a_paterno }}
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
      <button @click="generarPDF" class="generate-pdf" :disabled="!respuestaSeleccionada">
        📄 Generar PDF
      </button>
    </div>

    <div class="responses-layout">
      <!-- Columna izquierda - Lista de respuestas -->
      <div class="responses-list">
        <h3>Lista de respuestas</h3>
        <div class="response-cards-container">
          <button v-for="respuesta in respuestasFiltradas" :key="respuesta.id" @click="seleccionarRespuesta(respuesta)"
            :class="['response-card', {
              'active': respuestaSeleccionada?.id === respuesta.id,
              'today': esHoy(respuesta.fecha_creacion)
            }]">
            <div class="card-header">
              <div style="color: black;" class="investigator">{{ obtenerNombreAcademico(respuesta.nombre_investigador)
              }}</div>
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
          <!-- Botón para eliminar la respuesta -->
          <button @click="eliminarRespuesta" class="delete-response-btn" title="Eliminar esta respuesta">
            🗑️ Eliminar
          </button>
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
            <div class="question-answer-pair" v-for="(respuesta, index) in respuestasNumeradas" :key="index">
              <!-- La pregunta va primero -->
              <div class="question-section">
                <div class="question-number">Pregunta {{ index + 1 }}</div>
                <div class="question-text">{{ obtenerPregunta(index + 1) }}</div>
              </div>
              <!-- La respuesta va debajo -->
              <div class="answer-section">
                <div class="answer-label">Respuesta:</div>
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
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import '../assets/Proyecto_styles/respuestas_formu.css' // Esta es la importación de estilos globales de la vista

// Definimos las URLs desde las variables de entorno
const respuestasUrl = 'https://elysia-bunbackend-production.up.railway.app/respuestas-cuestionario/ '
const academicosUrl = 'https://elysia-bunbackend-production.up.railway.app/academicos/'
const unidadesUrl = 'https://elysia-bunbackend-production.up.railway.app/unidades/'
const cuestionariosUrl = 'https://elysia-bunbackend-production.up.railway.app/cuestionarios/'

export default {
  data() {
    return {
      respuestas: [],
      respuestaSeleccionada: null,
      academicos: [],
      unidades: [],
      preguntas: [],
      tipoFiltro: 'academico',
      filtroValor: ''
    }
  },
  computed: {
    respuestasNumeradas() {
      if (!this.respuestaSeleccionada) return []
      const respuestasArray = [];
      for (let i = 1; i <= 9; i++) {
        const key = `respuesta_${i}`;
        if (Object.prototype.hasOwnProperty.call(this.respuestaSeleccionada, key)) {
          respuestasArray.push(this.respuestaSeleccionada[key]);
        }
      }
      return respuestasArray;
    },
    respuestasFiltradas() {
      let filtered = this.respuestas;

      if (!this.filtroValor) return filtered;

      switch (this.tipoFiltro) {
        case 'academico':
          return filtered.filter(r => r.nombre_investigador == this.filtroValor);
        case 'escuela':
          return filtered.filter(r => r.escuela == this.filtroValor);
        case 'fecha':
          return filtered.filter(r => {
            if (!r.fecha_creacion) return false;
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
        ]);

        // Log the responses before parsing JSON
        console.log('Raw academicos response:', academicosRes);

        this.respuestas = await respuestasRes.json();

        // IMPORTANT: Add error handling for JSON parsing
        const academicosData = await academicosRes.json();
        console.log('Parsed academicos data:', academicosData);

        // Check if it's an array before assigning
        if (Array.isArray(academicosData)) {
          this.academicos = academicosData;
        } else {
          console.error('Academicos API did not return an array:', academicosData);
          this.academicos = []; // Ensure it remains an array
        }


        this.unidades = await unidadesRes.json();
        this.preguntas = await preguntasRes.json();

      } catch (e) {
        console.error('Error cargando datos:', e);
        alert('Error al cargar los datos. Por favor, intente más tarde.');
        // Ensure arrays are cleared or set to default empty arrays on error
        this.respuestas = [];
        this.academicos = [];
        this.unidades = [];
        this.preguntas = [];
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
      return academico ? `${academico.nombre || ''} ${academico.a_paterno || ''}`.trim() || `ID Investigador ${id}` : `ID Investigador ${id || 'N/A'}`
    },
    obtenerNombreEscuela(id) {
      if (id === null || id === undefined) return 'N/A (Colaborador Externo)';
      const unidad = this.unidades.find(u => u.id_unidad === id)
      return unidad ? unidad.nombre : `ID Unidad ${id}`
    },
    obtenerPregunta(numeroPregunta) {
      const pregunta = this.preguntas.find(p => p.id_cuestionario === numeroPregunta)
      return pregunta ? pregunta.pregunta : `Pregunta ${numeroPregunta} (no encontrada)`
    },
    esHoy(dateString) {
      if (!dateString) return false
      const fechaRespuesta = new Date(dateString)
      const hoy = new Date()
      return (
        fechaRespuesta.getFullYear() === hoy.getFullYear() &&
        fechaRespuesta.getMonth() === hoy.getMonth() &&
        fechaRespuesta.getDate() === hoy.getDate()
      )
    },
    resetFiltroValor() {
      this.filtroValor = '';
    },

    limpiarFiltros() {
      this.tipoFiltro = 'academico';
      this.filtroValor = '';
      this.respuestaSeleccionada = null;
    },

    async eliminarRespuesta() {
      if (!this.respuestaSeleccionada || !confirm('¿Estás seguro de que quieres eliminar esta respuesta? Esta acción es irreversible.')) {
        return;
      }

      const idRespuesta = this.respuestaSeleccionada.id;
      try {
        const response = await fetch(`${respuestasUrl}${idRespuesta}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Respuesta eliminada exitosamente.');
          await this.cargarDatos();
          this.respuestaSeleccionada = null;
        } else {
          const errorData = await response.json();
          alert(`Error al eliminar la respuesta: ${errorData.message || response.statusText}`);
          console.error('Error al eliminar respuesta:', errorData);
        }
      } catch (error) {
        alert('Hubo un error de red o del servidor al intentar eliminar la respuesta.');
        console.error('Error de red al eliminar respuesta:', error);
      }
    },

    generarPDF() {
      if (!this.respuestaSeleccionada) return;

      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      const titleFontSize = 18;
      const subtitleFontSize = 12;
      const textFontSize = 10;
      const lineHeight = 7;

      doc.setFontSize(titleFontSize);
      doc.setTextColor(40, 53, 147);
      doc.setFont('helvetica', 'bold');
      doc.text('RESPUESTAS DE CUESTIONARIO', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight * 1.5;

      doc.setDrawColor(40, 53, 147);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(subtitleFontSize);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL INVESTIGADOR', margin, yPos);
      yPos += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(textFontSize);
      doc.text(`• Investigador: ${this.obtenerNombreAcademico(this.respuestaSeleccionada.nombre_investigador)}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Escuela: ${this.obtenerNombreEscuela(this.respuestaSeleccionada.escuela)}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Fecha: ${this.formatDate(this.respuestaSeleccionada.fecha_creacion)}`, margin, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('RESPUESTAS DETALLADAS', margin, yPos);
      yPos += lineHeight;
      doc.setFont('helvetica', 'normal');

      const tableRows = [];

      this.respuestasNumeradas.forEach((respuesta, index) => {
        const preguntaText = this.obtenerPregunta(index + 1);
        tableRows.push([`P${index + 1}: ${preguntaText}`, respuesta || 'Sin respuesta']);
      });

      doc.autoTable({
        startY: yPos,
        head: [['Pregunta', 'Respuesta']],
        body: tableRows,
        headStyles: { fillColor: [40, 53, 147], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: textFontSize },
        bodyStyles: { textColor: [0, 0, 0], fontSize: textFontSize, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          valign: 'top',
        },
        columnStyles: {
          0: { cellWidth: pageWidth * 0.4 - margin },
          1: { cellWidth: pageWidth * 0.6 - margin },
        },
        margin: { top: margin, bottom: margin, left: margin, right: margin },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Documento generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })} - Página ${data.pageNumber}`,
            data.settings.margin.left,
            pageHeight - 10,
            { align: 'left' }
          );
        }
      });

      doc.save(`Respuestas-Cuestionario-${this.obtenerNombreAcademico(this.respuestaSeleccionada.nombre_investigador).replace(/\s+/g, '-')}.pdf`);
    }
  },
  created() {
    this.cargarDatos();
  }
}
</script>


<style scoped>
/* Estilos específicos de esta vista que deberían estar aquí */

/* --- Nuevas reglas o ajustes para la disposición de pregunta/respuesta --- */
.question-answer-pair {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 8px;
  /* CAMBIO CLAVE: Eliminar grid para que fluya en bloque */
  display: block;
  /* Asegura que sea un bloque */
}

.question-section {
  margin-bottom: 10px;
  /* Espacio entre la pregunta y la respuesta */
}

.question-number {
  font-weight: bold;
  color: #354577f0;
  margin-bottom: 5px;
}

.question-text {
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}


.answer-label {
  font-weight: bold;
  color: #666;
  margin-bottom: 5px;
}

.answer-content {
  background-color: #f0f0f0;
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #444;
}

/* --- Estilos para el botón de eliminar --- */
.delete-response-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
  margin-left: auto;
}

.delete-response-btn:hover {
  background-color: #c82333;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-header h3 {
  margin: 0;
}

/* Estilos para los filtros (existentes, para contexto) */
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

.clear-filters,
.generate-pdf {
  padding: 8px 15px;
  background-color: #354577f0;
  color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-filters:hover {
  background-color: #e0e0e0;
  color: #333;
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