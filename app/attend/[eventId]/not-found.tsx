export default function AttendNotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center sm:py-20">
      <div className="glass-panel">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Evento no encontrado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Comprueba que el enlace sea correcto o contacta al organizador.
        </p>
      </div>
    </main>
  );
}
