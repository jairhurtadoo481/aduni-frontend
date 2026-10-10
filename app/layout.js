import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RegistrarSW from "../components/RegistrarSW";


export const metadata = {
  title: "Colegio ADUNI+ | Andahuaylas",
  description: "Colegio privado ADUNI+ en San Jerónimo, Andahuaylas: educación primaria y secundaria. Admisión, becas, noticias e intranet.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icono-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "ADUNI+", statusBarStyle: "default" },
};

export const viewport = { themeColor: "#12306b" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <RegistrarSW />
      </body>
    </html>
  );
}
