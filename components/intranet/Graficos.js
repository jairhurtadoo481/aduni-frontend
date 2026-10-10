"use client";

// Gráficos ligeros en SVG/CSS, sin librerías.

export function Barras({ datos, valor, etiqueta, formato = (v) => v, color = "#1b4aa0", maximo }) {
  const max = maximo ?? Math.max(1, ...datos.map(valor));
  return (
    <div className="flex items-end gap-2 h-48 pt-6">
      {datos.map((d, i) => {
        const v = valor(d);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">{formato(v)}</span>
            <div className="w-full max-w-10 rounded-t-md transition-all" style={{ height: `${(v / max) * 100}%`, background: color, minHeight: v ? 2 : 0 }} title={`${etiqueta(d)}: ${formato(v)}`} />
            <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{etiqueta(d)}</span>
          </div>
        );
      })}
    </div>
  );
}

// Dos series (ej. esperado vs cobrado)
export function BarrasDobles({ datos, a, b, etiqueta, nombres, colores = ["#cbd5e1", "#15803d"], formato = (v) => v }) {
  const max = Math.max(1, ...datos.flatMap((d) => [a(d), b(d)]));
  return (
    <div>
      <div className="flex items-end gap-2 h-48 pt-4">
        {datos.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <div className="flex items-end gap-0.5 w-full justify-center h-full">
              <div className="w-1/2 max-w-5 rounded-t" style={{ height: `${(a(d) / max) * 100}%`, background: colores[0] }} title={`${nombres[0]}: ${formato(a(d))}`} />
              <div className="w-1/2 max-w-5 rounded-t" style={{ height: `${(b(d) / max) * 100}%`, background: colores[1] }} title={`${nombres[1]}: ${formato(b(d))}`} />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{etiqueta(d)}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-gray-500 mt-2">
        {nombres.map((n, i) => <span key={n} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: colores[i] }} />{n}</span>)}
      </div>
    </div>
  );
}

// Barra 100% apilada (ej. distribución AD/A/B/C)
export function Apilada({ partes }) {
  const total = partes.reduce((s, p) => s + p.valor, 0) || 1;
  return (
    <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
      {partes.map((p) => p.valor > 0 && (
        <div key={p.nombre} style={{ width: `${(p.valor / total) * 100}%`, background: p.color }} title={`${p.nombre}: ${p.valor} (${Math.round((p.valor / total) * 100)}%)`} />
      ))}
    </div>
  );
}
