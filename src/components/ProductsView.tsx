import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Clock,
  DollarSign,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { Product, Material, WorkCenter, ProductMaterial, ProductStage } from '../types';
import { api } from '../services/api';

interface ProductsViewProps {
  products: Product[];
  materials: Material[];
  workCenters: WorkCenter[];
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  materials,
  workCenters,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  const [processTime, setProcessTime] = useState(60);
  const [salePrice, setSalePrice] = useState(0);
  const [workCenterId, setWorkCenterId] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState(0);

  // Dynamic BOM materials list
  const [bomItems, setBomItems] = useState<Array<{ material_id: number; quantity: number }>>([]);

  // Dynamic process stages list
  const [stagesList, setStagesList] = useState<Array<{ stage_name: string; duration_minutes: number }>>([
    { stage_name: 'Corte e Preparação', duration_minutes: 20 },
    { stage_name: 'Usinagem / Conformação', duration_minutes: 30 },
    { stage_name: 'Montagem e Acabamento', duration_minutes: 25 },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    const nextCode = `PRD-${100 + products.length + 1}`;
    setCode(nextCode);
    setName('');
    setDescription('');
    setSpecs('Material conforme normas ABNT/NBR. Tolerâncias dimensionais +-0.2mm.');
    setProcessTime(75);
    setSalePrice(250);
    setWorkCenterId(workCenters[0]?.id || '');
    setStockQuantity(0);
    setBomItems(
      materials.length > 0 ? [{ material_id: materials[0].id, quantity: 1 }] : []
    );
    setStagesList([
      { stage_name: 'Corte e Preparação', duration_minutes: 25 },
      { stage_name: 'Usinagem / Dobra CNC', duration_minutes: 30 },
      { stage_name: 'Inspeção e Embalagem', duration_minutes: 20 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingId(prod.id);
    setCode(prod.code);
    setName(prod.name);
    setDescription(prod.description || '');
    setSpecs(prod.specs || '');
    setProcessTime(prod.process_time_minutes || 60);
    setSalePrice(prod.sale_price || 0);
    setWorkCenterId(prod.work_center_id || '');
    setStockQuantity(prod.stock_quantity || 0);

    setBomItems(
      prod.materials && prod.materials.length > 0
        ? prod.materials.map((m) => ({ material_id: m.material_id, quantity: m.quantity }))
        : materials.length > 0
        ? [{ material_id: materials[0].id, quantity: 1 }]
        : []
    );

    setStagesList(
      prod.stages && prod.stages.length > 0
        ? prod.stages.map((s) => ({ stage_name: s.stage_name, duration_minutes: s.duration_minutes }))
        : [{ stage_name: 'Processamento Geral', duration_minutes: 60 }]
    );

    setIsModalOpen(true);
  };

  const handleAddBomItem = () => {
    if (materials.length > 0) {
      setBomItems([...bomItems, { material_id: materials[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveBomItem = (index: number) => {
    setBomItems(bomItems.filter((_, i) => i !== index));
  };

  const handleUpdateBomItem = (index: number, field: 'material_id' | 'quantity', val: number) => {
    const updated = [...bomItems];
    updated[index] = { ...updated[index], [field]: val };
    setBomItems(updated);
  };

  const handleAddStage = () => {
    setStagesList([...stagesList, { stage_name: '', duration_minutes: 15 }]);
  };

  const handleRemoveStage = (index: number) => {
    setStagesList(stagesList.filter((_, i) => i !== index));
  };

  const handleUpdateStage = (index: number, field: 'stage_name' | 'duration_minutes', val: any) => {
    const updated = [...stagesList];
    updated[index] = { ...updated[index], [field]: val };
    setStagesList(updated);

    // Auto-update total process time from sum of stages
    const totalMinutes = updated.reduce((sum, item) => sum + (Number(item.duration_minutes) || 0), 0);
    if (totalMinutes > 0) {
      setProcessTime(totalMinutes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        code,
        name,
        description,
        specs,
        process_time_minutes: processTime,
        sale_price: salePrice,
        work_center_id: workCenterId ? Number(workCenterId) : null,
        stock_quantity: stockQuantity,
        materials: bomItems,
        stages: stagesList,
      };

      if (editingId) {
        await api.updateProduct(editingId, payload);
        setMessage('Ficha Técnica atualizada com sucesso!');
      } else {
        await api.createProduct(payload);
        setMessage('Ficha Técnica cadastrada com sucesso!');
      }

      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao salvar produto: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, prodName: string) => {
    if (!window.confirm(`Deseja excluir a ficha técnica do produto "${prodName}"?`)) return;
    try {
      await api.deleteProduct(id);
      onRefresh();
      setMessage('Produto excluído.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate estimated material cost preview
  const previewMaterialCost = bomItems.reduce((acc, item) => {
    const m = materials.find((mat) => mat.id === item.material_id);
    return acc + (m ? m.unit_cost * item.quantity : 0);
  }, 0);

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
            <span>Engenharia de Produto & Manufatura</span>
            <span aria-hidden="true">·</span>
            <span>Estrutura de Materiais (BOM)</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Fichas Técnicas de Produtos
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Ficha Técnica</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código, produto ou especificação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Product Grid / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {filtered.map((prod) => {
          const rawCost = prod.raw_material_cost || 0;
          const hours = (prod.process_time_minutes / 60).toFixed(1);

          return (
            <div
              key={prod.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {prod.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                      title="Editar Ficha Técnica"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{prod.name}</h3>
                {prod.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{prod.description}</p>
                )}

                {prod.specs && (
                  <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5">Especificações Técnicas:</span>
                    <p className="font-mono text-[10px] line-clamp-3">{prod.specs}</p>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tempo de Processo:</span>
                    <span className="font-bold tabular-nums text-slate-900">
                      {prod.process_time_minutes} min ({hours}h)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Centro de Trabalho:</span>
                    <span className="font-medium text-slate-800 truncate block">
                      {prod.work_center_name || 'Geral'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Custo Direto Insumos:</span>
                    <span className="font-bold tabular-nums text-slate-900">
                      R$ {rawCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Preço Sugerido:</span>
                    <span className="font-bold tabular-nums text-emerald-700">
                      R$ {Number(prod.sale_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Insumos & Etapas counts */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span>
                    BOM: <strong>{prod.materials?.length || 0}</strong> insumos
                  </span>
                  <span>
                    Roteiro: <strong>{prod.stages?.length || 0}</strong> etapas
                  </span>
                  <span>
                    Estoque: <strong className="tabular-nums text-slate-900">{prod.stock_quantity} un</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(prod)}
                  className="w-full py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-center"
                >
                  Ver / Editar Ficha Técnica Completa
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-500">
            Nenhuma ficha técnica encontrada com o termo de busca.
          </div>
        )}
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO DE FICHA TÉCNICA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-4">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingId ? `Editar Ficha Técnica — ${code}` : 'Nova Ficha Técnica de Produto'}
                </h3>
                <p className="text-xs text-slate-400">
                  Especificações, tempos operacionais e estrutura de materiais (BOM)
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código do Produto: *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Produto: *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabinete Industrial Inox 600x400"
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Comercial & Aplicação:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Gabinete para comandos elétricos, vedação estanque IP66..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Especificações Técnicas (Normas, Tratamentos, Tolerâncias):
                </label>
                <textarea
                  rows={2}
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="Normas NBR aplicáveis, tipo de liga metálica, tolerância dimensional (+-0.2mm), acabamento superficial..."
                  className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Centro de Trabalho:</label>
                  <select
                    value={workCenterId}
                    onChange={(e) => setWorkCenterId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="">Selecione...</option>
                    {workCenters.map((wc) => (
                      <option key={wc.id} value={wc.id}>
                        {wc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempo Total Processo:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      required
                      value={processTime}
                      onChange={(e) => setProcessTime(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                    />
                    <span className="text-slate-500 font-medium">min</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço Sugerido (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estoque Acabado:</label>
                  <input
                    type="number"
                    step="1"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums font-bold"
                  />
                </div>
              </div>

              {/* LISTA DE MATERIAIS / BOM */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Estrutura de Insumos (BOM) — Matérias-Primas por Unidade
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Custo direto estimado de materiais: <strong>R$ {previewMaterialCost.toFixed(2)}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBomItem}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Insumo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {bomItems.map((item, index) => {
                    const matObj = materials.find((m) => m.id === item.material_id);
                    const subtotal = matObj ? matObj.unit_cost * item.quantity : 0;

                    return (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                        <div className="flex-1">
                          <select
                            value={item.material_id}
                            onChange={(e) => handleUpdateBomItem(index, 'material_id', Number(e.target.value))}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.code}] {m.name} (R$ {m.unit_cost.toFixed(2)}/{m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleUpdateBomItem(index, 'quantity', Number(e.target.value))}
                            className="w-full p-1.5 border border-slate-300 rounded text-right tabular-nums font-bold"
                          />
                          <span className="text-slate-500 text-[10px]">{matObj?.unit || 'un'}</span>
                        </div>

                        <div className="w-24 text-right tabular-nums text-[11px] font-semibold text-slate-700">
                          R$ {subtotal.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBomItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {bomItems.length === 0 && (
                    <p className="text-slate-400 text-xs italic text-center py-2">
                      Nenhum insumo adicionado ainda. Clique em "Adicionar Insumo" acima.
                    </p>
                  )}
                </div>
              </div>

              {/* ROTEIRO DE PROCESSO (ETAPAS) */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Roteiro de Fabricação (Etapas Sequenciais)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddStage}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Etapa</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {stagesList.map((stg, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                      <span className="font-bold text-slate-500 w-5 text-center">{index + 1}</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nome da Operação (ex: Corte Laser, Solda TIG...)"
                          value={stg.stage_name}
                          onChange={(e) => handleUpdateStage(index, 'stage_name', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded"
                        />
                      </div>
                      <div className="w-28 flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={stg.duration_minutes}
                          onChange={(e) => handleUpdateStage(index, 'duration_minutes', Number(e.target.value))}
                          className="w-full p-1.5 border border-slate-300 rounded text-right tabular-nums font-bold"
                        />
                        <span className="text-slate-500 text-[10px]">min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded transition-colors"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Ficha Técnica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
