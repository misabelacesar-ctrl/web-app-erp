import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProductionOrdersView } from './components/ProductionOrdersView';
import { ProductsView } from './components/ProductsView';
import { MaterialsView } from './components/MaterialsView';
import { CapacitiesView } from './components/CapacitiesView';
import { OrdersView } from './components/OrdersView';
import { PartnersView } from './components/PartnersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PrintWorkOrderModal } from './components/PrintWorkOrderModal';
import { api } from './services/api';
import {
  CompanySettings,
  DashboardData,
  Product,
  Material,
  Customer,
  Supplier,
  WorkCenter,
  CustomerOrder,
  ProductionOrder,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Core state
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

  // Modals
  const [isCreateOPModalOpen, setIsCreateOPModalOpen] = useState(false);
  const [printingOP, setPrintingOP] = useState<ProductionOrder | null>(null);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      const [
        sRes,
        dRes,
        pRes,
        mRes,
        cRes,
        supRes,
        wRes,
        oRes,
        poRes,
      ] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getDashboardData().catch(() => null),
        api.getProducts().catch(() => []),
        api.getMaterials().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getWorkCenters().catch(() => []),
        api.getOrders().catch(() => []),
        api.getProductionOrders().catch(() => []),
      ]);

      if (sRes) setSettings(sRes);
      if (dRes) setDashboardData(dRes);
      setProducts(pRes);
      setMaterials(mRes);
      setCustomers(cRes);
      setSuppliers(supRes);
      setWorkCenters(wRes);
      setCustomerOrders(oRes);
      setProductionOrders(poRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle printing OP with full details loaded from API
  const handlePrintOP = async (order: ProductionOrder) => {
    try {
      const fullOP = await api.getProductionOrder(order.id);
      setPrintingOP(fullOP);
    } catch (err) {
      // Fallback to existing order object
      setPrintingOP(order);
    }
  };

  const handlePrintOPById = async (opId: number) => {
    try {
      const fullOP = await api.getProductionOrder(opId);
      setPrintingOP(fullOP);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateOPFromOrder = (order: CustomerOrder) => {
    setActiveTab('production');
    setIsCreateOPModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenNewOP={() => {
          setActiveTab('production');
          setIsCreateOPModalOpen(true);
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full mb-3" />
            <p className="text-sm font-medium">Iniciando sistema de PCP e ERP Industrial...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                data={dashboardData}
                settings={settings}
                onNavigate={setActiveTab}
                onSelectOPForPrint={handlePrintOPById}
                onOpenNewOP={() => {
                  setActiveTab('production');
                  setIsCreateOPModalOpen(true);
                }}
              />
            )}

            {activeTab === 'production' && (
              <ProductionOrdersView
                orders={productionOrders}
                products={products}
                customerOrders={customerOrders}
                settings={settings}
                onRefresh={loadAllData}
                onPrintOP={handlePrintOP}
                isCreateModalOpen={isCreateOPModalOpen}
                setIsCreateModalOpen={setIsCreateOPModalOpen}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                materials={materials}
                workCenters={workCenters}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'materials' && (
              <MaterialsView
                materials={materials}
                suppliers={suppliers}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'capacities' && (
              <CapacitiesView
                workCenters={workCenters}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersView
                orders={customerOrders}
                customers={customers}
                products={products}
                onRefresh={loadAllData}
                onGenerateOPFromOrder={handleGenerateOPFromOrder}
              />
            )}

            {activeTab === 'partners' && (
              <PartnersView
                customers={customers}
                suppliers={suppliers}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                orders={productionOrders}
                materials={materials}
                workCenters={workCenters}
                settings={settings}
                onPrintOP={handlePrintOP}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Official Printable Work Order Sheet Modal */}
      {printingOP && (
        <PrintWorkOrderModal
          order={printingOP}
          settings={settings}
          onClose={() => setPrintingOP(null)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings?.company_name || 'Manufatura Industrial'} · Sistema de Planejamento e Controle de Produção (PCP)
          </span>
          <span className="text-[11px] text-slate-400">
            Responsável Técnico:{' '}
            <strong className="text-slate-600">
              {settings?.technical_responsible_name || 'Eng. de Produção'}
            </strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
