import React from 'react';
import { Printer, X, CheckCircle, ShieldAlert, FileText, Factory } from 'lucide-react';
import { ProductionOrder, CompanySettings } from '../types';

interface PrintWorkOrderModalProps {
  order: ProductionOrder;
  settings: CompanySettings | null;
  onClose: () => void;
}

export const PrintWorkOrderModal: React.FC<PrintWorkOrderModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const company = settings || {
    company_name: 'Metalprint Manufatura Industrial Ltda',
    cnpj: '12.345.678/0001-90',
    technical_responsible_name: 'Eng. Carlos Eduardo Ribeiro',
    technical_responsible_title: 'Resp. Técnico de Manufatura - CREA-SP 506.789/D',
    contact_email: 'pcp@metalprint.ind.br',
    contact_phone: '(11) 4892-3000',
    address: 'Av. das Indústrias, 450 - Polo Metal-Mecânico, Campinas - SP',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl border border-slate-300 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold">
              Visualização de Impressão — Ordem de Produção {order.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Documento</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 text-slate-900 text-xs print:p-0">
          {/* Document Header */}
          <div className="border border-slate-900 p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-300 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-bold text-lg rounded">
                  <Factory className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-base font-bold uppercase tracking-wider text-slate-950">
                    {company.company_name}
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    CNPJ: <span className="tabular-nums">{company.cnpj}</span> · {company.address}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tel: {company.contact_phone} · E-mail: {company.contact_email}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-300 sm:pl-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Documento Operacional
                </span>
                <span className="text-lg font-black tracking-tight text-slate-900 block tabular-nums">
                  {order.code}
                </span>
                <span className="text-[10px] text-slate-600 block tabular-nums">
                  Emissão: {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Document Title Bar */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div>
                <span className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                  Ordem de Produção Industrial (OP)
                </span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-xs font-semibold text-slate-700">
                  Lote: <span className="font-mono">{order.batch_number}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs">
                  Prioridade: <strong className="uppercase">{order.priority}</strong>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-xs">
                  Status: <strong>{order.status}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Block: Product & Production Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Box 1: Product Specifications */}
            <div className="border border-slate-900 p-3 bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Identificação do Produto Fabricado
              </h2>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500 text-[11px] block">Código e Descrição:</span>
                  <span className="font-bold text-slate-950 text-xs">
                    [{order.product_code}] {order.product_name}
                  </span>
                </div>
                {order.product_description && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">Aplicação / Finalidade:</span>
                    <span className="text-slate-700 text-[11px]">{order.product_description}</span>
                  </div>
                )}
                {order.product_specs && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">Especificações Técnicas & Normas:</span>
                    <span className="text-slate-700 text-[11px] font-mono bg-white p-1.5 border border-slate-200 block rounded-xs">
                      {order.product_specs}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span>
                    Quantidade Programada:{' '}
                    <strong className="text-sm font-black tabular-nums text-slate-900">
                      {order.quantity} unidades
                    </strong>
                  </span>
                  <span>
                    Tempo Est. Total:{' '}
                    <strong className="tabular-nums">
                      {order.total_estimated_hours || ((order.quantity * (order.process_time_minutes || 60)) / 60).toFixed(1)} h
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Production Parameters & Planning */}
            <div className="border border-slate-900 p-3 bg-slate-50/50">
              <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Planejamento & Rastreabilidade
              </h2>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Data de Início:</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {order.start_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Data Limite de Entrega:</span>
                    <span className="font-bold tabular-nums text-slate-950">
                      {order.target_date}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Centro de Trabalho:</span>
                    <span className="font-medium text-slate-900">
                      {order.work_center_name || 'Linha Geral de Manufatura'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Operador Responsável:</span>
                    <span className="font-medium text-slate-900">
                      {order.operator_name || 'Equipe de Turno'}
                    </span>
                  </div>
                </div>

                {order.order_number && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Pedido de Venda Vinculado:</span>
                    <span className="font-semibold text-slate-900">
                      {order.order_number} · Cliente: {order.customer_name || 'Industrial'}
                    </span>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">Instruções / Observações:</span>
                    <p className="text-[11px] text-slate-700 italic">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bill of Materials (BOM) Table */}
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase text-slate-900 mb-1 flex items-center justify-between">
              <span>Lista de Materiais Requeridos (BOM / Insumos)</span>
              <span className="text-[10px] font-normal text-slate-500">
                Baixa de Estoque:{' '}
                {order.materials_deducted ? (
                  <strong className="text-emerald-700">EFETUADA</strong>
                ) : (
                  <strong className="text-amber-700">PENDENTE DE CONCLUSÃO</strong>
                )}
              </span>
            </h2>

            <div className="border border-slate-900 overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-900">
                    <th className="p-1.5 border-r border-slate-300">Código</th>
                    <th className="p-1.5 border-r border-slate-300">Descrição do Insumo / Matéria-Prima</th>
                    <th className="p-1.5 text-right border-r border-slate-300">Consumo Unit.</th>
                    <th className="p-1.5 text-right border-r border-slate-300">Total Necessário</th>
                    <th className="p-1.5 text-center border-r border-slate-300">Unid.</th>
                    <th className="p-1.5 text-center">Conferência Almox.</th>
                  </tr>
                </thead>
                <tbody>
                  {order.materials && order.materials.length > 0 ? (
                    order.materials.map((mat: any, idx: number) => {
                      const totalNeeded = (Number(mat.quantity || mat.qty_per_unit || 0) * order.quantity).toFixed(2);
                      return (
                        <tr
                          key={idx}
                          className={`border-b border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        >
                          <td className="p-1.5 font-mono border-r border-slate-300">
                            {mat.material_code || mat.code || `MP-${idx + 1}`}
                          </td>
                          <td className="p-1.5 font-medium border-r border-slate-300">
                            {mat.material_name || mat.name}
                          </td>
                          <td className="p-1.5 text-right tabular-nums border-r border-slate-300">
                            {Number(mat.quantity || mat.qty_per_unit).toFixed(2)}
                          </td>
                          <td className="p-1.5 text-right font-bold tabular-nums border-r border-slate-300">
                            {totalNeeded}
                          </td>
                          <td className="p-1.5 text-center border-r border-slate-300">
                            {mat.unit}
                          </td>
                          <td className="p-1.5 text-center">
                            <span className="inline-block w-4 h-4 border border-slate-500 rounded-xs"></span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-500 italic">
                        Nenhum insumo específico cadastrado na ficha técnica.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Process Routing Checklist */}
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase text-slate-900 mb-1">
              Roteiro de Processo & Apontamento Operacional
            </h2>
            <div className="border border-slate-900 overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-900">
                    <th className="p-1.5 w-8 text-center border-r border-slate-300">Etapa</th>
                    <th className="p-1.5 border-r border-slate-300">Operação / Posto de Trabalho</th>
                    <th className="p-1.5 text-right border-r border-slate-300">Tempo Padrão</th>
                    <th className="p-1.5 border-r border-slate-300">Operador</th>
                    <th className="p-1.5 border-r border-slate-300">Data & Hora</th>
                    <th className="p-1.5 text-center w-20">Rubrica / Visto</th>
                  </tr>
                </thead>
                <tbody>
                  {order.stages && order.stages.length > 0 ? (
                    order.stages.map((stage: any, idx: number) => (
                      <tr
                        key={idx}
                        className={`border-b border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      >
                        <td className="p-1.5 text-center font-bold border-r border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="p-1.5 font-semibold text-slate-900 border-r border-slate-300">
                          {stage.stage_name}
                        </td>
                        <td className="p-1.5 text-right tabular-nums border-r border-slate-300">
                          {stage.duration_minutes} min
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400 italic">
                          ________________
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-slate-400 italic">
                          ___/___/___ __:__
                        </td>
                        <td className="p-1.5 text-center text-slate-400">
                          __________
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-500 italic">
                        Roteiro de etapas não especificado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Control & Final Release */}
          <div className="border border-slate-900 p-3 mb-6 bg-slate-50/30">
            <h2 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Controle da Qualidade & Liberação Final do Lote
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] block">Inspeção Dimensional:</span>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-1">
                    <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs"></span>
                    <span>Aprovado</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs"></span>
                    <span>Reprovado</span>
                  </label>
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Acabamento & Vedação:</span>
                <div className="flex items-center gap-3 mt-1">
                  <label className="flex items-center gap-1">
                    <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs"></span>
                    <span>Conforme</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="inline-block w-3.5 h-3.5 border border-slate-500 rounded-xs"></span>
                    <span>Ressalva</span>
                  </label>
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Data de Liberação:</span>
                <span className="tabular-nums font-semibold mt-1 block">
                  {order.completion_date || 'Aguardando encerramento'}
                </span>
              </div>
            </div>
          </div>

          {/* Formal Technical Responsible Validation Block */}
          <div className="border-t-2 border-slate-900 pt-4 mt-6">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 min-h-[40px] flex items-end justify-center">
                  <span className="text-slate-400 text-[10px] italic">
                    Assinatura do Encarregado / Líder de Produção
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 block">
                  {order.operator_name || 'Encarregado Geral de Produção'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Execução e Apontamento Fabril
                </span>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 min-h-[40px] flex items-end justify-center">
                  <span className="text-slate-900 font-serif italic text-xs font-bold">
                    {company.technical_responsible_name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-950 block">
                  {company.technical_responsible_name}
                </span>
                <span className="text-[10px] text-slate-600 block">
                  {company.technical_responsible_title}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
              <span>
                Documento emitido eletronicamente via Sistema PCP Manufatura ERP · {company.company_name}
              </span>
              <span className="tabular-nums">
                Rastreabilidade: {order.batch_number} · Hash: {order.code}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
