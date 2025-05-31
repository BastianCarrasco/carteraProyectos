<template>
  <div class="container">
    <header class="header">
      <h1 class="title">Cartera de Proyectos</h1>
      <div class="controls">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar proyectos..."
            aria-label="Buscar proyectos"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-controls">
          <select
            v-model="selectedFilter"
            class="filter-select"
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los proyectos</option>
            <option v-for="tipo in uniqueTypes" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
          <button
            @click="toggleSort"
            class="sort-button"
            aria-label="Cambiar orden"
          >
            {{ sortAscending ? "Más nuevos primero" : "Más antiguos primero" }}
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando proyectos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">Reintentar</button>
    </div>

    <div v-else>
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <p>
          No se encontraron proyectos que coincidan con los criterios de
          búsqueda.
        </p>
      </div>

      <div class="project-list">
        <div
          v-for="proyecto in filteredProjects"
          :key="proyecto.id_proyecto"
          class="project-card"
          :class="{ 'highlighted-project': proyecto.destacado }"
        >
          <div class="project-header">
            <h2 class="project-title">
              {{ proyecto.nombre || "Proyecto sin nombre" }}
            </h2>
            <div class="title-wrapper">
              <!-- <span
                class="project-status"
                :class="getStatusClass(proyecto.estado)"
              >
                {{ proyecto.estado || "Estado no especificado" }}
              </span> -->
              <div class="logos">
                <img
                  :src="getLogoForTipo(proyecto.Tipo_Convo)"
                  :alt="`Logo ${proyecto.Tipo_Convo}`"
                  class="logo"
                  loading="lazy"
                />
                <!-- <img
                  v-if="proyecto.Tipo_Convo !== 'GORE'"
                  :src="getLogoForTipo(proyecto.Institucion_convocatoria)"
                  :alt="`Logo ${proyecto.Institucion_convocatoria}`"
                  class="logo"
                  loading="lazy"
                /> -->
              </div>
            </div>
          </div>

          <div class="project-body">
            <div class="info-grid">
              <div class="info-item">
                <h3 class="info-label">Academic@Lider</h3>
                <p class="info-content">
                  {{
                    proyecto.jefes.length > 0
                      ? formatList(proyecto.jefes)
                      : "No hay jefes asignados"
                  }}
                </p>
              </div>
              <!-- <div class="info-item">
                <h3 class="info-label">Académicos asociados</h3>
                <p class="info-content">
                  {{ formatList(proyecto.academicos) || "No especificado" }}
                </p>
              </div> -->

              <div class="info-item">
                <h3 class="info-label">Unidad Académica</h3>
                <p class="info-content">
                  {{ proyecto.UA || "No especificada" }}
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Monto total</h3>
                <p class="info-content">
                  {{ formatCurrency(proyecto.montoTotal) }}
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Fecha de postulación</h3>
                <p class="info-content">
                  {{ formatDate(proyecto.fecha_postulacion) }}
                </p>
              </div>

              <!-- <div class="info-item">
                <h3 class="info-label">Duración</h3>
                <p class="info-content">{{ formatDuration(proyecto.fecha_inicio) }}</p>
              </div> -->

              <div class="info-item full-width">
                <h3 class="info-label">Convocatorias</h3>
                <p class="info-content">
                  {{ formatList(proyecto.convocatorias) || "No especificadas" }}
                </p>
              </div>

              <div class="info-item full-width" v-if="proyecto.comentarios">
                <h3 class="info-label">Comentarios</h3>
                <p class="info-content">{{ proyecto.comentarios }}</p>
              </div>
            </div>

            <div
              class="project-footer"
              v-if="proyecto.enlaces || proyecto.documentos"
            >
              <div class="links" v-if="proyecto.enlaces">
                <a
                  v-for="(enlace, index) in proyecto.enlaces"
                  :key="index"
                  :href="enlace.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-button"
                >
                  {{ enlace.nombre || "Enlace externo" }}
                </a>
              </div>
              <div class="documents" v-if="proyecto.documentos">
                <button
                  v-for="(doc, index) in proyecto.documentos"
                  :key="index"
                  @click="openDocument(doc)"
                  class="doc-button"
                >
                  📄 {{ doc.nombre || "Documento" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import "../../assets/Proyecto_styles/vistaProyectos.css";

const props = defineProps({
  proyectos: Array,
  loading: Boolean,
  error: String,
});

const emit = defineEmits(["retry"]);

// Estados reactivos
const searchQuery = ref("");
const selectedFilter = ref("");
const sortAscending = ref(false);

// Computed properties
const uniqueTypes = computed(() => {
  const types = new Set();
  props.proyectos.forEach((p) => {
    types.add(p.Tipo_Convo);
    if (p.Institucion_convocatoria && p.Tipo_Convo !== "GORE") {
      types.add(p.Institucion_convocatoria);
    }
  });
  return Array.from(types).sort();
});

const groupedProjects = computed(() => {
  const grouped = {};
  props.proyectos.forEach((proyecto) => {
    if (!grouped[proyecto.nombre]) {
      grouped[proyecto.nombre] = {
        ...proyecto,
        jefes: new Set(), // Aquí irán los académicos con jefe = 1
        academicos: new Set(), // Aquí irán los académicos con jefe = 0
        montoTotal: 0,
        convocatorias: new Set(),
        enlaces: proyecto.enlaces || [],
        documentos: proyecto.documentos || [],
        destacado: proyecto.destacado || false,
        estado: proyecto.estado || "En progreso",
      };
    }

    // Modificamos esta parte para separar jefes de académicos
    if (proyecto.Academico) {
      if (proyecto.jefe === 1 || proyecto.jefe === true) {
        grouped[proyecto.nombre].jefes.add(proyecto.Academico);
      } else {
        grouped[proyecto.nombre].academicos.add(proyecto.Academico);
      }
    }

    grouped[proyecto.nombre].montoTotal += proyecto.monto || 0;
    if (proyecto.Convocatoria)
      grouped[proyecto.nombre].convocatorias.add(proyecto.Convocatoria);

    // Fusionar enlaces y documentos si existen en proyectos duplicados
    if (proyecto.enlaces) {
      grouped[proyecto.nombre].enlaces = [
        ...grouped[proyecto.nombre].enlaces,
        ...proyecto.enlaces,
      ];
    }
    if (proyecto.documentos) {
      grouped[proyecto.nombre].documentos = [
        ...grouped[proyecto.nombre].documentos,
        ...proyecto.documentos,
      ];
    }
  });

  return Object.values(grouped).map((p) => ({
    ...p,
    jefes: Array.from(p.jefes),
    academicos: Array.from(p.academicos),
    convocatorias: Array.from(p.convocatorias),
  }));
});

const filteredProjects = computed(() => {
  let filtered = [...groupedProjects.value];

  // Aplicar filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query) ||
        Array.from(p.academicos).some((a) => a.toLowerCase().includes(query)) ||
        Array.from(p.jefes).some((j) => j.toLowerCase().includes(query)) ||
        p.UA.toLowerCase().includes(query)
    );
  }

  // Aplicar filtro por tipo
  if (selectedFilter.value) {
    filtered = filtered.filter(
      (p) =>
        p.Tipo_Convo === selectedFilter.value ||
        p.Institucion_convocatoria === selectedFilter.value
    );
  }

  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    const dateA = new Date(a.fecha_postulacion || 0);
    const dateB = new Date(b.fecha_postulacion || 0);
    return sortAscending.value ? dateA - dateB : dateB - dateA;
  });

  return filtered;
});

// Métodos
const getLogoForTipo = (tipo) => {
  const logos = {
    CORFO:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSehNJ8c1LJpJ2z8Nr2XYscS09nWUlKwaulgA&s",
    GORE: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVIux8ljUoTxTk5iZz3tjeY1bvO95MdNHSgg&s",
    ANID: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGM-cRJH0Ht6RvxzhqhjRjnISvlCibYJFnuQ&s",
    PRIVADA: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    CODESSER:
      "https://yt3.googleusercontent.com/ytc/AIdro_nzFhzBeDsXQ3D7AF5rdL_n5us28Hn8hLUTSaK3xYwwtkU=s900-c-k-c0x00ffffff-no-rj",
    SQM: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZbCTVM6AKaqYd5XuTWp8-VRuTkEsNQJaJBA&s",
    "GORE-Valparaíso":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_GORE_Valparaiso.svg/1200px-Logo_GORE_Valparaiso.svg.png",
    FONDECYT:
      "https://www.anid.cl/wp-content/uploads/2021/07/logo-anid-2021.png",
    FONDAP: "https://www.anid.cl/wp-content/uploads/2021/07/logo-anid-2021.png",
    FONIS: "https://www.anid.cl/wp-content/uploads/2021/07/logo-anid-2021.png",
  };
  return (
    logos[tipo] || "https://cdn-icons-png.flaticon.com/512/2097/2097743.png"
  );
};

const formatCurrency = (amount) => {
  if (!amount) return "No especificado";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return "No especificada";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-CL", options);
};

const formatDuration = (start, end) => {
  if (!start || !end) return "No especificada";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return `${diffMonths} meses (${formatDate(start)} - ${formatDate(end)})`;
};

const formatList = (items) => {
  if (!items || items.length === 0) return "";
  return items.join(", ");
};

const getStatusClass = (status) => {
  const statusClasses = {
    "En progreso": "status-in-progress",
    Finalizado: "status-completed",
    Aprobado: "status-approved",
    Rechazado: "status-rejected",
    "En revisión": "status-review",
  };
  return statusClasses[status] || "status-unknown";
};

const toggleSort = () => {
  sortAscending.value = !sortAscending.value;
};

const openDocument = (doc) => {
  // Aquí iría la lógica para abrir el documento
  console.log("Abriendo documento:", doc);
  // window.open(doc.url, '_blank');
};
</script>

<style scoped>
.project-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  width: 100%;
}

.title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}


.project-header {
  display: flex;
  flex-direction: column;
  min-height: 80px; /* Altura mínima para el encabezado */
  justify-content: space-between;
}

.title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.project-title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.4;
  min-height: 3em; /* Altura fija para el título (2 líneas) */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limita a 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.logos {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  height: 50px; /* Tamaño fijo para los logos */
  width: auto;
  object-fit: contain;
}
</style>
