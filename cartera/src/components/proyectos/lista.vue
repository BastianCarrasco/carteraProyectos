<template>
  <div class="container">
    <header class="header">
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
            <option value="">Convocatorias</option>
            <option v-for="tipo in uniqueTypes" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>
          <!-- <button
            @click="toggleSort"
            class="sort-button"
            aria-label="Cambiar orden"
          >
            {{ sortAscending ? "Más nuevos primero" : "Más antiguos primero" }}
          </button> -->

          <select
            v-model="selectedTematica"
            class="filter-select"
            aria-label="Filtrar por temática"
          >
            <option value="">Todas las temáticas</option>
            <option v-for="t in uniqueTematicas" :key="t" :value="t">
              {{ t }}
            </option>
          </select>

          <select
            v-model="selectedAcademico"
            class="filter-select"
            aria-label="Filtrar por académic@"
          >
            <option value="">Académic@/s</option>
            <option v-for="a in uniqueAcademicos" :key="a" :value="a">
              {{ a }}
            </option>
          </select>

          <select
            v-model="selectedUnidad"
            class="filter-select"
            aria-label="Filtrar por unidad académica"
          >
            <option value="">Todas las unidades</option>
            <option v-for="u in uniqueUnidades" :key="u" :value="u">
              {{ u }}
            </option>
          </select>
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
      <div v-if="groupedProjects.length === 0" class="empty-state">
        <p>
          No se encontraron proyectos que coincidan con los criterios de
          búsqueda.
        </p>
      </div>

      <div class="project-list">
        <div
          v-for="proyecto in groupedProjects"
          :key="proyecto.ids.join('-')"
          class="project-card"
        >
          <div class="project-header">
            <h2 class="project-title">
              {{ proyecto.nombre || "Proyecto sin nombre" }}
            </h2>
            <div class="title-wrapper">
              <span
                class="project-status"
                :class="getStatusClass(proyecto.estatus)"
              >
                {{ proyecto.estatus || "Estado no especificado" }}
              </span>

              <div class="info-item">
                <h3 class="info-label">Temática</h3>
                <p class="info-content">
                  {{ proyecto.tematica || "No especificada" }}
                </p>
              </div>
              <div class="logos">
                <img
                  :src="getLogoForTipo(proyecto.tipo_convo)"
                  :alt="`Logo ${proyecto.tipo_convo}`"
                  class="logo"
                  loading="lazy"
                />
                <!-- <img
                  v-if="proyecto.inst_convo && proyecto.inst_convo !== proyecto.tipo_convo"
                  :src="getLogoForTipo(proyecto.inst_convo)"
                  :alt="`Logo ${proyecto.inst_convo}`"
                  class="logo"
                  loading="lazy"
                /> -->
              </div>
            </div>
          </div>

          <div class="project-body">
            <div class="info-grid">
              <div class="info-item">
                <h3 class="info-label">Académic@/s-Líder</h3>
                <p class="info-content">
                  {{ proyecto.academicos.join(", ") }}
                  <!-- <span v-if="proyecto.jefe">(Líder: {{ proyecto.jefe }})</span> -->
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Unidad Académica</h3>
                <p class="info-content">
                  {{ proyecto.unidad || "No especificada" }}
                </p>
              </div>

              <!-- <div class="info-item">
                <h3 class="info-label">Temática</h3>
                <p class="info-content">
                  {{ proyecto.tematica || "No especificada" }}
                </p>
              </div> -->

              <div class="info-item">
                <h3 class="info-label">Monto total</h3>
                <p class="info-content">
                  {{ formatCurrency(proyecto.monto) }}
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Tipo de apoyo</h3>
                <p class="info-content">
                  {{ proyecto.tipo_apoyo || "No especificado" }}
                  <span v-if="proyecto.detalle">({{ proyecto.detalle }})</span>
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Fecha de postulación</h3>
                <p class="info-content">
                  {{ formatDate(proyecto.fecha_postulacion) }}
                </p>
              </div>

              <div class="info-item full-width">
                <h3 class="info-label">Convocatoria</h3>
                <p class="info-content">
                  {{ proyecto.convo_nombre || "No especificada" }}
                </p>
              </div>

              <div class="info-item full-width" v-if="proyecto.comentarios">
                <h3 class="info-label">Comentarios</h3>
                <p class="info-content">{{ proyecto.comentarios }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import "../../assets/Proyecto_styles/vistaProyectos.css";

const props = defineProps({
  proyectos: Array,
  loading: Boolean,
  error: String,
});

const selectedTematica = ref("");
const selectedAcademico = ref("");
const selectedUnidad = ref("");


const emit = defineEmits(["retry"]);

// Estados reactivos
const searchQuery = ref("");
const selectedFilter = ref("");
const sortAscending = ref(false);

// Computed properties
const uniqueTypes = computed(() => {
  const types = new Set();
  props.proyectos.forEach((p) => {
    if (p.tipo_convo) types.add(p.tipo_convo);
    if (p.inst_convo) types.add(p.inst_convo);
  });
  return Array.from(types).sort();
});

const uniqueTematicas = computed(() => {
  const tematicas = new Set();
  props.proyectos.forEach((p) => {
    if (p.tematica) tematicas.add(p.tematica);
  });
  return Array.from(tematicas).sort();
});

const uniqueAcademicos = computed(() => {
  const academicos = new Set();
  props.proyectos.forEach((p) => {
    if (p.academico) academicos.add(p.academico);
  });
  return Array.from(academicos).sort();
});

const uniqueUnidades = computed(() => {
  const unidades = new Set();
  props.proyectos.forEach((p) => {
    if (p.unidad) unidades.add(p.unidad);
  });
  return Array.from(unidades).sort();
});

const filteredProjects = computed(() => {
  let filtered = [...props.proyectos];

  // Aplicar filtro de búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(query)) ||
        (p.academico && p.academico.toLowerCase().includes(query)) ||
        (p.unidad && p.unidad.toLowerCase().includes(query)) ||
        (p.tematica && p.tematica.toLowerCase().includes(query))
    );
  }

  // Aplicar filtro por tipo
  if (selectedFilter.value) {
    filtered = filtered.filter(
      (p) =>
        p.tipo_convo === selectedFilter.value ||
        p.inst_convo === selectedFilter.value
    );
  }

  // Filtro por temática
  if (selectedTematica.value) {
    filtered = filtered.filter((p) => p.tematica === selectedTematica.value);
  }

  // Filtro por académic@
  if (selectedAcademico.value) {
  filtered = filtered.filter((p) => p.academico === selectedAcademico.value);
}


  // Filtro por unidad académica
  if (selectedUnidad.value) {
    filtered = filtered.filter((p) => p.unidad === selectedUnidad.value);
  }

  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    const dateA = new Date(a.fecha_postulacion || 0);
    const dateB = new Date(b.fecha_postulacion || 0);
    return sortAscending.value ? dateA - dateB : dateB - dateA;
  });

  return filtered;
});

const groupedProjects = computed(() => {
  const projectsMap = new Map();

  filteredProjects.value.forEach((proyecto) => {
    if (!projectsMap.has(proyecto.nombre)) {
      projectsMap.set(proyecto.nombre, {
        ...proyecto,
        academicos: [proyecto.academico],
        hasJefe: proyecto.jefe === 1,
        jefe: proyecto.jefe === 1 ? proyecto.academico : null,
        ids: [proyecto.id_proyecto],
      });
    } else {
      const existing = projectsMap.get(proyecto.nombre);
      if (!existing.academicos.includes(proyecto.academico)) {
        existing.academicos.push(proyecto.academico);
      }
      if (proyecto.jefe === 1) {
        existing.hasJefe = true;
        existing.jefe = proyecto.academico;
      }
      existing.ids.push(proyecto.id_proyecto);
    }
  });

  return Array.from(projectsMap.values());
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

const getStatusClass = (status) => {
  const statusClasses = {
    Postulado: "status-in-progress",
    Finalizado: "status-completed",
    Aprobado: "status-approved",
    Perfil: "status-rejected",
    "En revisión": "status-review",
  };
  return statusClasses[status] || "status-unknown";
};

const toggleSort = () => {
  sortAscending.value = !sortAscending.value;
};
</script>

<style scoped>
.project-header {
  height: 180px; /* Altura fija para todos los headers */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px 8px 0 0;
  box-sizing: border-box;
}

.project-title {
  font-size: 1.25rem;
  font-weight: bold;
  word-wrap: break-word;
  line-height: 1.4;
  margin: 0;
  max-height: 4.5em; /* Máximo 2-3 líneas */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Cambia el número de líneas visibles */
  -webkit-box-orient: vertical;
}

.project-body {
  flex: 1; /* Hace que el cuerpo ocupe el espacio restante */
  padding: 1rem;
  overflow: hidden; /* Evita que el contenido desborde */
}

.title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  gap: 0.5rem;
}

.project-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
}

.logos {
  display: flex;
  gap: 0.5rem;
}

.logo {
  max-height: 32px;
  max-width: 80px;
  object-fit: contain;
}
</style>
