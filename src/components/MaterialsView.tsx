import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Trash2,
  DollarSign,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { Material, Supplier } from '../types';
import { api } from '../services/api';

interface MaterialsViewProps {
  materials: Material[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  suppliers,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('kg');
  const [unitCost, setUnitCost] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [supplierId, setSupplierId] = useState<number | ''>('');

  // Quick Adjustment Modal
  const [adjustMaterial, setAdjustMaterial] = useState<Material | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');

  const [message, setMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setCode(`MP-${String(materials.length + 1).padStart(3, '0')}`);
    setName('');
    setDescription('');
    setUnit('kg');
    setUnitCost(25.0);
    setCurrentStock(100.0);
    setMinStock(20.0);
    setSupplierId(suppliers[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditingId(mat.id);
    setCode(mat.code);
    setName(mat.name);
    setDescription(mat.description || '');
    setUnit(mat.unit);
    setUnitCost(mat.unit_cost);
    setCurrentStock(mat.current_stock);
    setMinStock(mat.min_stock);
    setSupplierId(mat.supplier_id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code,
        name,
        description,
        unit,
        unit_cost: unitCost,
        current_stock: currentStock,
        min_stock: minStock,
        supplier_id: supplierId ? Number(supplierId) : null,
      };

      if (editingId) {
        await api.updateMaterial(editingId, payload);
        setMessage('Matéria-prima atualizada com sucesso!');
      } else {
        await api.createMaterial(payload);
        setMessage('Matéria-prima cadastrada com sucesso!');
      }

      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMaterial) return;

    try {
      const delta = adjustType === 'add' ? Number(adjustQty) : -Number(adjustQty);
      const newStock = Math.max(0, adjustMaterial.current_stock + delta);

      await api.updateMaterial(adjustMaterial.id, {
        ...adjustMaterial,
        current_stock: newStock,
      });

      setAdjustMaterial(null);
      setAdjustQty(0);
      onRefresh();
      setMessage(`Estoque de ${adjustMaterial.name} ajustado para ${newStock} ${adjustMaterial.unit}`);
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro no ajuste: ${err.message}`);
    }
  };

  const handleDelete = async (id: number, matName: string) => {
    if (!window.confirm(`Deseja excluir a matéria-prima "${matName}"?`)) return;
    try {
      await api.deleteMaterial(id);
      onRefresh();
      setMessage('Insumo excluído com sucesso.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filtered = materials.filter((mat) => {
    const matchSearch =
      mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mat.supplier_name && mat.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchLowStock = !onlyLowStock || mat.current_stock <= mat.min_stock;
    return matchSearch && matchLowStock;
  });

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
            <span>Almoxarifado & Suprimentos</span>
            <span aria-hidden="true">·</span>
            <span>Estoque Operacional</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Matérias-Primas & Insumos
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Matéria-Prima</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, insumo ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span className="font-semibold text-rose-700">Apenas estoque crítico (abaixo do mín.)</span>
          </label>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Nome / Descrição</th>
                <th className="py-2.5 px-3 text-center">Unidade</th>
                <th className="py-2.5 px-3 text-right">Custo Unitário</th>
                <th className="py-2.5 px-3 text-right">Estoque Atual</th>
                <th className="py-2.5 px-3 text-right">Estoque Mínimo</th>
                <th className="py-2.5 px-3">Fornecedor Principal</th>
                <th className="py-2.5 px-3 text-center">Situação</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((mat) => {
                const isCritical = mat.current_stock <= mat.min_stock;

                return (
                  <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {mat.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 block">{mat.name}</span>
                      {mat.description && (
                        <span className="text-[11px] text-slate-500 block line-clamp-1">
                          {mat.description}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700 uppercase">
                      {mat.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-slate-900">
                      R$ {Number(mat.unit_cost).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black tabular-nums text-sm">
                      <span className={isCritical ? 'text-rose-700' : 'text-slate-900'}>
                        {Number(mat.current_stock).toFixed(1)} {mat.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      {Number(mat.min_stock).toFixed(1)} {mat.unit}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 truncate max-w-[150px]">
                      {mat.supplier_name || 'Diversos / Próprio'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Crítico</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setAdjustMaterial(mat);
                            setAdjustQty(0);
                            setAdjustType('add');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                          title="Ajustar saldo em estoque"
                        >
                          Ajustar
                        </button>
                        <button
                          onClick={() => openEditModal(mat)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id, mat.name)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhum insumo encontrado com os filtros ativos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO DE MATÉRIA-PRIMA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingId ? `Editar Matéria-Prima — ${code}` : 'Nova Matéria-Prima / Insumo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código: *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Insumo: *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chapa Aço Inox 304 2mm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Detalhada / Norma:</label>
                <input
                  type="text"
                  placeholder="Dimensões, especificações, acabamento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade de Medida: *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-bold"
                  >
                    <option value="kg">kg (Quilograma)</option>
                    <option value="m">m (Metro Linear)</option>
                    <option value="m²">m² (Metro Quadrado)</option>
                    <option value="un">un (Unidade / Peça)</option>
                    <option value="l">l (Litro)</option>
                    <option value="g">g (Grama)</option>
                    <option value="barra">barra</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custo Unitário (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estoque Atual:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estoque Mínimo de Segurança:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fornecedor Principal:</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="">Nenhum / Compra Spot</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded"
                >
                  Salvar Matéria-Prima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTE RÁPIDO DE ESTOQUE */}
      {adjustMaterial && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold">
                Ajuste de Estoque — {adjustMaterial.name}
              </h3>
              <button onClick={() => setAdjustMaterial(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Saldo Atual em Almoxarifado:</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {adjustMaterial.current_stock} {adjustMaterial.unit}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Operação:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-1.5 font-bold rounded text-center border ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    + Entrada / Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('sub')}
                    className={`py-1.5 font-bold rounded text-center border ${
                      adjustType === 'sub'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    - Saída / Baixa
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantidade a {adjustType === 'add' ? 'adicionar' : 'baixar'} ({adjustMaterial.unit}):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded tabular-nums font-black text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustMaterial(null)}
                  className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
