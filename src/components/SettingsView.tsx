import React, { useState } from 'react';
import {
  Settings,
  User,
  Building2,
  Save,
  RotateCcw,
  CheckCircle,
  FileCode,
  Shield,
  Factory,
} from 'lucide-react';
import { CompanySettings } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  settings: CompanySettings | null;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onRefresh,
}) => {
  const [companyName, setCompanyName] = useState(settings?.company_name || '');
  const [cnpj, setCnpj] = useState(settings?.cnpj || '');
  const [techName, setTechName] = useState(settings?.technical_responsible_name || '');
  const [techTitle, setTechTitle] = useState(settings?.technical_responsible_title || '');
  const [email, setEmail] = useState(settings?.contact_email || '');
  const [phone, setPhone] = useState(settings?.contact_phone || '');
  const [address, setAddress] = useState(settings?.address || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Sync if settings load later
  React.useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name);
      setCnpj(settings.cnpj);
      setTechName(settings.technical_responsible_name);
      setTechTitle(settings.technical_responsible_title);
      setEmail(settings.contact_email);
      setPhone(settings.contact_phone);
      setAddress(settings.address);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings({
        company_name: companyName,
        cnpj,
        technical_responsible_name: techName,
        technical_responsible_title: techTitle,
        contact_email: email,
        contact_phone: phone,
        address,
      });

      onRefresh();
      setMessage('Configurações e dados do Responsável Técnico atualizados com sucesso!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemo = async () => {
    const confirm = window.confirm(
      'Deseja restaurar os dados de demonstração iniciais?\n\nIsso irá repovoar a base de dados com as fichas técnicas industriais, pedidos, matérias-primas e ordens de produção modelo.'
    );
    if (!confirm) return;

    try {
      const res = await api.resetDemoData();
      onRefresh();
      setMessage(res.message);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-700 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            <span>Parâmetros do Sistema</span>
            <span aria-hidden="true">·</span>
            <span>Chancela Técnica & Fábrica</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Configurações & Responsável Técnico
          </h1>
        </div>

        <button
          type="button"
          onClick={handleResetDemo}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Dados de Demonstração</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6 text-xs">
            {/* Bloco 1: Responsável Técnico */}
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-700" />
                <span>Responsável Técnico (Exibido nas Ordens e Documentos)</span>
              </h2>
              <p className="text-slate-500 text-[11px] mb-4">
                Nome e habilitação profissional do engenheiro ou técnico que assina formalmente as Ordens de Produção (OPs) e laudos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome Completo do Responsável Técnico: *
                  </label>
                  <input
                    type="text"
                    required
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    placeholder="Ex: Eng. Carlos Eduardo Ribeiro"
                    className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cargo / Registro Profissional (CREA / CRQ / CFT): *
                  </label>
                  <input
                    type="text"
                    required
                    value={techTitle}
                    onChange={(e) => setTechTitle(e.target.value)}
                    placeholder="Ex: Resp. Técnico de Manufatura - CREA-SP 506.789/D"
                    className="w-full p-2 border border-slate-300 rounded text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Dados da Empresa / Manufatura */}
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Dados Cadastrais da Empresa / Manufatura</span>
              </h2>
              <p className="text-slate-500 text-[11px] mb-4">
                Informações impressas nos cabeçalhos das Ordens de Produção e relatórios de auditoria.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Razão Social / Nome da Empresa: *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CNPJ: *</label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full p-2 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">E-mail Comercial / PCP:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Telefone da Fábrica:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Endereço da Unidade Fabril:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Distrito Industrial, Cidade - UF"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): Visual Profile & Local Setup Guide */}
        <div className="space-y-6">
          {/* Card: Perfil do Responsável Técnico */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Chancela Técnica Ativa
            </h3>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-100 shrink-0">
                <img
                  src="/src/assets/images/technical_manager_avatar_1791488389874.jpg"
                  alt="Responsável Técnico"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  {techName || 'Responsável Técnico'}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {techTitle || 'Engenharia de Produção'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Registro Ativo em Documentos
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2.5">
              Este nome é inserido automaticamente em todas as Ordens de Produção impressas e relatórios técnicos do sistema, garantindo conformidade e rastreabilidade fabril.
            </p>
          </div>

          {/* Card: Instruções de Setup Local & Arquitetura */}
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <FileCode className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Instruções de Setup & Arquitetura
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Aplicação Full-Stack de PCP / ERP com persistência em banco relacional SQLite nativo.
            </p>

            <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-slate-300 space-y-1">
              <p className="text-amber-400 font-bold"># Execução Local:</p>
              <p>1. npm install</p>
              <p>2. npm run dev</p>
              <p className="text-slate-500"># Servidor roda em http://localhost:3000</p>
              <p className="text-slate-500"># Banco de dados: production_erp.db</p>
            </div>

            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Frontend:</strong> React 19 + TypeScript + Tailwind CSS</li>
              <li><strong>Backend:</strong> Node.js + Express + node:sqlite relacional</li>
              <li><strong>Persistência:</strong> Arquivo SQLite local com chaves estrangeiras e integridade referencial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
