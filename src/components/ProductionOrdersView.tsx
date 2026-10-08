import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Trash2,
  Edit,
} from 'lucide-react';
import { ProductionOrder, Product, CustomerOrder, CompanySettings } from '../types';
import { api } from '../services/api';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  products: Product[];
  customerOrders: CustomerOrder[];
  settings: CompanySettings | null;
  onRefresh: () => void;
  onPrintOP: (order: ProductionOrder) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  products,
  customerOrders,
  settings,
  onRefresh,
  onPrintOP,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [expandedOpId, setExpandedOpId] = useState<number | null>(null);

  // Apontamento modal
  const [selectedForLog, setSelectedForLog] = useState<ProductionOrder | null>(null);
  const [logStageName, setLogStageName] = useState('');
  const [logOperator, setLogOperator] = useState('');
  const [logUnits, setLogUnits] = useState(0);
  const [logProgress, setLogProgress] = useState(50);
  const [logNotes, setLogNotes] = useState('');

  // New OP form state
  const [newProductId, setNewProductId] = useState<number>(products[0]?.id || 1);
  const [newOrderId, setNewOrderId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(10);
  const [newPriority, setNewPriority] = useState<'Baixa' | 'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)
  );
  const [newOperator, setNewOperator] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Handle order selection change when creating OP to auto-fill
  const handleOrderSelect = (orderIdStr: string) => {
    setNewOrderId(orderIdStr);
    if (orderIdStr) {
      const found = customerOrders.find((o) => o.id === Number(orderIdStr));
      if (found) {
        setNewProductId(found.product_id);
        setNewQuantity(found.quantity);
        setNewTargetDate(found.delivery_date);
        setNewNotes(`Gerada a partir do Pedido ${found.order_number} (${found.customer_name})`);
      }
    }
  };

  // Submit New OP
  const handleCreateOP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createProductionOrder({
        product_id: newProductId,
        order_id: newOrderId ? Number(newOrderId) : null,
        quantity: newQuantity,
        priority: newPriority,
        start_date: newStartDate,
        target_date: newTargetDate,
        operator_name: newOperator || 'A definir',
        notes: newNotes,
      });

      setIsCreateModalOpen(false);
      onRefresh();
      setActionMessage('Ordem de Produção criada com sucesso!');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao criar OP: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Baixa / Conclusão
  const handleBaixa = async (op: ProductionOrder) => {
    const confirm = window.confirm(
      `Confirma a BAIXA e CONCLUSÃO da Ordem de Produção ${op.code}?\n\nIsso irá:\n1. Adicionar ${op.quantity} unidades ao estoque de produtos acabados.\n2. Deduzir automaticamente as matérias-primas do estoque conforme a Ficha Técnica.\n3. Encerrar a OP com data de hoje.`
    );
    if (!confirm) return;

    try {
      const res = await api.concludeAndDeductPO(op.id);
      setActionMessage(res.message);
      setTimeout(() => setActionMessage(null), 5000);
      onRefresh();
    } catch (err: any) {
      alert(`Erro na baixa da OP: ${err.message}`);
    }
  };

  // Submit Apontamento
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForLog) return;
    try {
      await api.addProductionLog(selectedForLog.id, {
        stage_name: logStageName || 'Etapa Geral',
        operator: logOperator || 'Operador',
        units_completed: Number(logUnits) || 0,
        notes: logNotes,
        update_op_progress: Number(logProgress),
      });
      setSelectedForLog(null);
      onRefresh();
      setActionMessage('Apontamento de produção registrado!');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao apontar produção: ${err.message}`);
    }
  };

  // Delete OP
  const handleDeleteOP = async (id: number, code: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a OP ${code}?`)) return;
    try {
      await api.deleteProductionOrder(id);
      onRefresh();
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((op) => {
    const matchSearch =
      op.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.customer_name && op.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || op.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || op.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const selectedProductForPreview = products.find((p) => p.id === Number(newProductId));

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-700 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-300 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* View Header with Top Bar Contract Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            <span>Planejamento e Execução</span>
            <span aria-hidden="true">·</span>
            <span>Controle Fabril</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ordens de Produção (OP)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Mode Switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabela Detalhada
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quadro Kanban
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova OP</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar OP, produto, lote, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">Todos os Status</option>
              <option value="Planejada">Planejada</option>
              <option value="Aguardando Insumos">Aguardando Insumos</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Controle de Qualidade">Controle de Qualidade</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 text-[11px]">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">Todas Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Código / Lote</th>
                  <th className="py-2.5 px-3">Produto Fabricado</th>
                  <th className="py-2.5 px-3 text-right">Qtd Programada</th>
                  <th className="py-2.5 px-3">Centro / Operador</th>
                  <th className="py-2.5 px-3">Início / Prazo</th>
                  <th className="py-2.5 px-3">Progresso (%)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((op) => {
                    const isExpanded = expandedOpId === op.id;
                    const isCompleted = op.status === 'Concluída';

                    return (
                      <React.Fragment key={op.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 font-mono block">
                              {op.code}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {op.batch_number}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">
                              {op.product_name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="font-mono">[{op.product_code}]</span>
                              {op.order_number && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{op.order_number} ({op.customer_name})</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right font-black tabular-nums text-slate-900 text-sm">
                            {op.quantity}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800 block">
                              {op.work_center_name || 'Linha Geral'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {op.operator_name || 'Turno Regular'}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="tabular-nums text-slate-800 font-medium block">
                              Até {op.target_date}
                            </span>
                            <span className="text-[10px] text-slate-500 tabular-nums block">
                              Início: {op.start_date}
                            </span>
                          </td>

                          <td className="py-3 px-3 w-36">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold tabular-nums text-slate-800">
                                {op.progress_percent}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {op.total_estimated_hours}h est.
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  isCompleted
                                    ? 'bg-emerald-500'
                                    : op.progress_percent >= 80
                                    ? 'bg-sky-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${op.progress_percent}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : op.status === 'Em Andamento'
                                  ? 'bg-amber-100 text-amber-800'
                                  : op.status === 'Controle de Qualidade'
                                  ? 'bg-purple-100 text-purple-800'
                                  : op.status === 'Aguardando Insumos'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {op.status}
                            </span>
                            {op.has_missing_materials && !isCompleted && (
                              <span className="block text-[9px] text-rose-600 font-semibold mt-0.5">
                                Faltam Insumos
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Print OP */}
                              <button
                                onClick={() => onPrintOP(op)}
                                title="Imprimir Ordem de Produção"
                                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Apontar Produção */}
                              {!isCompleted && (
                                <button
                                  onClick={() => {
                                    setSelectedForLog(op);
                                    setLogProgress(op.progress_percent);
                                    setLogOperator(op.operator_name || '');
                                    setLogUnits(op.quantity);
                                  }}
                                  title="Apontar Produção / Etapa"
                                  className="px-2 py-1 text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                >
                                  Apontar
                                </button>
                              )}

                              {/* Baixar Produção */}
                              {!isCompleted ? (
                                <button
                                  onClick={() => handleBaixa(op)}
                                  className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded transition-colors shadow-xs"
                                >
                                  Baixar OP
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Baixada
                                </span>
                              )}

                              {/* Expand BOM / Stages */}
                              <button
                                onClick={() => setExpandedOpId(isExpanded ? null : op.id)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteOP(op.id, op.code)}
                                title="Excluir OP"
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details: BOM items checklist */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={8} className="p-4 border-b border-slate-200">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                  <span className="font-bold text-slate-900 text-xs">
                                    Insumos & Matérias-Primas Requeridas (BOM para {op.quantity} un)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Status da Baixa de Estoque:{' '}
                                    <strong className={op.materials_deducted ? 'text-emerald-700' : 'text-amber-700'}>
                                      {op.materials_deducted ? 'Estoque já baixado' : 'Aguardando Baixa'}
                                    </strong>
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                  {op.required_materials && op.required_materials.length > 0 ? (
                                    op.required_materials.map((rm, idx) => {
                                      const isLacking = rm.current_stock < rm.total_required;
                                      return (
                                        <div
                                          key={idx}
                                          className={`p-2 rounded border text-[11px] ${
                                            isLacking
                                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                                              : 'bg-white border-slate-200 text-slate-800'
                                          }`}
                                        >
                                          <div className="font-semibold truncate">{rm.material_name}</div>
                                          <div className="flex justify-between items-center mt-1 text-[10px]">
                                            <span>Necessário: {rm.total_required} {rm.unit}</span>
                                            <span className={isLacking ? 'font-bold text-rose-700' : 'text-slate-600'}>
                                              Disp: {rm.current_stock} {rm.unit}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <span className="text-slate-500 text-xs italic">
                                      Nenhum insumo específico vinculado na ficha do produto.
                                    </span>
                                  )}
                                </div>

                                {op.notes && (
                                  <div className="text-[11px] text-slate-600 pt-1">
                                    <strong>Observações Técnicas:</strong> {op.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Nenhuma ordem de produção encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(
            [
              { status: 'Planejada', title: '1. Planejada', bg: 'bg-slate-100', text: 'text-slate-800' },
              { status: 'Aguardando Insumos', title: '2. Aguardando Insumos', bg: 'bg-rose-50', text: 'text-rose-800' },
              { status: 'Em Andamento', title: '3. Em Andamento', bg: 'bg-amber-50', text: 'text-amber-800' },
              { status: 'Controle de Qualidade', title: '4. Qualidade', bg: 'bg-purple-50', text: 'text-purple-800' },
              { status: 'Concluída', title: '5. Concluída', bg: 'bg-emerald-50', text: 'text-emerald-800' },
            ] as const
          ).map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.status);

            return (
              <div key={col.status} className="bg-slate-100/70 border border-slate-200 rounded-lg p-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className={`text-xs font-bold ${col.text}`}>{col.title}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded tabular-nums text-slate-700">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                  {colOrders.map((op) => (
                    <div
                      key={op.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs hover:border-slate-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-slate-900">{op.code}</span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">{op.priority}</span>
                      </div>

                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">{op.product_name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Lote: {op.batch_number} · Qtd: <strong className="text-slate-900">{op.quantity}</strong>
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Prazo: {op.target_date}</span>
                        <span className="font-bold tabular-nums">{op.progress_percent}%</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => onPrintOP(op)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Imprimir OP"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {op.status !== 'Concluída' ? (
                          <button
                            onClick={() => handleBaixa(op)}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded"
                          >
                            Baixar
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">Baixada</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs italic">
                      Nenhuma OP nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOVA ORDEM DE PRODUÇÃO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Emitir Nova Ordem de Produção (OP)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Geração para atendimento a pedido de cliente ou reposição de estoque
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateOP} className="p-5 space-y-4 text-xs">
              {/* Optional: Pick Customer Order to auto-fill */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  Vincular a Pedido de Venda (Opcional):
                </label>
                <select
                  value={newOrderId}
                  onChange={(e) => handleOrderSelect(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                >
                  <option value="">-- OP Avulsa / Para Estoque Interno --</option>
                  {customerOrders
                    .filter((o) => o.status !== 'Concluído' && o.status !== 'Entregue')
                    .map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.order_number} · {co.customer_name} ({co.product_name} - {co.quantity} un)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Produto Fabricado (Ficha Técnica): *
                  </label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(Number(e.target.value))}
                    required
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-medium"
                  >
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        [{prod.code}] {prod.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantidade a Produzir: *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Início:</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prazo de Entrega: *</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operador / Líder de Produção Responsável:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marcio Silveira (Líder Turno 1)"
                  value={newOperator}
                  onChange={(e) => setNewOperator(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instruções e Observações de Fabricação:
                </label>
                <textarea
                  rows={2}
                  placeholder="Especificar detalhes de lote, tolerâncias ou cuidados especiais..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              {/* BOM Preview */}
              {selectedProductForPreview && selectedProductForPreview.materials && (
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    Cálculo Prévia de Insumos Necessários ({newQuantity} un):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProductForPreview.materials.map((m, i) => {
                      const needed = (Number(m.quantity) * newQuantity).toFixed(1);
                      const current = Number(m.current_stock || 0);
                      const isShort = current < Number(needed);
                      return (
                        <div key={i} className="text-[11px] p-1.5 bg-white border rounded">
                          <span className="font-medium block truncate">{m.material_name}</span>
                          <span className="text-slate-500 tabular-nums">
                            Precisa: {needed} {m.unit}
                          </span>
                          <span className={`block font-bold tabular-nums ${isShort ? 'text-rose-600' : 'text-emerald-600'}`}>
                            Estoque: {current} {m.unit} {isShort && '(FALTA)'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded font-bold transition-colors"
                >
                  {isSubmitting ? 'Gerando...' : 'Criar Ordem de Produção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APONTAMENTO DE PRODUÇÃO */}
      {selectedForLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Apontamento Operacional — OP {selectedForLog.code}
                </h3>
                <p className="text-xs text-slate-400">{selectedForLog.product_name}</p>
              </div>
              <button
                onClick={() => setSelectedForLog(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitLog} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Etapa / Operação Concluída:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Corte CNC, Dobra, Soldagem, Pintura..."
                  required
                  value={logStageName}
                  onChange={(e) => setLogStageName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operador / Técnico:
                  </label>
                  <input
                    type="text"
                    required
                    value={logOperator}
                    onChange={(e) => setLogOperator(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peças Processadas:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={logUnits}
                    onChange={(e) => setLogUnits(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Atualizar Progresso Total da OP (%):
                  </label>
                  <span className="font-bold text-slate-900 tabular-nums">{logProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={logProgress}
                  onChange={(e) => setLogProgress(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações do Apontamento:
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações dimensionais, paradas de máquina ou ressalvas..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForLog(null)}
                  className="px-3.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded"
                >
                  Salvar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
