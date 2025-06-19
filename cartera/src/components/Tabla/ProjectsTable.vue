<template>
    <table v-if="projects.length" class="proyectos-table">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Tematica</th>
                <th>Estatus</th>
                <th>Apoyo</th>
                <th>Detalle de Apoyo</th>
                <th>Monto</th>
                <th>Académicos</th>
                <th>Unidad</th>
                <th>Convocatoria</th>
                <th>Fecha Postulación</th>
                <th>Institución</th>
                <th>Comentario</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="proyecto in projects" :key="proyecto.id_proyecto" class="fila-proyecto">
                <td>{{ proyecto.nombre }}</td>
                <td>{{ getTematicaNombre(proyecto.tematica) }}</td>
                <td>{{ getEstatusNombre(proyecto.estatus) }}</td>
                <td>{{ getApoyoNombre(proyecto.apoyo) }}</td>
                <td>{{ proyecto.detalle_apoyo }}</td>
                <td>${{ proyecto.monto?.toLocaleString() }}</td>
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
                <td>{{ proyecto.unidad }}</td>
                <td>{{ proyecto.convocatoria }}</td>
                <td>{{ formatFecha(proyecto.fecha_postulacion) }}</td>
                <td>{{ getInstitucionNombre(proyecto.institucion) }}</td>
                <td>{{ proyecto.comentarios }}</td>
                <td>
                    <button @click="$emit('edit-project', proyecto)" class="boton-editar">
                        Editar
                    </button>
                    <button @click="$emit('delete-project', proyecto)" class="boton-eliminar">
                        Eliminar
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <p v-else>Cargando proyectos...</p>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Define las props que este componente espera recibir del padre
const props = defineProps({
    projects: {
        type: Array,
        required: true,
    },
    academicosPorProyecto: {
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
});

// Define los eventos que este componente puede emitir al padre
const emit = defineEmits(['edit-project', 'delete-project']);

// Funciones de utilidad (podrían ir en un archivo de utilidades si se usan mucho)
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
    return apoyo ? apoyo.nombre : '';
};

const getTematicaNombre = (idTematica) => {
    const tematica = props.tematicasOptions.find(
        (t) => t.id_tematica === idTematica,
    );
    return tematica ? tematica.nombre : idTematica;
};
</script>