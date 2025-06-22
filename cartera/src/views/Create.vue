<template>
  <v-container fluid class="pa-4">
    <h1 class="my-4 text-h4">Listado de Proyectos</h1>

    <!-- Create Project Button -->
    <v-row class="mb-4">
      <v-col cols="12" class="text-right">
        <v-btn color="primary" @click="openCreateProjectModal">
          <v-icon left>mdi-plus</v-icon>
          Crear Proyecto
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading state -->
    <v-row v-if="loading" justify="center" class="mt-5">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-2 text-subtitle-1">Cargando proyectos...</p>
      </v-col>
    </v-row>

    <!-- Error state -->
    <v-row v-if="error" justify="center" class="mt-5">
      <v-col cols="12" class="text-center">
        <v-alert type="error" prominent border="start" variant="tonal">
          Error al cargar los proyectos: {{ error.message || error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Filter Section -->
    <v-row class="mb-4 align-end">
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-text-field v-model="searchQuery" label="Buscar por Nombre de Proyecto" clearable
          prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-select v-model="filterUnidad" :items="unidadesLookup" item-title="nombre" item-value="id_unidad"
          label="Filtrar por Unidad" clearable variant="outlined" density="compact" hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-select v-model="filterTematica" :items="tematicasLookup" item-title="nombre" item-value="id_tematica"
          label="Filtrar por Temática" clearable variant="outlined" density="compact" hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="2">
        <v-select v-model="filterEstatus" :items="estatusLookup" item-title="tipo" item-value="id_estatus"
          label="Filtrar por Estatus" clearable variant="outlined" density="compact" hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="3">
        <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom">
          <template v-slot:activator="{ props }">
            <v-text-field v-model="dateRangeText" label="Filtrar por Fecha de Postulación"
              prepend-inner-icon="mdi-calendar" readonly v-bind="props" clearable variant="outlined" density="compact"
              hide-details @click:clear="clearDateFilter"></v-text-field>
          </template>
          <v-date-picker v-model="filterDateRange" range color="primary" show-adjacent-months
            @update:model-value="onDateRangeChange"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" class="text-right mt-n4">
        <!-- New Reset Filters Button -->
        <v-btn color="secondary" @click="resetFilters">
          <v-icon left>mdi-filter-off</v-icon>
          Restablecer Filtros
        </v-btn>
      </v-col>
    </v-row>

    <!-- Data Table Wrapper for Horizontal Scrolling -->
    <div class="data-table-wrapper">
      <v-data-table v-if="!loading && !error" :headers="headers" :items="paginatedProyectos" item-value="id_proyecto"
        class="excel-table" no-data-text="No hay proyectos disponibles." fixed-header @click:row="editProject"
        :items-per-page="itemsPerPage">
        <!-- Custom template for 'monto' to format as currency -->
        <template v-slot:item.monto="{ item }">
          {{ formatCurrency(item.monto / 100000) }}
        </template>

        <!-- Custom template for 'fecha_postulacion' to format as a readable date -->
        <template v-slot:item.fecha_postulacion="{ item }">
          {{ formatDateDisplay(item.fecha_postulacion) }}
        </template>

        <!-- Custom template for 'comentarios' to limit length and show tooltip -->
        <template v-slot:item.comentarios="{ item }">
          <v-tooltip :text="item.comentarios" location="bottom" open-delay="300">
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="d-inline-block text-truncate" style="max-width: 150px;">
                {{ item.comentarios || '-' }}
              </span>
            </template>
          </v-tooltip>
        </template>

        <!-- Custom template for 'unidad' to show unit name -->
        <template v-slot:item.unidad="{ item }">
          {{ getUnitName(item.unidad) }}
        </template>

        <!-- Custom template for 'id_tematica' to show tematica name -->
        <template v-slot:item.id_tematica="{ item }">
          {{ getTematicaName(item.id_tematica) }}
        </template>

        <!-- Custom template for 'id_estatus' to show estatus name -->
        <template v-slot:item.id_estatus="{ item }">
          {{ getEstatusName(item.id_estatus) }}
        </template>

        <!-- Custom template for 'tipo_convocatoria' to show type name -->
        <template v-slot:item.tipo_convocatoria="{ item }">
          {{ getTipoConvocatoriaName(item.tipo_convocatoria) }}
        </template>

        <!-- Custom template for 'inst_conv' to show institution name -->
        <template v-slot:item.inst_conv="{ item }">
          {{ getInstitucionName(item.inst_conv) }}
        </template>

        <!-- Custom template for 'apoyo' to show apoyo name -->
        <template v-slot:item.apoyo="{ item }">
          {{ getApoyoName(item.apoyo) }}
        </template>

        <!-- Custom template for 'academicos' to show professors -->
        <template v-slot:item.academicos="{ item }">
          <div class="academicos-cell">
            <span v-if="getAcademicosByProyecto(item.id_proyecto).length > 0">
              {{ getAcademicosByProyecto(item.id_proyecto).join(', ') }}
            </span>
            <span v-else>-</span>
          </div>
        </template>

        <!-- Optionally, customize other headers/items here if needed -->
        <template v-slot:column.id_proyecto="{ column }">
          <span class="font-weight-bold">{{ column.title }}</span>
        </template>

        <!-- Custom footer for pagination controls -->
        <template v-slot:bottom>
          <div class="pa-2 d-flex justify-space-between align-center text-caption text-grey">
            <span>Proyectos mostrados: {{ paginatedProyectos.length }} de {{ filteredProyectos.length }}</span>
            <v-pagination v-model="page" :length="pageCount" :total-visible="7" density="compact"></v-pagination>
            <!-- Add a items-per-page dropdown for convenience -->
            <v-select v-model="itemsPerPage" :items="itemsPerPageOptions" label="Proyectos por página"
              variant="outlined" density="compact" hide-details style="max-width: 150px;"></v-select>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Edit Project Dialog (Existing) -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2 d-flex align-center">
          <!-- Truncate and add tooltip for project name in dialog title -->
          <v-tooltip :text="editedProject.nombre" location="bottom" open-delay="300"
            :disabled="!editedProject.nombre || editedProject.nombre.length < 50">
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="text-h6 d-inline-block text-truncate" style="max-width: 650px;">
                Editar Proyecto: {{ editedProject.nombre }}
              </span>
            </template>
          </v-tooltip>

          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model="editedProject.nombre" label="Nombre del Proyecto"
                  :rules="[rules.optionalText]"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model.number="editedProject.monto" label="Monto" type="number"
                  :rules="[rules.optionalNumber]" prefix="$"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model="editedProject.fecha_postulacion" label="Fecha de Postulación" type="date"
                  :rules="[rules.optionalText]" hint="Formato AAAA-MM-DD" persistent-hint></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-textarea v-model="editedProject.comentarios" label="Comentarios" rows="3"></v-textarea>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.unidad" :items="unidadesLookup" item-title="nombre"
                  item-value="id_unidad" label="Unidad" :rules="[rules.optionalSelect]" clearable></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.id_tematica" :items="tematicasLookup" item-title="nombre"
                  item-value="id_tematica" label="Temática" :rules="[rules.optionalSelect]" clearable></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.id_estatus" :items="estatusLookup" item-title="tipo"
                  item-value="id_estatus" label="Estatus" :rules="[rules.optionalSelect]" clearable></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model="editedProject.convocatoria" label="Convocatoria"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select v-model="editedProject.tipo_convocatoria" :items="tipoConvocatoriasLookup" item-title="nombre"
                  item-value="id" label="Tipo Convocatoria" clearable></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="6">
                <v-select v-model="editedProject.inst_conv" :items="institucionesLookup" item-title="nombre"
                  item-value="id" label="Institución Convocatoria" clearable></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="6">
                <v-select v-model="editedProject.apoyo" :items="apoyosLookup" item-title="nombre" item-value="id_apoyo"
                  label="Apoyo" :rules="[rules.optionalSelect]" clearable
                  @update:model-value="handleApoyoChange"></v-select>
              </v-col>

              <v-col cols="12">
                <!-- Conditional rendering based on apoyo type -->
                <v-text-field v-if="isApoyoTotal" v-model="editedProject.detalle_apoyo" label="Detalle Apoyo" readonly
                  :rules="[rules.required]"></v-text-field>

                <v-select v-else-if="isApoyoParcial" v-model="selectedTags" :items="tagsLookup" item-title="tag"
                  item-value="tag" label="Detalle Apoyo (Seleccione tags)" multiple chips clearable
                  :rules="[rules.requiredIfParcialSelect]" @update:model-value="updateDetalleApoyoFromTags"></v-select>

                <v-text-field v-else v-model="editedProject.detalle_apoyo" label="Detalle Apoyo"
                  placeholder="Ingrese detalle de apoyo" clearable :rules="[rules.optionalText]"></v-text-field>
              </v-col>

              <!-- KTH ID - As it was commented out, I'm assuming it's a simple text input if it were to be added -->
              <!-- <v-col cols="12" sm="6">
                <v-text-field v-model.number="editedProject.id_kth" label="KTH ID" type="number"></v-text-field>
              </v-col> -->
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <!-- New: Delete Button in Edit Modal -->
          <v-btn color="red-darken-2" variant="tonal" @click="confirmDeleteFromEditModal">Eliminar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="saveProject">Guardar</v-btn>
          <v-btn color="grey-darken-1" variant="tonal" @click="closeDialog">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog (unchanged) -->
    <v-dialog v-model="deleteConfirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar el proyecto
          <strong class="text-error">{{ projectToDeleteName }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="grey-darken-1" variant="tonal" @click="cancelDelete">Cancelar</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="executeDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Project Modal (New) -->
    <CreateProjectModal ref="createProjectModalRef" @project-created="handleProjectCreated"
      @close-modal="closeCreateProjectModal" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import CreateProjectModal from '@/components/CreateProjectModal.vue';
import '../assets/Proyecto_styles/exel2.css';

// URLs
const url =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/crudo';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';
const urlUnidades =
  'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlUpdateProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/';
const urlDeleteProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/';
const urlEstatus =
  'https://elysia-bunbackend-production.up.railway.app/estatus/';
const urlInstituciones =
  'https://elysia-bunbackend-production.up.railway.app/inst-convo/';
const urlApoyos =
  'https://elysia-bunbackend-production.up.railway.app/apoyos/';
const urltematicas =
  'https://elysia-bunbackend-production.up.railway.app/tematicas/';
const urltags =
  'https://elysia-bunbackend-production.up.railway.app/tags/';
const urlTipoConvocatorias =
  'https://elysia-bunbackend-production.up.railway.app/tipo-convo/';

// Reactive data
const proyectosCrudo = ref([]);
const unidadesLookup = ref([]);
const estatusLookup = ref([]);
const institucionesLookup = ref([]);
const apoyosLookup = ref([]);
const tematicasLookup = ref([]);
const tipoConvocatoriasLookup = ref([]);
const academicosXProyectoLookup = ref([]);
const tagsLookup = ref([]);

const loading = ref(true);
const error = ref(null);

// Dialog state for EDIT Project
const dialog = ref(false); // Controls the Edit Project Modal
const editedProject = ref({}); // Stores the project being edited
const defaultProject = {
  id_proyecto: null,
  nombre: '',
  monto: 0,
  fecha_postulacion: null,
  comentarios: null,
  unidad: null,
  id_tematica: null,
  id_estatus: null,
  id_kth: null,
  convocatoria: null,
  tipo_convocatoria: null,
  inst_conv: null,
  detalle_apoyo: null,
  apoyo: null,
};
const selectedTags = ref([]);

// Delete Confirmation State
const deleteConfirmDialog = ref(false); // Controls the Delete Confirmation Dialog
const projectToDelete = ref(null); // Stores the project to be deleted
const projectToDeleteName = ref(''); // Stores the name of the project to be deleted for display

// Form Validation for EDIT Project
const valid = ref(true);
const form = ref(null);

const rules = {
  required: (value) => !!value || 'Campo requerido.',
  optionalText: (value) => true,
  optionalNumber: (value) => {
    if (value === null || value === undefined || value === '') return true;
    return (
      (!isNaN(parseFloat(value)) && isFinite(value)) ||
      'Debe ser un número válido.'
    );
  },
  optionalSelect: (value) => true,
  // New rule for v-select when Apoyo is PARCIAL
  requiredIfParcialSelect: (value) => {
    const partialApoyo = apoyosLookup.value.find(
      (a) => a.nombre === 'PARCIAL',
    );
    const isPartialApoyoSelected =
      partialApoyo && editedProject.value.apoyo === partialApoyo.id_apoyo;

    if (isPartialApoyoSelected) {
      return (
        (Array.isArray(value) && value.length > 0) ||
        'Debe seleccionar al menos un tag si el apoyo es PARCIAL.'
      );
    }
    return true;
  },
};

// --- New Filter State ---
const searchQuery = ref('');
const filterUnidad = ref(null);
const filterTematica = ref(null);
const filterEstatus = ref(null);
const filterDateRange = ref([]); // For v-date-picker, holds [startDate, endDate]
const dateMenu = ref(false); // To control the date picker menu visibility

// Computed property for displaying date range
const dateRangeText = computed(() => {
  if (!filterDateRange.value || filterDateRange.value.length === 0) return '';
  if (filterDateRange.value.length === 1) {
    return formatDateDisplay(filterDateRange.value[0]);
  }
  const [start, end] = filterDateRange.value;
  return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`;
});

// Watch for filter changes to reset page to 1
watch(
  [searchQuery, filterUnidad, filterTematica, filterEstatus, filterDateRange],
  () => {
    page.value = 1;
  },
);

// --- New Filtered Projects Computed Property ---
const filteredProyectos = computed(() => {
  let filtered = proyectosCrudo.value;

  // Filter by search query (project name)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((proyecto) =>
      proyecto.nombre.toLowerCase().includes(query),
    );
  }

  // Filter by unidad
  if (filterUnidad.value !== null) {
    filtered = filtered.filter(
      (proyecto) => proyecto.unidad === filterUnidad.value,
    );
  }

  // Filter by tematica
  if (filterTematica.value !== null) {
    filtered = filtered.filter(
      (proyecto) => proyecto.id_tematica === filterTematica.value,
    );
  }

  // Filter by estatus
  if (filterEstatus.value !== null) {
    filtered = filtered.filter(
      (proyecto) => proyecto.id_estatus === filterEstatus.value,
    );
  }

  // Filter by date range
  if (filterDateRange.value && filterDateRange.value.length > 0) {
    let startDate = null;
    let endDate = null;

    if (filterDateRange.value.length === 1) {
      // If only one date selected, filter for that specific day
      startDate = new Date(filterDateRange.value[0]);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else if (filterDateRange.value.length === 2) {
      // Ensure start date is always before end date for range
      let [date1, date2] = filterDateRange.value;
      if (date1 > date2) [date1, date2] = [date2, date1]; // Swap if needed

      startDate = new Date(date1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date2);
      endDate.setHours(23, 59, 59, 999);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((proyecto) => {
        const projectDate = new Date(proyecto.fecha_postulacion);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }
  }

  return filtered;
});

// Pagination state
const page = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: -1, title: 'Todos' },
];

const pageCount = computed(() => {
  if (itemsPerPage.value === 0) return 1;
  if (itemsPerPage.value === -1)
    return Math.ceil(filteredProyectos.value.length / 10);
  return Math.ceil(filteredProyectos.value.length / itemsPerPage.value);
});

const paginatedProyectos = computed(() => {
  if (itemsPerPage.value === -1) {
    return filteredProyectos.value;
  }
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProyectos.value.slice(start, end);
});

watch(itemsPerPage, () => {
  page.value = 1;
});

const isApoyoTotal = computed(() => {
  const totalApoyo = apoyosLookup.value.find((a) => a.nombre === 'TOTAL');
  return totalApoyo && editedProject.value.apoyo === totalApoyo.id_apoyo;
});

const isApoyoParcial = computed(() => {
  const partialApoyo = apoyosLookup.value.find((a) => a.nombre === 'PARCIAL');
  return partialApoyo && editedProject.value.apoyo === partialApoyo.id_apoyo;
});

// Table headers (Removed 'actions' column as it's now in the edit modal)
const headers = [
  { title: 'Nombre del Proyecto', key: 'nombre', minWidth: '250px' },
  { title: 'Monto', key: 'monto', align: 'end', minWidth: '120px' },
  { title: 'Fecha Postulación', key: 'fecha_postulacion', minWidth: '120px' },
  {
    title: 'Comentarios',
    key: 'comentarios',
    sortable: false,
    minWidth: '200px',
  },
  { title: 'Unidad', key: 'unidad', align: 'start', minWidth: '250px' },
  { title: 'Temática', key: 'id_tematica', align: 'start', minWidth: '150px' },
  { title: 'Estatus', key: 'id_estatus', align: 'start', minWidth: '120px' },
  { title: 'Convocatoria', key: 'convocatoria', minWidth: '150px' },
  {
    title: 'Tipo Convocatoria',
    key: 'tipo_convocatoria',
    align: 'start',
    minWidth: '150px',
  },
  {
    title: 'Institución Convocatoria',
    key: 'inst_conv',
    align: 'start',
    minWidth: '180px',
  },
  {
    title: 'Detalle Apoyo',
    key: 'detalle_apoyo',
    minWidth: '150px',
  },
  { title: 'Apoyo', key: 'apoyo', align: 'start', minWidth: '120px' },
  {
    title: 'Académicos',
    key: 'academicos',
    sortable: false,
    minWidth: '250px',
  },
  // Removed the 'actions' column
];

// Helper functions for formatting and lookups
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDateForInput = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  } catch (e) {
    console.error('Error formatting date for input:', e);
    return null;
  }
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

    if (isNaN(adjustedDate.getTime())) {
      return 'Fecha Inválida';
    }
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(adjustedDate);
  } catch (e) {
    console.error('Error formatting date for display:', e);
    return 'Fecha Inválida';
  }
};

// Function to handle date range change from picker
const onDateRangeChange = (newDates) => {
  // If user picks two dates, close the menu
  if (newDates && newDates.length === 2) {
    dateMenu.value = false;
  }
};

// Function to clear date filter
const clearDateFilter = () => {
  filterDateRange.value = [];
};

// --- New Function to Reset All Filters ---
const resetFilters = () => {
  searchQuery.value = '';
  filterUnidad.value = null;
  filterTematica.value = null;
  filterEstatus.value = null;
  filterDateRange.value = [];
  page.value = 1; // Ensure pagination resets too
};

const getUnitName = (unitId) => {
  if (unitId === null || unitId === undefined) return '-';
  const item = unidadesLookup.value.find((u) => u.id_unidad === unitId);
  return item ? item.nombre : `ID Desconocido (${unitId})`;
};

const getEstatusName = (estatusId) => {
  if (estatusId === null || estatusId === undefined) return '-';
  const item = estatusLookup.value.find((e) => e.id_estatus === estatusId);
  return item ? item.tipo : `ID Desconocido (${estatusId})`;
};

const getTematicaName = (tematicaId) => {
  if (tematicaId === null || tematicaId === undefined) return '-';
  const item = tematicasLookup.value.find((t) => t.id_tematica === tematicaId);
  return item ? item.nombre : `ID Desconocido (${tematicaId})`;
};

const getTipoConvocatoriaName = (tipoConvoId) => {
  if (tipoConvoId === null || tipoConvoId === undefined) return '-';
  const item = tipoConvocatoriasLookup.value.find(
    (tc) => tc.id === tipoConvoId,
  );
  return item ? item.nombre : `ID Desconocido (${tipoConvoId})`;
};

const getInstitucionName = (instConvoId) => {
  if (instConvoId === null || instConvoId === undefined) return '-';
  const item = institucionesLookup.value.find((ic) => ic.id === instConvoId);
  return item ? item.nombre : `ID Desconocido (${instConvoId})`;
};

const getApoyoName = (apoyoId) => {
  if (apoyoId === null || apoyoId === undefined) return '-';
  const item = apoyosLookup.value.find((a) => a.id_apoyo === apoyoId);
  return item ? item.nombre : `ID Desconocido (${apoyoId})`;
};

const getAcademicosByProyecto = (projectId) => {
  if (projectId === null || projectId === undefined) return [];

  const projectAcademics = academicosXProyectoLookup.value.find(
    (pa) => pa.id_proyecto === projectId,
  );

  // Si se encuentra el proyecto y tiene profesores, mapear los nombres
  return projectAcademics && projectAcademics.profesores
    ? projectAcademics.profesores.map((profesor) => profesor.nombre_completo)
    : [];
};

// Original editProject function (no longer needs click.closest check)
const editProject = (event, { item }) => {
  editedProject.value = { ...item };
  editedProject.value.fecha_postulacion = formatDateForInput(
    editedProject.value.fecha_postulacion,
  );

  // Initialize selectedTags based on existing detalle_apoyo if Apoyo is PARCIAL
  if (
    getApoyoName(editedProject.value.apoyo) === 'PARCIAL' &&
    editedProject.value.detalle_apoyo
  ) {
    selectedTags.value = editedProject.value.detalle_apoyo
      .split(', ')
      .map((tag) => tag.trim());
  } else {
    selectedTags.value = [];
  }

  dialog.value = true;
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation();
    }
  });
};

const closeDialog = () => {
  dialog.value = false;
  editedProject.value = { ...defaultProject };
  selectedTags.value = []; // Clear selected tags on close
};

const handleApoyoChange = (newApoyoId) => {
  const newApoyoName = apoyosLookup.value.find(
    (a) => a.id_apoyo === newApoyoId,
  )?.nombre;

  // Reset relevant fields when apoyo type changes
  if (newApoyoName === 'TOTAL') {
    editedProject.value.detalle_apoyo = 'TOTAL';
    selectedTags.value = []; // Clear tags if not partial
  } else if (newApoyoName === 'PARCIAL') {
    editedProject.value.detalle_apoyo = selectedTags.value.join(', '); // Initialize based on current tags
  } else {
    editedProject.value.detalle_apoyo = null; // Clear if 'Otro' or none
    selectedTags.value = [];
  }

  // Validate the form after the change to reflect new rules
  nextTick(() => {
    if (form.value) {
      form.value.validate();
    }
  });
};

// New function to update detalle_apoyo whenever selectedTags changes
const updateDetalleApoyoFromTags = (newTags) => {
  if (isApoyoParcial.value) {
    editedProject.value.detalle_apoyo = newTags.join(', ');
  }
  // Re-validate the form field specifically if needed
  nextTick(() => {
    if (form.value) {
      form.value.validate();
    }
  });
};

const saveProject = async () => {
  // Ensure detalle_apoyo is consistent with selectedTags before validation
  if (isApoyoParcial.value) {
    editedProject.value.detalle_apoyo = selectedTags.value.join(', ');
  }

  const { valid: formValid } = await form.value.validate();

  if (!formValid) {
    console.log('Form is invalid. Not saving.');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const projectToSave = { ...editedProject.value };

    // Final check for detalle_apoyo before sending
    if (isApoyoParcial.value) {
      projectToSave.detalle_apoyo = selectedTags.value.join(', ');
    } else if (isApoyoTotal.value) {
      projectToSave.detalle_apoyo = 'TOTAL';
    } else {
      projectToSave.detalle_apoyo = projectToSave.detalle_apoyo || null;
    }

    for (const key in projectToSave) {
      if (projectToSave[key] === '') {
        projectToSave[key] = null;
      }
      if (
        [
          'monto',
          'unidad',
          'id_tematica',
          'id_estatus',
          'id_kth',
          'tipo_convocatoria',
          'inst_conv',
          'apoyo',
        ].includes(key)
      ) {
        if (projectToSave[key] !== null && projectToSave[key] !== undefined) {
          projectToSave[key] = Number(projectToSave[key]);
        } else if (projectToSave[key] === '') {
          projectToSave[key] = null;
        }
      }
    }

    if (projectToSave.fecha_postulacion) {
      projectToSave.fecha_postulacion = new Date(
        projectToSave.fecha_postulacion,
      ).toISOString();
    } else {
      projectToSave.fecha_postulacion = null;
    }

    const response = await fetch(
      `${urlUpdateProyecto}${projectToSave.id_proyecto}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectToSave),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! Status: ${response.status}. ${errorData.message || JSON.stringify(errorData) || ''
        }`,
      );
    }

    await fetchData();
    closeDialog();
  } catch (err) {
    error.value = err;
    console.error('Error saving project:', err);
    alert(`Error al guardar: ${err.message}`);
  } finally {
    loading.value = false;
  }
};

// New Delete Project Functions
const confirmDeleteFromEditModal = () => {
  projectToDelete.value = { ...editedProject.value };
  projectToDeleteName.value = editedProject.value.nombre;

  dialog.value = false;
  deleteConfirmDialog.value = true;
};

const cancelDelete = () => {
  deleteConfirmDialog.value = false;
  projectToDelete.value = null;
  projectToDeleteName.value = '';
};

const executeDelete = async () => {
  if (!projectToDelete.value || !projectToDelete.value.id_proyecto) {
    console.error('No project selected for deletion.');
    cancelDelete();
    return;
  }

  deleteConfirmDialog.value = false;
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `${urlDeleteProyecto}${projectToDelete.value.id_proyecto}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! Status: ${response.status}. ${errorData.message || JSON.stringify(errorData) || ''
        }`,
      );
    }

    console.log('Project deleted successfully.');
    await fetchData();
  } catch (err) {
    error.value = err;
    console.error('Error deleting project:', err);
    alert(`Error al eliminar el proyecto: ${err.message}`);
  } finally {
    loading.value = false;
    projectToDelete.value = null;
    projectToDeleteName.value = '';
  }
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [
      projectsResponse,
      unitsResponse,
      estatusResponse,
      institucionesResponse,
      apoyosResponse,
      tematicasResponse,
      tipoConvocatoriasResponse,
      academicosResponse,
      tagsResponse,
    ] = await Promise.all([
      fetch(url),
      fetch(urlUnidades),
      fetch(urlEstatus),
      fetch(urlInstituciones),
      fetch(urlApoyos),
      fetch(urltematicas),
      fetch(urlTipoConvocatorias),
      fetch(urlAcademicos),
      fetch(urltags),
    ]);

    const parseResponse = async (response, dataRef, name) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} for ${name}`,
        );
      }
      dataRef.value = await response.json();
    };

    await parseResponse(projectsResponse, proyectosCrudo, 'proyectos');
    await parseResponse(unitsResponse, unidadesLookup, 'unidades');
    await parseResponse(estatusResponse, estatusLookup, 'estatus');
    await parseResponse(
      institucionesResponse,
      institucionesLookup,
      'instituciones',
    );
    await parseResponse(apoyosResponse, apoyosLookup, 'apoyos');
    await parseResponse(tematicasResponse, tematicasLookup, 'temáticas');
    await parseResponse(
      tipoConvocatoriasResponse,
      tipoConvocatoriasLookup,
      'tipo de convocatorias',
    );
    await parseResponse(
      academicosResponse,
      academicosXProyectoLookup,
      'académicos por proyecto',
    );
    await parseResponse(tagsResponse, tagsLookup, 'tags');
  } catch (err) {
    error.value = err;
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Create Project Modal Logic
const createProjectModalRef = ref(null);

const openCreateProjectModal = () => {
  if (createProjectModalRef.value) {
    createProjectModalRef.value.openDialog();
  }
};

const handleProjectCreated = () => {
  console.log('New project created, refreshing list...');
  fetchData();
};

const closeCreateProjectModal = () => {
  console.log('Create Project Modal closed.');
};
</script>
<style scoped>
/* (Your existing styles remain here) */
/* ==========================================================================
   Base Styles for Excel-like Table (keep this)
   ========================================================================== */

/* Base container for the Vuetify data table, removing default shadow and adding a black border */
.excel-table.v-data-table {
  box-shadow: none !important;
  border: 1px solid #000;
  /* Borde principal de la tabla a negro */
}

/* Ensure the table content takes up enough space for horizontal scrolling */
.excel-table.v-data-table :deep(.v-data-table__content table) {
  min-width: 2060px;
  /* Adjust as needed based on content */
  border-collapse: collapse;
  /* Crucial for consistent borders between cells */
}

/* Wrapper for horizontal scrolling when table content overflows */
.data-table-wrapper {
  overflow-x: auto;
  width: 100%;
  /* Ensures the wrapper takes full available width */
}

/* ==========================================================================
   Table Header Styles (keep this)
   ========================================================================== */

.excel-table.v-data-table :deep(.v-data-table__thead th) {
  background-color: #e8f5e9;
  /* Un verde muy claro, casi blanco verdoso */
  /* Header background color */
  color: #333;
  /* Header text color */
  font-weight: bold;
  font-size: 0.875rem;
  text-transform: capitalize;
  white-space: nowrap;
  /* Prevent header text from wrapping */
  padding: 8px 12px;
  /* Internal padding of header cells */

  /* IMPORTANT: Apply borders to all sides of header cells */
  border: 1px solid #000 !important;
  /* Force black border */
}

/* ==========================================================================
   Table Body Styles (keep this)
   ========================================================================== */

/* Alternating row colors (zebra stripping) */
.excel-table.v-data-table :deep(.v-data-table__tbody tr:nth-of-type(odd)) {
  background-color: #f5f5f5;
}

/* Hover effect for rows */
.excel-table.v-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: #e0f2f7 !important;
  /* Un azul claro para el hover, similar a la selección de excel */
  /* Background color on hover */
  cursor: pointer;
}

/* Cell styling */
.excel-table.v-data-table :deep(.v-data-table__tbody td) {
  padding: 8px 12px;
  /* Internal padding of body cells */
  font-size: 0.875rem;
  white-space: normal;
  /* Allow cell content to wrap by default */

  /* IMPORTANT: Apply borders to all sides of body cells */
  border: 1px solid #000 !important;
  /* Force black border */
}

/* Specific styling for 'academicos' cell to handle multiple names, ensuring wrapping */
.excel-table.v-data-table :deep(.v-data-table__tbody td .academicos-cell) {
  white-space: normal;
  /* Ensure this specific cell always allows line breaks */
}

/* ==========================================================================
   Table Footer Styles (keep this)
   ========================================================================== */

/* Pagination footer styling */
.excel-table.v-data-table :deep(.v-data-table__tfoot) {
  background-color: #e8f5e9;
  /* Un verde muy claro, consistente con el header */
  /* Footer background color */
  border-top: 1px solid #000;
  /* Top border of the footer */
  padding: 8px 16px;
}

/* Hide default Vuetify pagination controls if using custom footer */
.excel-table.v-data-table :deep(.v-data-table-footer) {
  display: none;
}

/* ==========================================================================
   Tooltip Styles (keep this)
   ========================================================================== */

.v-tooltip>.v-overlay__content {
  background-color: rgba(0, 0, 0, 0.8) !important;
  color: #fff !important;
  /* Vuelve el color de texto del tooltip a blanco para mejor contraste */
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 4px;
}

/* ==========================================================================
   Responsive Adjustments (Media Queries) (keep this)
   ========================================================================= */

@media (max-width: 768px) {

  .excel-table.v-data-table :deep(.v-data-table__thead th),
  .excel-table.v-data-table :deep(.v-data-table__tbody td) {
    font-size: 0.75rem;
    padding: 6px 8px;
  }
}
</style>
