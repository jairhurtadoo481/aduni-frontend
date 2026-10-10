"use client";

import { useCallback, useRef, useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, ASISTENCIA, hoyLima, iniciales } from "../../../../lib/intranet";
import { usePortal } from "../../../../components/intranet/PortalLayout";
import EscanerQR from "../../../../components/intranet/EscanerQR";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Campo, inputClase, botonClase, botonSecundario, EstadoAsistencia, AvisoError, Exito } from "../../../../components/intranet/ui";

const pitido = (ok) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.15;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + (ok ? 0.15 : 0.4));
  } catch {}
};

// Docentes y personal marcan ingreso (y salida, con la segunda lectura) con su carné QR.
function Escaner({ onRegistro }) {
  const [camara, setCamara] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const ocupado = useRef(false);

  const registrar = useCallback(async (texto, metodo) => {
    if (ocupado.current || !texto.trim()) return;
    ocupado.current = true;
    try {
      const r = await apiIntranet("/admin/asistencia/marcar", { method: "POST", body: { codigo: texto.trim(), metodo } });
      setResultado({ ok: true, ...r });
      pitido(true);
      onRegistro();
    } catch (err) {
      setResultado({ ok: false, mensaje: err.message });
      pitido(false);
    } finally {
      ocupado.current = false;
    }
  }, [onRegistro]);

  const color = !resultado ? "bg-gray-200 text-gray-500" : !resultado.ok ? "bg-red-600" : resultado.repetido ? "bg-sky-600" : resultado.salida ? "bg-violet-600" : resultado.estado === "P" ? "bg-emerald-600" : "bg-amber-500";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Tarjeta titulo="Escanear carné del personal" accion={<button onClick={() => setCamara(!camara)} className={camara ? botonSecundario : botonClase}><Icono nombre="camara" className="w-4 h-4" />{camara ? "Apagar cámara" : "Encender cámara"}</button>}>
        {camara ? <EscanerQR activo={camara} onCodigo={(t) => registrar(t, "qr")} /> : (
          <div className="aspect-video rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-500 text-sm gap-2 text-center px-4">
            <Icono nombre="qr" className="w-12 h-12" />
            Enciende la cámara y apunta al QR del carné del docente o trabajador
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); registrar(codigo, "codigo"); setCodigo(""); }} className="flex gap-2 mt-4">
          <input autoFocus value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="O escribe / escanea con lector el código (D2026001, ADM002...)" className={inputClase} />
          <button className={botonClase}>Registrar</button>
        </form>
        <p className="text-xs text-gray-400 mt-2">1.ª lectura del día = ingreso (puntual o tardanza según la hora configurada). 2.ª lectura = salida.</p>
      </Tarjeta>
      <div className={`rounded-2xl p-6 text-white min-h-44 flex items-center gap-5 transition-colors ${color}`}>
        {!resultado ? <p className="mx-auto">Esperando lectura...</p> : !resultado.ok ? (
          <><Icono nombre="x" className="w-14 h-14 shrink-0" /><div><p className="text-xl font-bold">No registrado</p><p>{resultado.mensaje}</p></div></>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">{iniciales(resultado.nombre)}</div>
            <div>
              <p className="text-2xl font-bold leading-tight">{resultado.nombre}</p>
              <p className="opacity-90">{resultado.aula} · {resultado.codigo}</p>
              <p className="text-lg font-semibold mt-1">
                {resultado.salida ? `Salida · ${resultado.hora}` : resultado.repetido ? `Ya registrado a las ${resultado.hora}` : `Ingreso ${ASISTENCIA[resultado.estado].nombre.toLowerCase()} · ${resultado.hora}`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ListaPersonal({ version }) {
  const { puede } = usePortal();
  const [fecha, setFecha] = useState(hoyLima());
  const { data, cargando, recargar } = useApi(`/admin/asistencia/personal?fecha=${fecha}&v=${version}`);
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const esAuxiliar = puede("auxiliar");

  const cerrar = async () => {
    if (!confirm(`Se registrará FALTA a todo el personal sin ingreso el ${fecha}. ¿Continuar?`)) return;
    try { const r = await apiIntranet("/admin/asistencia/personal/cerrar", { method: "POST", body: { fecha } }); setMsg({ ok: r.mensaje, error: "" }); recargar(); } catch (e) { setMsg({ ok: "", error: e.message }); }
  };
  const corregir = async (p, estado) => {
    const observacion = estado === "J" ? prompt("Motivo de la justificación:") || "" : "";
    try { await apiIntranet("/admin/asistencia/personal", { method: "PUT", body: { usuario: p._id, fecha, estado, observacion } }); recargar(); } catch (e) { setMsg({ ok: "", error: e.message }); }
  };

  return (
    <Tarjeta titulo="Asistencia del personal" accion={esAuxiliar && <button onClick={cerrar} className={botonSecundario}>Registrar faltas del día</button>}>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={`${inputClase} w-auto`} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
        <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
      </div>
      {cargando || !data ? <Cargando /> : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-2">Nombre</th><th className="px-3 py-2">Rol</th><th className="px-3 py-2">Ingreso</th><th className="px-3 py-2">Salida</th><th className="px-3 py-2">Estado</th>{esAuxiliar && <th className="px-5 py-2">Corregir</th>}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.personal.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-2"><p className="font-medium">{p.nombre}</p><p className="text-xs text-gray-400">{p.codigo} · {p.especialidad || p.cargo}</p></td>
                  <td className="px-3 py-2 text-center text-xs">{p.rol === "profesor" ? "Docente" : "Administrativo"}</td>
                  <td className="px-3 py-2 text-center">{p.registro?.horaIngreso || "—"}</td>
                  <td className="px-3 py-2 text-center">{p.registro?.horaSalida || "—"}</td>
                  <td className="px-3 py-2 text-center"><EstadoAsistencia estado={p.registro?.estado} />{p.registro?.observacion && <span className="block text-[10px] text-gray-400">{p.registro.observacion}</span>}</td>
                  {esAuxiliar && (
                    <td className="px-5 py-2 text-center">
                      <select value={p.registro?.estado || ""} onChange={(e) => corregir(p, e.target.value)} className="border border-gray-300 rounded-md text-xs px-2 py-1">
                        <option value="">Sin registro</option>
                        {Object.entries(ASISTENCIA).map(([k, v]) => <option key={k} value={k}>{v.nombre}</option>)}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tarjeta>
  );
}

export default function IngresoPersonal() {
  const [version, setVersion] = useState(0);
  const refrescar = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <>
      <Titulo titulo="Ingreso del personal" subtitulo="Control estricto de docentes y personal con su carné QR. La asistencia de los estudiantes la toman los docentes en cada clase." />
      <div className="grid gap-6">
        <Escaner onRegistro={refrescar} />
        <ListaPersonal version={version} />
      </div>
    </>
  );
}
