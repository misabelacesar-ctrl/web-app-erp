import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Factory,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { CustomerOrder, Customer, Product } from '../types';
import { api } from '../services/api';

interface OrdersViewProps {
  orders: CustomerOrder[];
  customers: Customer[];
  products: Product[];
  onRefresh: () => void;
  onGenerateOPFromOrder: (order: CustomerOrder) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  customers,
  products,
  onRefresh,
  onGenerateOPFromOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [orderNumber, setOrderNumber] = useState('');
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id || 1);
  const [productId, setProductId] = useState<number>(products[0]?.id || 1);
  const [quantity, setQuantity] = useState(10);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [unitPrice, setUnitPrice] = useState(0);
  const [status, setStatus] = useState<CustomerOrder['status']>('Pendente');
  const [notes, setNotes] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    const count = orders.length + 1;
    setOrderNumber(`PED-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`);
    setCustomerId(customers[0]?.id || 1);
    const prod = products[0];
    setProductId(prod?.id || 1);
    setUnitPrice(prod?.sale_price || 0);
    setQuantity(10);
    setOrderDate(new Date().toISOString().slice(0, 10));
    setDeliveryDate(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    setStatus('Pendente');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleProductChange = (prodId: number) => {
    setProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setUnitPrice(p.sale_price);
    }
  };

  const openEditModal = (order: CustomerOrder) => {
    setEditingId(order.id);
    setOrderNumber(order.order_number);
    setCustomerId(order.customer_id);
    setProductId(order.product_id);
    setQuantity(order.quantity);
    setOrderDate(order.order_date);
    setDeliveryDate(order.delivery_date);
    setUnitPrice(order.unit_price);
    setStatus(order.status);
    setNotes(order.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        order_number: orderNumber,
        customer_id: customerId,
        product_id: productId,
        quantity,
        order_date: orderDate,
        delivery_date: deliveryDate,
        unit_price: unitPrice,
        status,
        notes,
      };

      if (editingId) {
        await api.updateOrder(editingId, payload);
        setMessage('Pedido de cliente atualizado com sucesso!');
      } else {
        await api.createOrder(payload);
        setMessage('Pedido cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id: number, orderNum: string) => {
    if (!window.confirm(`Deseja excluir o pedido ${orderNum}?`)) return;
    try {
      await api.deleteOrder(id);
      onRefresh();
      setMessage('Pedido excluído.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.product_name && o.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
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
            <span>Comercial & Vendas</span>
            <span aria-hidden="true">·</span>
            <span>Demanda de Manufatura</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pedidos de Clientes
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Pedido</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nº do pedido, cliente ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none"
          >
            <option value="ALL">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Produção">Em Produção</option>
            <option value="Concluído">Concluído</option>
            <option value="Entregue">Entregue</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Pedido Nº</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Produto Solicitado</th>
                <th className="py-2.5 px-3 text-right">Qtd</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3">Data Pedido</th>
                <th className="py-2.5 px-3">Data Entrega</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Ação PCP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => {
                const hasPO = Boolean(order.linked_po_id);

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {order.order_number}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">{order.customer_name}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-900 block">{order.product_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{order.product_code}]</span>
                    </td>

                    <td className="py-3 px-3 text-right font-black tabular-nums text-sm text-slate-900">
                      {order.quantity}
                    </td>

                    <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900">
                      R$ {Number(order.total_price).toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 tabular-nums">
                      {order.order_date}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                      {order.delivery_date}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded ${
                          order.status === 'Concluído' || order.status === 'Entregue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Em Produção'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Gerar OP a partir do Pedido */}
                        {!hasPO && order.status !== 'Concluído' ? (
                          <button
                            onClick={() => onGenerateOPFromOrder(order)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-2xs"
                            title="Gerar Ordem de Produção para atender este pedido"
                          >
                            <Factory className="w-3 h-3" />
                            <span>Gerar OP</span>
                          </button>
                        ) : hasPO ? (
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {order.linked_po_code} ({order.linked_po_status})
                          </span>
                        ) : null}

                        <button
                          onClick={() => openEditModal(order)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id, order.order_number)}
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
                    Nenhum pedido de venda encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO / EDITAR PEDIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingId ? `Editar Pedido — ${orderNumber}` : 'Novo Pedido de Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número do Pedido: *</label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cliente: *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produto Manufaturado: *</label>
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} — Preço: R$ {p.sale_price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantidade: *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço Unit. (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total (R$):</label>
                  <div className="p-2 bg-slate-100 rounded border border-slate-200 font-black tabular-nums text-slate-900">
                    R$ {(quantity * unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data do Pedido:</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Prometida de Entrega: *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Produção">Em Produção</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Entregue">Entregue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Observações:</label>
                <textarea
                  rows={2}
                  placeholder="Informações de transporte, requisitos especiais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
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
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
