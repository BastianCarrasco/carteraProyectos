export function formatoMonto(monto) {
  if (monto === null || monto === undefined) return "No especificado";
  const numero = Number(monto) / 1000000;
  return numero === 1
    ? "1 millón de pesos"
    : `${numero % 1 === 0 ? numero : numero.toLocaleString("es-CL")} millones de pesos`;
}

export function formatoFecha(fecha) {
  if (!fecha) return "Sin fecha";
  try {
    const opciones = { year: "numeric", month: "long", day: "numeric" };
    return new Date(fecha).toLocaleDateString("es-CL", opciones);
  } catch {
    return "Fecha inválida";
  }
}


export function nombreUnidad(id, uaList) {
  if (!id) return "No asignada";
  const unidad = uaList.find((u) => u.id_unidad === id);
  return unidad ? unidad.nombre : `ID ${id}`;
}

export function nombreConvocatoria(id, convocatorias) {
  if (!id) return "No asignada";
  const convocatoria = convocatorias.find((c) => c.id === id);
  return convocatoria ? `${convocatoria.convocatoria} (${convocatoria.tipo})` : `ID ${id}`;
}

export function nombreTematica(id, tematicas) {
  if (!id) return "No asignada";
  const tematica = tematicas.find((t) => t.id_tematica === id);
  return tematica ? tematica.nombre : `ID ${id}`;
}

export function nombreApoyo(id, apoyos) {
    
  if (!id) return "No asignado";
  if (id=== 1 ) return "TODO";
  if (id!=1) return "PARCIAL";
  const apoyo = apoyos.find((a) => a.id_apoyo === id);
  return apoyo ? apoyo.detalle : `ID ${id}`;
}

export function nombreEstatus(id, estatusList) {
  if (!id) return "No asignado";
  const estatus = estatusList.find((e) => e.id_estatus === id);
  return estatus ? estatus.tipo : `ID ${id}`;
}

export function nombreAcademico(ids, academicos) {
  if (!Array.isArray(ids) || ids.length === 0) return "No asignado";
  const nombres = ids
    .filter((id) => id)
    .map((id) => {
      const acad = academicos.find((a) => a.id_academico === id);
      return acad ? `${acad.nombre} ${acad.a_paterno}` : `ID ${id}`;
    });
  return nombres.length ? nombres.join(", ") : "No asignado";
}
