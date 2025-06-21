<!-- src/components/MontoTotalDisplay.vue -->
<template>
    <div class="stat-card">
        <h3>Monto Total de Proyectos</h3>
        <p v-if="loading">Calculando monto...</p>
        <p v-if="error" class="error-message">
            Error al calcular monto: {{ error }}
        </p>
        <div v-if="!loading && !error">
            <p class="total-amount">{{ formattedTotalMonto }}</p>
        </div>
        <p v-if="!loading && !error && rawData.length === 0">
            No hay datos de proyectos para calcular el monto.
        </p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const data_crudaURL =
    'https://elysia-bunbackend-production.up.railway.app/funciones/data';

const loading = ref(false);
const error = ref(null);
const rawData = ref([]);

const totalMonto = computed(() => {
    if (rawData.value.length === 0) {
        return 0;
    }
    return rawData.value.reduce((sum, item) => sum + (item.monto || 0), 0);
});

const formattedTotalMonto = computed(() => {
    // Formato de moneda, ej. $1,234,567.89
    return totalMonto.value.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP', // Moneda de ejemplo, ajusta según tu necesidad
    });
});

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
        console.error('Error fetching raw data for total monto:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
.stat-card {
    width: 100%;
    max-width: 400px;
    /* Un poco más pequeño para una tarjeta de estadística */
    margin: 20px auto;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
    text-align: center;
    min-height: 150px;
    /* Altura mínima para la tarjeta */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.stat-card h3 {
    color: #4CAF50;
    /* Verde para un monto positivo */
    margin-bottom: 15px;
    font-size: 1.5em;
}

.total-amount {
    font-size: 2.2em;
    font-weight: bold;
    color: #28a745;
    /* Un verde más fuerte */
}

.error-message {
    color: #dc3545;
    font-weight: bold;
}
</style>