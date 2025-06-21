<!-- src/components/ProfessorsByAcademicUnitChart.vue -->
<template>
    <div class="chart-container">
        <h2>Profesores por Unidad Académica</h2>
        <p v-if="loading">Cargando datos del gráfico...</p>
        <p v-if="error" class="error-message">
            Error al cargar los datos: {{ error }}
        </p>
        <div v-if="chartData.labels.length > 0" class="chart-wrapper">
            <Bar :data="chartData" :options="chartOptionsComputed" />
        </div>
        <p v-if="!loading && !error && chartData.labels.length === 0">
            No hay datos disponibles para mostrar el gráfico.
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
);

const AxU_url =
    'https://elysia-bunbackend-production.up.railway.app/estadisticas/academicos-por-unidad';

const loading = ref(false);
const error = ref(null);
const rawChartData = ref([]);

const chartData = computed(() => {
    if (rawChartData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    const labels = rawChartData.value.map((item) => item.UnidadAcademica);
    const data = rawChartData.value.map((item) => item.NumeroDeProfesores);

    return {
        labels: labels,
        datasets: [
            {
                label: 'Número de Profesores',
                backgroundColor: '#28a745',
                data: data,
            },
        ],
    };
});

const chartOptionsComputed = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: 'Distribución de Profesores por Unidad Académica',
            font: {
                size: 18,
            },
        },
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Unidad Académica',
            },
            ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
            },
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Número de Profesores',
            },
            ticks: {
                callback: function (value) {
                    if (Number.isInteger(value)) {
                        return value;
                    }
                    return null;
                },
                stepSize: 1,
            },
        },
    },
}));

const fetchDataAndPrepareChart = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await fetch(AxU_url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Los datos de la API no son un array.');
        }
        rawChartData.value = data;
    } catch (e) {
        console.error('Error fetching data for chart:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDataAndPrepareChart);
</script>

<style scoped>
.chart-container {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
    text-align: center;
    min-height: 450px;
}

.chart-container h2 {
    color: #333;
    margin-bottom: 15px;
}

.error-message {
    color: #dc3545;
    font-weight: bold;
    margin-top: 10px;
}

.chart-wrapper {
    position: relative;
    height: 400px;
    width: 100%;
    margin-top: 20px;
}

.chart-wrapper canvas {
    width: 100% !important;
    height: 100% !important;
}
</style>