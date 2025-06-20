<!-- components/ProjectsTable.vue -->
<template>
    <table v-if="proyectos.length" class="proyectos-table">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Tematica</th>
                <th>Estatus</th>
                <th>Apoyo</th>
                <th>Detalle de Apoyo</th>
                <th>Monto MM</th>
                <th>Académicos</th>
                <th>Unidad</th>
                <th>Convocatoria</th>
                <th>Tipo Convocatoria</th>
                <th>Fecha Postulación</th>
                <th>Institución</th>
                <th>Comentario</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="proyecto in proyectos" :key="proyecto.id_proyecto" class="fila-proyecto">
                <!-- Nombre -->
                <td>{{ proyecto.nombre }}</td>
                <!-- Tematica -->
                <td>{{ getTematicaNombre(proyecto.id_tematica) }}</td>
                <!-- Estatus -->
                <td>{{ getEstatusNombre(proyecto.id_estatus) }}</td>
                <!-- Apoyo -->
                <td>{{ getApoyoNombre(proyecto.apoyo) }}</td>
                <!-- Detalle de Apoyo -->
                <td>{{ proyecto.detalle_apoyo }}</td>
                <!-- Monto -->
                <td>${{ (proyecto.monto ? proyecto.monto / 1000000 : 0).toLocaleString() }}</td>
                <!-- Académicos -->
                <td>
                    <ul v-if="getAcademicosForProject(proyecto.id_proyecto).length">
                        <li v-for="(profesor, index) in getAcademicosForProject(
                            proyecto.id_proyecto,
                        )" :key="index">
                            {{ profesor }}
                        </li>
                    </ul>
                    <span v-else>-</span>
                </td>
                <!-- Unidad -->
                <td>{{ getUnidadNombre(proyecto.unidad) }}</td>
                <!-- Convocatoria -->
                <td>{{ proyecto.convocatoria }}</td>
                <!-- Tipo Convocatoria -->
                <td>{{ getTipoConvocatoriaNombre(proyecto.tipo_convocatoria) }}</td>
                <!-- Fecha Postulación -->
                <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
                <!-- Institución -->
                <td>{{ getInstitucionNombre(proyecto.inst_conv) }}</td>
                <!-- Comentario -->
                <td>{{ proyecto.comentarios }}</td>
                <!-- Acciones -->
                <td>
                    <button @click="openEditModal(proyecto)" class="boton-editar">
                        Editar
                    </button>
                    <button @click="confirmDelete(proyecto)" class="boton-eliminar">
                        Eliminar
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <p v-else>No hay proyectos para mostrar.</p>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    proyectos: {
        type: Array,
        required: true,
    },
    academicosPorProyecto: {
        type: Array,
        required: true,
    },
    unidades: {
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
    tipoConvocatoriasOptions: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['open-edit-modal', 'confirm-delete']);

// Helper functions (mantienen la misma lógica, ahora usan las props)
const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL');
};

const getAcademicosForProject = (idProyecto) => {
    const proyecto = props.academicosPorProyecto.find(
        (p) => p.id_proyecto === idProyecto,
    );
    return proyecto ? proyecto.profesores : [];
};

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
    return apoyo ? apoyo.nombre : idApoyo;
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

const getTipoConvocatoriaNombre = (idTipo) => {
    const tipo = props.tipoConvocatoriasOptions.find((t) => t.id === idTipo);
    return tipo ? tipo.nombre : idTipo;
};

// Emitir eventos para las acciones de Editar y Eliminar
const openEditModal = (proyecto) => {
    emit('open-edit-modal', proyecto);
};

const confirmDelete = (proyecto) => {
    emit('confirm-delete', proyecto);
};
</script>

<style scoped>
/* Puedes mover los estilos específicos de la tabla aquí o mantenerlos en un archivo CSS global si se usan en más lugares */
.proyectos-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.proyectos-table th,
.proyectos-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.proyectos-table th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.fila-proyecto:nth-child(even) {
    background-color: #f9f9f9;
}

.fila-proyecto:hover {
    background-color: #f1f1f1;
}

.boton-editar,
.boton-eliminar {
    padding: 6px 10px;
    margin-right: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
}

.boton-editar {
    background-color: #4caf50;
    color: white;
}

.boton-editar:hover {
    background-color: #45a049;
}

.boton-eliminar {
    background-color: #f44336;
    color: white;
}

.boton-eliminar:hover {
    background-color: #da190b;
}

ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

ul li {
    white-space: nowrap;
    /* Evita que los nombres largos se dividan */
}
</style>