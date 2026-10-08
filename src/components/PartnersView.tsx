import React, { useState } from 'react';
import {
  Users,
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  X,
} from 'lucide-react';
import { Customer, Supplier } from '../types';
import { api } from '../services/api';

interface PartnersViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  customers,
  suppliers,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');

  // Customer Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [cName, setCName] = useState('');
  const [cContact, setCContact] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cCNPJ, setCCNPJ] = useState('');
  const [cAddress, setCAddress] = useState('');

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [sName, setSName] = useState('');
  const [sContact, setSContact] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sCNPJ, setSCNPJ] = useState('');
  const [sCity, setSCity] = useState('');
  const [sProducts, setSProducts] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  // Customer handlers
  const openCreateCustomer = () => {
    setEditingCustomerId(null);
    setCName('');
    setCContact('');
    setCPhone('');
    setCEmail('');
    setCCNPJ('');
    setCAddress('');
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = (c: Customer) => {
    setEditingCustomerId(c.id);
    setCName(c.name);
    setCContact(c.contact_name || '');
    setCPhone(c.phone || '');
    setCEmail(c.email || '');
    setCCNPJ(c.cnpj || '');
    setCAddress(c.address || '');
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: cName,
        contact_name: cContact,
        phone: cPhone,
        email: cEmail,
        cnpj: cCNPJ,
        address: cAddress,
      };

      if (editingCustomerId) {
        await api.updateCustomer(editingCustomerId, payload);
        setMessage('Cliente atualizado com sucesso!');
      } else {
        await api.createCustomer(payload);
        setMessage('Cliente cadastrado com sucesso!');
      }

      setIsCustomerModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteCustomer = async (id: number, name: string) => {
    if (!window.confirm(`Deseja excluir o cliente "${name}"?`)) return;
    try {
      await api.deleteCustomer(id);
      onRefresh();
      setMessage('Cliente removido.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  // Supplier handlers
  const openCreateSupplier = () => {
    setEditingSupplierId(null);
    setSName('');
    setSContact('');
    setSPhone('');
    setSEmail('');
    setSCNPJ('');
    setSCity('');
    setSProducts('');
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSupplierId(s.id);
    setSName(s.name);
    setSContact(s.contact_name || '');
    setSPhone(s.phone || '');
    setSEmail(s.email || '');
    setSCNPJ(s.cnpj || '');
    setSCity(s.city || '');
    setSProducts(s.supplied_products || '');
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: sName,
        contact_name: sContact,
        phone: sPhone,
        email: sEmail,
        cnpj: sCNPJ,
        city: sCity,
        supplied_products: sProducts,
      };

      if (editingSupplierId) {
        await api.updateSupplier(editingSupplierId, payload);
        setMessage('Fornecedor atualizado com sucesso!');
      } else {
        await api.createSupplier(payload);
        setMessage('Fornecedor cadastrado com sucesso!');
      }

      setIsSupplierModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteSupplier = async (id: number, name: string) => {
    if (!window.confirm(`Deseja excluir o fornecedor "${name}"?`)) return;
    try {
      await api.deleteSupplier(id);
      onRefresh();
      setMessage('Fornecedor removido.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  // Filtering
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact_name && c.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.supplied_products && s.supplied_products.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-700 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            <span>Relacionamento & Suprimentos</span>
            <span aria-hidden="true">·</span>
            <span>Cadastros Base</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Clientes & Fornecedores
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Tab Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => {
                setActiveTab('customers');
                setSearchTerm('');
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'customers'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes ({customers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('suppliers');
                setSearchTerm('');
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fornecedores ({suppliers.length})
            </button>
          </div>

          <button
            onClick={activeTab === 'customers' ? openCreateCustomer : openCreateSupplier}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'customers' ? 'Novo Cliente' : 'Novo Fornecedor'}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'customers'
                ? 'Buscar cliente por razão social, contato ou cidade...'
                : 'Buscar fornecedor por nome, insumo ou produto...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* CLIENTES TAB */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCustomer(c)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {c.cnpj && (
                  <span className="text-[11px] font-mono text-slate-500 block mb-3">
                    CNPJ: {c.cnpj}
                  </span>
                )}

                <div className="space-y-1.5 text-xs text-slate-600">
                  {c.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Contato:</span>
                      <span className="font-semibold text-slate-800">{c.contact_name}</span>
                    </div>
                  )}

                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}

                  {c.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}

                  {c.address && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                <span>Pedidos registrados:</span>
                <strong className="text-slate-900 tabular-nums">{c.orders_count || 0}</strong>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-500 text-xs">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      )}

      {/* FORNECEDORES TAB */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditSupplier(s)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(s.id, s.name)}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {s.cnpj && (
                  <span className="text-[11px] font-mono text-slate-500 block mb-2">
                    CNPJ: {s.cnpj} {s.city && `· ${s.city}`}
                  </span>
                )}

                <div className="space-y-1.5 text-xs text-slate-600">
                  {s.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Contato:</span>
                      <span className="font-semibold text-slate-800">{s.contact_name}</span>
                    </div>
                  )}

                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  )}

                  {s.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}

                  {s.supplied_products && (
                    <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded text-[11px]">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Produtos / Insumos Fornecidos:
                      </span>
                      <p className="text-slate-700">{s.supplied_products}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                <span>Insumos catalogados:</span>
                <strong className="text-slate-900 tabular-nums">{s.materials_count || 0}</strong>
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-500 text-xs">
              Nenhum fornecedor encontrado.
            </div>
          )}
        </div>
      )}

      {/* MODAL: CLIENTE */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingCustomerId ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Indústrias Metalmax S/A"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pessoa de Contato:</label>
                  <input
                    type="text"
                    placeholder="Ex: Mariana Lopes"
                    value={cContact}
                    onChange={(e) => setCContact(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNPJ:</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cCNPJ}
                    onChange={(e) => setCCNPJ(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone:</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Comercial:</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endereço Completo:</label>
                <input
                  type="text"
                  placeholder="Av. das Indústrias, 1200 - Campinas - SP"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORNECEDOR */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupplierSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razão Social / Fornecedor: *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Açotec Metais Ltda"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contato:</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Andrade"
                    value={sContact}
                    onChange={(e) => setSContact(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNPJ:</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={sCNPJ}
                    onChange={(e) => setSCNPJ(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone:</label>
                  <input
                    type="text"
                    placeholder="(11) 3344-5566"
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade / UF:</label>
                  <input
                    type="text"
                    placeholder="São Paulo - SP"
                    value={sCity}
                    onChange={(e) => setSCity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Cotação:</label>
                <input
                  type="email"
                  placeholder="vendas@fornecedor.com.br"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produtos / Insumos Fornecidos:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chapas de aço inox 304, parafusos especiais, tintas a pó..."
                  value={sProducts}
                  onChange={(e) => setSProducts(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
