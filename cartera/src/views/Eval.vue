<template>
  <div class="fondos-container">
    <h1 class="title">Fondos Concursables</h1>
    
    <!-- Filtros avanzados -->
    <div class="filters-container">
      <div class="filters">
        <div class="filter-group">
          <label>Tipo de Fondo:</label>
          <select v-model="filters.tipoFondo" @change="updateTipoOptions">
            <option :value="null">Todos</option>
            <option v-for="fondo in tiposFondoUnicos" :value="fondo">{{ fondo }}</option>
          </select>
        </div>

        <!-- <div class="filter-group">
          <label>Tipo:</label>
          <select v-model="filters.tipo">
            <option :value="null">Todos</option>
            <option v-for="t in filteredTipos" :value="t">{{ getTipoName(t) }}</option>
          </select>
        </div> -->

        <div class="filter-group">
          <label>TRL:</label>
          <select v-model="filters.trl">
            <option :value="null">Todos</option>
            <option v-for="n in 9" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Plazo:</label>
          <select v-model="filters.plazo">
            <option :value="null">Todos</option>
            <option v-for="p in plazosUnicos" :value="p">{{ p }}</option>
          </select>
        </div>

        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-redo"></i> Reiniciar
        </button>
      </div>

      <div class="search-box">
        <input v-model="searchText" placeholder="Buscar por nombre o objetivo..." />
        <i class="fas fa-search"></i>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando fondos...
    </div>

    <!-- Resultados -->
    <div v-else>
      <div v-if="filteredFondos.length === 0" class="no-results">
        <i class="fas fa-info-circle"></i> No se encontraron fondos con los filtros seleccionados
      </div>

      <div v-else>
        <div class="results-info">
          Mostrando {{ filteredFondos.length }} de {{ fondos.length }} fondos
        </div>

        <div class="fondos-grid">
          <div v-for="fondo in filteredFondos" :key="fondo.id" class="fondo-card">
            <div class="fondo-header">
              <h2>{{ fondo.nombre }}</h2>
              <span class="fondo-badge" :class="getFondoBadgeClass(fondo['tipo de fondo'])">
                {{ fondo['tipo de fondo'] }}
              </span>
            </div>
            
            <div class="fondo-meta">
              <div class="meta-item">
                <i class="fas fa-money-bill-wave"></i>
                <span><strong>Financiamiento:</strong> {{ fondo.financiamiento }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span><strong>Plazo:</strong> {{ fondo.plazo }}</span>
              </div>
            </div>

            <div class="fondo-dates">
              <div class="date-item">
                <i class="fas fa-play-circle"></i>
                <span><strong>Inicio:</strong> {{ formatDate(fondo.inicio) }}</span>
              </div>
              <div class="date-item">
                <i class="fas fa-flag-checkered"></i>
                <span><strong>Cierre:</strong> {{ formatDate(fondo.cierre) }}</span>
              </div>
            </div>

            <div class="fondo-tags">
              <span v-if="fondo.trl" class="tag trl">
                <i class="fas fa-microscope"></i> TRL {{ fondo.trl }}
              </span>
              <span v-if="fondo.tipo" class="tag tipo">
                <i class="fas fa-tag"></i> {{ getTipoName(fondo.tipo) }}
              </span>
            </div>

            <div class="fondo-content">
              <h3><i class="fas fa-bullseye"></i> Objetivo</h3>
              <p>{{ fondo.objetivo }}</p>

              <div v-if="fondo.req" class="fondo-req">
                <h3><i class="fas fa-clipboard-list"></i> Requisitos</h3>
                <ul>
                  <li v-for="(req, index) in formatReqs(fondo.req)" :key="index">{{ req }}</li>
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
        plazo: null
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
        const matchesSearch = this.searchText === '' || 
          fondo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
          fondo.objetivo.toLowerCase().includes(this.searchText.toLowerCase())
        
        const matchesFilters = (
          (this.filters.tipoFondo === null || fondo['tipo de fondo'] === this.filters.tipoFondo) &&
          (this.filters.tipo === null || fondo.tipo === this.filters.tipo) &&
          (this.filters.trl === null || fondo.trl === this.filters.trl) &&
          (this.filters.plazo === null || fondo.plazo === this.filters.plazo)
        )
        
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
    },
    plazosUnicos() {
      return [...new Set(this.fondos.map(f => f.plazo).filter(Boolean))].sort((a, b) => {
        const numA = parseInt(a)
        const numB = parseInt(b)
        return numA - numB
      })
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
      // Separar por saltos de línea o puntos y números
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
        plazo: null
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

.fondos-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.2rem;
  font-weight: 600;
}

.filters-container {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 180px;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

select, input {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.reset-btn {
  padding: 10px 15px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 5px;
}

.reset-btn:hover {
  background: #5a6268;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding-left: 35px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading i, .no-results i {
  font-size: 1.5rem;
  color: #3498db;
}

.results-info {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.fondos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
}

.fondo-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fondo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.fondo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.fondo-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  flex: 1;
}

.fondo-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.anid-badge {
  background: #3498db;
}

.corfo-badge {
  background: #e74c3c;
}

.pucv-badge {
  background: #9b59b6;
}

.fondo-meta, .fondo-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.meta-item, .date-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  font-size: 0.9rem;
}

.meta-item i, .date-item i {
  color: #7f8c8d;
  width: 16px;
  text-align: center;
}

.fondo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag.trl {
  background: #e3f2fd;
  color: #1976d2;
}

.tag.tipo {
  background: #e8f5e9;
  color: #388e3c;
}

.fondo-content h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 15px 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fondo-content h3 i {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.fondo-content p {
  color: #495057;
  line-height: 1.6;
  margin: 0;
}

.fondo-req ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.fondo-req li {
  color: #495057;
  margin-bottom: 5px;
  line-height: 1.5;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .fondos-grid {
    grid-template-columns: 1fr;
  }
  
  .fondo-card {
    padding: 20px;
  }
}
</style>