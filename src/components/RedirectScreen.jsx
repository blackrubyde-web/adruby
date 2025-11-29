// FILE: src/components/RedirectScreen.jsx
import React from 'react';

const RedirectScreen = ({
  title = 'Bitte warten…',
  subtitle = '',
  details = '',
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-slate-600 border-t-slate-100 animate-spin" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="text-slate-300 text-sm">{subtitle}</p>
          ) : null}
          {details ? (
            <p className="text-slate-400 text-xs leading-relaxed">
              {details}
            </p>
          ) : null}
        </div>

        <p className="text-xs text-slate-500 pt-2">
          AdRuby – KI-gestützte Ad Intelligence
        </p>
      </div>
    </div>
  );
};

export default RedirectScreen;
