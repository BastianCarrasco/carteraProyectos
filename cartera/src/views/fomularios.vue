<template>
  <div class="responses-view">
    <h2 class="page-title">📋 Respuestas de Cuestionarios</h2>

    <!-- Filtros -->
    <div class="filters">
      <div class="filter-group">
        <label for="nombreFilter">🔍 Filtrar por nombre:</label>
        <input 
          id="nombreFilter" 
          v-model="nombreFilter" 
          type="text" 
          placeholder="Buscar investigador..."
        >
      </div>
      <div class="filter-group">
        <label for="fechaFilter">📅 Filtrar por fecha:</label>
        <input 
          id="fechaFilter" 
          v-model="fechaFilter" 
          type="date"
        >
      </div>
      <button @click="limpiarFiltros" class="clear-filters">🔄 Limpiar filtros</button>
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
              <div class="investigator">{{ obtenerNombreAcademico(respuesta.nombre_investigador) }}</div>
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
      nombreFilter: '',
      fechaFilter: ''
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
      
      // Filtrar por nombre
      if (this.nombreFilter) {
        const searchTerm = this.nombreFilter.toLowerCase();
        filtered = filtered.filter(respuesta => {
          const nombre = this.obtenerNombreAcademico(respuesta.nombre_investigador).toLowerCase();
          return nombre.includes(searchTerm);
        });
      }
      
      // Filtrar por fecha
      if (this.fechaFilter) {
        filtered = filtered.filter(respuesta => {
          const respuestaDate = new Date(respuesta.fecha_creacion).toISOString().split('T')[0];
          return respuestaDate === this.fechaFilter;
        });
      }
      
      return filtered;
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
    limpiarFiltros() {
      this.nombreFilter = ''
      this.fechaFilter = ''
    }
  },
  created() {
    this.cargarDatos()
  }
}
</script>

<style scoped>

</style>