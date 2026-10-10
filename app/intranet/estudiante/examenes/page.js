"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApiEst, usePortal } from "../../../../components/intranet/PortalLayout";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Nivel, AvisoError, botonClase } from "../../../../components/intranet/ui";

const ESTADO = { proximo: ["Próximo", "gray"], disponible: ["Disponible", "green"], en_curso: ["En curso", "amber"], enviado: ["Enviado", "blue"], cerrado: ["Cerrado", "red"] };
const fecha = (d) => new Date(d).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });

function Rendir({ examenId, onSalir }) {
  const [ex, setEx] = useState(null);
  const [resp, setResp] = useState([]);
  const [restante, setRestante] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const enviando = useRef(false);
  const respRef = useRef([]);

  useEffect(() => {
    apiIntranet(`/estudiante/examenes/${examenId}/iniciar`, { method: "POST" })
      .then((e) => { setEx(e); setResp(e.respuestas); respRef.current = e.respuestas; })
      .catch((e) => setError(e.message));
  }, [examenId]);

  const enviar = useCallback(async () => {
    if (enviando.current) return;
    enviando.current = true;
    try {
      setResultado(await apiIntranet(`/estudiante/examenes/${examenId}/enviar`, { method: "POST", body: { respuestas: respRef.current } }));
    } catch (e) {
      setError(e.message);
      enviando.current = false;
    }
  }, [examenId]);

  // Cuenta regresiva; al llegar a cero se envía solo.
  useEffect(() => {
    if (!ex || resultado) return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.floor((new Date(ex.limite) - Date.now()) / 1000));
      setRestante(s);
      if (s === 0) enviar();
    }, 1000);
    return () => clearInterval(t);
  }, [ex, resultado, enviar]);

  // Guardado automático cada 20 s (por si se corta el internet).
  useEffect(() => {
    if (!ex || resultado) return;
    const t = setInterval(() => apiIntranet(`/estudiante/examenes/${examenId}/respuestas`, { method: "PUT", body: { respuestas: respRef.current } }).catch(() => {}), 20000);
    return () => clearInterval(t);
  }, [ex, resultado, examenId]);

  const elegir = (indice, opcion) => {
    const n = [...resp];
    n[indice] = opcion;
    setResp(n);
    respRef.current = n;
  };

  if (error && !ex) return <><AvisoError texto={error} /><button onClick={onSalir} className="text-sm text-aduni-700 mt-3">← Volver</button></>;
  if (!ex) return <Cargando texto="Preparando examen..." />;

  if (resultado) {
    return (
      <Tarjeta>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Examen enviado</p>
          <h2 className="text-xl font-bold mb-4">{ex.titulo}</h2>
          {resultado.nivel ? (
            <>
              <Nivel nivel={resultado.nivel} grande />
              <p className="text-3xl font-bold mt-3">{resultado.puntaje} / {resultado.total}</p>
              {resultado.fueraDeTiempo && <p className="text-xs text-red-600 mt-1">Enviado fuera de tiempo</p>}
            </>
          ) : <p>Tu docente publicará los resultados.</p>}
          <button onClick={onSalir} className={`${botonClase} mt-6`}>Volver a mis exámenes</button>
        </div>
      </Tarjeta>
    );
  }

  const respondidas = resp.filter((r) => r >= 0).length;
  const min = Math.floor((restante ?? 0) / 60);
  const seg = String((restante ?? 0) % 60).padStart(2, "0");

  return (
    <div>
      <div className="sticky top-16 z-30 bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">{ex.titulo}</p>
          <p className="text-xs text-gray-500">{respondidas} de {ex.preguntas.length} respondidas · se guarda automáticamente</p>
        </div>
        <div className={`font-mono text-2xl font-bold ${restante !== null && restante < 120 ? "text-red-600" : "text-aduni-900"}`}>{min}:{seg}</div>
      </div>
      {ex.instrucciones && <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{ex.instrucciones}</p>}
      <div className="grid gap-4">
        {ex.preguntas.map((p, n) => (
          <Tarjeta key={p.indice}>
            <p className="font-semibold mb-3"><span className="text-aduni-700">{n + 1}.</span> {p.enunciado} <span className="text-xs text-gray-400 font-normal">({p.puntaje} pt)</span></p>
            <div className="grid gap-2">
              {p.opciones.map((o, i) => (
                <label key={i} className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer text-sm ${resp[p.indice] === i ? "border-aduni-600 bg-aduni-100/50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="radio" name={`p${p.indice}`} checked={resp[p.indice] === i} onChange={() => elegir(p.indice, i)} />
                  <span className="font-semibold text-gray-400">{String.fromCharCode(65 + i)}.</span> {o}
                </label>
              ))}
            </div>
          </Tarjeta>
        ))}
      </div>
      <AvisoError texto={error} />
      <button onClick={() => confirm(`¿Enviar el examen? Respondiste ${respondidas} de ${ex.preguntas.length}.`) && enviar()} className={`${botonClase} mt-6`}>Enviar examen</button>
    </div>
  );
}

export default function ExamenesEstudiante() {
  const { rol } = usePortal();
  const { data, cargando, error, recargar } = useApiEst("/estudiante/examenes");
  const [rindiendo, setRindiendo] = useState(null);

  if (rindiendo) return <Rendir examenId={rindiendo} onSalir={() => { setRindiendo(null); recargar(); }} />;

  return (
    <>
      <Titulo titulo="Exámenes en línea" subtitulo="Evaluaciones con tiempo límite y corrección automática" />
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : data.length === 0 ? <Tarjeta><Vacio texto="No hay exámenes programados" icono="examen" /></Tarjeta> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => (
            <Tarjeta key={e._id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold" style={{ color: e.curso.color }}>{e.curso.nombre}</p>
                  <h3 className="font-semibold">{e.titulo}</h3>
                </div>
                <Etiqueta color={ESTADO[e.estado][1]}>{ESTADO[e.estado][0]}</Etiqueta>
              </div>
              <p className="text-xs text-gray-500 mt-2">{e.preguntas} preguntas · {e.duracionMin} min</p>
              <p className="text-xs text-gray-500">Desde {fecha(e.inicio)} hasta {fecha(e.fin)}</p>
              <div className="mt-3 flex items-center justify-between">
                {e.resultado ? <span className="flex items-center gap-2 text-sm">Resultado: <Nivel nivel={e.resultado.nivel} /> {e.resultado.puntaje}/{e.resultado.total}</span> : <span />}
                {rol === "estudiante" && (e.estado === "disponible" || e.estado === "en_curso") && (
                  <button onClick={() => setRindiendo(e._id)} className={botonClase}>{e.estado === "en_curso" ? "Continuar" : "Empezar"}</button>
                )}
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </>
  );
}
