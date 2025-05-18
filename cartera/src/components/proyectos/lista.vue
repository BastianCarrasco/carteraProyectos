<script setup>
import '../../assets/Proyecto_styles/vistaProyectos.css';
import '../../assets/Proyecto_styles/vistaProyectos 2.css';
defineProps({
    proyectos: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    }
});

const getLogoForTipo = (tipo) => {
    const logos = {
        'CORFO': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSehNJ8c1LJpJ2z8Nr2XYscS09nWUlKwaulgA&s',
        'GORE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Logo_Gobierno_de_Chile.svg/1200px-Logo_Gobierno_de_Chile.svg.png',
        'ANID': 'https://www.anid.cl/wp-content/uploads/2021/07/logo-anid-2021.png',
        'PRIVADA': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        'CODESSER': 'https://yt3.googleusercontent.com/ytc/AIdro_nzFhzBeDsXQ3D7AF5rdL_n5us28Hn8hLUTSaK3xYwwtkU=s900-c-k-c0x00ffffff-no-rj',
        'SQM': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZbCTVM6AKaqYd5XuTWp8-VRuTkEsNQJaJBA&s'
    };
    return logos[tipo] || 'https://cdn-icons-png.flaticon.com/512/2097/2097743.png'; // Imagen por defecto
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CL', options);
};
</script>

<template>
   <div class="projects-container">
    <div v-if="loading" class="loading">Cargando proyectos...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="projects-grid">
        <!-- Each project as a separate row -->
        <div v-for="proyecto in proyectos" :key="proyecto.id_proyecto" class="project-row">
            <!-- Project Section - Divided into two parts -->
            <div class="project-section">
                <!-- Top part - Project details -->
                <div class="project-main-section">
                    <h3 class="project-title">{{ proyecto.nombre || 'Proyecto sin nombre' }}</h3>
                    <div class="project-details">
                        <div class="detail-item">
                            <span class="detail-label">Académico responsable: </span>
                            <span class="detail-value">{{ proyecto.Academico }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Unidad Académica: </span>
                            <span class="detail-value">{{ proyecto.UA }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Jefe de proyecto:</span>
                            <span class="detail-value">{{ proyecto.jefe ? 'Sí' : 'No' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Monto :</span>
                            <span class="detail-value">{{ formatCurrency(proyecto.monto) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de postulación: </span>
                            <span class="detail-value">{{ formatDate(proyecto.fecha_postulacion) }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom part - Comments -->
                <div class="project-comments-section">
                    <div class="detail-item">
                        <span class="detail-label">Comentarios: </span>
                        <span class="detail-value">{{ proyecto.comentarios || 'Sin comentarios' }}</span>
                    </div>
                </div>
            </div>

            <!-- Call Section - Divided into two parts -->
            <div class="call-section">
                <!-- Top part - Call info -->
                <div class="call-info-section">
                    <h3 class="call-title">{{ proyecto.Convocatoria || 'Convocatoria sin nombre' }}</h3>
                    <div class="call-info">
                        <div class="call-info-item">
                            <span class="call-info-label">Tipo:</span>
                            <span class="call-info-value">{{ proyecto.Tipo_Convo }}</span>
                        </div>
                        <div class="call-info-item">
                            <span class="call-info-label">Institución:</span>
                            <span class="call-info-value">{{ proyecto.Institucion_convocatoria }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom part - Logos -->
                <div class="call-logos-section">
                    <img :src="getLogoForTipo(proyecto.Tipo_Convo)" 
                         :alt="proyecto.Tipo_Convo" 
                         class="logo-img" />
                    <img :src="getLogoForTipo(proyecto.Institucion_convocatoria)" 
                         :alt="proyecto.Institucion_convocatoria" 
                         class="logo-img" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>

</style>