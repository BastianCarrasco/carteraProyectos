<template>
  <div class="stats-container">
   
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="fetchData" class="retry-button">Reintentar</button>
    </div>
    
    <div v-else>
      <div class="stats-grid">
        <!-- Tarjeta 1: Total de proyectos -->
        <div class="stat-card">
          <div class="stat-value">{{ totalProjects }}</div>
          <div class="stat-label">Proyectos Totales</div>
          <div class="stat-icon">📊</div>
        </div>
        
        <!-- Tarjeta 2: Monto total invertido -->
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalAmount) }}</div>
          <div class="stat-label">Inversión Total</div>
          <div class="stat-icon">💰</div>
        </div>
        
        <!-- Tarjeta 3: Número de académicos involucrados -->
        <div class="stat-card">
          <div class="stat-value">{{ uniqueAcademics.length }}</div>
          <div class="stat-label">Académicos Involucrados</div>
          <div class="stat-icon">👨‍🏫</div>
        </div>
        
        <!-- Tarjeta 4: Proyectos por facultad -->
        <div class="stat-card">
          <div class="stat-value">{{ faculties.length }}</div>
          <div class="stat-label">Facultades Participantes</div>
          <div class="stat-icon">🏛️</div>
        </div>
      </div>
      
      <div class="charts-container">
        <!-- Gráfico 1: Distribución por tipo de convocatoria -->
        <div class="chart-card">
          <h2>Distribución por Tipo de Convocatoria</h2>
          <div class="chart-wrapper">
            <canvas ref="typeChart"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 2: Monto por facultad -->
        <div class="chart-card">
          <h2>Inversión por Facultad</h2>
          <div class="chart-wrapper">
            <canvas ref="facultyChart"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 3: Proyectos por año -->
        <div class="chart-card">
          <h2>Proyectos por Año</h2>
          <div class="chart-wrapper">
            <canvas ref="yearChart"></canvas>
          </div>
        </div>
        
        <!-- Tabla de líderes de proyectos -->
        <div class="table-card">
          <h2>Académicos con más Proyectos</h2>
          <table>
            <thead>
              <tr>
                <th>Académico</th>
                <th>Proyectos como Jefe</th>
                <th>Proyectos Participantes</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="academic in topAcademics" :key="academic.name">
                <td>{{ academic.name }}</td>
                <td>{{ academic.asLeader }}</td>
                <td>{{ academic.asParticipant }}</td>
                <td>{{ formatCurrency(academic.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'; // Añadidos watch y nextTick
import { Chart, registerables } from 'chart.js';

// Registra los componentes de Chart.js
Chart.register(...registerables);

// Referencias para los gráficos
const typeChart = ref(null);
const facultyChart = ref(null);
const yearChart = ref(null);

// Estado de la aplicación
const proyectos = ref([]);
const loading = ref(true);
const error = ref(null);

// Método para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

// Método para obtener datos de la API
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await fetch('https://kth2025backend-production.up.railway.app/proyectos');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      proyectos.value = data.data;
    } else {
      throw new Error('Formato de datos inesperado');
    }
  } catch (err) {
    error.value = `Error al cargar los datos: ${err.message}`;
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

// Estadísticas computadas
const totalProjects = computed(() => {
  const uniqueIds = new Set(proyectos.value.map(p => p.id_proyecto));
  return uniqueIds.size;
});

const totalAmount = computed(() => {
  return proyectos.value.reduce((sum, proyecto) => sum + (proyecto.monto || 0), 0);
});

const uniqueAcademics = computed(() => {
  const academics = new Set(proyectos.value.map(p => p.Academico));
  return Array.from(academics);
});

const faculties = computed(() => {
  const facs = new Set(proyectos.value.map(p => p.UA));
  return Array.from(facs);
});

const topAcademics = computed(() => {
  const academicMap = {};
  
  proyectos.value.forEach(proyecto => {
    if (!academicMap[proyecto.Academico]) {
      academicMap[proyecto.Academico] = {
        name: proyecto.Academico,
        asLeader: 0,
        asParticipant: 0,
        totalAmount: 0
      };
    }
    
    if (proyecto.jefe === 1) {
      academicMap[proyecto.Academico].asLeader++;
    } else {
      academicMap[proyecto.Academico].asParticipant++;
    }
    
    academicMap[proyecto.Academico].totalAmount += proyecto.monto || 0;
  });
  
  return Object.values(academicMap)
    .sort((a, b) => (b.asLeader + b.asParticipant) - (a.asLeader + a.asParticipant))
    .slice(0, 5);
});

// Datos para gráficos
const typeDistribution = computed(() => {
  const types = {};
  proyectos.value.forEach(proyecto => {
    const type = proyecto.Tipo_Convo;
    types[type] = (types[type] || 0) + 1;
  });
  return types;
});

const facultyAmounts = computed(() => {
  const amounts = {};
  proyectos.value.forEach(proyecto => {
    amounts[proyecto.UA] = (amounts[proyecto.UA] || 0) + (proyecto.monto || 0);
  });
  return amounts;
});

const projectsByYear = computed(() => {
  const years = {};
  proyectos.value.forEach(proyecto => {
    if (proyecto.fecha_postulacion) {
      const year = new Date(proyecto.fecha_postulacion).getFullYear();
      years[year] = (years[year] || 0) + 1;
    }
  });
  return years;
});

// Inicializar gráficos cuando los datos estén cargados
onMounted(() => {
  fetchData();
});

// Observar cambios en los datos para renderizar gráficos
watch(proyectos, (newVal) => {
  if (newVal.length > 0) {
    nextTick(() => {
      renderCharts();
    });
  }
}, { immediate: true });

const renderCharts = () => {
  // Destruir gráficos existentes si hay alguno
   // Destruir gráficos existentes si hay alguno
  if (typeChart.value && typeChart.value._chart) {
    typeChart.value._chart.destroy();
  }
  if (facultyChart.value && facultyChart.value._chart) {
    facultyChart.value._chart.destroy();
  }
  if (yearChart.value && yearChart.value._chart) {
    yearChart.value._chart.destroy();
  }

  // Gráfico de tipos de convocatoria
  if (typeChart.value) {
    new Chart(typeChart.value.getContext('2d'), {
      type: 'pie',
      data: {
        labels: Object.keys(typeDistribution.value),
        datasets: [{
          data: Object.values(typeDistribution.value),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ]
        }]
      }
    });
  }

  // Gráfico de montos por facultad
  if (facultyChart.value) {
    new Chart(facultyChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(facultyAmounts.value),
        datasets: [{
          label: 'Monto Total (CLP)',
          data: Object.values(facultyAmounts.value),
          backgroundColor: '#4BC0C0'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Gráfico de proyectos por año
  if (yearChart.value) {
    new Chart(yearChart.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: Object.keys(projectsByYear.value).sort(),
        datasets: [{
          label: 'Proyectos',
          data: Object.keys(projectsByYear.value).sort().map(year => projectsByYear.value[year]),
          borderColor: '#36A2EB',
          fill: false
        }]
      }
    });
  }
};
</script>

<style scoped>
.stats-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 1rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}

.stat-icon {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  font-size: 2rem;
  opacity: 0.2;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.chart-card, .table-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-card h2, .table-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #2c3e50;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #fdecea;
  border-radius: 4px;
  color: #d32f2f;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #b71c1c;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
