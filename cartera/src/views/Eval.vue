<template>
  <div class="fondos-container">
    <h1 class="title">
      Fondos Concursables
    </h1>

    <!-- Advanced Filters -->
    <div class="filters-container">
      <div class="filters">
        <div class="filter-group">
          <label for="tipoFondo">
            Tipo de Fondo:
          </label>
          <select id="tipoFondo" v-model="filters.tipoFondo" @change="updateTipoOptions">
            <option :value="null">
              Todos
            </option>
            <option v-for="fondo in tiposFondoUnicos" :key="fondo" :value="fondo">
              {{ fondo }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="trl">
            TRL:
          </label>
          <select id="trl" v-model="filters.trl">
            <option :value="null">
              Todos
            </option>
            <option v-for="n in 9" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="vigente">
            Vigentes:
          </label>
          <select id="vigente" v-model="filters.vigente">
            <option :value="null">
              Todos
            </option>
            <option :value="true">
              Sí
            </option>
            <option :value="false">
              No
            </option>
          </select>
        </div>

        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-redo">
          </i>
          Reiniciar
        </button>
      </div>

      <div class="search-box">
        <input v-model="searchText" placeholder="Buscar por nombre o objetivo..." />
        <i class="fas fa-search">
        </i>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin">
      </i>
      Cargando fondos...
    </div>

    <!-- Results -->
    <div v-else>
      <div v-if="filteredFondos.length === 0" class="no-results">
        <i class="fas fa-info-circle">
        </i>
        No se encontraron fondos con los filtros seleccionados
      </div>

      <div v-else>
        <div class="results-info">
          Mostrando {{ filteredFondos.length }} de {{ fondos.length }} fondos
        </div>

        <div class="fondos-grid">
          <div v-for="fondo in filteredFondos" :key="fondo.id" class="fondo-card">
           <div class="fondo-header">
  <h2>
    {{ fondo.nombre }}
  </h2>
  <h3>
    {{ fondo['tipo de fondo'] }}
  </h3>
</div>

            <div class="fondo-meta">
             
              <div class="meta-item">
                <i class="fa fa-credit-card-alt">
                </i>
                <span>
                  <strong>
                    Financiamiento:
                  </strong>
                  {{ fondo.financiamiento }}
                </span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar-alt">
                </i>
                <span>
                  <strong>
                    Duración del Instrumento:
                  </strong>
                  {{ fondo.plazo }}
                </span>
              </div>
            </div>

            <div class="fondo-dates">
              <div class="date-item">
                <i class="fas fa-play-circle">
                </i>
                
                  <strong>
                    Inicio:   {{ formatDate(fondo.inicio) }}
                  </strong>
                
     
              </div>
              <div class="date-item">
                <i class="fas fa-flag-checkered">
                </i>
        
                  <strong>
                    Cierre: {{ formatDate(fondo.cierre) }}
                  </strong>
                 
            
              </div>
            </div>

            <div class="fondo-tags">
              <span v-if="fondo.trl" class="tag trl">
                TRL {{ fondo.trl }}
              </span>
              <span v-if="fondo.tipo" class="tag tipo">
                {{ getTipoName(fondo.tipo) }}
              </span>
            </div>

            <div class="fondo-content">
              <h3>
                <i class="fas fa-bullseye">
                </i>
                Objetivo
              </h3>
              <p>
                {{ fondo.objetivo }}
              </p>

              <div v-if="fondo.req" class="fondo-req">
                <h3>
                  <i class="fas fa-clipboard-list">
                  </i>
                  Requisitos
                </h3>
                <ul>
                  <li v-for="(req, index) in formatReqs(fondo.req)" :key="index">
                    {{ req }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/Proyecto_styles/fondos.css'

export default {
  data() {
    return {
      fondos: [],
      loading: true,
      searchText: '',
      filters: {
        tipoFondo: null,
        tipo: null,
        trl: null,
        vigente: null
      },
      tipoNames: {
        1: 'Innovación Productiva',
        4: 'Investigación y Desarrollo',
        5: 'Investigación Académica'
      }
    }
  },
  computed: {
    filteredFondos() {
      return this.fondos.filter(fondo => {
        const matchesSearch =
          this.searchText === '' ||
          fondo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
          fondo.objetivo.toLowerCase().includes(this.searchText.toLowerCase())

        let vigente = false
        if (fondo.inicio && fondo.cierre) {
          const hoy = new Date()
          const inicio = new Date(fondo.inicio)
          const cierre = new Date(fondo.cierre)
          vigente = hoy >= inicio && hoy <= cierre
        }

        const matchesFilters =
          (this.filters.tipoFondo === null || fondo['tipo de fondo'] === this.filters.tipoFondo) &&
          (this.filters.tipo === null || fondo.tipo === this.filters.tipo) &&
          (this.filters.trl === null || fondo.trl === this.filters.trl) &&
          (this.filters.vigente === null || vigente === this.filters.vigente)

        return matchesSearch && matchesFilters
      })
    },
    tiposFondoUnicos() {
      return [...new Set(this.fondos.map(f => f['tipo de fondo']))].sort()
    },
    tiposUnicos() {
      return [...new Set(this.fondos.map(f => f.tipo).filter(Boolean))].sort()
    },
    filteredTipos() {
      if (!this.filters.tipoFondo) return this.tiposUnicos
      return [...new Set(
        this.fondos
          .filter(f => f['tipo de fondo'] === this.filters.tipoFondo)
          .map(f => f.tipo)
          .filter(Boolean)
      )].sort()
    }
  },
  methods: {
    async fetchFondos() {
      try {
        const response = await fetch('https://kth2025backend-production.up.railway.app/fondos')
        const data = await response.json()
        this.fondos = data.data || []
      } catch (error) {
        console.error('Error fetching fondos:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'No especificado'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-CL', options)
    },
    formatReqs(reqs) {
      if (!reqs) return []
      return reqs.split(/\n|\d+\./).filter(item => item.trim() !== '')
    },
    getTipoName(tipo) {
      return this.tipoNames[tipo] || `Tipo ${tipo}`
    },
    getFondoBadgeClass(tipoFondo) {
      return {
        'anid-badge': tipoFondo === 'ANID',
        'corfo-badge': tipoFondo === 'CORFO',
        'pucv-badge': tipoFondo === 'Internas PUCV'
      }
    },
    updateTipoOptions() {
      this.filters.tipo = null
    },
    resetFilters() {
      this.filters = {
        tipoFondo: null,
        tipo: null,
        trl: null,
        vigente: null
      }
      this.searchText = ''
    }
  },
  mounted() {
    this.fetchFondos()
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* General container for the entire component */
.fondos-container {
  max-width: 100%; /* Ensure it takes the full width available */
  padding: 20px; /* Add padding for spacing around the content */
}

/* Title Styling */
.title {
  font-size: 2rem; /* Larger font size */
  font-weight: bold; /* Bold font weight */
  margin-bottom: 20px; /* Space below the title */
  text-align: center; /* Center the title */
  color: #333; /* Darker color for better readability */
  padding: 15px;
  border-radius: 8px;
  background-color: #f0f0f0;
}

/* Filters Container */
.filters-container {
  display: flex;
  justify-content: space-between; /* Space out the filters and search */
  align-items: center; /* Vertically align items */
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}

/* Filters Section */
.filters {
  display: flex;
  gap: 15px; /* Space between filter groups */
}

.filter-group {
  display: flex;
  flex-direction: column; /* Stack label and select */
  gap: 5px; /* Space between label and select */
}

label {
  font-weight: 500; /* Slightly bolder labels */
  color: #555; /* Slightly lighter label color */
}

select,
input[type="text"] {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  color: #333;
}

/* Reset Button */
.reset-btn {
  background-color: #007bff; /* Primary color for the button */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease; /* Smooth transition for hover */
}

.reset-btn:hover {
  background-color: #0056b3; /* Darker shade on hover */
}

/* Search Box */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box i {
  color: #999; /* Icon color */
}

/* Loading State */
.loading {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: #777;
}

.loading i {
  animation: spin 1s linear infinite;
  font-size: 2rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* No Results Message */
.no-results {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: #777;
}

.no-results i {
  font-size: 2rem;
  color: #aaa;
}

/* Results Info */
.results-info {
  margin-bottom: 10px;
  font-style: italic;
  color: #666;
}

/* Fondos Grid */
.fondos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Responsive columns */
  gap: 20px; /* Space between cards */
}

/* Fondo Card */
.fondo-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  background-color: white;
}

.fondo-card:hover {
  transform: translateY(-3px); /* Slightly lift the card on hover */
}

.fondo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.fondo-header h2 {
  font-size: 1.3rem;
  margin: 0;
  color: #333;
}

.fondo-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

.anid-badge {
  background-color: #dc3545; /* Red */
}

.corfo-badge {
  background-color: #ffc107; /* Yellow */
  color: black;
}

.pucv-badge {
  background-color: #17a2b8; /* Light Blue */
}

/* Fondo Meta */
.fondo-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item i {
  font-size: 1.1rem;
  color: #999;
}

/* Fondo Dates */
.fondo-dates {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-item i {
  font-size: 1.1rem;
  color: #999;
}

/* Fondo Tags */
.fondo-tags {
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-right: 5px;
  font-weight: 500;
  color: white;
}

.trl {
  background-color: #28a745; /* Green */
}

.tipo {
  background-color: #007bff; /* Blue */
}

/* Fondo Content */
.fondo-content h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #333;
  display: flex;
  align-items: center; /* Vertically align the icon */
  gap: 5px;
}

.fondo-content i {
  font-size: 1.1rem;
  color: #555;
}

.fondo-content p {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #444;
}

/* Fondo Requirements */
.fondo-req ul {
  list-style: none;
  padding-left: 0;
}

.fondo-req li {
  margin-bottom: 5px;
  padding-left: 20px; /* Indentation for list items */
  position: relative; /* For the bullet point */
  color: #444;
}

.fondo-req li::before {
  content: '\2022'; /* Unicode character for a bullet point */
  position: absolute;
  left: 0;
  top: 0;
  font-size: 1.2rem; /* Size of the bullet point */
  color: #007bff; /* Color of the bullet point */
}


/* Fondo Card - Estructura base */
.fondo-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%; /* Asegura que todas las cards tengan la misma altura */
}

/* Secciones con altura fija */
.fondo-header {
  min-height: 60px; /* Altura fija para el encabezado */
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.fondo-meta {
  min-height: 80px; /* Altura fija para la sección meta */
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.fondo-dates {
  min-height: 50px; /* Altura fija para las fechas */
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.fondo-tags {
  min-height: 40px; /* Altura fija para los tags */
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.fondo-content {
  flex: 1; /* Hace que esta sección ocupe el espacio restante */
  display: flex;
  flex-direction: column;
}

.fondo-content p,
.fondo-req ul {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ajustes específicos para el contenido */
.fondo-header h2 {
  font-size: 1.3rem;
  margin: 0 0 5px 0; /* Espacio entre nombre y tipo */
  color: #333;
  text-align: center; /* Centrar el título */
}

.fondo-header h3 {
  font-size: 1rem;
  margin: 0;
  color: #666;
  text-align: center;
  font-weight: normal;
}

/* Asegurar que el texto largo no rompa el diseño */
.fondo-content p {
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Limitar a 4 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.fondo-req ul {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limitar a 3 elementos */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>