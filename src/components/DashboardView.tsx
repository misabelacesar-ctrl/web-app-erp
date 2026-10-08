import React from 'react';
import {
  Factory,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Cpu,
  Plus,
} from 'lucide-react';
import { DashboardData, CompanySettings, ProductionOrder } from '../types';

interface DashboardViewProps {
  data: DashboardData | null;
  settings: CompanySettings | null;
  onNavigate: (tab: string) => void;
  onSelectOPForPrint: (opId: number) => void;
  onOpenNewOP: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  settings,
  onNavigate,
  onSelectOPForPrint,
  onOpenNewOP,
}) => {
  if (!data) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full mb-3" />
        <p className="text-sm">Carregando indicadores industriais...</p>
      </div>
    );
  }

  const { summary, work_centers_capacity, low_stock_materials, pending_orders } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner / Factory Operational Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Planejamento & Controle da Produção (PCP)</span>
            <span aria-hidden="true">·</span>
            <span>Turno Operacional Ativo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {settings?.company_name || 'Manufatura & Manutenção Industrial'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Responsável Técnico:{' '}
            <strong className="text-slate-800">
              {settings?.technical_responsible_name || 'Engenharia de Produção'}
            </strong>{' '}
            ({settings?.technical_responsible_title || 'CREA Ativo'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('production')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Quadro de OPs
          </button>
          <button
            onClick={onOpenNewOP}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir Nova OP</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Single-Elevation, anti-slop, tabular-nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active OPs */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">OPs em Andamento</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {summary.active_ops}
            </span>
            <span className="text-xs text-slate-500">ativas na fábrica</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Total programado:</span>
            <span className="font-semibold tabular-nums">{summary.total_ops} OPs</span>
          </div>
        </div>

        {/* Card 2: Completed OPs */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">OPs Concluídas / Baixadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {summary.completed_ops}
            </span>
            <span className="text-xs text-slate-500">finalizadas com baixa</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Taxa de conclusão:</span>
            <span className="font-semibold tabular-nums">
              {summary.total_ops > 0
                ? Math.round((summary.completed_ops / summary.total_ops) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Card 3: Pending Customer Orders */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pedidos de Venda</span>
            <ShoppingCart className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {summary.total_orders}
            </span>
            <span className="text-xs text-slate-500">pedidos cadastrados</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Fichas técnicas ativas:</span>
            <span className="font-semibold tabular-nums">{summary.total_products} produtos</span>
          </div>
        </div>

        {/* Card 4: Low Stock Alert */}
        <div className={`border rounded-lg p-4 shadow-xs ${
          summary.low_stock_count > 0 ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Estoque Crítico (Insumos)</span>
            <AlertTriangle className={`w-4 h-4 ${summary.low_stock_count > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black tabular-nums ${
              summary.low_stock_count > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}>
              {summary.low_stock_count}
            </span>
            <span className="text-xs text-slate-500">itens abaixo do mín.</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
            <span>Total de matérias-primas:</span>
            <span className="font-semibold tabular-nums">{summary.total_materials} cadastros</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Capacity Analysis & Production Orders Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Capacity by Work Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capacity Utilization Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-700" />
                  <span>Ocupação da Capacidade Produtiva por Centro de Trabalho</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Horas de processamento requeridas pelas OPs ativas vs capacidade nominal diária
                </p>
              </div>
              <button
                onClick={() => onNavigate('capacities')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
              >
                <span>Configurar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {work_centers_capacity.map((center) => {
                const committed = Number(center.committed_hours || 0);
                const available = Number(center.daily_capacity_hours || 8);
                const percent = Math.min(100, Math.round((committed / available) * 100));

                let barColor = 'bg-emerald-500';
                if (percent > 90) barColor = 'bg-rose-500';
                else if (percent > 70) barColor = 'bg-amber-500';

                return (
                  <div key={center.id} className="py-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{center.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{center.shifts_per_day} turno(s)</span>
                          <span aria-hidden="true">·</span>
                          <span>{center.operators_count} operador(es)</span>
                          <span aria-hidden="true">·</span>
                          <span>Eficiência: {center.efficiency_rate}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold tabular-nums text-slate-900">
                          {committed.toFixed(1)}h / {available.toFixed(1)}h dia
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1.5 tabular-nums">
                          ({percent}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Customer Orders */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span>Próximos Pedidos de Clientes & Prazos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fila de pedidos aguardando atendimento ou em fabricação
                </p>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
              >
                <span>Ver Todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-2 font-medium">Pedido</th>
                    <th className="py-2 font-medium">Cliente</th>
                    <th className="py-2 font-medium">Produto</th>
                    <th className="py-2 text-right font-medium">Qtd</th>
                    <th className="py-2 text-right font-medium">Entrega</th>
                    <th className="py-2 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending_orders.length > 0 ? (
                    pending_orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono font-semibold text-slate-900">
                          {order.order_number}
                        </td>
                        <td className="py-2.5 text-slate-700">{order.customer_name}</td>
                        <td className="py-2.5 text-slate-900 font-medium">{order.product_name}</td>
                        <td className="py-2.5 text-right font-bold tabular-nums text-slate-900">
                          {order.quantity}
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-slate-700">
                          {order.delivery_date}
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                              order.status === 'Concluído'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'Em Produção'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                        Nenhum pedido pendente registrado no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Critical Materials & Fast Actions */}
        <div className="space-y-6">
          {/* Critical Raw Materials Alert */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Alerta de Insumos Críticos</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Saldo abaixo do estoque mínimo de segurança</p>
              </div>
              <button
                onClick={() => onNavigate('materials')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-950"
              >
                Estoque
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {low_stock_materials.length > 0 ? (
                low_stock_materials.map((mat) => {
                  const shortage = (mat.min_stock - mat.current_stock).toFixed(1);
                  return (
                    <div key={mat.id} className="py-3 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">{mat.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {mat.code} · Unid: {mat.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 tabular-nums block">
                          {mat.current_stock} / {mat.min_stock} {mat.unit}
                        </span>
                        <span className="text-[10px] text-rose-500 block">
                          Faltam {shortage} {mat.unit}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>Todos os insumos estão com saldo acima do estoque mínimo.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick ERP Shortcuts */}
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-bold tracking-tight text-white mb-1">
              Atalhos Rápidos de Operação
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Rotinas frequentes do Planejamento e Controle de Produção
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenNewOP}
                className="w-full text-left p-2.5 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-200">Emitir Ordem de Produção (OP)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="w-full text-left p-2.5 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-slate-200">Consultar / Criar Ficha Técnica</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="w-full text-left p-2.5 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">Gerenciar Pedidos de Clientes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full text-left p-2.5 rounded bg-slate-800 hover:bg-slate-700/80 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-slate-200">Relatórios Gerenciais e OTD</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
