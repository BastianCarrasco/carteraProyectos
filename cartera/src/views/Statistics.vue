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
          <div class="stat-label">Proyectos en Cartera</div>
          <div class="stat-icon">📊</div>
        </div>
        
        <!-- Tarjeta 2: Monto total invertido -->
        <div class="stat-card">
          <div class="stat-value">{{ formatMillions(totalAmount) }}</div>
          <div class="stat-label">Inversión Total</div>
          <div class="stat-icon">💰</div>
        </div>
        
        <!-- Tarjeta 3: Número de académicos involucrados -->
        <div class="stat-card">
          <div class="stat-value">{{ uniqueLeaders.length }}</div>
          <div class="stat-label">Académicos Líderes</div>
          <div class="stat-icon">👨‍🏫</div>
        </div>
        
        <!-- Tarjeta 4: Proyectos por facultad -->
        <div class="stat-card">
          <div class="stat-value">{{ faculties.length }}</div>
          <div class="stat-label">Unidades Académicas</div>
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
          <h2>Montos Postulados por Unidad Académica</h2>
          <div class="chart-wrapper">
            <canvas ref="facultyChart"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 3: Proyectos por facultad -->
        <div class="chart-card">
          <h2>Proyectos por Unidad Académica</h2>
          <div class="chart-wrapper">
            <canvas ref="projectsFacultyChart"></canvas>
          </div>
        </div>
        
        <!-- Listado de Unidades Académicas -->
        <div class="table-card">
          <h2>Unidades Académicas Participantes</h2>
          <div class="faculty-list">
            <div v-for="faculty in sortedFaculties" :key="faculty.name" class="faculty-item">
              <span class="faculty-name">{{ faculty.name }}</span>
              <span class="faculty-count">{{ faculty.count }} proyectos</span>
              <span class="faculty-amount">{{ formatMillions(faculty.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import '../assets/Proyecto_styles/estadisticas.css';

Chart.register(...registerables);

const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS;
const typeChart = ref(null);
const facultyChart = ref(null);
const projectsFacultyChart = ref(null);

const proyectos = ref([]);
const loading = ref(true);
const error = ref(null);

// Métodos de formato
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

const formatMillions = (amount) => {
  return `${Math.round(amount / 1000000)}M`;
};

// Obtener datos
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(proyectosUrl);
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
    const data = await response.json();
    proyectos.value = data.success ? data.data : [];
    if (!proyectos.value.length) throw new Error('No hay datos disponibles');
  } catch (err) {
    error.value = `Error al cargar los datos: ${err.message}`;
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

// Estadísticas computadas
const totalProjects = computed(() => {
  return new Set(proyectos.value.map(p => p.id_proyecto)).size;
});

const totalAmount = computed(() => {
  return proyectos.value.reduce((sum, p) => sum + (p.monto || 0), 0);
});

const uniqueLeaders = computed(() => {
  const leaders = proyectos.value.filter(p => p.jefe === 1);
  return [...new Set(leaders.map(p => p.Academico))];
});

const faculties = computed(() => {
  return [...new Set(proyectos.value.map(p => p.UA))];
});

const sortedFaculties = computed(() => {
  const facultyData = {};
  
  proyectos.value.forEach(p => {
    if (!facultyData[p.UA]) {
      facultyData[p.UA] = {
        name: p.UA,
        count: 0,
        amount: 0
      };
    }
    facultyData[p.UA].amount += p.monto || 0;
    // Contar proyectos únicos por facultad
    if (!facultyData[p.UA].projectIds) {
      facultyData[p.UA].projectIds = new Set();
    }
    facultyData[p.UA].projectIds.add(p.id_proyecto);
  });
  
  // Convertir Set a count
  Object.keys(facultyData).forEach(key => {
    facultyData[key].count = facultyData[key].projectIds.size;
    delete facultyData[key].projectIds;
  });
  
  return Object.values(facultyData)
    .sort((a, b) => b.amount - a.amount);
});

// Datos para gráficos
const typeDistribution = computed(() => {
  const types = {};
  proyectos.value.forEach(p => {
    types[p.Tipo_Convo] = (types[p.Tipo_Convo] || 0) + 1;
  });
  return types;
});

const facultyAmounts = computed(() => {
  const amounts = {};
  proyectos.value.forEach(p => {
    amounts[p.UA] = (amounts[p.UA] || 0) + (p.monto || 0);
  });
  return amounts;
});

const projectsByFaculty = computed(() => {
  const counts = {};
  const projectIds = new Set();
  
  // Primero identificamos todos los proyectos únicos
  proyectos.value.forEach(p => projectIds.add(p.id_proyecto));
  
  // Luego contamos por facultad
  const facultyProjects = {};
  projectIds.forEach(id => {
    const proyecto = proyectos.value.find(p => p.id_proyecto === id);
    if (proyecto) {
      facultyProjects[proyecto.UA] = (facultyProjects[proyecto.UA] || 0) + 1;
    }
  });
  
  return facultyProjects;
});

// Inicialización y renderizado de gráficos
onMounted(fetchData);

watch(proyectos, (newVal) => {
  if (newVal.length > 0) {
    nextTick(renderCharts);
  }
}, { immediate: true });

const renderCharts = () => {
  // Limpiar gráficos anteriores
  [typeChart, facultyChart, projectsFacultyChart].forEach(chartRef => {
    if (chartRef.value?._chart) chartRef.value._chart.destroy();
  });

  // Gráfico de tipos de convocatoria con porcentajes
  if (typeChart.value) {
    const typeData = typeDistribution.value;
    const total = Object.values(typeData).reduce((a, b) => a + b, 0);
    
    new Chart(typeChart.value.getContext('2d'), {
      type: 'pie',
      data: {
        labels: Object.keys(typeData).map(label => `${label} (${((typeData[label]/total)*100).toFixed(1)}%)`),
        datasets: [{
          data: Object.values(typeData),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label.split(' (')[0]}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Gráfico de montos por facultad
  if (facultyChart.value) {
    const facultyData = facultyAmounts.value;
    const sortedEntries = Object.entries(facultyData)
      .sort((a, b) => b[1] - a[1]);
    
    new Chart(facultyChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sortedEntries.map(([name]) => name),
        datasets: [{
          label: 'Monto Total (CLP)',
          data: sortedEntries.map(([_, amount]) => amount),
          backgroundColor: '#4BC0C0'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatMillions(value);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
              }
            }
          }
        }
      }
    });
  }

  // Gráfico de proyectos por facultad
  if (projectsFacultyChart.value) {
    const facultyData = projectsByFaculty.value;
    const sortedEntries = Object.entries(facultyData)
      .sort((a, b) => b[1] - a[1]);
    
    new Chart(projectsFacultyChart.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: sortedEntries.map(([name]) => name),
        datasets: [{
          label: 'Cantidad de Proyectos',
          data: sortedEntries.map(([_, count]) => count),
          backgroundColor: '#FF9F40'
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
};
</script>

<style scoped>

</style>