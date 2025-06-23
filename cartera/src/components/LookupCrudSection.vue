<template>
    <v-container fluid class="pa-0">
        <v-row class="mb-4 align-center">
            <v-col cols="12" sm="6">
                <v-text-field v-model="newItemName" :label="`Nuevo ${itemNameKeyDisplay}`" variant="outlined"
                    density="compact" hide-details :rules="[rules.required]"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex align-center">
                <v-btn color="primary" @click="addItem" :loading="loading" class="add-button">
                    <v-icon left>mdi-plus</v-icon>
                    Agregar
                </v-btn>
            </v-col>
        </v-row>

        <v-alert v-if="error" type="error" prominent border="start" variant="tonal" class="mb-4">
            Error: {{ error.message || error }}
        </v-alert>

        <v-data-table :headers="headers" :items="lookupData" :item-value="itemIdKey" class="elevation-1 lookup-table"
            density="compact" :loading="loading" loading-text="Cargando..." no-data-text="No hay datos disponibles.">
            <template v-slot:item.actions="{ item }">
                <v-btn size="small" variant="flat" color="green" class="action-button edit-button mr-1"
                    @click="editItem(item)"> EDITAR
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn size="small" variant="flat" color="error" class="action-button delete-button"
                    @click="confirmDeleteItem(item)">ELIMINAR
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </template>
        </v-data-table>

        <!-- Edit Dialog -->
        <v-dialog v-model="editDialog" max-width="500px" persistent>
            <v-card>
                <v-card-title class="headline grey lighten-2">Editar {{ itemNameKeyDisplay }}</v-card-title>
                <v-card-text class="pt-4">
                    <v-text-field v-model="editedItemName" :label="itemNameKeyDisplay" :rules="[rules.required]"
                        variant="outlined" density="compact" hide-details></v-text-field>
                </v-card-text>
                <v-card-actions class="justify-end pa-4">
                    <v-btn color="primary" variant="flat" @click="saveItem" :loading="loading">Guardar</v-btn>
                    <v-btn color="grey-darken-1" variant="tonal" @click="closeEditDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteConfirmDialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">Confirmar Eliminación</v-card-title>
                <v-card-text>
                    ¿Está seguro de que desea eliminar "{{ itemToDeleteName }}"?
                    Esta acción no se puede deshacer.
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn color="grey-darken-1" variant="tonal" @click="cancelDelete">Cancelar</v-btn>
                    <v-btn color="red-darken-2" variant="flat" @click="executeDelete"
                        :loading="loading">Eliminar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    lookupData: {
        type: Array,
        required: true,
    },
    headers: {
        type: Array,
        required: true,
    },
    itemIdKey: {
        type: String,
        required: true,
    },
    itemNameKey: {
        type: String,
        required: true,
    },
    fetchUrl: String,
    createUrl: String,
    updateUrl: String,
    deleteUrl: String,
});

const emit = defineEmits(['data-updated']);

const newItemName = ref('');
const loading = ref(false);
const error = ref(null);

const editDialog = ref(false);
const editedItemId = ref(null);
const editedItemName = ref('');

const deleteConfirmDialog = ref(false);
const itemToDelete = ref(null);
const itemToDeleteName = ref('');

const rules = {
    required: (value) => !!value || 'Campo requerido.',
};

const itemNameKeyDisplay = computed(() => {
    // Simple capitalization for display purposes
    return props.itemNameKey.charAt(0).toUpperCase() + props.itemNameKey.slice(1);
});

const callApi = async (url, method, body = null) => {
    loading.value = true;
    error.value = null;
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `HTTP error! Status: ${response.status}. ${errorData.message || JSON.stringify(errorData) || ''}`
            );
        }
        return await response.json();
    } catch (err) {
        error.value = err;
        console.error('API Error:', err);
        throw err;
    } finally {
        loading.value = false;
    }
};

const addItem = async () => {
    if (!newItemName.value) {
        error.value = new Error(`${itemNameKeyDisplay.value} no puede estar vacío.`);
        return;
    }
    try {
        const body = {};
        body[props.itemNameKey] = newItemName.value;
        await callApi(props.createUrl, 'POST', body);
        newItemName.value = ''; // Clear input
        emit('data-updated'); // Notify parent to refetch
    } catch (e) {
        // Error already set by callApi
    }
};

const editItem = (item) => {
    editedItemId.value = item[props.itemIdKey];
    editedItemName.value = item[props.itemNameKey];
    editDialog.value = true;
};

const saveItem = async () => {
    if (!editedItemName.value) {
        error.value = new Error(`${itemNameKeyDisplay.value} no puede estar vacío.`);
        return;
    }
    try {
        const body = {};
        body[props.itemNameKey] = editedItemName.value;

        await callApi(`${props.updateUrl}${editedItemId.value}`, 'PUT', body);
        closeEditDialog();
        emit('data-updated'); // Notify parent to refetch
    } catch (e) {
        // Error already set by callApi
    }
};

const closeEditDialog = () => {
    editDialog.value = false;
    editedItemId.value = null;
    editedItemName.value = '';
    error.value = null; // Clear error on close
};

const confirmDeleteItem = (item) => {
    itemToDelete.value = item;
    itemToDeleteName.value = item[props.itemNameKey];
    deleteConfirmDialog.value = true;
};

const executeDelete = async () => {
    if (!itemToDelete.value) return;
    try {
        await callApi(`${props.deleteUrl}${itemToDelete.value[props.itemIdKey]}`, 'DELETE');
        cancelDelete(); // Close dialog and reset
        emit('data-updated'); // Notify parent to refetch
    } catch (e) {
        // Error already set by callApi
    }
};

const cancelDelete = () => {
    deleteConfirmDialog.value = false;
    itemToDelete.value = null;
    itemToDeleteName.value = '';
    error.value = null; // Clear error on close
};
</script>

<style scoped>
.v-container {
    padding: 16px;
    /* Restore some padding if 'pa-0' was too much */
}

/* Style for the Add button */
.add-button {
    height: 48px !important;
    /* Ensure consistent height with text field */
    min-width: 120px;
    /* Give it a decent minimum width */
    font-weight: 500;
}

/* Style for the table itself */
.lookup-table {
    border: 1px solid #ddd;
    /* Light border around the table */
    border-radius: 4px;
    /* Slightly rounded corners */
}

/* Table header styling for consistency with main project table if desired */
.lookup-table :deep(.v-data-table__thead th) {
    background-color: #e8f5e9;
    /* Light green, similar to your main table headers */
    color: #333;
    font-weight: bold;
    font-size: 0.875rem;
    white-space: nowrap;
    border-bottom: 1px solid #ccc;
    /* Separator for headers */
}

/* Table body row and cell styling */
.lookup-table :deep(.v-data-table__tbody tr:nth-of-type(odd)) {
    background-color: #f9f9f9;
    /* Lighter odd rows */
}

.lookup-table :deep(.v-data-table__tbody tr:hover) {
    background-color: #e0f2f7 !important;
    /* Hover effect */
    cursor: pointer;
}

.lookup-table :deep(.v-data-table__tbody td) {
    font-size: 0.875rem;
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    /* Light separator for cells */
}

/* Action buttons within the table rows */
.action-button {
    /* Adjust these values to match the 'Agregar' button's general feel */
    min-width: unset;
    /* Allow buttons to be smaller if just an icon */
    padding: 0 8px;
    /* Reduce horizontal padding for icons */
    height: 30px !important;
    /* Make them slightly smaller than 'Agregar' for row compactness */
    line-height: 30px !important;
    border-radius: 4px;
    /* Match standard button radius */
    font-weight: 500;
}

/* Further fine-tuning for icon buttons if needed */
.action-button .v-icon {
    font-size: 18px;
    /* Adjust icon size if necessary */
}

/* Align the text field and button nicely */
.v-col.d-flex.align-center {
    align-items: flex-end;
    /* Align to bottom for text field and button */
}

/* Responsive adjustments if needed */
@media (max-width: 600px) {

    .add-button,
    .action-button {
        width: 100%;
        /* Full width on small screens */
        margin-right: 0 !important;
        margin-bottom: 8px;
    }
}
</style>