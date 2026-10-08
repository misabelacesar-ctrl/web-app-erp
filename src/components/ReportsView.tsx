import React, { useState } from 'react';
import {
  FileText,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Factory,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ProductionOrder, Material, WorkCenter, CompanySettings } from '../types';

interface ReportsViewProps {
  orders: ProductionOrder[];
  materials: Material[];
  workCenters: WorkCenter[];
  settings: CompanySettings | null;
  onPrintOP: (order: ProductionOrder) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  materials,
  workCenters,
  settings,
  onPrintOP,
}) => {
  const [selectedReport, setSelectedReport] = useState<'ops' | 'capacity' | 'materials'>('ops');

  const handlePrintReport = () => {
    window.print();
  };

  // Metrics calculation
  const totalOps = orders.length;
  const completedOps = orders.filter((o) => o.status === 'Concluída');
  const inProgressOps = orders.filter((o) => o.status === 'Em Andamento' || o.status === 'Controle de Qualidade');
  const delayedOps = orders.filter(
    (o) => o.status !== 'Concluída' && new Date(o.target_date) < new Date()
  );

  const totalUnitsPlanned = orders.reduce((acc, o) => acc + Number(o.quantity || 0), 0);
  const totalUnitsCompleted = completedOps.reduce((acc, o) => acc + Number(o.quantity || 0), 0);

  const criticalMaterials = materials.filter((m) => m.current_stock <= m.min_stock);

  return (
    <div className="space-y-6">
      {/* Header with Top Bar Contract & Print button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            <span>Gestão & Auditoria Fabril</span>
            <span aria-hidden="true">·</span>
            <span>Documentos Técnicos</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Relatórios de Acompanhamento da Produção
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Report Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSelectedReport('ops')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                selectedReport === 'ops' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status das OPs
            </button>
            <button
              onClick={() => setSelectedReport('capacity')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                selectedReport === 'capacity' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carga / Capacidade
            </button>
            <button
              onClick={() => setSelectedReport('materials')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                selectedReport === 'materials' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reposição Insumos
            </button>
          </div>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs print:p-0 print:border-none print:shadow-none">
        {/* Formal Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">
                Relatório Técnico de Planejamento e Controle de Produção
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {settings?.company_name || 'Metalprint Manufatura Industrial Ltda'}
              </h2>
              <p className="text-xs text-slate-600">
                CNPJ: <span className="tabular-nums">{settings?.cnpj}</span> · {settings?.address}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded border sm:border-none border-slate-200">
              <div className="text-xs font-semibold text-slate-900">
                Responsável Técnico: {settings?.technical_responsible_name}
              </div>
              <div className="text-[11px] text-slate-600">
                {settings?.technical_responsible_title}
              </div>
              <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                Data de Emissão: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>
            </div>
          </div>
        </div>

        {/* REPORT 1: STATUS DAS ORDENS DE PRODUÇÃO */}
        {selectedReport === 'ops' && (
          <div className="space-y-6">
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total de OPs</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums">{totalOps}</span>
                <span className="text-[10px] text-slate-500 block">no ciclo produtivo</span>
              </div>

              <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">OPs Baixadas</span>
                <span className="text-2xl font-black text-emerald-700 tabular-nums">
                  {completedOps.length}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalOps > 0 ? Math.round((completedOps.length / totalOps) * 100) : 0}% concluído
                </span>
              </div>

              <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Peças Produzidas</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {totalUnitsCompleted} / {totalUnitsPlanned}
                </span>
                <span className="text-[10px] text-slate-500 block">unidades físicas</span>
              </div>

              <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Atrasos Críticos</span>
                <span className={`text-2xl font-black tabular-nums ${delayedOps.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                  {delayedOps.length}
                </span>
                <span className="text-[10px] text-slate-500 block">OPs fora do prazo</span>
              </div>
            </div>

            {/* OPs Detailed Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Quadro de Rastreabilidade das Ordens de Produção
              </h3>
              <div className="border border-slate-300 overflow-x-auto rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <th className="p-2 border-r border-slate-200">OP / Lote</th>
                      <th className="p-2 border-r border-slate-200">Produto Manufaturado</th>
                      <th className="p-2 text-right border-r border-slate-200">Qtd</th>
                      <th className="p-2 border-r border-slate-200">Posto de Trabalho</th>
                      <th className="p-2 border-r border-slate-200">Início</th>
                      <th className="p-2 border-r border-slate-200">Prazo Final</th>
                      <th className="p-2 text-center border-r border-slate-200">Progresso</th>
                      <th className="p-2 text-center border-r border-slate-200">Status</th>
                      <th className="p-2 text-center no-print">Imprimir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {orders.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {op.code}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {op.batch_number}
                          </span>
                        </td>
                        <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                          {op.product_name}
                          <span className="block text-[10px] text-slate-500 font-mono font-normal">
                            [{op.product_code}]
                          </span>
                        </td>
                        <td className="p-2 text-right font-black tabular-nums border-r border-slate-200">
                          {op.quantity}
                        </td>
                        <td className="p-2 text-slate-700 border-r border-slate-200">
                          {op.work_center_name || 'Geral'}
                        </td>
                        <td className="p-2 text-slate-600 tabular-nums border-r border-slate-200">
                          {op.start_date}
                        </td>
                        <td className="p-2 font-semibold text-slate-900 tabular-nums border-r border-slate-200">
                          {op.target_date}
                        </td>
                        <td className="p-2 text-center font-bold tabular-nums border-r border-slate-200">
                          {op.progress_percent}%
                        </td>
                        <td className="p-2 text-center border-r border-slate-200">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                              op.status === 'Concluída'
                                ? 'bg-emerald-100 text-emerald-800'
                                : op.status === 'Em Andamento'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {op.status}
                          </span>
                        </td>
                        <td className="p-2 text-center no-print">
                          <button
                            onClick={() => onPrintOP(op)}
                            className="p-1 text-slate-600 hover:text-slate-900 rounded bg-slate-100"
                            title="Imprimir Folha da OP"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: CAPACIDADE E CARGA DE TRABALHO */}
        {selectedReport === 'capacity' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Relatório de Carga Fabril e Ocupação dos Centros de Trabalho
            </h3>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-200">Centro de Trabalho</th>
                    <th className="p-2 text-center border-r border-slate-200">Turnos</th>
                    <th className="p-2 text-center border-r border-slate-200">Operadores</th>
                    <th className="p-2 text-right border-r border-slate-200">Capacidade Nominal</th>
                    <th className="p-2 text-right border-r border-slate-200">Eficiência OEE</th>
                    <th className="p-2 text-right border-r border-slate-200">Capacidade Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workCenters.map((wc) => {
                    const realCap = (wc.daily_capacity_hours * (wc.efficiency_rate / 100)).toFixed(1);

                    return (
                      <tr key={wc.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                          {wc.name}
                        </td>
                        <td className="p-2.5 text-center tabular-nums border-r border-slate-200">
                          {wc.shifts_per_day}
                        </td>
                        <td className="p-2.5 text-center tabular-nums border-r border-slate-200">
                          {wc.operators_count}
                        </td>
                        <td className="p-2.5 text-right font-semibold tabular-nums border-r border-slate-200">
                          {wc.daily_capacity_hours}h / dia
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-emerald-700 font-bold border-r border-slate-200">
                          {wc.efficiency_rate}%
                        </td>
                        <td className="p-2.5 text-right font-black tabular-nums text-slate-900">
                          {realCap}h / dia
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 3: NECESSIDADE DE MATÉRIA-PRIMA */}
        {selectedReport === 'materials' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>Relatório de Posição de Estoque e Reposição de Insumos</span>
              <span className="text-rose-700 font-bold">
                {criticalMaterials.length} item(ns) abaixo do estoque de segurança
              </span>
            </h3>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-200">Código</th>
                    <th className="p-2 border-r border-slate-200">Insumo / Matéria-Prima</th>
                    <th className="p-2 text-center border-r border-slate-200">Unid.</th>
                    <th className="p-2 text-right border-r border-slate-200">Saldo Atual</th>
                    <th className="p-2 text-right border-r border-slate-200">Estoque Mínimo</th>
                    <th className="p-2 text-right border-r border-slate-200">Déficit / Compra</th>
                    <th className="p-2 border-r border-slate-200">Fornecedor</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materials.map((m) => {
                    const isCrit = m.current_stock <= m.min_stock;
                    const diff = Math.max(0, m.min_stock - m.current_stock);

                    return (
                      <tr key={m.id} className={isCrit ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {m.code}
                        </td>
                        <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">
                          {m.name}
                        </td>
                        <td className="p-2 text-center uppercase font-bold border-r border-slate-200">
                          {m.unit}
                        </td>
                        <td className="p-2 text-right font-black tabular-nums border-r border-slate-200">
                          {m.current_stock}
                        </td>
                        <td className="p-2 text-right tabular-nums text-slate-600 border-r border-slate-200">
                          {m.min_stock}
                        </td>
                        <td className="p-2 text-right font-bold tabular-nums text-rose-700 border-r border-slate-200">
                          {diff > 0 ? `${diff.toFixed(1)} ${m.unit}` : '-'}
                        </td>
                        <td className="p-2 text-slate-700 border-r border-slate-200">
                          {m.supplier_name || 'Diversos'}
                        </td>
                        <td className="p-2 text-center">
                          {isCrit ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-rose-800 bg-rose-100 rounded">
                              Comprar
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 rounded">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Technical Responsible Sign-off Seal at Bottom of Report */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <span className="font-bold text-slate-900 uppercase">Validação de Engenharia & PCP</span>
              </div>
              <p className="text-[11px] text-slate-600 max-w-md">
                Relatório gerado em conformidade com o sistema de gestão da produção industrial.
                As informações refletem o apontamento em tempo real da fábrica.
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="border-b border-slate-400 pb-1 mb-1 min-w-[240px]">
                <span className="font-serif italic font-bold text-slate-900 text-sm">
                  {settings?.technical_responsible_name}
                </span>
              </div>
              <span className="font-bold text-slate-900 block">
                {settings?.technical_responsible_name}
              </span>
              <span className="text-[10px] text-slate-600 block">
                {settings?.technical_responsible_title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
