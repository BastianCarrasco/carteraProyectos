<!-- src/components/CreateProjectModal.vue -->
<template>
    <v-dialog v-model="dialog" max-width="900px" persistent>
        <v-card>
            <v-card-title class="headline grey lighten-2 d-flex align-center">
                <span class="text-h6">Crear Nuevo Proyecto</span>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pt-4">
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="newProject.nombre" label="Nombre del Proyecto"
                                :rules="[rules.required]"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <!-- Monto can be empty/null and default to 1 on backend -->
                            <v-text-field v-model.number="newProject.monto" label="Monto" type="number"
                                :rules="[rules.number, rules.positiveNumber]" prefix="$" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="newProject.fecha_postulacion" label="Fecha de Postulación"
                                type="date" hint="Formato AAAA-MM-DD" persistent-hint clearable></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-textarea v-model="newProject.comentarios" label="Comentarios" rows="3"
                                clearable></v-textarea>
                        </v-col>

                        <v-col cols="12" sm="6" md="4">
                            <!-- All these selects can be empty/null and default to 1 on backend -->
                            <v-select v-model="newProject.unidad" :items="unidadesLookup" item-title="nombre"
                                item-value="id_unidad" label="Unidad" clearable></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="newProject.id_tematica" :items="tematicasLookup" item-title="nombre"
                                item-value="id_tematica" label="Temática" clearable></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="newProject.id_estatus" :items="estatusLookup" item-title="tipo"
                                item-value="id_estatus" label="Estatus" clearable></v-select>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="newProject.convocatoria" label="Convocatoria"
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="newProject.tipo_convocatoria" :items="tipoConvocatoriasLookup"
                                item-title="nombre" item-value="id" label="Tipo Convocatoria" clearable></v-select>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="newProject.inst_conv" :items="institucionesLookup" item-title="nombre"
                                item-value="id" label="Institución Convocatoria" clearable></v-select>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                            <v-select v-model="newProject.apoyo" :items="apoyosLookup" item-title="nombre"
                                item-value="id_apoyo" label="Apoyo" clearable
                                @update:model-value="handleApoyoChange"></v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-if="isApoyoTotal" v-model="newProject.detalle_apoyo" label="Detalle Apoyo"
                                readonly></v-text-field>
                            <v-select v-else-if="isApoyoParcial" v-model="selectedTags" :items="tagsLookup"
                                item-title="tag" item-value="tag" label="Detalle Apoyo (Seleccione tags)" multiple chips
                                clearable :rules="[rules.requiredIfParcial]"></v-select>
                            <v-text-field v-else v-model="newProject.detalle_apoyo" label="Detalle Apoyo"
                                placeholder="Ingrese detalle de apoyo" clearable></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-divider class="my-4"></v-divider>
                            <h3 class="text-subtitle-1 mb-2">Académicos Participantes</h3>

                            <v-select v-model="selectedJefeAcademicoId" :items="academicosLookup"
                                item-title="nombreCompleto" item-value="id_academico"
                                label="Académico Jefe de Proyecto (Obligatorio)" :rules="[rules.requiredJefeAcademico]"
                                clearable></v-select>

                            <v-select v-model="selectedAcademicosIds" :items="academicosLookupFiltered"
                                item-title="nombreCompleto" item-value="id_academico"
                                label="Otros Académicos Participantes (Opcional)" multiple chips clearable
                                :hint="`Académico Jefe seleccionado: ${selectedJefeAcademicoName}`"
                                persistent-hint></v-select>
                            <!-- Error message for academic selection -->
                            <div v-if="!hasAnyAcademicSelected && !selectedJefeAcademicoId"
                                class="text-caption text-error mt-2">
                                Debe seleccionar al menos un académico (jefe o participante).
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
                <v-btn color="primary" variant="flat" @click="createProject">Crear</v-btn>
                <v-btn color="grey-darken-1" variant="tonal" @click="closeDialog">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, defineEmits } from 'vue';

// Define emits for parent communication
const emits = defineEmits(['project-created', 'close-modal']);

// URLs for lookups and creation
const urlCrearProyecto =
    'https://elysia-bunbackend-production.up.railway.app/funciones/crearProyectoConAcademicos';
const urlUnidades =
    'https://elysia-bunbackend-production.up.railway.app/unidades/';
const urlEstatus =
    'https://elysia-bunbackend-production.up.railway.app/estatus/';
const urlInstituciones =
    'https://elysia-bunbackend-production.up.railway.app/inst-convo/';
const urlApoyos =
    'https://elysia-bunbackend-production.up.railway.app/apoyos/';
const urlTematicas =
    'https://elysia-bunbackend-production.up.railway.app/tematicas/';
const urlTags =
    'https://elysia-bunbackend-production.up.railway.app/tags/';
const urlTipoConvocatorias =
    'https://elysia-bunbackend-production.up.railway.app/tipo-convo/';
const urlAcademicos =
    'https://elysia-bunbackend-production.up.railway.app/academicos/';

// Component-specific reactive data
const dialog = ref(false); // Controls modal visibility

// Initialize fields with values that will become backend's default (1 or '') if not explicitly set by user.
// This is for V-MODEL binding. Actual payload mapping happens in createProject.
const newProject = ref({
    nombre: '',
    monto: null, // Start as null to allow number input to be empty
    fecha_postulacion: null,
    comentarios: '',
    unidad: null, // Start as null/empty for select
    id_tematica: null,
    id_estatus: null,
    tipo_convocatoria: null,
    inst_conv: null,
    detalle_apoyo: '',
    apoyo: null,
    convocatoria: '',
});

const selectedTags = ref([]); // For 'PARCIAL' apoyo type
const selectedJefeAcademicoId = ref(null); // Stores the ID of the selected 'jefe' academic
const selectedAcademicosIds = ref([]); // Stores IDs of other selected academics

// Lookup data
const unidadesLookup = ref([]);
const estatusLookup = ref([]);
const institucionesLookup = ref([]);
const apoyosLookup = ref([]);
const tematicasLookup = ref([]);
const tipoConvocatoriasLookup = ref([]);
const tagsLookup = ref([]);
const academicosRaw = ref([]); // Raw academic data from API

// Computed property to format academic names for display in selects
const academicosLookup = computed(() => {
    return academicosRaw.value.map((academic) => ({
        ...academic,
        nombreCompleto: `${academic.nombre} ${academic.a_paterno} ${academic.a_materno}`,
    }));
});

// Filtered academics for the "Otros Académicos" select, excluding the jefe
const academicosLookupFiltered = computed(() => {
    if (!selectedJefeAcademicoId.value) {
        return academicosLookup.value;
    }
    return academicosLookup.value.filter(
        (academic) => academic.id_academico !== selectedJefeAcademicoId.value,
    );
});

// Display name for the selected jefe
const selectedJefeAcademicoName = computed(() => {
    const jefe = academicosLookup.value.find(
        (a) => a.id_academico === selectedJefeAcademicoId.value,
    );
    return jefe ? jefe.nombreCompleto : 'Ninguno';
});

// Computed property to check if at least one academic (jefe or other) is selected
const hasAnyAcademicSelected = computed(() => {
    return (
        selectedJefeAcademicoId.value !== null || selectedAcademicosIds.value.length > 0
    );
});

// Form validation
const valid = ref(true);
const form = ref(null);

const rules = {
    required: (value) => !!value || 'Campo requerido.',
    // 'number' and 'positiveNumber' are now optional for 'monto' if not filled
    number: (value) =>
        value === null || // v-model.number returns null for empty
        value === '' || // v-text-field without .number returns '' for empty
        (!isNaN(parseFloat(value)) && isFinite(value)) ||
        'Debe ser un número válido.',
    positiveNumber: (value) =>
        value === null || // v-model.number returns null for empty
        value === '' || // v-text-field without .number returns '' for empty
        parseFloat(value) >= 0 || // Changed to >= 0 as 1 is a valid default for monto
        'Debe ser un número positivo o cero.',
    requiredIfParcial: (value) => {
        const partialApoyo = apoyosLookup.value.find(
            (a) => a.nombre === 'Parcial',
        );
        const isPartialApoyoSelected =
            partialApoyo && newProject.value.apoyo === partialApoyo.id_apoyo;

        if (isPartialApoyoSelected) {
            return (
                (Array.isArray(value) && value.length > 0) ||
                'Debe seleccionar al menos un tag si el apoyo es Parcial.'
            );
        }
        return true;
    },
    requiredJefeAcademico: (value) =>
        (!!value || selectedAcademicosIds.value.length > 0) ||
        'Debe seleccionar un académico jefe o añadir otros participantes.',
};

// Computed properties for Apoyo type
const isApoyoTotal = computed(() => {
    const totalApoyo = apoyosLookup.value.find((a) => a.nombre === 'Total');
    return totalApoyo && newProject.value.apoyo === totalApoyo.id_apoyo;
});

const isApoyoParcial = computed(() => {
    const partialApoyo = apoyosLookup.value.find((a) => a.nombre === 'Parcial');
    return partialApoyo && newProject.value.apoyo === partialApoyo.id_apoyo;
});

// Watcher to clear other academics if the jefe academic changes and is among them
watch(selectedJefeAcademicoId, (newJefeId) => {
    if (newJefeId !== null) {
        // If the new jefe ID is present in selectedAcademicosIds, remove it
        selectedAcademicosIds.value = selectedAcademicosIds.value.filter(
            (id) => id !== newJefeId,
        );
    }
    // This helps re-trigger validation for the academic section
    nextTick(() => {
        if (form.value) {
            form.value.validate();
        }
    });
});

// Watcher for other academics to re-validate academic section
watch(selectedAcademicosIds, () => {
    nextTick(() => {
        if (form.value) {
            form.value.validate();
        }
    });
});

// Functions
const openDialog = () => {
    // Reset form and data when opening, setting non-required fields to initial null/empty state
    // so they are handled by the payload construction logic in createProject.
    Object.assign(newProject.value, {
        nombre: '',
        monto: null, // Allow empty input
        fecha_postulacion: null,
        comentarios: '',
        unidad: null,
        id_tematica: null,
        id_estatus: null,
        tipo_convocatoria: null,
        inst_conv: null,
        detalle_apoyo: '',
        apoyo: null,
        convocatoria: '',
    });
    selectedTags.value = [];
    selectedJefeAcademicoId.value = null;
    selectedAcademicosIds.value = [];

    dialog.value = true;
    nextTick(() => {
        if (form.value) {
            form.value.resetValidation();
        }
    });
};

const closeDialog = () => {
    dialog.value = false;
    emits('close-modal'); // Emit event to notify parent to close
};

const handleApoyoChange = (newApoyoId) => {
    const newApoyoName = apoyosLookup.value.find(
        (a) => a.id_apoyo === newApoyoId,
    )?.nombre;

    if (newApoyoName === 'Total') {
        newProject.value.detalle_apoyo = 'Total';
        selectedTags.value = [];
    } else if (newApoyoName === 'Parcial') {
        newProject.value.detalle_apoyo = ''; // Reset to empty string for partial, then tags will fill
        selectedTags.value = [];
    } else {
        newProject.value.detalle_apoyo = ''; // Reset to empty string for other/cleared
        selectedTags.value = [];
    }
    nextTick(() => {
        if (form.value) {
            form.value.validate();
        }
    });
};

const fetchDataForLookups = async () => {
    try {
        const [
            unitsResponse,
            estatusResponse,
            institucionesResponse,
            apoyosResponse,
            tematicasResponse,
            tipoConvocatoriasResponse,
            tagsResponse,
            academicosResponse,
        ] = await Promise.all([
            fetch(urlUnidades),
            fetch(urlEstatus),
            fetch(urlInstituciones),
            fetch(urlApoyos),
            fetch(urlTematicas),
            fetch(urlTipoConvocatorias),
            fetch(urlTags),
            fetch(urlAcademicos),
        ]);

        const parseResponse = async (response, dataRef, name) => {
            if (!response.ok) {
                throw new Error(
                    `HTTP error! Status: ${response.status} for ${name} lookup.`,
                );
            }
            dataRef.value = await response.json();
        };

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
        await parseResponse(tagsResponse, tagsLookup, 'tags');
        await parseResponse(academicosResponse, academicosRaw, 'académicos');
    } catch (err) {
        console.error('Error fetching lookup data for Create Project Modal:', err);
        // You might want to display a more prominent error to the user
    }
};

const createProject = async () => {
    // Validate the form (this will check required fields like 'nombre' and conditional ones)
    const { valid: formValid } = await form.value.validate();

    // Custom validation for academics: ensure at least one academic (jefe or other) is selected.
    if (!hasAnyAcademicSelected.value) {
        // This 'alert' is a fallback; the `requiredJefeAcademico` rule should ideally catch this.
        // But for clarity, we keep an explicit check before sending.
        alert('Debe seleccionar al menos un académico (jefe o participante).');
        console.log('No academics selected. Cannot create project.');
        return; // Stop execution if this critical validation fails
    }

    // If formValid is false after checking all rules, stop here.
    // This covers 'nombre' being empty and any other field rule violations.
    if (!formValid) {
        console.log('Form has validation errors. Please correct them.');
        return;
    }

    // Construct the academics array
    const projectAcademics = [];

    // Add the jefe academic if selected
    if (selectedJefeAcademicoId.value) {
        projectAcademics.push({
            id: selectedJefeAcademicoId.value,
            jefe: 1, // Indicate this is the head academic
        });
    }

    // Add other selected academics, ensuring the jefe is not duplicated
    selectedAcademicosIds.value.forEach((id) => {
        if (id !== selectedJefeAcademicoId.value) {
            projectAcademics.push({
                id: id,
                jefe: 0, // Indicate this is not the head academic
            });
        }
    });

    const projectData = { ...newProject.value };

    // --- REVISED LOGIC FOR HANDLING OPTIONAL FIELDS AND BACKEND DEFAULTS ---

    // 1. Handle `detalle_apoyo` (special logic for TOTAL/PARCIAL, then default to empty string)
    if (isApoyoParcial.value) {
        projectData.detalle_apoyo = selectedTags.value.join(', ');
    } else if (isApoyoTotal.value) {
        projectData.detalle_apoyo = 'Total';
    } else {
        // If it's not TOTAL or PARCIAL, ensure it's an empty string if null/undefined/empty
        projectData.detalle_apoyo = projectData.detalle_apoyo || '';
    }

    // 2. Handle `fecha_postulacion` (explicitly null if empty)
    if (projectData.fecha_postulacion) {
        // If your backend specifically needs "YYYY-MM-DDT00:00:00.000Z", ensure it's converted correctly.
        // For 'date' type input, it's typically 'YYYY-MM-DD'. Converting to ISO string is good.
        projectData.fecha_postulacion = new Date(
            projectData.fecha_postulacion,
        ).toISOString();
    } else {
        projectData.fecha_postulacion = null; // Ensure it's explicitly null if not provided
    }

    // 3. Handle numeric ID fields (default to 1 if not provided/cleared, or 0 for monto if desired)
    // The backend expects 1 for these IDs if not provided.
    const numericIdFieldsDefaultOne = [
        'unidad',
        'id_tematica',
        'id_estatus',
        'tipo_convocatoria',
        'inst_conv',
        'apoyo',
    ];
    numericIdFieldsDefaultOne.forEach((key) => {
        // Check if value is null, undefined, or empty string (common for cleared selects/number inputs)
        if (projectData[key] === null || projectData[key] === undefined || projectData[key] === '') {
            projectData[key] = 1; // Default to 1
        } else {
            projectData[key] = Number(projectData[key]); // Ensure it's a number
        }
    });

    // Special handling for 'monto' if 0 is an acceptable default or if it can be left empty
    // Based on your previous description, 1 was also a default, but 0 makes more sense for money.
    // If you intend for 0 to be the default for monto, make sure your backend accepts 0.
    if (projectData.monto === null || projectData.monto === undefined || projectData.monto === '') {
        projectData.monto = 0; // Default monto to 0 if not provided
    } else {
        projectData.monto = Number(projectData.monto);
    }
    // Note: The `positiveNumber` rule was adjusted to `parseFloat(value) >= 0` to allow 0.

    // 4. Handle other string fields (default to empty string if not provided/cleared)
    const stringFieldsDefaultEmpty = ['comentarios', 'convocatoria'];
    stringFieldsDefaultEmpty.forEach((key) => {
        // If the value is null or undefined (e.g., from clearable textarea/text-field)
        if (projectData[key] === null || projectData[key] === undefined) {
            projectData[key] = ''; // Set to backend's default empty string
        }
        // If it's already an empty string from user input, it remains empty.
    });

    // The 'nombre' field is already handled by `newProject.nombre: ''` initialization and `rules.required`.

    // Add the academics array to the project data
    projectData.academicos = projectAcademics;

    // --- CONSOLE LOG THE PAYLOAD HERE (for debugging) ---
    console.log('Project data payload for POST request:', JSON.stringify(projectData, null, 2));
    // --- END CONSOLE LOG ---

    try {
        const response = await fetch(urlCrearProyecto, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `HTTP error! Status: ${response.status}. ${errorData.message || JSON.stringify(errorData) || ''
                }`,
            );
        }

        const result = await response.json();
        console.log('Project created successfully:', result);
        emits('project-created'); // Emit success event
        closeDialog(); // Close modal on success
    } catch (err) {
        console.error('Error creating project:', err);
        alert(`Error al crear proyecto: ${err.message}`); // Simple alert for now
    }
};

onMounted(fetchDataForLookups);

// Expose openDialog to parent component (via template ref)
defineExpose({
    openDialog,
});
</script>

<style scoped>
/*
   Styles specific to this modal if needed, but for general Vuetify elements
   like text fields, selects, etc., the global Vuetify styles usually suffice.
*/
.v-dialog .v-card-title {
    /* Ensure the title background matches, for consistency */
    background-color: #f5f5f5;
    /* lighten-2 is approximately this color */
}
</style>