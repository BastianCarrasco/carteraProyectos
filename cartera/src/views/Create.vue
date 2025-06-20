<template>
  <v-container fluid class="pa-4">
    <h1 class="my-4 text-h4">Listado de Proyectos</h1>

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

    <!-- Data Table Wrapper for Horizontal Scrolling -->
    <div class="data-table-wrapper">
      <v-data-table v-if="!loading && !error" :headers="headers" :items="proyectosCrudo" item-value="id_proyecto"
        class="excel-table" no-data-text="No hay proyectos disponibles." items-per-page="10" fixed-header
        @click:row="editProject">
        <!-- Custom template for 'monto' to format as currency -->
        <template v-slot:item.monto="{ item }">
          {{ formatCurrency(item.monto / 100000) }}
        </template>

        <!-- Custom template for 'fecha_postulacion' to format as a readable date -->
        <template v-slot:item.fecha_postulacion="{ item }">
          {{ formatDateDisplay(item.fecha_postulacion) }} <!-- Use formatDateDisplay here -->
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
            <span>Proyectos mostrados: {{ proyectosCrudo.length }}</span>
            <v-pagination v-model="page" :length="pageCount" :total-visible="7" density="compact"></v-pagination>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Edit Project Dialog -->
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span class="text-h6">Editar Proyecto: {{ editedProject.nombre }}</span>
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
                  :rules="[rules.required]"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field v-model.number="editedProject.monto" label="Monto" type="number"
                  :rules="[rules.required, rules.number]" prefix="$"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <!-- Date Picker -->
                <v-text-field v-model="editedProject.fecha_postulacion" label="Fecha de Postulación" type="date"
                  :rules="[rules.required]" hint="Formato AAAA-MM-DD" persistent-hint></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-textarea v-model="editedProject.comentarios" label="Comentarios" rows="3"></v-textarea>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.unidad" :items="unidadesLookup" item-title="nombre"
                  item-value="id_unidad" label="Unidad" :rules="[rules.required]" clearable></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.id_tematica" :items="tematicasLookup" item-title="nombre"
                  item-value="id_tematica" label="Temática" :rules="[rules.required]" clearable></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="editedProject.id_estatus" :items="estatusLookup" item-title="tipo"
                  item-value="id_estatus" label="Estatus" :rules="[rules.required]" clearable></v-select>
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
                  label="Apoyo" :rules="[rules.required]" clearable @update:model-value="handleApoyoChange"></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field v-if="isApoyoTotal" v-model="editedProject.detalle_apoyo" label="Detalle Apoyo" readonly
                  :rules="[rules.required]"></v-text-field>
                <v-select v-else-if="isApoyoParcial" v-model="selectedTags" :items="tagsLookup" item-title="tag"
                  item-value="tag" label="Detalle Apoyo (Seleccione tags)" multiple chips clearable
                  :rules="[rules.requiredIfParcial]"></v-select>
                <v-text-field v-else v-model="editedProject.detalle_apoyo" label="Detalle Apoyo"
                  placeholder="Ingrese detalle de apoyo" clearable></v-text-field>
              </v-col>

              <!-- KTH ID - As it was commented out, I'm assuming it's a simple text input if it were to be added -->
              <!-- <v-col cols="12" sm="6">
                <v-text-field v-model.number="editedProject.id_kth" label="KTH ID" type="number"></v-text-field>
              </v-col> -->
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="flat" @click="saveProject">Guardar</v-btn>
          <v-btn color="grey-darken-1" variant="tonal" @click="closeDialog">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';

// URLs (removed duplicate URL block)
const url =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/crudo';
const urlAcademicos =
  'https://elysia-bunbackend-production.up.railway.app/funciones/academicosXProyecto';
const urlUnidades =
  'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlUpdateProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/';
const urlDeleteProyecto =
  'https://elysia-bunbackend-production.up.railway.app/proyectos/'; // Not used yet but kept
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

// Dialog state
const dialog = ref(false);
const editedProject = ref({});
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

// Form Validation
const valid = ref(true);
const form = ref(null);

const rules = {
  required: (value) => !!value || 'Campo requerido.',
  number: (value) =>
    (!isNaN(parseFloat(value)) && isFinite(value)) ||
    'Debe ser un número válido.',
  requiredIfParcial: (value) => {
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

// Pagination state
const page = ref(1);
const itemsPerPage = ref(10);

const pageCount = computed(() => {
  return Math.ceil(proyectosCrudo.value.length / itemsPerPage.value);
});

// Computed property to check if selected apoyo is 'TOTAL'
const isApoyoTotal = computed(() => {
  const totalApoyo = apoyosLookup.value.find((a) => a.nombre === 'TOTAL');
  return totalApoyo && editedProject.value.apoyo === totalApoyo.id_apoyo;
});

// Computed property to check if selected apoyo is 'PARCIAL'
const isApoyoParcial = computed(() => {
  const partialApoyo = apoyosLookup.value.find((a) => a.nombre === 'PARCIAL');
  return partialApoyo && editedProject.value.apoyo === partialApoyo.id_apoyo;
});

// Table headers for v-data-table
const headers = [
  { title: 'Nombre del Proyecto', key: 'nombre', minWidth: '200px' },
  { title: 'Monto', key: 'monto', align: 'end', minWidth: '120px' },
  { title: 'Fecha Postulación', key: 'fecha_postulacion', minWidth: '120px' },
  {
    title: 'Comentarios',
    key: 'comentarios',
    sortable: false,
    minWidth: '200px',
  },
  { title: 'Unidad', key: 'unidad', align: 'start', minWidth: '150px' },
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

// Function for formatting date for the form input (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    // Adjust for UTC if your API sends UTC and you want local date input
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  } catch (e) {
    console.error('Error formatting date for input:', e);
    return null;
  }
};

// Function for formatting date for table display (DD-MM-YYYY)
const formatDateDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha Inválida';
    }
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (e) {
    console.error('Error formatting date for display:', e);
    return 'Fecha Inválida';
  }
};

const getUnitName = (unitId) => {
  if (unitId === null || unitId === undefined) return '-';
  const item = unidadesLookup.value.find((u) => u.id_unidad === unitId);
  return item ? item.nombre : `ID Desconocido (${unitId})`;
};

const getEstatusName = (estatusId) => {
  if (estatusId === null || estatusId === undefined) return '-';
  const item = estatusLookup.value.find((e) => e.id_estatus === estatusId);
  return item ? item.tipo : `ID Desconocido (${estatusId})`; // Changed from .nombre to .tipo
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
  return projectAcademics ? projectAcademics.profesores : [];
};

// Dialog Functions
const editProject = (event, { item }) => {
  editedProject.value = { ...item }; // Shallow copy the item
  // Format date for the input field
  editedProject.value.fecha_postulacion = formatDateForInput(
    editedProject.value.fecha_postulacion,
  );

  // Handle detalle_apoyo parsing for selectedTags if Apoyo is PARCIAL
  if (
    getApoyoName(editedProject.value.apoyo) === 'PARCIAL' &&
    editedProject.value.detalle_apoyo
  ) {
    // Split by ', ' and trim each tag
    selectedTags.value = editedProject.value.detalle_apoyo
      .split(', ')
      .map((tag) => tag.trim());
  } else {
    selectedTags.value = [];
  }

  dialog.value = true;
  // Ensure the form's validation state is reset when dialog opens
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation();
    }
  });
};

const closeDialog = () => {
  dialog.value = false;
  editedProject.value = { ...defaultProject };
  selectedTags.value = [];
};

const handleApoyoChange = (newApoyoId) => {
  const newApoyoName = apoyosLookup.value.find(
    (a) => a.id_apoyo === newApoyoId,
  )?.nombre;

  if (newApoyoName === 'TOTAL') {
    editedProject.value.detalle_apoyo = 'TOTAL';
    selectedTags.value = [];
  } else if (newApoyoName === 'PARCIAL') {
    // If switching to PARCIAL, clear current text and selected tags
    editedProject.value.detalle_apoyo = null;
    selectedTags.value = [];
  } else {
    // If some other apoyo type or cleared
    editedProject.value.detalle_apoyo = null;
    selectedTags.value = [];
  }
  // This helps re-trigger validation for the dynamically shown/hidden fields
  nextTick(() => {
    if (form.value) {
      form.value.validate();
    }
  });
};

const saveProject = async () => {
  const { valid: formValid } = await form.value.validate();

  if (!formValid) {
    console.log('Form is invalid. Not saving.');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const projectToSave = { ...editedProject.value };

    // Finalize detalle_apoyo based on selectedTags for PARCIAL or fixed 'TOTAL'
    if (isApoyoParcial.value) {
      // Ensure the concatenated string is built from the selectedTags array
      projectToSave.detalle_apoyo = selectedTags.value.join(', ');
    } else if (isApoyoTotal.value) {
      projectToSave.detalle_apoyo = 'TOTAL';
    } else {
      // If it's not TOTAL or PARCIAL, ensure detalle_apoyo is what the user typed or null
      projectToSave.detalle_apoyo = projectToSave.detalle_apoyo || null;
    }

    // Convert empty strings to null for optional fields before sending to API
    for (const key in projectToSave) {
      if (projectToSave[key] === '') {
        projectToSave[key] = null;
      }
      // Special handling for numbers: ensure they are numbers or null
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
          // Catch empty strings from number inputs
          projectToSave[key] = null;
        }
      }
    }
    // API expects `fecha_postulacion` as ISO string with Z or just YYYY-MM-DD
    // If your backend specifically needs an ISO string with time (e.g., "2024-01-01T00:00:00.000Z"), adjust this:
    if (projectToSave.fecha_postulacion) {
      // Assuming formatDateForInput gives YYYY-MM-DD. Convert to ISO string.
      projectToSave.fecha_postulacion = new Date(
        projectToSave.fecha_postulacion,
      ).toISOString();
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
      const errorData = await response.json(); // Attempt to read error message from API
      throw new Error(
        `HTTP error! Status: ${response.status}. ${errorData.message || JSON.stringify(errorData) || ''
        }`,
      );
    }

    // Refresh the table data after successful update
    await fetchData();
    closeDialog();
  } catch (err) {
    error.value = err;
    console.error('Error saving project:', err);
    // You might want to display the error message in the dialog itself
    alert(`Error al guardar: ${err.message}`); // Simple alert for now
  } finally {
    loading.value = false;
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
    await parseResponse(institucionesResponse, institucionesLookup, 'instituciones');
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
</script>

<style scoped>
/* ==========================================================================
   Base Styles for Excel-like Table
   ========================================================================== */

/* Base container for the Vuetify data table, removing default shadow and adding a black border */
.excel-table.v-data-table {
  box-shadow: none !important;
  border: 1px solid #000;
  /* Borde principal de la tabla a negro */
}

/*
   The :deep() pseudo-element (or ::v-deep or >>>) is used to style child components
   that are not part of the current component's scope (shadow DOM).
   Vuetify components often render their internal elements in a way that requires
   deep selectors to style them.
*/

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
   Table Header Styles
   ========================================================================== */

.excel-table.v-data-table :deep(.v-data-table__thead th) {
  background-color: #f2f2f2;
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
   Table Body Styles
   ========================================================================== */

/* Alternating row colors (zebra stripping) */
.excel-table.v-data-table :deep(.v-data-table__tbody tr:nth-of-type(odd)) {
  background-color: #f9f9f9;
}

/* Hover effect for rows */
.excel-table.v-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: #e8f5e9 !important;
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
   Table Footer Styles
   ========================================================================== */

/* Pagination footer styling */
.excel-table.v-data-table :deep(.v-data-table__tfoot) {
  background-color: #f2f2f2;
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
   Tooltip Styles
   ========================================================================== */

.v-tooltip>.v-overlay__content {
  background-color: rgba(0, 0, 0, 0.8) !important;
  color: #fff !important;
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 4px;
}

/* ==========================================================================
   Responsive Adjustments (Media Queries)
   ========================================================================== */

@media (max-width: 768px) {

  .excel-table.v-data-table :deep(.v-data-table__thead th),
  .excel-table.v-data-table :deep(.v-data-table__tbody td) {
    font-size: 0.75rem;
    padding: 6px 8px;
  }
}
</style>