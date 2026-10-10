import { apiIntranet } from "./api";

const aUint8 = (base64) => {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...b].map((c) => c.charCodeAt(0)));
};

export const pushDisponible = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// Pide permiso y registra este dispositivo para recibir notificaciones.
export const activarPush = async () => {
  if (!pushDisponible()) throw new Error("Tu navegador no admite notificaciones push");
  const { clave } = await apiIntranet("/push/clave");
  if (!clave) throw new Error("Las notificaciones push no están configuradas en el servidor");
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") throw new Error("No diste permiso para mostrar notificaciones");
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aUint8(clave) }));
  await apiIntranet("/push/suscribir", { method: "POST", body: sub.toJSON() });
  return true;
};
