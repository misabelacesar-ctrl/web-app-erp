import {
  CompanySettings,
  WorkCenter,
  Supplier,
  Material,
  Customer,
  Product,
  CustomerOrder,
  ProductionOrder,
  DashboardData,
  ProductionLog,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Erro HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Settings
  getSettings: () => fetch(`${API_BASE}/settings`).then((r) => handleResponse<CompanySettings>(r)),
  updateSettings: (data: Partial<CompanySettings>) =>
    fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<CompanySettings>(r)),
  resetDemoData: () =>
    fetch(`${API_BASE}/settings/reset-demo`, {
      method: 'POST',
    }).then((r) => handleResponse<{ success: boolean; message: string }>(r)),

  // Work Centers / Capacities
  getWorkCenters: () => fetch(`${API_BASE}/work-centers`).then((r) => handleResponse<WorkCenter[]>(r)),
  createWorkCenter: (data: Partial<WorkCenter>) =>
    fetch(`${API_BASE}/work-centers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<WorkCenter>(r)),
  updateWorkCenter: (id: number, data: Partial<WorkCenter>) =>
    fetch(`${API_BASE}/work-centers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<WorkCenter>(r)),
  deleteWorkCenter: (id: number) =>
    fetch(`${API_BASE}/work-centers/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Materials
  getMaterials: () => fetch(`${API_BASE}/materials`).then((r) => handleResponse<Material[]>(r)),
  createMaterial: (data: Partial<Material>) =>
    fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Material>(r)),
  updateMaterial: (id: number, data: Partial<Material>) =>
    fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Material>(r)),
  deleteMaterial: (id: number) =>
    fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Suppliers
  getSuppliers: () => fetch(`${API_BASE}/suppliers`).then((r) => handleResponse<Supplier[]>(r)),
  createSupplier: (data: Partial<Supplier>) =>
    fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Supplier>(r)),
  updateSupplier: (id: number, data: Partial<Supplier>) =>
    fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Supplier>(r)),
  deleteSupplier: (id: number) =>
    fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Customers
  getCustomers: () => fetch(`${API_BASE}/customers`).then((r) => handleResponse<Customer[]>(r)),
  createCustomer: (data: Partial<Customer>) =>
    fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Customer>(r)),
  updateCustomer: (id: number, data: Partial<Customer>) =>
    fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Customer>(r)),
  deleteCustomer: (id: number) =>
    fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Products
  getProducts: () => fetch(`${API_BASE}/products`).then((r) => handleResponse<Product[]>(r)),
  getProduct: (id: number) => fetch(`${API_BASE}/products/${id}`).then((r) => handleResponse<Product>(r)),
  createProduct: (data: any) =>
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Product>(r)),
  updateProduct: (id: number, data: any) =>
    fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Product>(r)),
  deleteProduct: (id: number) =>
    fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Orders
  getOrders: () => fetch(`${API_BASE}/orders`).then((r) => handleResponse<CustomerOrder[]>(r)),
  createOrder: (data: Partial<CustomerOrder>) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<CustomerOrder>(r)),
  updateOrder: (id: number, data: Partial<CustomerOrder>) =>
    fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<CustomerOrder>(r)),
  deleteOrder: (id: number) =>
    fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Production Orders (OP)
  getProductionOrders: () => fetch(`${API_BASE}/production-orders`).then((r) => handleResponse<ProductionOrder[]>(r)),
  getProductionOrder: (id: number) => fetch(`${API_BASE}/production-orders/${id}`).then((r) => handleResponse<ProductionOrder>(r)),
  createProductionOrder: (data: any) =>
    fetch(`${API_BASE}/production-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ProductionOrder>(r)),
  updatePOStatus: (id: number, data: { status: string; progress_percent?: number; operator_name?: string }) =>
    fetch(`${API_BASE}/production-orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ProductionOrder>(r)),
  concludeAndDeductPO: (id: number) =>
    fetch(`${API_BASE}/production-orders/${id}/baixa`, {
      method: 'POST',
    }).then((r) => handleResponse<{ success: boolean; message: string; production_order: ProductionOrder }>(r)),
  addProductionLog: (id: number, data: Partial<ProductionLog> & { update_op_progress?: number }) =>
    fetch(`${API_BASE}/production-orders/${id}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ProductionLog[]>(r)),
  deleteProductionOrder: (id: number) =>
    fetch(`${API_BASE}/production-orders/${id}`, { method: 'DELETE' }).then((r) => handleResponse<{ success: boolean }>(r)),

  // Dashboard & Reports
  getDashboardData: () => fetch(`${API_BASE}/reports/dashboard`).then((r) => handleResponse<DashboardData>(r)),
};
