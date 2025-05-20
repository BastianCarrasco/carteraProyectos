<template>
  <div class="responses-view">
    <h2 class="page-title">📋 Respuestas de Cuestionarios</h2>

    <div class="responses-layout">
      <!-- Columna izquierda - Lista de botones -->
      <div class="responses-list">
        <h3>Lista de respuestas</h3>
        <button 
          v-for="respuesta in respuestas" 
          :key="respuesta.id"
          @click="seleccionarRespuesta(respuesta)"
          :class="['response-card', { 'active': respuestaSeleccionada?.id === respuesta.id }]"
        >
          <div class="investigator">{{ obtenerNombreAcademico(respuesta.nombre_investigador) }}</div>
          <div class="school">🏫 Escuela: {{ obtenerNombreEscuela(respuesta.escuela) }}</div>
          <div class="date">📅 {{ formatDate(respuesta.fecha_creacion) }}</div>
        </button>
      </div>

      <!-- Columna derecha - Detalles de la respuesta seleccionada -->
      <div class="response-details" v-if="respuestaSeleccionada">
        <div class="detail-header">
          <h3>📝 Detalles de la Respuesta</h3>
          <div class="response-id">ID Respuesta: <strong>{{ respuestaSeleccionada.id }}</strong></div>
        </div>

        <div class="investigator-info">
          <div class="info-item">
            <span class="label">👤 Investigador:</span>
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
          <div class="answers-grid">
            <div 
              class="answer-item" 
              v-for="(respuesta, index) in respuestasNumeradas" 
              :key="index"
            >
              <div class="question-number">Pregunta {{ index + 1 }}</div>
              <div class="answer-content">{{ respuesta || 'Sin respuesta' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>👈 Haz clic en una respuesta de la lista para ver sus detalles</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      respuestas: [],
      respuestaSeleccionada: null,
      academicos: [],
      unidades: []
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
    }
  },
  methods: {
    async cargarDatos() {
      try {
        const [respuestasRes, academicosRes, unidadesRes] = await Promise.all([
          fetch('https://kth2025backend-production.up.railway.app/respuestas-cuestionarios'),
          fetch('https://kth2025backend-production.up.railway.app/academicos'),
          fetch('https://kth2025backend-production.up.railway.app/ua')
        ])

        const respuestasJson = await respuestasRes.json()
        const academicosJson = await academicosRes.json()
        const unidadesJson = await unidadesRes.json()

        this.respuestas = respuestasJson.data || []
        this.academicos = academicosJson.data || []
        this.unidades = unidadesJson.data || []
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
    }
  },
  created() {
    this.cargarDatos()
  }
}
</script>

<style scoped>
.responses-view {
  padding: 30px;
  font-family: 'Segoe UI', sans-serif;
}

.page-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.responses-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.responses-list {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.response-card {
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: background-color 0.2s, border-color 0.2s;
}
.response-card:hover {
  background-color: #f5faff;
  border-color: #007bff;
}
.response-card.active {
  background-color: #e0f0ff;
  border-color: #0056b3;
}

.response-details {
  flex-grow: 1;
  min-width: 400px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.investigator-info {
  margin-top: 15px;
}

.info-item {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.label {
  font-weight: bold;
  width: 120px;
}

.answers-section {
  margin-top: 25px;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.answer-item {
  background: #ffffff;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.question-number {
  font-weight: bold;
  margin-bottom: 5px;
}

.empty-state {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  color: #888;
  min-height: 200px;
}
</style>
