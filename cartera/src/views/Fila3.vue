<template>
  <div class="proyecto-card">
    <h2>{{ proyecto.nombre || "Proyecto sin nombre" }}</h2>

    <div class="detalle">
      <div><strong>Monto:</strong> {{ formatoMonto(proyecto.monto) }}</div>
      <div>
        <strong>Fecha de Postulación:</strong>
        {{ formatoFecha(proyecto.fecha_postulacion) }}
      </div>
      <div>
        <strong>Comentarios:</strong>
        {{ proyecto.comentarios || "Sin comentarios" }}
      </div>
      <div><strong>Unidad:</strong> {{ nombreUnidad(proyecto.id_unidad) }}</div>
      <div>
        <strong>Convocatoria:</strong>
        {{ nombreConvocatoria(proyecto.id_convocatoria) }}
      </div>
      <div>
        <strong>Temática:</strong> {{ nombreTematica(proyecto.id_tematica) }}
      </div>
      <div>
        <strong>Tipo de Apoyo:</strong>
        {{ nombreApoyo(proyecto.id_apoyo) }}
        <span v-if="proyecto.tags_parciales && proyecto.tags_parciales.length">
          -
          <span v-for="(tag, index) in proyecto.tags_parciales" :key="index">
            {{ tag
            }}<span v-if="index < proyecto.tags_parciales.length - 1">, </span>
          </span>
        </span>
      </div>

      <div>
        <strong>Estatus:</strong> {{ nombreEstatus(proyecto.id_estatus) }}
      </div>
      <div>
        <div>
          <strong>Académico(s):</strong>
          {{ nombreAcademico(proyecto.academicos) }}
        </div>
      </div>
    </div>
    <button @click="crearProyecto" class="crear-proyecto-btn">
      Crear Proyecto en Backend
    </button>

    <div v-if="respuestaBackend" class="respuesta-backend">
      <strong>Respuesta del backend:</strong> {{ respuestaBackend }}
    </div>

    <div v-if="errorBackend" class="error-backend">
      <strong>Error:</strong> {{ errorBackend }}
    </div>
  </div>
</template>

<script>
import {
  fetchTematicas,
  fetchEstatus,
  fetchConvocatorias,
  fetchUA,
  fetchApoyos,
  fetchAcademicos,
} from "../plugins/useSistemaData.js";

import {
  nombreUnidad,
  nombreConvocatoria,
  nombreTematica,
  nombreApoyo,
  nombreEstatus,
  nombreAcademico,
  formatoMonto,
  formatoFecha,
} from "../components/funciones.js";

import "../assets/Proyecto_styles/Fila3.css";

export default {
  props: {
    proyecto: {
      type: Object,
      default: () => ({
        nombre: "",
        monto: null,
        fecha_postulacion: null,
        comentarios: "",
        id_unidad: null,
        id_convocatoria: null,
        id_tematica: null,
        id_apoyo: null,
        id_estatus: null,
        id_academico: [],
      }),
    },
  },
  data() {
    return {
      tematicas: [],
      estatusList: [],
      convocatorias: [],
      uaList: [],
      apoyos: [],
      academicos: [],
      respuestaBackend: null,
      errorBackend: null,
      isLoading: false,
    };
  },
  async created() {
    try {
      const [temas, estatus, convocs, ua, apoyo, acads] = await Promise.all([
        fetchTematicas(),
        fetchEstatus(),
        fetchConvocatorias(),
        fetchUA(),
        fetchApoyos(),
        fetchAcademicos(),
      ]);

      this.tematicas = temas.data || temas;
      this.estatusList = estatus.data || estatus;
      this.convocatorias = convocs.data || convocs;
      this.uaList = ua.data || ua;
      this.apoyos = apoyo.data || apoyo;
      this.academicos = acads.data || acads;
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  },
  methods: {
    nombreUnidad(id) {
      return nombreUnidad(id, this.uaList);
    },
    nombreConvocatoria(id) {
      return nombreConvocatoria(id, this.convocatorias);
    },
    nombreTematica(id) {
      return nombreTematica(id, this.tematicas);
    },
    nombreApoyo(id) {
      return nombreApoyo(id, this.apoyos);
    },
    nombreEstatus(id) {
      return nombreEstatus(id, this.estatusList);
    },
    nombreAcademico(ids) {
      return nombreAcademico(ids, this.academicos);
    },
    formatoMonto,
    formatoFecha,
    async crearProyecto() {
      this.isLoading = true;
      this.errorBackend = null;
      this.respuestaBackend = null;

      try {
        const proyectoData = {
          nombre: this.proyecto.nombre,
          monto: this.proyecto.monto || 0,
          fecha_postulacion: this.proyecto.fecha_postulacion,
          comentarios: this.proyecto.comentarios || null,
          unidad: this.proyecto.id_unidad,
          id_convocatoria: this.proyecto.id_convocatoria || null,
          id_tematica: this.proyecto.id_tematica,
          id_apoyo: this.proyecto.id_apoyo || null,
          id_estatus: this.proyecto.id_estatus,
          id_kth: null,
        };

        const proyectoResponse = await fetch(
          "https://kth2025backend-production.up.railway.app/proyectos",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(proyectoData),
          }
        );

        if (!proyectoResponse.ok) {
          const errorData = await proyectoResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error HTTP: ${proyectoResponse.status}`
          );
        }

        const proyectoResponseData = await proyectoResponse.json();
        const idProyecto = proyectoResponseData.data?.id_proyecto;

        if (!idProyecto) {
          throw new Error("El backend no devolvió un ID de proyecto válido");
        }

        this.respuestaBackend = `Proyecto creado con ID: ${idProyecto}`;

        if (
          Array.isArray(this.proyecto.academicos) &&
          this.proyecto.academicos.length > 0
        ) {
          try {
            const asociaciones = this.proyecto.academicos.map(
              async (idAcademico) => {
                const academicoData = {
                  id_proyecto: idProyecto,
                  id_academico: idAcademico,
                  jefe: 1,
                };

                const response = await fetch(
                  "https://kth2025backend-production.up.railway.app/proyecto-academico",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(academicoData),
                  }
                );

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(
                    `Error asociando académico ${idAcademico}: ${
                      errorData.message || response.status
                    }`
                  );
                }

                return response.json();
              }
            );

            await Promise.all(asociaciones);
            this.respuestaBackend += ". Académicos asociados correctamente.";
          } catch (error) {
            console.error("Error asociando académicos:", error);
            this.respuestaBackend += `. Pero hubo un error asociando académicos: ${error.message}`;
          }
        } else {
          this.respuestaBackend += ". No hay académicos para asociar.";
        }
      } catch (error) {
        console.error("Error al crear proyecto:", error);
        this.errorBackend = error.message || "Error al crear el proyecto";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped></style>
