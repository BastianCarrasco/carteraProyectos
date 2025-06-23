<template>
    <v-dialog v-model="dialog" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline grey lighten-2 d-flex align-center">
                <span class="text-h6">Gestionar Datos de Listas</span>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pt-4">
                <v-tabs v-model="selectedTab" bg-color="primary" class="mb-4">
                    <v-tab value="unidades">Unidades</v-tab>
                    <v-tab value="tematicas">Temáticas</v-tab>
                    <v-tab value="estatus">Estatus</v-tab>
                    <v-tab value="tipoConvocatorias">Tipos de Convocatoria</v-tab>
                    <v-tab value="instituciones">Instituciones Convocatoria</v-tab>
                    <v-tab value="apoyos">Apoyos</v-tab>
                    <v-tab value="tags">Tags (Detalle Apoyo Parcial)</v-tab>
                </v-tabs>

                <v-window v-model="selectedTab">
                    <!-- Unidades Tab -->
                    <v-window-item value="unidades">
                        <LookupCrudSection :lookup-data="unidades" :headers="unidadesHeaders" item-id-key="id_unidad"
                            item-name-key="nombre"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/unidades/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/unidades/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/unidades/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/unidades/"
                            @data-updated="emitDataUpdated('unidades')" />
                    </v-window-item>

                    <!-- Temáticas Tab -->
                    <v-window-item value="tematicas">
                        <LookupCrudSection :lookup-data="tematicas" :headers="tematicasHeaders"
                            item-id-key="id_tematica" item-name-key="nombre"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/tematicas/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/tematicas/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/tematicas/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/tematicas/"
                            @data-updated="emitDataUpdated('tematicas')" />
                    </v-window-item>

                    <!-- Estatus Tab -->
                    <v-window-item value="estatus">
                        <LookupCrudSection :lookup-data="estatus" :headers="estatusHeaders" item-id-key="id_estatus"
                            item-name-key="tipo"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/estatus/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/estatus/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/estatus/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/estatus/"
                            @data-updated="emitDataUpdated('estatus')" />
                    </v-window-item>

                    <!-- Tipo Convocatorias Tab -->
                    <v-window-item value="tipoConvocatorias">
                        <LookupCrudSection :lookup-data="tipoConvocatorias" :headers="tipoConvocatoriasHeaders"
                            item-id-key="id" item-name-key="nombre"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/tipo-convo/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/tipo-convo/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/tipo-convo/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/tipo-convo/"
                            @data-updated="emitDataUpdated('tipoConvocatorias')" />
                    </v-window-item>

                    <!-- Instituciones Convocatoria Tab -->
                    <v-window-item value="instituciones">
                        <LookupCrudSection :lookup-data="instituciones" :headers="institucionesHeaders" item-id-key="id"
                            item-name-key="nombre"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/inst-convo/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/inst-convo/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/inst-convo/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/inst-convo/"
                            @data-updated="emitDataUpdated('instituciones')" />
                    </v-window-item>

                    <!-- Apoyos Tab -->
                    <v-window-item value="apoyos">
                        <LookupCrudSection :lookup-data="apoyos" :headers="apoyosHeaders" item-id-key="id_apoyo"
                            item-name-key="nombre"
                            fetch-url="https://elysia-bunbackend-production.up.railway.app/apoyos/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/apoyos/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/apoyos/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/apoyos/"
                            @data-updated="emitDataUpdated('apoyos')" />
                    </v-window-item>

                    <!-- Tags Tab -->
                    <v-window-item value="tags">
                        <LookupCrudSection :lookup-data="tags" :headers="tagsHeaders" item-id-key="id_tag"
                            item-name-key="tag" fetch-url="https://elysia-bunbackend-production.up.railway.app/tags/"
                            create-url="https://elysia-bunbackend-production.up.railway.app/tags/"
                            update-url="https://elysia-bunbackend-production.up.railway.app/tags/"
                            delete-url="https://elysia-bunbackend-production.up.railway.app/tags/"
                            @data-updated="emitDataUpdated('tags')" />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
                <v-btn color="grey-darken-1" variant="tonal" @click="closeDialog">Cerrar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import LookupCrudSection from './LookupCrudSection.vue'; // This will be our sub-component

// Define props to receive initial lookup data from parent
const props = defineProps({
    unidadesLookup: Array,
    tematicasLookup: Array,
    estatusLookup: Array,
    tipoConvocatoriasLookup: Array,
    institucionesLookup: Array,
    apoyosLookup: Array,
    tagsLookup: Array,
});

// Emit events to the parent when data is updated
const emit = defineEmits(['data-updated', 'close-modal']);

const dialog = ref(false);
const selectedTab = ref('unidades'); // Default selected tab

// Local reactive copies of props data
const unidades = ref([]);
const tematicas = ref([]);
const estatus = ref([]);
const tipoConvocatorias = ref([]);
const instituciones = ref([]);
const apoyos = ref([]);
const tags = ref([]);

// Headers for each lookup table (minimal, showing only 'Nombre'/'Tipo' and 'Acciones')
const unidadesHeaders = [{ title: 'Nombre', key: 'nombre' }, { title: 'Acciones', key: 'actions', sortable: false }];
const tematicasHeaders = [{ title: 'Nombre', key: 'nombre' }, { title: 'Acciones', key: 'actions', sortable: false }];
const estatusHeaders = [{ title: 'Tipo', key: 'tipo' }, { title: 'Acciones', key: 'actions', sortable: false }];
const tipoConvocatoriasHeaders = [{ title: 'Nombre', key: 'nombre' }, { title: 'Acciones', key: 'actions', sortable: false }];
const institucionesHeaders = [{ title: 'Nombre', key: 'nombre' }, { title: 'Acciones', key: 'actions', sortable: false }];
const apoyosHeaders = [{ title: 'Nombre', key: 'nombre' }, { title: 'Acciones', key: 'actions', sortable: false }];
const tagsHeaders = [{ title: 'Tag', key: 'tag' }, { title: 'Acciones', key: 'actions', sortable: false }];

// Watch props and update local refs when props change (e.g., after parent refetches)
watch(props, (newProps) => {
    unidades.value = newProps.unidadesLookup;
    tematicas.value = newProps.tematicasLookup;
    estatus.value = newProps.estatusLookup;
    tipoConvocatorias.value = newProps.tipoConvocatoriasLookup;
    instituciones.value = newProps.institucionesLookup;
    apoyos.value = newProps.apoyosLookup;
    tags.value = newProps.tagsLookup;
}, { immediate: true });

const openDialog = () => {
    dialog.value = true;
};

const closeDialog = () => {
    dialog.value = false;
    emit('close-modal');
};

const emitDataUpdated = (lookupType) => {
    // Emit a generic event or specific ones if needed by parent
    console.log(`Data for ${lookupType} updated, requesting parent to refetch.`);
    emit('data-updated', lookupType);
};

// Expose openDialog function to parent using `defineExpose`
defineExpose({
    openDialog,
});
</script>

<style scoped>
/* Scoped styles for this component if needed */
</style>