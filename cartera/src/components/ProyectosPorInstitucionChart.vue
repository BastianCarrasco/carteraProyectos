<!-- src/components/ProyectosPorInstitucionChart.vue -->
<template>
    <div class="chart-container">
        <h2>Proyectos por Institución</h2>
        <p v-if="loading">Cargando datos del gráfico de instituciones...</p>
        <p v-if="error" class="error-message">
            Error al cargar los datos: {{ error }}
        </p>
        <div v-if="chartData.labels.length > 0" class="chart-wrapper">
            <Pie :data="chartData" :options="chartOptionsComputed" />
        </div>
        <p v-if="!loading && !error && chartData.labels.length === 0">
            No hay datos disponibles para mostrar el gráfico de instituciones.
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const data_crudaURL =
    'https://elysia-bunbackend-production.up.railway.app/funciones/data';

const loading = ref(false);
const error = ref(null);
const rawData = ref([]);

const chartData = computed(() => {
    if (rawData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    const institutionsCount = rawData.value.reduce((acc, item) => {
        const institucion = item.institucion || 'Sin Institución'; // Manejar nulos
        acc[institucion] = (acc[institucion] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(institutionsCount);
    const data = Object.values(institutionsCount);

    const backgroundColors = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    });
    const borderColors = backgroundColors.map((color) =>
        color.replace('0.8', '1'),
    );

    return {
        labels: labels,
        datasets: [
            {
                label: 'Número de Proyectos',
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
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
            text: 'Distribución de Proyectos por Institución',
            font: {
                size: 18,
            },
        },
        legend: {
            display: true,
            position: 'right',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
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
        console.error('Error fetching raw data for institutions chart:', e);
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
    max-width: 500px;
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