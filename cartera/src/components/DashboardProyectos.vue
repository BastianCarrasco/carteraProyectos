<template>
    <div :class="styles['project-dashboard']">
        <h1>Dashboard de Estadísticas Académicas</h1>

        <!-- Fila superior de Tarjetas de Resumen (como en la imagen) -->
        <div :class="[styles['dashboard-row'], styles['top-summary-row']]">
            <!-- Columna izquierda: Proyectos en Cartera y Monto Formulados -->
            <div :class="styles['col-group']">
                <MetricCard :value="proyectosEnCartera" label="Proyectos en Cartera">
                    <template #buttons>
                        <div :class="styles['button-group']">
                            <button>Postulados ({{ postuladosCount }})</button>
                            <button>Perfilados ({{ perfiladosCount }})</button>
                        </div>
                    </template>
                </MetricCard>
                <ValueDisplayCard :value="proyectosFormuladosMM" label="En Proyectos Formulados" />
            </div>

            <!-- Columna central: Trabajo con Escuelas y Académicos -->
            <div :class="[styles['col-group'], styles['center-metrics']]">
                <MetricCard :value="escuelasFin" label="Escuelas de la FIN" class="dashboard-metric-card-override">
                    <template #top-label>Trabajo con</template>
                </MetricCard>
                <MetricCard :value="academicosInvolucrados" label="Académicos Involucrados"
                    class="dashboard-metric-card-override">
                    <template #top-label>Cantidad de</template>
                    <template #icon>
                        <svg :class="styles.icon" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </template>
                </MetricCard>
            </div>

            <!-- Columna derecha: Temáticas -->
            <div :class="styles['col-group']">
                <ThematicList />
            </div>
        </div>

        <!-- Fila de Instrumentos Postulados (como en la imagen) -->
        <div :class="[styles['dashboard-row'], styles['instruments-row']]">
            <InstrumentList />
        </div>

        <hr :class="styles['section-divider']" />

        <!-- Sección de Gráficos Detallados -->
        <div :class="[styles['charts-section'], styles['detailed-charts']]">
            <h2>Análisis Profundo de Datos</h2>

            <!-- Fila de gráficos 2x2 (Ej. Profesores, Proyectos por Profesor) -->
            <div :class="[styles['charts-grid'], styles['charts-grid-2-columns']]">
                <div :class="styles['chart-item']">
                    <ProfessorsByAcademicUnitChart />
                </div>
                <div :class="styles['chart-item']">
                    <ProyectosPorProfesorChart />
                </div>
                <div :class="styles['chart-item']">
                    <ProyectosPorTematicaChart />
                </div>
                <div :class="styles['chart-item']">
                    <ProyectosPorInstitucionChart />
                </div>
            </div>

            <!-- Gráfico grande (Proyectos por Unidad) -->
            <div :class="[styles['charts-grid'], styles['charts-grid-1-column']]">
                <div :class="[styles['chart-item'], styles['wide-chart-item']]">
                    <ProyectosPorUnidadChart />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MetricCard from '@/components/MetricCard.vue';
import ValueDisplayCard from '@/components/ValueDisplayCard.vue';
import ThematicList from '@/components/ThematicList.vue';
import InstrumentList from '@/components/InstrumentList.vue';
import ProfessorsByAcademicUnitChart from '@/components/ProfessorsByAcademicUnitChart.vue';
import ProyectosPorProfesorChart from '@/components/ProyectosPorProfesorChart.vue';
import ProyectosPorTematicaChart from '@/components/ProyectosPorTematicaChart.vue';
import ProyectosPorInstitucionChart from '@/components/ProyectosPorInstitucionChart.vue';
import ProyectosPorUnidadChart from '@/components/ProyectosPorUnidadChart.vue';

// Import CSS Module
import styles from '../assets/DashboardProyectos.module.css';

// URLs de tus APIs
const data_crudaURL =
    'https://elysia-bunbackend-production.up.railway.app/funciones/data';
const academicosURL =
    'https://elysia-bunbackend-production.up.railway.app/estadisticas/academicos-por-unidad';
const proyectosProfesorURL =
    'https://elysia-bunbackend-production.up.railway.app/estadisticas/proyectos-por-profesor';

// Datos Reactivos
const rawProjectsData = ref([]);
const academicosData = ref([]); // Para almacenar datos de académicos por unidad
const proyectosProfesorData = ref([]); // Para almacenar datos de proyectos por profesor

const loading = ref(true); // Controla el estado de carga general del dashboard
const error = ref(null);

// --- Métricas Derivadas de rawProjectsData (data_crudaURL) ---
const proyectosEnCartera = computed(() => rawProjectsData.value.length);

const postuladosCount = computed(
    () => rawProjectsData.value.filter((p) => p.estatus === 'Postulado').length,
);
const perfiladosCount = computed(
    () => rawProjectsData.value.filter((p) => p.estatus === 'Perfilado').length,
);

const proyectosFormuladosMM = computed(() => {
    const totalMonto = rawProjectsData.value.reduce(
        (sum, item) => sum + (item.monto || 0),
        0,
    );
    // Formatear a MM$ (Millones de pesos chilenos, asumiendo CLPC)
    return (
        (totalMonto / 1000000).toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }) + ' MM$'
    );
});

// --- Métricas Derivadas de otras URLs / Datos Adicionales ---

// Escuelas de la FIN: Derivado de las unidades únicas en rawProjectsData (si "unidad" representa la escuela)
// O podrías buscar esto de 'academicosData' si cada académico tiene una 'unidad' que es una escuela.
const escuelasFin = computed(() => {
    if (rawProjectsData.value.length === 0) return 0;
    const uniqueUnits = new Set(
        rawProjectsData.value.map((p) => p.unidad).filter(Boolean),
    );
    return uniqueUnits.size;
});

// Académicos Involucrados: Número único de profesores de la API de proyectos por profesor
const academicosInvolucrados = computed(() => {
    if (proyectosProfesorData.value.length === 0) return 0;
    const uniqueProfessors = new Set(
        proyectosProfesorData.value.map(
            (p) => `${p.NombreAcademico} ${p.ApellidoAcademico}`,
        ),
    );
    return uniqueProfessors.size;
});

// --- Función para cargar todos los datos necesarios para las métricas superiores ---
const fetchDataForSummary = async () => {
    loading.value = true;
    error.value = null;
    try {
        const [projectsResponse, profProjectsResponse] = await Promise.all([
            fetch(data_crudaURL),
            fetch(proyectosProfesorURL),
        ]);

        if (!projectsResponse.ok)
            throw new Error(
                `HTTP error! status: ${projectsResponse.status} from projects API`,
            );
        if (!profProjectsResponse.ok)
            throw new Error(
                `HTTP error! status: ${profProjectsResponse.status} from prof projects API`,
            );

        rawProjectsData.value = await projectsResponse.json();
        proyectosProfesorData.value = await profProjectsResponse.json();
    } catch (e) {
        console.error('Error fetching data for dashboard summary:', e);
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDataForSummary);
</script>