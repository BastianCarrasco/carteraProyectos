<template>
  <div class="container">
    <header class="header">
      <div class="controls">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="Buscar proyectos..." aria-label="Buscar proyectos"
            class="search-input" />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-controls">
          <select v-model="selectedFilter" class="filter-select" aria-label="Filtrar por tipo">
            <option value="">Convocatorias</option>
            <option v-for="tipo in uniqueTypes" :key="tipo" :value="tipo">
              {{ tipo }}
            </option>
          </select>

          <select v-model="selectedTematica" class="filter-select" aria-label="Filtrar por temática">
            <option value="">Todas las temáticas</option>
            <option v-for="t in uniqueTematicas" :key="t" :value="t">
              {{ t }}
            </option>
          </select>

          <select v-model="selectedAcademico" class="filter-select" aria-label="Filtrar por académic@">
            <option value="">Académic@/s</option>
            <option v-for="a in uniqueAcademicos" :key="a" :value="a">
              {{ a }}
            </option>
          </select>

          <select v-model="selectedUnidad" class="filter-select" aria-label="Filtrar por unidad académica">
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
        <p>No se encontraron proyectos que coincidan con los criterios de búsqueda.</p>
      </div>

      <div class="project-list">
        <div v-for="proyecto in groupedProjects" :key="proyecto.ids.join('-')" class="project-card">
          <div class="project-header">
            <h2 class="project-title">{{ proyecto.nombre || "Proyecto sin nombre" }}</h2>
            <div class="title-wrapper">
              <span class="project-status" :class="getStatusClass(proyecto.estatus)">
                {{ proyecto.estatus || "Estado no especificado" }}
              </span>
              <div class="info-item">
                <h3 class="info-label">Temática</h3>
                <p class="info-content">{{ proyecto.tematica || "No especificada" }}</p>
              </div>
              <div class="logos">
                <img :src="getLogoForTipo(proyecto.nombre_convo)" :alt="`Logo ${proyecto.nombre_convo}`" class="logo"
                  loading="lazy" />
              </div>
            </div>
          </div>

          <div class="project-body">
            <div class="info-grid">
              <div class="info-item">
                <h3 class="info-label">Académic@/s-Líder</h3>
                <p class="info-content">
                  {{ proyecto.academicos.join(", ") }}
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Unidad Académica</h3>
                <p class="info-content">{{ proyecto.unidad || "No especificada" }}</p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Monto total</h3>
                <p class="info-content">{{ formatCurrency(proyecto.monto) }}</p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Tipo de apoyo</h3>
                <p class="info-content">
                  {{ proyecto.apoyo || "No especificado" }}
                  <span v-if="proyecto.detalle_apoyo">({{ proyecto.detalle_apoyo }})</span>
                </p>
              </div>

              <div class="info-item">
                <h3 class="info-label">Fecha de postulación</h3>
                <p class="info-content">{{ formatDate(proyecto.fecha_postulacion) }}</p>
              </div>

              <div class="info-item full-width">
                <h3 class="info-label">Convocatoria</h3>
                <p class="info-content">{{ proyecto.convocatoria || "No especificada" }}</p>
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

const emit = defineEmits(["retry"]);

const searchQuery = ref("");
const selectedFilter = ref("");
const selectedTematica = ref("");
const selectedAcademico = ref("");
const selectedUnidad = ref("");
const sortAscending = ref(false);

const uniqueTypes = computed(() => {
  const tipos = new Set();
  props.proyectos.forEach(p => {
    if (p.nombre_convo) tipos.add(p.nombre_convo);
    if (p.institucion) tipos.add(p.institucion);
  });
  return Array.from(tipos).sort();
});

const uniqueTematicas = computed(() => {
  const tSet = new Set();
  props.proyectos.forEach(p => {
    if (p.tematica) tSet.add(p.tematica);
  });
  return Array.from(tSet).sort();
});

const uniqueAcademicos = computed(() => {
  const aSet = new Set();
  props.proyectos.forEach(p => {
    if (Array.isArray(p.academicos)) {
      p.academicos.forEach(a => aSet.add(a));
    }
  });
  return Array.from(aSet).sort();
});

const uniqueUnidades = computed(() => {
  const uSet = new Set();
  props.proyectos.forEach(p => {
    if (p.unidad) uSet.add(p.unidad);
  });
  return Array.from(uSet).sort();
});

const filteredProjects = computed(() => {
  return props.proyectos
    .filter(p => {
      const q = searchQuery.value.toLowerCase();
      if (q && !(
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.academicos && p.academicos.some(a => a.toLowerCase().includes(q))) ||
        (p.unidad && p.unidad.toLowerCase().includes(q)) ||
        (p.tematica && p.tematica.toLowerCase().includes(q))
      )) {
        return false;
      }
      if (selectedFilter.value &&
        ![p.nombre_convo, p.institucion].includes(selectedFilter.value)) {
        return false;
      }
      if (selectedTematica.value && p.tematica !== selectedTematica.value) {
        return false;
      }
      if (selectedAcademico.value &&
        !(p.academicos && p.academicos.includes(selectedAcademico.value))) {
        return false;
      }
      if (selectedUnidad.value && p.unidad !== selectedUnidad.value) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.fecha_postulacion || 0);
      const db = new Date(b.fecha_postulacion || 0);
      return sortAscending.value ? da - db : db - da;
    });
});

const groupedProjects = computed(() => {
  const map = new Map();
  filteredProjects.value.forEach(p => {
    const key = p.nombre;
    if (!map.has(key)) {
      map.set(key, {
        ...p,
        academicos: Array.isArray(p.academicos) ? [...p.academicos] : [],
        ids: [p.id_proyecto]
      });
    } else {
      const ex = map.get(key);
      if (Array.isArray(p.academicos)) {
        p.academicos.forEach(a => {
          if (!ex.academicos.includes(a)) ex.academicos.push(a);
        });
      }
      ex.ids.push(p.id_proyecto);
    }
  });
  return Array.from(map.values());
});

const getLogoForTipo = (tipo) => {
  const logos = {
    CORFO: "https://.../logo-corfo.png",
    GORE: "https://.../logo-gore.png",
    ANID: "https://.../logo-anid.png",
    PRIVADA: "https://.../logo-privada.png"
    // añade más según tus tipos
  };
  return logos[tipo] || "https://cdn-icons-png.flaticon.com/512/2097/2097743.png";
};

const formatCurrency = (amount) => {
  if (amount == null) return "No especificado";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);
};

const formatDate = (iso) => {
  if (!iso) return "No especificada";
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" });
};

const getStatusClass = (estado) => {
  const map = {
    Postulado: "status-in-progress",
    Finalizado: "status-completed",
    Aprobado: "status-approved",
    Perfil: "status-rejected",
    "En revisión": "status-review"
  };
  return map[estado] || "status-unknown";
};
</script>

<style scoped>
.project-header {
  height: 180px;
  /* Altura fija para todos los headers */
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
  max-height: 4.5em;
  /* Máximo 2-3 líneas */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  /* Cambia el número de líneas visibles */
  -webkit-box-orient: vertical;
}

.project-body {
  flex: 1;
  /* Hace que el cuerpo ocupe el espacio restante */
  padding: 1rem;
  overflow: hidden;
  /* Evita que el contenido desborde */
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
