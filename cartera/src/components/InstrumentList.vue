<!-- src/components/InstrumentList.vue -->
<template>
    <div class="instrument-list-card">
        <div class="card-title">INSTRUMENTOS A LOS QUE SE HA POSTULADO</div>
        <p v-if="loading">Cargando instrumentos...</p>
        <p v-if="error" class="error-message">
            Error al cargar instrumentos: {{ error }}
        </p>
        <ul v-if="!loading && !error && instruments.length > 0">
            <li v-for="(instrument, index) in instruments" :key="index">
                {{ instrument.name }} ({{ instrument.montoFormatted }})
            </li>
        </ul>
        <p v-if="!loading && !error && instruments.length === 0">
            No hay instrumentos disponibles.
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

const instruments = computed(() => {
    if (rawData.value.length === 0) {
        return [];
    }

    // Agrupar por 'apoyo' y sumar los 'monto'
    const groupedInstruments = rawData.value.reduce((acc, item) => {
        const key = `${item.apoyo || 'Desconocido'} (${item.institucion || 'Desconocida'
            })`; // Combinar apoyo e institución para una clave única

        if (!acc[key]) {
            acc[key] = { name: key, monto: 0 };
        }
        acc[key].monto += item.monto || 0;
        return acc;
    }, {});

    // Convertir a array, formatear montos y limitar para la visualización
    return Object.values(groupedInstruments)
        .map((instrument) => ({
            ...instrument,
            montoFormatted: (instrument.monto / 1000000).toLocaleString(
                'es-CL',
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 3,
                },
            ) + ' MM$', // Formato a MM$
        }))
        .sort((a, b) => b.monto - a.monto) // Opcional: ordenar por monto
        .slice(0, 4); // Mostrar los top 4 instrumentos
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
        console.error('Error fetching raw data for instruments list:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
.instrument-list-card {
    background-color: #5684ba;
    /* Color de fondo similar a las tarjetas grandes */
    border-radius: 10px;
    padding: 20px 25px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    height: 100%;
    color: white;
    text-align: left;
    /* Alineación del texto diferente a las tarjetas de métricas */
}

.card-title {
    font-size: 1.1em;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 20px;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    background-color: #6a9ccf;
    /* Color de fondo de cada ítem */
    padding: 10px 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    font-size: 0.9em;
    font-weight: 500;
}

li:last-child {
    margin-bottom: 0;
}

.error-message {
    color: #dc3545;
    font-weight: bold;
}
</style>