import React from "react";
import { motion } from "framer-motion";

const ProductInputStage = () => (
  <motion.div
    initial={{ x: 40, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -40, opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/60 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition dark:border-white/10 dark:bg-white/5"
  >
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/10 via-white/10 to-blue-500/10 dark:via-white/5" />
    <div className="relative flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          Stage 1
        </p>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Produkt-Eingabe
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Platzhalter für die Produktdetails. Hier kann der Nutzer Kerninfos, Features und Positionierung erfassen.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CardField label="Produktname" />
        <CardField label="Nutzenversprechen" />
        <CardField label="Zielgruppe / Persona" full />
      </div>
    </div>
  </motion.div>
);

const CardField = ({ label, full }) => (
  <div
    className={`rounded-xl border border-white/30 bg-white/70 p-4 text-sm text-zinc-600 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_15px_40px_rgba(200,0,0,0.12)] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 ${
      full ? "sm:col-span-2" : ""
    }`}
  >
    {label}
  </div>
);

export default ProductInputStage;
