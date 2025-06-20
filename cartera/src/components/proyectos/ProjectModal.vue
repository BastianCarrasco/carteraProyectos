<template>
    <div class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <button class="close-btn" @click="close">×</button>
            <h2 class="modal-title">{{ proyecto.nombre }}</h2>

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
                                    {{ proyecto.tematica || 'Sin temática' }}
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
                                    {{ proyecto.institucion || 'Sin institución' }}
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
                                {{ proyecto.apoyo || 'No especificado' }}
                            </p>
                        </div>
                        <div class="detail-group status-detail">
                            <p><strong>Estado Actual:</strong></p>
                            <span class="badge" :class="getStatusClass(proyecto.estatus)">
                                {{ proyecto.estatus || 'Desconocido' }}
                            </span>
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
                            {{ proyecto.nombre_convo || 'No especificada' }}
                        </p>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: SECCIONES ADICIONALES Y COMENTARIOS -->
                <div class="right-column">
                    <!-- Sección para la imagen destacada -->
                    <div class="section image-showcase-section">
                        <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 100 100'><rect x='0' y='0' width='100' height='100' fill='%23e0e0e0'/><text x='50' y='50' font-family='Arial' font-size='10' fill='%23666' text-anchor='middle' alignment-baseline='middle'>Placeholder Image</text></svg>"
                            alt="Imagen representativa del proyecto (próximamente)" class="project-showcase-img" />
                        <p class="image-caption">
                            Impacto y alcance de la investigación.
                        </p>
                    </div>

                    <!-- Académicos -->
                    <div class="section">
                        <h3>Académicos Involucrados</h3>
                        <ul v-if="proyecto.profesores && proyecto.profesores.length > 0">
                            <li v-for="(profesor, index) in proyecto.profesores" :key="index">
                                {{ profesor }}
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
/* LOS ESTILOS CSS SON EXACTAMENTE LOS MISMOS QUE EN LA VERSIÓN ANTERIOR,
   YA QUE SE APLICAN A LAS CLASES CSS, NO A LA FORMA EN QUE LA IMAGEN FUE CARGADA. */

/* GENERAL MODAL STYLES (largely unchanged, but adjusted for new layout) */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    /* Slightly darker overlay */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 10px;
    /* Padding for very small screens */
}

.modal-content {
    background: white;
    padding: 2.5rem;
    /* More generous padding */
    max-width: 950px;
    /* Wider modal for two columns */
    width: 98%;
    /* Even more width on small screens */
    border-radius: 12px;
    /* Slightly more rounded corners */
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    /* Stronger shadow */
    display: flex;
    flex-direction: column;
    max-height: 95vh;
    /* Allow it to be taller, with internal scroll */
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1.2rem;
    background: transparent;
    border: none;
    font-size: 2rem;
    /* Larger close button */
    cursor: pointer;
    color: #888;
    transition: color 0.2s ease-in-out;
}

.close-btn:hover {
    color: #333;
    transform: scale(1.1);
}

.modal-title {
    font-size: 2rem;
    /* Larger title */
    margin-bottom: 1.5rem;
    color: #1a2a3a;
    /* Darker, more professional color */
    text-align: center;
    border-bottom: 2px solid #e0e0e0;
    /* Thicker border */
    padding-bottom: 1rem;
    font-weight: 700;
    /* Bolder title */
}

/* MAIN GRID LAYOUT FOR MODAL BODY */
.modal-body-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    /* Left column (summary) is 1 part, right (details) is 1.2 parts */
    gap: 30px;
    /* Space between columns */
    flex-grow: 1;
    /* Allow content area to fill remaining space */
    overflow-y: auto;
    /* Enable scrolling for the whole body grid */
    padding-right: 15px;
    /* Space for scrollbar */
}

.left-column,
.right-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* Space between sections within each column */
}

/* SECTION STYLES - REFINED FOR "PRESENTATION CARD" LOOK */
.section {
    background-color: #ffffff;
    /* White background for sections */
    border: 1px solid #e5e5e5;
    /* Light grey border */
    border-radius: 10px;
    /* Rounded corners for sections */
    padding: 1.5rem;
    /* Generous padding inside sections */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    /* Subtle shadow for depth */
    display: flex;
    flex-direction: column;
    height: fit-content;
    /* Ensure sections only take up needed height */
}

.section h3 {
    font-size: 1.3rem;
    /* Larger heading for sections */
    color: #2c3e50;
    /* Darker heading color */
    margin-bottom: 1rem;
    border-left: 6px solid #3498db;
    /* Stronger accent bar */
    padding-left: 12px;
    font-weight: 600;
    /* Semi-bold heading */
}

.section p {
    line-height: 1.6;
    color: #444;
    /* Darker text for readability */
    margin-bottom: 0.8rem;
    /* More space between paragraphs */
}

.section p:last-child {
    margin-bottom: 0;
    /* No margin on last paragraph */
}

.section p strong {
    color: #222;
    /* Bolder emphasis */
}

/* Specific Styles for Primary Details Card */
.primary-details-card {
    /* No specific grid/flex for this section itself, content inside is handled */
}

.detail-group {
    display: flex;
    flex-wrap: wrap;
    /* Allow items to wrap */
    gap: 20px;
    /* Space between detail items */
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed #f0f0f0;
    /* Soft separator */
    justify-content: space-around;
    /* Distribute items */
}

.detail-group:last-of-type {
    border-bottom: none;
    /* No border for the last group */
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    font-size: 1rem;
    /* Slightly larger text */
    color: #555;
    flex: 1 1 45%;
    /* Allow two items per row, with wrap */
    min-width: 150px;
    /* Minimum width for each detail item */
}

.detail-icon-image {
    width: 3.2em;
    /* Larger icons */
    height: 3.2em;
    object-fit: contain;
}

.detail-icon {
    font-size: 3.2em;
    /* Larger icons */
    color: #666;
}

.finance-details {
    flex-direction: column;
    /* Stack financial details */
    align-items: flex-start;
    /* Align text to start */
}

.finance-details p {
    width: 100%;
    /* Full width for each financial detail */
}

.status-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Center status */
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #f0f0f0;
}

.status-detail p {
    margin-bottom: 0.5rem;
    font-weight: 600;
}

/* BADGE STYLES (mostly unchanged, but ensuring alignment) */
.badge {
    padding: 0.5rem 1rem;
    border-radius: 25px;
    /* More rounded */
    font-weight: bold;
    color: white;
    display: inline-flex;
    /* Use flex to better align text if needed */
    align-items: center;
    justify-content: center;
    min-width: 100px;
    /* Wider badges */
    text-align: center;
    font-size: 0.95em;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* Slight shadow for badges */
}

.badge.approved {
    background: #28a745;
    /* Deeper green */
}

.badge.submitted {
    background: #007bff;
    /* Standard blue */
}

.badge.rejected {
    background: #dc3545;
    /* Standard red */
}

.badge.draft {
    background: #ffc107;
    /* Standard yellow */
    color: #333;
    /* Darker text for visibility */
}

.badge.in-progress {
    background: #6f42c1;
    /* Deeper purple */
}

.badge.unknown {
    background: #6c757d;
    /* Darker grey */
}

/* List Styles */
.section ul {
    list-style: none;
    /* Remove default bullets */
    padding: 0;
    /* Remove default padding */
    margin-top: 10px;
}

.section ul li {
    background-color: #f0f8ff;
    /* Light blue background for list items */
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    /* Subtle shadow */
}

.section ul li::before {
    content: '\2022';
    /* Unicode bullet point */
    color: #3498db;
    /* Blue bullet */
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
    font-size: 1.2em;
}

.comments-text {
    background-color: #fdfdfd;
    border-left: 4px solid #f0f0f0;
    padding: 10px 15px;
    font-style: italic;
    color: #666;
    border-radius: 5px;
    margin-top: 10px;
}

/* NEW STYLES FOR IMAGE SHOWCASE SECTION */
.image-showcase-section {
    padding: 0;
    /* Remove padding from the section itself, content handles it */
    overflow: hidden;
    /* Ensure image doesn't overflow rounded corners */
    text-align: center;
    position: relative;
    /* For caption positioning */
}

.project-showcase-img {
    width: 100%;
    /* Make image fill the section width */
    height: auto;
    /* Maintain aspect ratio */
    display: block;
    /* Remove extra space below image */
    border-radius: 10px 10px 0 0;
    /* Only top corners rounded if no padding */
    object-fit: cover;
    /* Crop if necessary to fill space */
    max-height: 250px;
    /* Limit height to prevent it from being too large */
}

.image-caption {
    position: absolute;
    bottom: 0;
    /* Align to the bottom of the section */
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.6);
    /* Semi-transparent black background */
    color: white;
    padding: 8px 15px;
    font-size: 0.9em;
    font-style: italic;
    border-radius: 0 0 10px 10px;
    /* Rounded bottom corners */
}

/* Responsive Adjustments */
@media (max-width: 992px) {
    .modal-body-grid {
        grid-template-columns: 1fr;
        /* Stack columns on smaller screens */
        gap: 25px;
        padding-right: 0;
        /* Remove padding if not needed for scrollbar */
    }

    .modal-content {
        padding: 1.8rem;
    }

    .left-column,
    .right-column {
        gap: 15px;
    }

    .detail-group {
        flex-direction: column;
        /* Stack details vertically on smaller screens */
        gap: 15px;
    }

    .detail-item,
    .finance-details p {
        min-width: unset;
        /* Remove min-width to allow full stacking */
        width: 100%;
        align-items: flex-start;
        /* Align text to left when stacked */
        text-align: left;
    }

    .image-showcase-section {
        padding: 1.5rem;
        /* Re-add padding for stacked layout if desired */
    }

    .project-showcase-img {
        border-radius: 8px;
        /* Round all corners for stacked image */
        max-height: 200px;
        /* Adjust max height for smaller screens */
    }

    .image-caption {
        position: static;
        /* Let caption flow with content */
        background: none;
        color: #555;
        padding: 10px 0 0;
        font-size: 0.85em;
    }
}

@media (max-width: 576px) {
    .modal-content {
        padding: 1rem;
        width: 100%;
        margin: 0;
        border-radius: 0;
        /* Full screen on very small devices */
    }

    .close-btn {
        top: 0.5rem;
        right: 0.8rem;
        font-size: 1.5rem;
    }

    .modal-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .section h3 {
        font-size: 1.1rem;
    }

    .detail-icon-image,
    .detail-icon {
        width: 2.5em;
        height: 2.5em;
        font-size: 2.5em;
    }

    .project-showcase-img {
        max-height: 150px;
        /* Even smaller for very small screens */
    }
}
</style>