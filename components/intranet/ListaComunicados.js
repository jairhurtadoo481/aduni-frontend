"use client";

import { apiIntranet } from "../../lib/api";
import { useApi, fechaCorta } from "../../lib/intranet";
import { Tarjeta, Cargando, Vacio, Etiqueta } from "./ui";

const PARA = { todos: "Todos", estudiante: "Estudiantes", profesor: "Docentes" };

export default function ListaComunicados({ puedeBorrar = false, limite, titulo = "Comunicados", version = 0 }) {
  const { data, cargando, recargar } = useApi(`/comunicados${limite ? `?limite=${limite}` : ""}${version ? `${limite ? "&" : "?"}v=${version}` : ""}`);

  const borrar = async (id) => {
    if (!confirm("¿Eliminar este comunicado?")) return;
    await apiIntranet(`/admin/comunicados/${id}`, { method: "DELETE" });
    recargar();
  };

  return (
    <Tarjeta titulo={titulo}>
      {cargando && <Cargando />}
      {data?.length === 0 && <Vacio texto="No hay comunicados" icono="comunicados" />}
      <div className="divide-y divide-gray-100 -my-3">
        {data?.map((c) => (
          <article key={c._id} className="py-3">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {c.importante && <Etiqueta color="red">Importante</Etiqueta>}
              <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line">{c.contenido}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
              <span>{fechaCorta(c.createdAt)}</span>
              <span>· {c.autor?.cargo || c.autor?.nombre || "Dirección"}</span>
              <Etiqueta>{c.aula ? c.aula.nombre : PARA[c.destinatarios]}</Etiqueta>
              {puedeBorrar && <button onClick={() => borrar(c._id)} className="text-red-600 hover:underline ml-auto">Eliminar</button>}
            </div>
          </article>
        ))}
      </div>
    </Tarjeta>
  );
}
