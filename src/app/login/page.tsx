'use client';

import { useState } from 'react';
import { loginAction, registerAction } from '../../app/actions';

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    setLoginError(null);
    const res = await loginAction(formData);
    if (res?.error) setLoginError(res.error);
  }

  async function handleRegister(formData: FormData) {
    setRegisterError(null);
    const res = await registerAction(formData);
    if (res?.error) setRegisterError(res.error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Bloc Connexion */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Connexion</h2>

        {loginError && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded">
            {loginError}
          </p>
        )}

        <form action={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              defaultValue="jihad@campus.tn"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              defaultValue="123456"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm"
          >
            Se connecter
          </button>
        </form>

        {/* Comptes de démo pour la soutenance */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Comptes de démonstration (mdp : 123456) :</p>
          <p>• Étudiant 1 : <code>jihad@campus.tn</code></p>
          <p>• Administrateur : <code>admin@campus.tn</code></p>
        </div>
      </div>

      {/* Bloc Inscription */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Créer un profil étudiant</h2>

        {registerError && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded">
            {registerError}
          </p>
        )}

        <form action={handleRegister} className="space-y-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nom complet"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email universitaire"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Mot de passe (min 4 caractères)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="specialite"
              required
              placeholder="Spécialité (ex: GL)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              name="niveau"
              required
              placeholder="Niveau (ex: ING 5)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <input
            type="text"
            name="skills"
            required
            placeholder="Compétences (ex: Java, React, SQL)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-sm"
          >
            S&apos;inscrire
          </button>
        </form>
      </div>
    </div>
  );
}