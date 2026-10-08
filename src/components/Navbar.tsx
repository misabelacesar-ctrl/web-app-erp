import React from 'react';
import {
  Factory,
  ClipboardList,
  Layers,
  Package,
  CalendarClock,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Plus,
} from 'lucide-react';
import { CompanySettings } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: CompanySettings | null;
  onOpenNewOP: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenNewOP,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel PCP', icon: Factory },
    { id: 'production', label: 'Ordens de Produção', icon: ClipboardList },
    { id: 'products', label: 'Fichas Técnicas', icon: Layers },
    { id: 'materials', label: 'Matérias-Primas', icon: Package },
    { id: 'capacities', label: 'Capacidade', icon: CalendarClock },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'partners', label: 'Parceiros', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <a
                href="#dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('dashboard');
                }}
                className="text-base font-bold tracking-tight text-white hover:text-amber-400 transition-colors block"
              >
                PCP Manufatura
              </a>
              <span className="text-[11px] text-slate-400 block -mt-1 truncate max-w-[200px]">
                {settings?.company_name || 'ERP & Gestão Industrial'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Technical Responsible Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[170px]">
                {settings?.technical_responsible_name || 'Responsável Técnico'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                {settings?.technical_responsible_title || 'Engenharia de Produção'}
              </span>
            </div>

            <button
              onClick={onOpenNewOP}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors shadow whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nova OP</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary nav scrollbar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
