import React, { useState } from 'react';
import { ServicePackage } from '../../types';
import { formatCurrency } from '../../utils/pdfGenerator';
import { 
  Package, Plus, Edit2, Trash2, CheckCircle2, 
  Sparkles, DollarSign, ListChecks, X 
} from 'lucide-react';

interface ServicePackagesManagerProps {
  packages: ServicePackage[];
  onSavePackage: (pkg: ServicePackage) => void;
  onDeletePackage: (id: string) => void;
}

export const ServicePackagesManager: React.FC<ServicePackagesManagerProps> = ({
  packages,
  onSavePackage,
  onDeletePackage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServicePackage['category']>('Assessoria');
  const [price, setPrice] = useState<number>(3000);
  const [description, setDescription] = useState('');
  const [itemsIncluded, setItemsIncluded] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const openCreateModal = () => {
    setEditingPkg(null);
    setName('');
    setCategory('Assessoria');
    setPrice(3500);
    setDescription('');
    setItemsIncluded([
      'Reuniões de alinhamento com fornecedores',
      'Elaboração de cronograma detalhado',
      'Equipe dedicada no dia do evento'
    ]);
    setNewItemText('');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: ServicePackage) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setCategory(pkg.category || 'Assessoria');
    setPrice(pkg.price);
    setDescription(pkg.description);
    setItemsIncluded(pkg.itemsIncluded || []);
    setNewItemText('');
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setItemsIncluded([...itemsIncluded, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    setItemsIncluded(itemsIncluded.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do pacote.');
      return;
    }

    const pkgToSave: ServicePackage = {
      id: editingPkg ? editingPkg.id : `pkg-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      description: description.trim(),
      itemsIncluded,
      createdAt: editingPkg?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSavePackage(pkgToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#882C4E]" />
            <span>Pacotes de Serviços do Cerimonial</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Cadastre os tipos de pacotes e serviços que sua empresa oferece. Você pode editar valores, descrições e incluí-los facilmente ao elaborar um orçamento para clientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pacote de Serviços</span>
        </button>
      </div>

      {/* Grid of Packages */}
      {packages.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">Nenhum pacote cadastrado</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Cadastre os modelos de pacotes que sua assessoria comercializa para agilizar a criação de orçamentos.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-[#882C4E] text-white rounded-xl text-xs font-semibold"
          >
            Criar Primeiro Pacote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:border-rose-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 bg-rose-50 text-[#882C4E] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {pkg.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                      title="Editar Pacote"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o pacote "${pkg.name}"?`)) {
                          onDeletePackage(pkg.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Excluir Pacote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                  {pkg.name}
                </h3>

                <div className="mt-2 text-2xl font-bold text-[#882C4E] flex items-baseline gap-1">
                  <span>{formatCurrency(pkg.price)}</span>
                </div>

                <p className="mt-3 text-xs text-stone-600 leading-relaxed font-normal">
                  {pkg.description}
                </p>

                {pkg.itemsIncluded && pkg.itemsIncluded.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Itens Inclusos no Pacote:
                    </span>
                    {pkg.itemsIncluded.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <span>Disponível para orçamentos</span>
                <button
                  onClick={() => openEditModal(pkg)}
                  className="text-[#882C4E] hover:underline font-semibold cursor-pointer"
                >
                  Editar Dados
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#882C4E] to-[#B85C7D] text-white shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">
                  {editingPkg ? 'Editar Pacote de Serviços' : 'Cadastrar Novo Pacote de Serviços'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Pacote *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assessoria Completa & Cerimonial do Dia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30 focus:border-[#882C4E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                  >
                    <option value="Cerimonial">Cerimonial</option>
                    <option value="Assessoria">Assessoria</option>
                    <option value="Coordenação">Coordenação</option>
                    <option value="Decoração">Decoração</option>
                    <option value="Música">Música</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Valor Padrão (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">
                      R$
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição Detalhada do Pacote
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o que o cliente recebe ao contratar este pacote..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                />
              </div>

              {/* Items included */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Itens / Escopo Inclusos</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {itemsIncluded.length} item(s) adicionados
                  </span>
                </label>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar item (Ex: Kit SOS noiva, Ensaio geral...)"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#882C4E]/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-[#882C4E] hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {itemsIncluded.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#882C4E] hover:bg-[#732240] text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  {editingPkg ? 'Atualizar Pacote' : 'Salvar Pacote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
