<!-- components/ProjectModal.vue -->
<template>
    <div class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <button class="close-btn" @click="close">×</button>
            <h2 class="modal-title">{{ proyecto.nombre }}</h2>

            <div class="modal-body">
                <div class="section">
                    <h3>Información Financiera</h3>
                    <p><strong>Monto:</strong> {{ formatCurrency(proyecto.monto) }}</p>
                    <p><strong>Tipo de apoyo:</strong> {{ proyecto.apoyo || 'No especificado' }}</p>
                </div>

                <div class="section">
                    <h3>Postulación</h3>
                    <p><strong>Fecha:</strong> {{ formatDate(proyecto.fecha_postulacion) }}</p>
                    <p><strong>Convocatoria:</strong> {{ proyecto.nombre_convo || 'No especificada' }}</p>
                </div>

                <div class="section">
                    <h3>Estado</h3>
                    <span class="badge" :class="getStatusClass(proyecto.estatus)">
                        {{ proyecto.estatus || 'Desconocido' }}
                    </span>
                </div>

                <div class="section" v-if="proyecto.unidad">
                    <h3>Unidad Responsable</h3>
                    <p>{{ proyecto.unidad }}</p>
                </div>

                <div class="section" v-if="proyecto.comentarios">
                    <h3>Comentarios</h3>
                    <p>{{ proyecto.comentarios }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    proyecto: Object
});
const emit = defineEmits(['close']);

const close = () => emit('close');

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada';

const formatCurrency = (amount) =>
    amount == null ? 'No especificado' : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

const getStatusClass = (status) => {
    const statusMap = {
        'aprobado': 'approved',
        'postulado': 'submitted',
        'rechazado': 'rejected',
        'perfil': 'draft',
        'en proceso': 'in-progress'
    };
    return statusMap[status?.toLowerCase()] || 'unknown';
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    border-radius: 10px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 0.8rem;
    right: 1rem;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-title {
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
}

.section {
    margin-bottom: 1.2rem;
}

.badge {
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-weight: bold;
    color: white;
}

.badge.approved {
    background: #2ecc71;
}

.badge.submitted {
    background: #3498db;
}

.badge.rejected {
    background: #e74c3c;
}

.badge.draft {
    background: #f39c12;
}

.badge.in-progress {
    background: #9b59b6;
}

.badge.unknown {
    background: #95a5a6;
}
</style>
