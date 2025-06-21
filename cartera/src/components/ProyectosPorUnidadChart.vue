<!-- src/components/ProyectosPorUnidadChart.vue -->
<template>
    <div class="chart-container">
        <h2>Proyectos por Unidad</h2>
        <p v-if="loading">Cargando datos del gráfico de unidades...</p>
        <p v-if="error" class="error-message">
            Error al cargar los datos: {{ error }}
        </p>
        <div v-if="chartData.labels.length > 0" class="chart-wrapper">
            <Bar :data="chartData" :options="chartOptionsComputed" />
        </div>
        <p v-if="!loading && !error && chartData.labels.length === 0">
            No hay datos disponibles para mostrar el gráfico de unidades.
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

const data_crudaURL =
    'https://elysia-bunbackend-production.up.railway.app/funciones/data';

const loading = ref(false);
const error = ref(null);
const rawData = ref([]);

const chartData = computed(() => {
    if (rawData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    const unitsCount = rawData.value.reduce((acc, item) => {
        const unidad = item.unidad || 'Sin Unidad'; // Manejar nulos
        acc[unidad] = (acc[unidad] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(unitsCount);
    const data = Object.values(unitsCount);

    return {
        labels: labels,
        datasets: [
            {
                label: 'Número de Proyectos',
                backgroundColor: '#ffc107', // Un color amarillo/naranja
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
            text: 'Proyectos por Unidad',
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
                text: 'Unidad',
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
                text: 'Número de Proyectos',
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

const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await fetch(data_crudaURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Los datos de la API no son un array.');
        }
        rawData.value = data;
    } catch (e) {
        console.error('Error fetching raw data for units chart:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
/* Misma plantilla de estilos */
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