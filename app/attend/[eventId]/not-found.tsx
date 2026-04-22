export default function AttendNotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center sm:py-20">
      <div className="glass-panel">
        <h1 className="theme-heading text-xl font-semibold tracking-tight">
          Evento no encontrado
        </h1>
        <p className="theme-sub mt-3 text-sm leading-relaxed">
          Comprueba que el enlace sea correcto o contacta al organizador.
        </p>
      </div>
    </main>
  );
}
