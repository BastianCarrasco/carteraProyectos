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
        
        <!-- Tarjeta 4: Proyectos por unidad -->
        <div class="stat-card">
          <div class="stat-value">{{ units.length }}</div>
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
        
        <!-- Gráfico 2: Monto por unidad académica -->
        <div class="chart-card">
          <h2>Montos Postulados por Unidad Académica</h2>
          <div class="chart-wrapper">
            <canvas ref="unitChart"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 3: Proyectos por unidad académica -->
        <div class="chart-card">
          <h2>Proyectos por Unidad Académica</h2>
          <div class="chart-wrapper">
            <canvas ref="projectsUnitChart"></canvas>
          </div>
        </div>
        
        <!-- Listado de Unidades Académicas -->
        <div class="table-card">
          <h2>Unidades Académicas Participantes</h2>
          <div class="unit-list">
            <div v-for="unit in sortedUnits" :key="unit.name" class="unit-item">
              <span class="unit-name">{{ unit.name }}</span>
              <span class="unit-count">{{ unit.count }} proyectos</span>
              <span class="unit-amount">{{ formatMillions(unit.amount) }}</span>
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

Chart.register(...registerables);

const proyectosUrl = import.meta.env.VITE_API_URL_PROYECTOS;
const typeChart = ref(null);
const unitChart = ref(null);
const projectsUnitChart = ref(null);

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

// Obtener datos - Versión mejorada
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log(`Fetching data from: ${proyectosUrl}`);
    const response = await fetch(proyectosUrl);
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Datos recibidos:', data);
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
      proyectos.value = data;
    } else if (data?.data && Array.isArray(data.data)) {
      proyectos.value = data.data;
    } else if (data?.success && data?.data && Array.isArray(data.data)) {
      proyectos.value = data.data;
    } else {
      throw new Error('Formato de datos no reconocido');
    }
    
    if (!proyectos.value.length) {
      console.warn('API respondió con array vacío');
      throw new Error('No se encontraron proyectos');
    }
    
  } catch (err) {
    console.error('Error completo al obtener datos:', err);
    error.value = `Error al cargar datos: ${err.message}`;
    proyectos.value = [];
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
  return [...new Set(leaders.map(p => p.academico))];
});

const units = computed(() => {
  return [...new Set(proyectos.value.map(p => p.unidad))];
});

const sortedUnits = computed(() => {
  const unitData = {};
  
  proyectos.value.forEach(p => {
    if (!unitData[p.unidad]) {
      unitData[p.unidad] = {
        name: p.unidad,
        count: 0,
        amount: 0
      };
    }
    unitData[p.unidad].amount += p.monto || 0;
    if (!unitData[p.unidad].projectIds) {
      unitData[p.unidad].projectIds = new Set();
    }
    unitData[p.unidad].projectIds.add(p.id_proyecto);
  });
  
  Object.keys(unitData).forEach(key => {
    unitData[key].count = unitData[key].projectIds.size;
    delete unitData[key].projectIds;
  });
  
  return Object.values(unitData)
    .sort((a, b) => b.amount - a.amount);
});

// Datos para gráficos
const typeDistribution = computed(() => {
  const types = {};
  proyectos.value.forEach(p => {
    types[p.tipo_convo] = (types[p.tipo_convo] || 0) + 1;
  });
  return types;
});

const unitAmounts = computed(() => {
  const amounts = {};
  proyectos.value.forEach(p => {
    amounts[p.unidad] = (amounts[p.unidad] || 0) + (p.monto || 0);
  });
  return amounts;
});

const projectsByUnit = computed(() => {
  const counts = {};
  const projectIds = new Set();
  
  proyectos.value.forEach(p => projectIds.add(p.id_proyecto));
  
  const unitProjects = {};
  projectIds.forEach(id => {
    const proyecto = proyectos.value.find(p => p.id_proyecto === id);
    if (proyecto) {
      unitProjects[proyecto.unidad] = (unitProjects[proyecto.unidad] || 0) + 1;
    }
  });
  
  return unitProjects;
});

// Inicialización y renderizado de gráficos
onMounted(() => {
  fetchData();
});

watch(proyectos, (newVal) => {
  if (newVal.length > 0) {
    nextTick(() => {
      renderCharts();
    });
  }
}, { immediate: true });

const renderCharts = () => {
  // Destruir gráficos existentes
  [typeChart, unitChart, projectsUnitChart].forEach(chartRef => {
    if (chartRef.value?._chart) {
      chartRef.value._chart.destroy();
    }
  });

  // Solo renderizar si hay datos
  if (!proyectos.value.length) return;

  // Gráfico 1: Tipos de convocatoria
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
        responsive: true,
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

  // Gráfico 2: Montos por unidad
  if (unitChart.value) {
    const unitData = unitAmounts.value;
    const sortedEntries = Object.entries(unitData).sort((a, b) => b[1] - a[1]);
    
    new Chart(unitChart.value.getContext('2d'), {
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
        responsive: true,
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

  // Gráfico 3: Proyectos por unidad
  if (projectsUnitChart.value) {
    const unitData = projectsByUnit.value;
    const sortedEntries = Object.entries(unitData).sort((a, b) => b[1] - a[1]);
    
    new Chart(projectsUnitChart.value.getContext('2d'), {
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
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        }
      }
    });
  }
};
</script>

<style scoped>
/* Tus estilos existentes pueden permanecer igual */
.stats-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
  min-height: 120px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card, .table-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

.unit-list {
  margin-top: 15px;
}

.unit-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.retry-button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #4BC0C0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background: #3aa8a8;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4BC0C0;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>