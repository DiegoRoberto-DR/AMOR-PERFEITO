import React, { useState } from 'react';
import { CerimonialSettings } from '../../types';
import { Save, Check, Building2, Phone, Mail, Instagram, MapPin, CreditCard, FileText, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  settings: CerimonialSettings;
  onSaveSettings: (settings: CerimonialSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<CerimonialSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof CerimonialSettings, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Configurações do Cerimonial
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Personalize os dados da sua empresa, contatos de WhatsApp, chave PIX e cláusulas contratuais que saem no PDF de orçamento.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        {/* Company Identity */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-4 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Identidade do Cerimonial</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome Comercial da Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Slogan / Tagline do Cerimonial
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Responsável / Cerimonialista
              </label>
              <input
                type="text"
                value={formData.responsibleName}
                onChange={(e) => handleChange('responsibleName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                CNPJ (se houver)
              </label>
              <input
                type="text"
                value={formData.cnpj || ''}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="pt-4 border-t border-stone-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-4 flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <span>Contatos & Redes Sociais</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telefone / WhatsApp Comercial *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Instagram Oficial
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="@amorperfeitocerimonial"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Endereço / Sede
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Av. Paulista, 1800 - São Paulo / SP"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Banking and PIX */}
        <div className="pt-4 border-t border-stone-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-4 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>Dados Bancários & Chave PIX (para Proposta)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixKey || ''}
                onChange={(e) => handleChange('pixKey', e.target.value)}
                placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Conta Bancária / Banco
              </label>
              <input
                type="text"
                value={formData.bankInfo || ''}
                onChange={(e) => handleChange('bankInfo', e.target.value)}
                placeholder="Banco, Agência e Conta"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contractual Terms */}
        <div className="pt-4 border-t border-stone-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#882C4E] mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Cláusulas Padrão e Termos da Proposta (PDF)</span>
          </h2>
          <p className="text-xs text-stone-500 mb-3">
            Essas condições serão incluídas automaticamente no rodapé de todos os novos orçamentos.
          </p>

          <textarea
            rows={5}
            value={formData.defaultTerms}
            onChange={(e) => handleChange('defaultTerms', e.target.value)}
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#882C4E]/20"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
