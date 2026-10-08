export interface CompanySettings {
  id: number;
  company_name: string;
  cnpj: string;
  technical_responsible_name: string;
  technical_responsible_title: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export interface WorkCenter {
  id: number;
  name: string;
  daily_capacity_hours: number;
  shifts_per_day: number;
  operators_count: number;
  efficiency_rate: number;
  notes?: string;
  products_count?: number;
  active_ops_count?: number;
  committed_hours?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  cnpj: string;
  city: string;
  supplied_products: string;
  materials_count?: number;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  min_stock: number;
  supplier_id?: number | null;
  supplier_name?: string;
}

export interface Customer {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  cnpj: string;
  address: string;
  orders_count?: number;
}

export interface ProductMaterial {
  id?: number;
  product_id?: number;
  material_id: number;
  quantity: number;
  material_name?: string;
  material_code?: string;
  unit?: string;
  unit_cost?: number;
  current_stock?: number;
}

export interface ProductStage {
  id?: number;
  product_id?: number;
  stage_name: string;
  duration_minutes: number;
  order_num?: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  specs: string;
  process_time_minutes: number;
  sale_price: number;
  work_center_id?: number | null;
  work_center_name?: string;
  stock_quantity: number;
  materials?: ProductMaterial[];
  stages?: ProductStage[];
  raw_material_cost?: number;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  product_id: number;
  product_name?: string;
  product_code?: string;
  quantity: number;
  order_date: string;
  delivery_date: string;
  unit_price: number;
  total_price: number;
  status: 'Pendente' | 'Em Produção' | 'Concluído' | 'Entregue' | 'Cancelado';
  notes?: string;
  linked_po_id?: number | null;
  linked_po_code?: string | null;
  linked_po_status?: string | null;
}

export interface ProductionOrder {
  id: number;
  code: string;
  order_id?: number | null;
  order_number?: string;
  customer_name?: string;
  product_id: number;
  product_name: string;
  product_code: string;
  product_specs?: string;
  product_description?: string;
  process_time_minutes?: number;
  work_center_id?: number | null;
  work_center_name?: string;
  quantity: number;
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  start_date: string;
  target_date: string;
  completion_date?: string | null;
  status: 'Planejada' | 'Aguardando Insumos' | 'Em Andamento' | 'Controle de Qualidade' | 'Concluída' | 'Cancelada';
  progress_percent: number;
  batch_number: string;
  technical_responsible: string;
  operator_name?: string;
  notes?: string;
  materials_deducted: number;
  required_materials?: Array<{
    qty_per_unit: number;
    total_required: number;
    material_id: number;
    material_name: string;
    material_code: string;
    unit: string;
    current_stock: number;
  }>;
  has_missing_materials?: boolean;
  total_estimated_hours?: string;
  materials?: Array<any>;
  stages?: ProductStage[];
  logs?: ProductionLog[];
  company_settings?: CompanySettings;
}

export interface ProductionLog {
  id: number;
  production_order_id: number;
  stage_name: string;
  operator: string;
  units_completed: number;
  log_date: string;
  notes?: string;
}

export interface DashboardData {
  summary: {
    total_ops: number;
    completed_ops: number;
    active_ops: number;
    total_materials: number;
    total_products: number;
    total_orders: number;
    low_stock_count: number;
  };
  op_status_counts: Array<{ status: string; count: number }>;
  work_centers_capacity: WorkCenter[];
  low_stock_materials: Material[];
  pending_orders: CustomerOrder[];
}
