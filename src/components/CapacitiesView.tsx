import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Activity,
  Layers,
  X,
  AlertTriangle,
} from 'lucide-react';
import { WorkCenter } from '../types';
import { api } from '../services/api';

interface CapacitiesViewProps {
  workCenters: WorkCenter[];
  onRefresh: () => void;
}

export const CapacitiesView: React.FC<CapacitiesViewProps> = ({
  workCenters,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [dailyCapacityHours, setDailyCapacityHours] = useState(16);
  const [shiftsPerDay, setShiftsPerDay] = useState(2);
  const [operatorsCount, setOperatorsCount] = useState(4);
  const [efficiencyRate, setEfficiencyRate] = useState(90);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDailyCapacityHours(16);
    setShiftsPerDay(2);
    setOperatorsCount(3);
    setEfficiencyRate(90);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (center: WorkCenter) => {
    setEditingId(center.id);
    setName(center.name);
    setDailyCapacityHours(center.daily_capacity_hours);
    setShiftsPerDay(center.shifts_per_day);
    setOperatorsCount(center.operators_count);
    setEfficiencyRate(center.efficiency_rate);
    setNotes(center.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        daily_capacity_hours: dailyCapacityHours,
        shifts_per_day: shiftsPerDay,
        operators_count: operatorsCount,
        efficiency_rate: efficiencyRate,
        notes,
      };

      if (editingId) {
        await api.updateWorkCenter(editingId, payload);
        setMessage('Capacidade produtiva atualizada com sucesso!');
      } else {
        await api.createWorkCenter(payload);
        setMessage('Centro de trabalho cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      onRefresh();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDelete = async (id: number, centerName: string) => {
    if (!window.confirm(`Deseja remover o centro de trabalho "${centerName}"?`)) return;
    try {
      await api.deleteWorkCenter(id);
      onRefresh();
      setMessage('Centro de trabalho removido.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  // Calculations
  const totalDailyAvailableHours = workCenters.reduce(
    (acc, c) => acc + Number(c.daily_capacity_hours || 0),
    0
  );
  const totalOperators = workCenters.reduce(
    (acc, c) => acc + Number(c.operators_count || 0),
    0
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
            <span>Planejamento Fabril</span>
            <span aria-hidden="true">·</span>
            <span>Centros de Trabalho & Máquinas</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Capacidade Produtiva da Fábrica
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Centro de Trabalho</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-medium block">
            Capacidade Total Instalada
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {totalDailyAvailableHours.toFixed(1)} h
            </span>
            <span className="text-xs text-slate-500">disponíveis por dia útil</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-medium block">
            Postos Operacionais / Células
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {workCenters.length}
            </span>
            <span className="text-xs text-slate-500">centros de trabalho</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-medium block">
            Mão de Obra Alocada
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {totalOperators}
            </span>
            <span className="text-xs text-slate-500">operadores fabris</span>
          </div>
        </div>
      </div>

      {/* Centers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workCenters.map((wc) => {
          const effectiveHours = (
            wc.daily_capacity_hours *
            (wc.efficiency_rate / 100)
          ).toFixed(1);

          return (
            <div
              key={wc.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{wc.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{wc.shifts_per_day} turno(s) diário(s)</span>
                    <span aria-hidden="true">·</span>
                    <span>{wc.operators_count} operador(es)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(wc)}
                    className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(wc.id, wc.name)}
                    className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {wc.notes && (
                <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                  {wc.notes}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Capacidade Nominal:</span>
                  <span className="font-bold tabular-nums text-slate-900 text-sm">
                    {wc.daily_capacity_hours}h / dia
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Eficiência OEE:</span>
                  <span className="font-bold tabular-nums text-emerald-700 text-sm">
                    {wc.efficiency_rate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Horas Efetivas:</span>
                  <span className="font-bold tabular-nums text-slate-900 text-sm">
                    {effectiveHours}h / dia
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Produtos associados: <strong>{wc.products_count || 0}</strong>
                </span>
                <span>
                  OPs ativas na fila: <strong>{wc.active_ops_count || 0}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: NOVO / EDITAR CENTRO DE TRABALHO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingId ? `Editar Centro — ${name}` : 'Novo Centro de Trabalho / Capacidade'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Centro de Trabalho / Máquina: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Célula de Usinagem CNC, Dobradeira Hidráulica..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capacidade Diária (Horas): *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    required
                    value={dailyCapacityHours}
                    onChange={(e) => setDailyCapacityHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Turnos por Dia:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={shiftsPerDay}
                    onChange={(e) => setShiftsPerDay(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operadores Alocados:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={operatorsCount}
                    onChange={(e) => setOperatorsCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Taxa de Eficiência Esperada (%):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={efficiencyRate}
                    onChange={(e) => setEfficiencyRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Equipamentos, Máquinas & Observações:
                </label>
                <textarea
                  rows={2}
                  placeholder="Modelo das máquinas, gabaritos ou limitações operacionais..."
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
                  Salvar Centro de Trabalho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
