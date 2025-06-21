<!-- src/components/ThematicList.vue -->
<template>
    <div class="thematic-list-card">
        <div class="card-title">TEMÁTICAS</div>
        <p v-if="loading">Cargando temáticas...</p>
        <p v-if="error" class="error-message">
            Error al cargar temáticas: {{ error }}
        </p>
        <ul v-if="!loading && !error && thematics.length > 0">
            <li v-for="thematic in thematics" :key="thematic">
                {{ thematic }}
            </li>
        </ul>
        <p v-if="!loading && !error && thematics.length === 0">
            No hay temáticas disponibles.
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

const thematics = computed(() => {
    if (rawData.value.length === 0) {
        return [];
    }
    // Obtener temáticas únicas y tomar las primeras 5-6 más frecuentes
    const thematicCounts = rawData.value.reduce((acc, item) => {
        const tematica = item.tematica || 'Sin Temática';
        acc[tematica] = (acc[tematica] || 0) + 1;
        return acc;
    }, {});

    const sortedThematics = Object.entries(thematicCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([name]) => name);

    // Puedes limitar la cantidad de temáticas mostradas aquí
    return sortedThematics.slice(0, 6); // Mostrar hasta 6 temáticas
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
        console.error('Error fetching raw data for thematics list:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
.thematic-list-card {
    background-color: #e3f2fd;
    /* Color más claro para las listas */
    border-radius: 10px;
    padding: 20px 25px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #333;
}

.card-title {
    font-size: 1.1em;
    font-weight: 700;
    text-transform: uppercase;
    color: #2c3e50;
    margin-bottom: 15px;
    background-color: #5684ba;
    /* Color de la barra de título */
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    width: fit-content;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    text-align: center;
    flex-grow: 1;
    /* Permite que la lista crezca y ocupe el espacio */
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Centra las temáticas verticalmente */
}

li {
    background-color: #6a9ccf;
    /* Color de fondo de cada ítem */
    color: white;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 5px;
    font-size: 0.9em;
    font-weight: 500;
    width: 80%;
    /* Ancho del item dentro de la lista */
    margin-left: auto;
    margin-right: auto;
}

li:last-child {
    margin-bottom: 0;
}

.error-message {
    color: #dc3545;
    font-weight: bold;
}
</style>