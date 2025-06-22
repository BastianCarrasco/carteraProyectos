<template>
    <div class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <button class="close-btn" @click="close">×</button>
            <h2 class="modal-title">{{ proyecto.nombre }}</h2>
            <p class="project-status-outside">
                <strong>Estado Actual:</strong>
                <span class="badge" :class="getStatusClass(proyecto.estatus)">
                    {{ proyecto.estatus || "Desconocido" }}
                </span>
            </p>

            <!-- El contenido principal del modal que puede necesitar scroll -->
            <div class="modal-scrollable-content">
                <div class="modal-body-grid">
                    <!-- COLUMNA IZQUIERDA: RESUMEN Y DETALLES CLAVE -->
                    <div class="left-column">
                        <!-- Detalles principales (Temática, Institución, Monto, Apoyo) -->
                        <div class="section primary-details-card">
                            <h3>Detalles del Proyecto</h3>
                            <div class="detail-group">
                                <div class="detail-item">
                                    <template v-if="getThematicImage(proyecto.tematica)">
                                        <img :src="getThematicImage(proyecto.tematica)" alt="Ícono de temática"
                                            class="detail-icon-image" />
                                    </template>
                                    <i v-else class="fas fa-tag detail-icon"></i>
                                    <p>
                                        <strong>Temática:</strong>
                                        {{ proyecto.tematica || "Sin temática" }}
                                    </p>
                                </div>
                                <div class="detail-item">
                                    <template v-if="getInstitutionImage(proyecto.institucion)">
                                        <img :src="getInstitutionImage(proyecto.institucion)" alt="Logo de institución"
                                            class="detail-icon-image" />
                                    </template>
                                    <i v-else class="fas fa-university detail-icon"></i>
                                    <p>
                                        <strong>Institución:</strong>
                                        {{ proyecto.institucion || "Sin institución" }}
                                    </p>
                                </div>
                            </div>
                            <div class="detail-group finance-details">
                                <p>
                                    <strong>Monto Solicitado:</strong>
                                    {{ formatCurrency(proyecto.monto) }}
                                </p>
                                <p>
                                    <strong>Tipo de Apoyo:</strong>
                                    {{ proyecto.apoyo || "No especificado" }} -
                                    {{ proyecto.detalle_apoyo || "No especificado" }}
                                </p>
                            </div>
                        </div>

                        <!-- Postulación -->
                        <div class="section">
                            <h3>Información de Postulación</h3>
                            <p>
                                <strong>Fecha de Postulación:</strong>
                                {{ formatDate(proyecto.fecha_postulacion) }}
                            </p>
                            <p>
                                <strong>Convocatoria:</strong>
                                {{ proyecto.nombre_convo || "No especificada" }}
                            </p>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: SECCIONES ADICIONALES Y COMENTARIOS -->
                    <div class="right-column">
                        <!-- Sección para las imágenes de los académicos -->
                        <div class="section image-showcase-section">
                            <h3>Imágenes de Académicos</h3>

                            <!-- CASO: Una sola imagen de académico -->
                            <div v-if="proyecto.academicImageLinks && proyecto.academicImageLinks.length === 1"
                                class="single-academic-image-container">
                                <img :src="proyecto.academicImageLinks[0]" :alt="`Imagen de académico`"
                                    class="project-showcase-img single-image" />
                                <p class="image-caption single-caption">
                                    Imagen de académico principal.
                                </p>
                            </div>

                            <!-- CASO: Múltiples imágenes de académicos -->
                            <div v-else-if="
                                proyecto.academicImageLinks && proyecto.academicImageLinks.length > 1
                            " class="academic-images-grid">
                                <img v-for="(imageLink, index) in proyecto.academicImageLinks" :key="index"
                                    :src="imageLink" :alt="`Imagen de académico ${index + 1}`"
                                    class="project-showcase-img grid-image" />
                            </div>

                            <!-- CASO: No hay imágenes de académicos -->
                            <div v-else class="no-image-container">
                                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 100 100'><rect x='0' y='0' width='100' height='100' fill='%23e0e0e0'/><text x='50' y='50' font-family='Arial' font-size='10' fill='%23666' text-anchor='middle' alignment-baseline='middle'>No Image Available</text></svg>"
                                    alt="No hay imagen disponible" class="project-showcase-img no-image" />
                                <p class="image-caption no-image-caption">
                                    No hay imágenes disponibles de los académicos.
                                </p>
                            </div>
                        </div>

                        <!-- Académicos -->
                        <div class="section">
                            <h3>Académicos Involucrados</h3>
                            <ul v-if="proyecto.profesores && proyecto.profesores.length > 0">
                                <li v-for="(profesor, index) in proyecto.profesores"
                                    :key="profesor.id_academico || index">
                                    {{ profesor.nombre_completo }}
                                </li>
                            </ul>
                            <p v-else>No se especificaron académicos para este proyecto.</p>
                        </div>

                        <!-- Unidad Responsable -->
                        <div class="section" v-if="proyecto.unidad">
                            <h3>Unidad Responsable</h3>
                            <p>{{ proyecto.unidad }}</p>
                        </div>

                        <!-- Comentarios -->
                        <div class="section last-section" v-if="proyecto.comentarios">
                            <h3>Comentarios Adicionales</h3>
                            <p class="comments-text">{{ proyecto.comentarios }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    proyecto: Object,
    getThematicImage: Function,
    getInstitutionImage: Function,
});
const emit = defineEmits(['close']);

const close = () => emit('close');

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'No especificada';

const formatCurrency = (amount) =>
    amount == null
        ? 'No especificado'
        : new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(amount);

const getStatusClass = (status) => {
    const statusMap = {
        aprobado: 'approved',
        postulado: 'submitted',
        rechazado: 'rejected',
        perfil: 'draft',
        'en proceso': 'in-progress',
    };
    return statusMap[status?.toLowerCase()] || 'unknown';
};
</script>

<style scoped>
/* Estilos generales del modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    /* Asegura que esté por encima de todo */
}

.modal-content {
    background-color: #f7f7f7;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 950px;
    /* Ancho máximo razonable */
    max-height: 90vh;
    /* *** CAMBIO CLAVE ***: Altura máxima basada en el viewport */
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    position: relative;
    display: flex;
    flex-direction: column;
}

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.8em;
    color: #888;
    cursor: pointer;
    padding: 5px;
    line-height: 1;
    z-index: 1001;
    /* Asegura que esté por encima del contenido y del scroll */
}

.close-btn:hover {
    color: #333;
}

.modal-title {
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 2.2em;
    text-align: center;
    width: 100%;
    /* No cambiará de tamaño, pero ayuda a que se centre */
    flex-shrink: 0;
    /* Evita que el título se encoja si hay poco espacio */
}

.project-status-outside {
    text-align: center;
    margin-bottom: 25px;
    font-size: 1.1em;
    color: #555;
    flex-shrink: 0;
    /* Evita que el estado se encoja */
}

/* *** CAMBIO CLAVE ***: Nuevo contenedor para el contenido scrollable */
.modal-scrollable-content {
    flex-grow: 1;
    /* Permite que este contenedor ocupe el espacio restante */
    overflow-y: auto;
    /* Habilita el scroll vertical si el contenido excede el espacio */
    padding-right: 15px;
    /* Espacio para que el scrollbar no tape el contenido */
    /* Opcional: Estilizar el scrollbar para webkit si lo deseas */
    scrollbar-width: thin;
    /* Firefox */
    scrollbar-color: #42b983 #f0f0f0;
    /* Firefox */
}

.modal-scrollable-content::-webkit-scrollbar {
    width: 8px;
}

.modal-scrollable-content::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
}

.modal-scrollable-content::-webkit-scrollbar-thumb {
    background-color: #42b983;
    border-radius: 10px;
    border: 2px solid #f0f0f0;
}


/* Distribución en columnas */
.modal-body-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 25px;
    padding-bottom: 15px;
    /* Asegura un poco de espacio al final del scrollable content */
}

.left-column,
.right-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* Estilo general de las secciones */
.section {
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-left: 5px solid #42b983;
}

.section h3 {
    color: #34495e;
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    font-size: 1.3em;
}

.primary-details-card {
    padding-bottom: 15px;
}

.detail-group {
    margin-bottom: 15px;
}

.detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.detail-item p {
    margin: 0;
    font-size: 0.95em;
    color: #333;
}

.detail-icon {
    font-size: 1.3em;
    color: #42b983;
    margin-right: 10px;
    width: 25px;
    text-align: center;
}

.detail-icon-image {
    width: 25px;
    height: 25px;
    object-fit: contain;
    margin-right: 10px;
}

.finance-details p {
    margin-bottom: 8px;
    font-size: 0.95em;
    color: #333;
}

.badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.85em;
    text-transform: uppercase;
    color: white;
    margin-left: 8px;
    display: inline-block;
}

.badge.approved {
    background-color: #28a745;
}

.badge.submitted {
    background-color: #007bff;
}

.badge.rejected {
    background-color: #dc3545;
}

.badge.draft {
    background-color: #6c757d;
}

.badge.in-progress {
    background-color: #ffc107;
    color: #343a40;
}

.badge.unknown {
    background-color: #aaaaaa;
}

.image-showcase-section {
    padding-bottom: 0;
}

.project-showcase-img {
    width: 100%;
    border-radius: 8px;
    background-color: #f0f0f0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.single-academic-image-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 180px;
}

.single-academic-image-container .project-showcase-img.single-image {
    max-width: 75%;
    height: 140px;
    object-fit: contain;
    margin-bottom: 8px;
}

.image-caption.single-caption {
    font-size: 0.8em;
    color: #666;
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
}

.academic-images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
}

.academic-images-grid .project-showcase-img.grid-image {
    width: 100%;
    height: 90px;
    object-fit: cover;
}

.no-image-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 180px;
}

.project-showcase-img.no-image {
    height: 140px;
    object-fit: contain;
    margin-bottom: 8px;
}

.image-caption.no-image-caption {
    font-size: 0.8em;
    color: #666;
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
}

.section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.section li {
    background-color: #f8faff;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-radius: 6px;
    border-left: 3px solid #63a46a;
    font-size: 0.9em;
    color: #333;
}

.section li:last-child {
    margin-bottom: 0;
}

.section.last-section {
    margin-bottom: 0;
}

/* Media Queries */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        padding: 20px;
    }

    .modal-body-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .modal-title {
        font-size: 1.8em;
    }

    .project-status-outside {
        font-size: 1em;
        margin-bottom: 15px;
    }

    .section {
        padding: 15px;
    }

    .section h3 {
        font-size: 1.1em;
        margin-bottom: 10px;
    }

    .detail-item p,
    .finance-details p,
    .section ul li {
        font-size: 0.85em;
    }

    .image-caption {
        font-size: 0.75em;
    }
}
</style>