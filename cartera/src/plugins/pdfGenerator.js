// pdfGenerator.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generarInformeProyectos = (proyectos, formatDate, formatCurrency) => {
  try {
    // Configuración del documento
    const doc = new jsPDF({
      unit: 'mm',
      format: 'letter',
    });

    // Constantes
    const marginLeft = 15;
    const marginRight = 15;
    const marginTop = 20;
    const marginBottom = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginLeft - marginRight;
    const maxYPosition = pageHeight - marginBottom;

    // Función auxiliar para chequear salto de página
    const checkAddPage = (currentY) => {
      if (currentY > maxYPosition) {
        doc.addPage('letter');
        return marginTop;
      }
      return currentY;
    };

    // Función auxiliar para agregar texto con salto automático
    const addTextWithPageCheck = (text, x, y, lineSpacing = 7) => {
      y = checkAddPage(y);
      doc.text(text, x, y);
      return y + lineSpacing;
    };

    // Estilo general
    doc.setFont('helvetica');
    doc.setTextColor(40);

    // Título
    doc.setFontSize(16);
    doc.setTextColor(0, 60, 120);
    doc.text('INFORME DETALLADO DE PROYECTOS', pageWidth / 2, marginTop, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, marginTop + 7, { align: 'center' });

    let yPosition = marginTop + 15; // Después del título

    let proyectosEnPagina = 0; // Contador de proyectos en página

    // Recorremos los proyectos
    proyectos?.forEach((proyecto, index) => {

      // Si ya imprimimos 2 proyectos → nueva página
      if (proyectosEnPagina === 2) {
        doc.addPage('letter');

        // Reimprimir título de la nueva página
        doc.setFontSize(16);
        doc.setTextColor(0, 60, 120);
        doc.text('INFORME DETALLADO DE PROYECTOS', pageWidth / 2, marginTop, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth / 2, marginTop + 7, { align: 'center' });

        yPosition = marginTop + 15;
        proyectosEnPagina = 0; // Reiniciar el contador
      }

      // Encabezado de proyecto
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');

      const titleLines = doc.splitTextToSize(proyecto.nombre || 'Sin nombre', maxWidth);
      titleLines.forEach((line) => {
        yPosition = checkAddPage(yPosition);
        doc.text(line, marginLeft, yPosition);
        yPosition += 7;
      });

      // Datos del proyecto
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPosition += 5;

      const datos = [
        `• Facultad: ${proyecto.unidad || 'N/A'}`,
        `• Estatus: ${proyecto.estatus || 'N/A'}`,
        `• Académico responsable: ${proyecto.academico || 'N/A'} ${proyecto.jefe ? '(Jefe de proyecto)' : ''}`,
        `• Monto: ${formatCurrency(proyecto.monto)}`,
        `• Fecha de postulación: ${formatDate(proyecto.fecha_postulacion)}`,
        `• Tipo de convocatoria: ${proyecto.tipo_Convo || 'N/A'}`,
        `• Institución convocante: ${proyecto.inst_convo || 'N/A'}`,
        `• Nombre convocatoria: ${proyecto.tipo_convo || 'N/A'}`,
        `• Tipo de apoyo: ${proyecto.tipo_apoyo || 'N/A'} - ${proyecto.detalle || 'N/A'}`,
        `• Comentarios: ${proyecto.comentarios || 'Ninguno'}`,
      ];

      datos.forEach((linea) => {
        const lines = doc.splitTextToSize(linea, maxWidth);
        lines.forEach((line) => {
          yPosition = checkAddPage(yPosition);
          doc.text(line, marginLeft + 5, yPosition);
          yPosition += 7;
        });
      });

      // Separador visual
      yPosition = checkAddPage(yPosition + 5);
      doc.setDrawColor(200);
      doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
      yPosition += 10;

      // Incrementar el contador de proyectos en la página
      proyectosEnPagina += 1;
    });

    // Resumen final
    doc.addPage('letter');
    doc.setFontSize(14);
    doc.setTextColor(0, 60, 120);
    doc.text('RESUMEN ESTADÍSTICO', pageWidth / 2, marginTop, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(0);
    yPosition = marginTop + 10;

    // Total de proyectos
    yPosition = addTextWithPageCheck(`• Total de proyectos: ${proyectos?.length || 0}`, marginLeft, yPosition);

    // Inversión total
    const inversionTotal = proyectos?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;
    yPosition = addTextWithPageCheck(`• Inversión total: ${formatCurrency(inversionTotal)}`, marginLeft, yPosition);

    // Proyectos por facultad + contar facultades distintas
    const facultades = {};
    proyectos?.forEach((p) => {
      const facultad = p.unidad || 'Sin Facultad';
      facultades[facultad] = (facultades[facultad] || 0) + 1;
    });

    const numFacultades = Object.keys(facultades).length;
    yPosition = addTextWithPageCheck(`• Total de facultades distintas: ${numFacultades}`, marginLeft, yPosition);

    // Proyectos por facultad como tabla
    const facultadesOrdenadas = Object.entries(facultades)
      .sort(([aFac], [bFac]) => aFac.localeCompare(bFac))
      .map(([fac, count]) => ({ facultad: fac, proyectos: count }));

    doc.autoTable({
      startY: yPosition + 5, // Posición inicial de la tabla
      head: [['Facultad', 'Proyectos']],
      body: facultadesOrdenadas.map(f => [f.facultad, f.proyectos]),
      theme: 'grid', // Opcional: estilo de la tabla
      styles: {
      fontSize: 10,
      cellWidth: 'auto', // Permite que las celdas se ajusten al contenido
      },
      headStyles: {
      fillColor: [0, 60, 120], // Color de fondo del encabezado
      textColor: 255, // Color del texto del encabezado
      fontStyle: 'bold'
      },
      tableWidth: 'auto', // Permite que la tabla use el ancho completo disponible
    });

  // Actualiza la posición y
  yPosition = doc.autoTable.previous.finalY + 5;


    // Guardar el documento
    doc.save('informe_detallado_proyectos.pdf');
  } catch (err) {
    console.error('Error al generar PDF:', err);
    alert('Error al generar el PDF: ' + err.message);
  }
};