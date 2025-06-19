<template>
    <div class="modal-overlay">
        <div class="modal-content-lg">
            <h3>Editar Proyecto: {{ editedProjectData?.nombre }}</h3>
            <form @submit.prevent="saveChanges">
                <div class="modal-form-group">
                    <label for="edit-nombre">Nombre:</label>
                    <input id="edit-nombre" v-model="editedProjectData.nombre" required />
                </div>

                <div class="modal-form-group">
                    <label for="edit-tematica">Temática:</label>
                    <select id="edit-tematica" v-model="editedProjectData.tematica">
                        <option v-for="tematica in tematicasOptions" :key="tematica.id_tematica"
                            :value="tematica.id_tematica">
                            {{ tematica.nombre }}
                        </option>
                    </select>
                </div>

                <div class="modal-form-group">
                    <label for="edit-estatus">Estatus:</label>
                    <select id="edit-estatus" v-model="editedProjectData.estatus">
                        <option v-for="est in estatusOptions" :key="est.id_estatus" :value="est.id_estatus">
                            {{ est.tipo }}
                        </option>
                    </select>
                </div>

                <div class="modal-form-group">
                    <label for="edit-apoyo">Apoyo:</label>
                    <select id="edit-apoyo" v-model="editedProjectData.apoyo">
                        <option v-for="apoyo in apoyosOptions" :key="apoyo.id_apoyo" :value="apoyo.id_apoyo">
                            {{ apoyo.nombre }}
                        </option>
                    </select>
                </div>

                <div class="modal-form-group">
                    <label for="edit-detalle-apoyo">Detalle de Apoyo:</label>
                    <input v-if="getApoyoNombre(editedProjectData.apoyo) === 'TOTAL'"
                        v-model="editedProjectData.detalle_apoyo" readonly class="readonly-input" />
                    <div v-else-if="getApoyoNombre(editedProjectData.apoyo) === 'PARCIAL'" class="tags-input-group">
                        <input type="text" :value="editedProjectData.detalle_apoyo" readonly
                            placeholder="Seleccionar tags..." class="readonly-input" />
                        <button type="button" @click="openTagsModal" class="boton-seleccionar-tags">
                            Seleccionar Tags
                        </button>
                    </div>
                    <input v-else v-model="editedProjectData.detalle_apoyo" />
                </div>

                <div class="modal-form-group">
                    <label for="edit-monto">Monto:</label>
                    <input id="edit-monto" type="number" v-model.number="editedProjectData.monto" />
                </div>

                <div class="modal-form-group">
                    <label>Unidad:</label>
                    <div class="unidad-select-group">
                        <select v-model="editedProjectData.selectedParentUnitId" @change="loadSubUnitsForEdit"
                            class="parent-unit-select">
                            <option value="">Seleccione una unidad padre</option>
                            <option v-for="unidad in unidadesPadre" :key="unidad.id_unidad" :value="unidad.id_unidad">
                                {{ unidad.nombre }}
                            </option>
                        </select>
                        <select v-if="currentSubUnits.length > 0" v-model="editedProjectData.unidad"
                            class="sub-unit-select">
                            <option value="">Seleccione una sub-unidad</option>
                            <option v-for="sub in currentSubUnits" :key="sub.id_unidad" :value="sub.nombre">
                                {{ sub.nombre }}
                            </option>
                        </select>
                        <div v-if="
                            editedProjectData.selectedParentUnitId &&
                            currentSubUnits.length === 0
                        ">
                            <input type="radio" :id="'radio-unidad-padre-' + editedProjectData.selectedParentUnitId"
                                :value="getUnidadNombre(editedProjectData.selectedParentUnitId)"
                                v-model="editedProjectData.unidad" />
                            <label :for="'radio-unidad-padre-' + editedProjectData.selectedParentUnitId">
                                {{ getUnidadNombre(editedProjectData.selectedParentUnitId) }}
                                (Unidad Final)
                            </label>
                        </div>
                    </div>
                </div>

                <div class="modal-form-group">
                    <label for="edit-convocatoria">Convocatoria:</label>
                    <input id="edit-convocatoria" v-model="editedProjectData.convocatoria" />
                </div>

                <div class="modal-form-group">
                    <label for="edit-fecha-postulacion">Fecha Postulación:</label>
                    <input id="edit-fecha-postulacion" type="date" v-model="editedProjectData.fecha_postulacion" />
                </div>

                <div class="modal-form-group">
                    <label for="edit-institucion">Institución:</label>
                    <select id="edit-institucion" v-model="editedProjectData.institucion">
                        <option v-for="inst in institucionesOptions" :key="inst.id" :value="inst.id">
                            {{ inst.nombre }}
                        </option>
                    </select>
                </div>

                <div class="modal-form-group">
                    <label for="edit-comentarios">Comentario:</label>
                    <textarea id="edit-comentarios" v-model="editedProjectData.comentarios"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="submit" class="boton-guardar">Guardar Cambios</button>
                    <button type="button" @click="$emit('cancel-edit')" class="boton-cancelar">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para la selección de Tags -->
    <TagsSelectionModal v-if="showTagsModal" :tags-options="tagsOptions" :initial-selected-tags="tempSelectedTags"
        @select-tags="handleTagsSelected" @cancel-selection="cancelTagsSelection" />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import TagsSelectionModal from './TagsSelectionModal.vue'; // Importa el sub-componente de tags

const props = defineProps({
    project: {
        type: Object,
        required: true,
    },
    unidades: {
        type: Array,
        required: true,
    },
    unidadesPadre: {
        type: Array,
        required: true,
    },
    estatusOptions: {
        type: Array,
        required: true,
    },
    institucionesOptions: {
        type: Array,
        required: true,
    },
    apoyosOptions: {
        type: Array,
        required: true,
    },
    tematicasOptions: {
        type: Array,
        required: true,
    },
    tagsOptions: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['save-changes', 'cancel-edit']);

// Mueve TODAS las funciones de utilidad aquí, al PRINCIPIO
const getEstatusNombre = (idEstatus) => {
    const est = props.estatusOptions.find((e) => e.id_estatus === idEstatus);
    return est ? est.tipo : idEstatus;
};

const getInstitucionNombre = (idInstitucion) => {
    const inst = props.institucionesOptions.find((i) => i.id === idInstitucion);
    return inst ? inst.nombre : idInstitucion;
};

const getApoyoNombre = (idApoyo) => {
    const apoyo = props.apoyosOptions.find((a) => a.id_apoyo === idApoyo);
    return apoyo ? apoyo.nombre : '';
};

const getTematicaNombre = (idTematica) => {
    const tematica = props.tematicasOptions.find(
        (t) => t.id_tematica === idTematica,
    );
    return tematica ? tematica.nombre : idTematica;
};

const getUnidadNombre = (idUnidad) => {
    const unidad = props.unidades.find((u) => u.id_unidad === idUnidad);
    return unidad ? unidad.nombre : idUnidad;
};

// Después de las funciones de utilidad, viene el resto del estado reactivo y la lógica
const editedProjectData = ref(JSON.parse(JSON.stringify(props.project)));
const currentSubUnits = ref([]);
const showTagsModal = ref(false);
const selectedTags = ref([]);
const tempSelectedTags = ref([]);

// Resto de tu lógica de inicialización y watchers

// Inicialización de la fecha para el input type="date"
if (editedProjectData.value.fecha_postulacion) {
    const date = new Date(editedProjectData.value.fecha_postulacion);
    editedProjectData.value.fecha_postulacion = date.toISOString().split('T')[0];
}

// Lógica para preseleccionar la unidad y su padre al abrir el modal
const initializeUnitSelection = () => {
    const currentUnit = props.unidades.find(
        (u) => u.nombre === editedProjectData.value.unidad,
    );
    if (currentUnit) {
        if (currentUnit.parent_id) {
            editedProjectData.value.selectedParentUnitId = currentUnit.parent_id;
            currentSubUnits.value = props.unidades.filter(
                (u) => u.parent_id === currentUnit.parent_id,
            );
        } else {
            editedProjectData.value.selectedParentUnitId = currentUnit.id_unidad;
            currentSubUnits.value = [];
        }
    } else {
        editedProjectData.value.selectedParentUnitId = '';
        editedProjectData.value.unidad = '';
        currentSubUnits.value = [];
    }
};
initializeUnitSelection();

// Lógica para inicializar tags para el modal anidado
const initializeTags = () => {
    // Ahora getApoyoNombre ya está definida
    const apoyoNombre = getApoyoNombre(editedProjectData.value.apoyo);
    if (apoyoNombre === 'PARCIAL') {
        if (
            editedProjectData.value.detalle_apoyo &&
            typeof editedProjectData.value.detalle_apoyo === 'string'
        ) {
            selectedTags.value = editedProjectData.value.detalle_apoyo
                .split(', ')
                .map((tagText) => {
                    const tag = props.tagsOptions.find((t) => t.tag === tagText);
                    return tag ? tag.id_apoyo : null;
                })
                .filter((id) => id !== null);
        } else {
            selectedTags.value = [];
        }
    } else {
        selectedTags.value = [];
    }
};
initializeTags();

const updateDetalleApoyoFromTags = () => {
    if (selectedTags.value.length > 0) {
        editedProjectData.value.detalle_apoyo = selectedTags.value
            .map((id) => props.tagsOptions.find((tag) => tag.id_apoyo === id)?.tag)
            .filter((tag) => tag !== undefined)
            .join(', ');
    } else if (getApoyoNombre(editedProjectData.value.apoyo) === 'PARCIAL') {
        editedProjectData.value.detalle_apoyo = '';
    }
};

watch(
    () => editedProjectData.value?.apoyo,
    (newApoyoId) => {
        if (editedProjectData.value) {
            const apoyoNombre = getApoyoNombre(newApoyoId);
            if (apoyoNombre === 'TOTAL') {
                editedProjectData.value.detalle_apoyo = 'TOTAL';
                selectedTags.value = [];
                tempSelectedTags.value = [];
            } else if (apoyoNombre === 'PARCIAL') {
                if (
                    editedProjectData.value.detalle_apoyo &&
                    typeof editedProjectData.value.detalle_apoyo === 'string' &&
                    editedProjectData.value.detalle_apoyo !== 'TOTAL'
                ) {
                    selectedTags.value = editedProjectData.value.detalle_apoyo
                        .split(', ')
                        .map((tagText) => {
                            const tag = props.tagsOptions.find((t) => t.tag === tagText);
                            return tag ? tag.id_apoyo : null;
                        })
                        .filter((id) => id !== null);
                } else {
                    selectedTags.value = [];
                }
                updateDetalleApoyoFromTags();
            } else {
                editedProjectData.value.detalle_apoyo = '';
                selectedTags.value = [];
                tempSelectedTags.value = [];
            }
        }
    },
    { deep: true },
);

watch(
    selectedTags,
    () => {
        if (
            editedProjectData.value &&
            getApoyoNombre(editedProjectData.value.apoyo) === 'PARCIAL'
        ) {
            updateDetalleApoyoFromTags();
        }
    },
    { deep: true },
);

const openTagsModal = () => {
    tempSelectedTags.value = [...selectedTags.value];
    showTagsModal.value = true;
};

const handleTagsSelected = (selectedTagIds) => {
    selectedTags.value = selectedTagIds;
    updateDetalleApoyoFromTags();
    showTagsModal.value = false;
};

const cancelTagsSelection = () => {
    showTagsModal.value = false;
};

const saveChanges = () => {
    // Aquí, emitimos el evento al padre con los datos finales del proyecto
    // El padre se encargará de la lógica de la API
    emit('save-changes', editedProjectData.value);
};
</script>