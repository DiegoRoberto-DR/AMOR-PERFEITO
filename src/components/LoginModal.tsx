import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, isStandalone = true }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Required credentials: Admin / 121200
    if (cleanUser === 'admin' && cleanPass === '121200') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('amor_perfeito_admin', 'true');
        onLoginSuccess();
      }, 400);
    } else {
      setError('Credenciais incorretas. Usuário: Admin | Senha: 121200');
    }
  };

  const handleQuickFill = () => {
    setUsername('Admin');
    setPassword('121200');
    setError('');
  };

  return (
    <div className={`${isStandalone ? 'min-h-screen bg-gradient-to-br from-[#FAF6F0] via-[#F5ECE5] to-[#F1E4DC] flex items-center justify-center p-4' : 'p-6'}`}>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
        {/* Header Decor */}
        <div className="relative bg-gradient-to-r from-[#882C4E] to-[#B85C7D] px-8 pt-10 pb-8 text-center text-white">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
            <Heart className="w-8 h-8 text-rose-200 fill-rose-200" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-wide">Amor Perfeito</h1>
          <p className="text-xs uppercase tracking-widest text-rose-200 font-medium mt-1">
            Cerimonial & Assessoria de Eventos
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] text-rose-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Acesso Restrito da Equipe</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-stone-800">Painel Administrativo</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Entre com suas credenciais para gerenciar orçamentos e listas de confirmação
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center gap-2">
            <span className="text-xs text-stone-400">Credenciais configuradas:</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#882C4E] rounded-lg text-xs font-medium border border-rose-200/60 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Preencher: <b>Admin</b> / <b>121200</b></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
