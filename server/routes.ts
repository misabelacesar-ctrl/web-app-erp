import { Router, Request, Response } from 'express';
import { db, seedDatabase } from './db.js';

export const apiRouter = Router();

// ==========================================
// CONFIGURAÇÕES & RESPONSÁVEL TÉCNICO
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const {
      company_name,
      cnpj,
      technical_responsible_name,
      technical_responsible_title,
      contact_email,
      contact_phone,
      address,
    } = req.body;

    db.prepare(`
      UPDATE settings
      SET company_name = ?, cnpj = ?, technical_responsible_name = ?,
          technical_responsible_title = ?, contact_email = ?, contact_phone = ?, address = ?
      WHERE id = 1
    `).run(
      company_name,
      cnpj,
      technical_responsible_name,
      technical_responsible_title,
      contact_email,
      contact_phone,
      address
    );

    const updated = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/settings/reset-demo', (req: Request, res: Response) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Dados de demonstração restaurados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// CAPACIDADE PRODUTIVA / CENTROS DE TRABALHO
// ==========================================
apiRouter.get('/work-centers', (req: Request, res: Response) => {
  try {
    const centers = db.prepare(`
      SELECT wc.*,
        (SELECT COUNT(*) FROM products p WHERE p.work_center_id = wc.id) as products_count,
        (SELECT COUNT(*) FROM production_orders po WHERE po.work_center_id = wc.id AND po.status IN ('Planejada', 'Em Andamento', 'Controle de Qualidade')) as active_ops_count
      FROM work_centers wc
      ORDER BY wc.name ASC
    `).all();
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/work-centers', (req: Request, res: Response) => {
  try {
    const { name, daily_capacity_hours, shifts_per_day, operators_count, efficiency_rate, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO work_centers (name, daily_capacity_hours, shifts_per_day, operators_count, efficiency_rate, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      name,
      Number(daily_capacity_hours) || 8,
      Number(shifts_per_day) || 1,
      Number(operators_count) || 1,
      Number(efficiency_rate) || 90,
      notes || ''
    );
    const created = db.prepare('SELECT * FROM work_centers WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/work-centers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, daily_capacity_hours, shifts_per_day, operators_count, efficiency_rate, notes } = req.body;
    db.prepare(`
      UPDATE work_centers
      SET name = ?, daily_capacity_hours = ?, shifts_per_day = ?, operators_count = ?, efficiency_rate = ?, notes = ?
      WHERE id = ?
    `).run(
      name,
      Number(daily_capacity_hours),
      Number(shifts_per_day),
      Number(operators_count),
      Number(efficiency_rate),
      notes || '',
      id
    );
    const updated = db.prepare('SELECT * FROM work_centers WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/work-centers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM work_centers WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// MATÉRIA-PRIMA / INSUMOS
// ==========================================
apiRouter.get('/materials', (req: Request, res: Response) => {
  try {
    const materials = db.prepare(`
      SELECT m.*, s.name as supplier_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      ORDER BY m.name ASC
    `).all();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/materials', (req: Request, res: Response) => {
  try {
    const { code, name, description, unit, unit_cost, current_stock, min_stock, supplier_id } = req.body;
    const stmt = db.prepare(`
      INSERT INTO materials (code, name, description, unit, unit_cost, current_stock, min_stock, supplier_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      code,
      name,
      description || '',
      unit || 'kg',
      Number(unit_cost) || 0,
      Number(current_stock) || 0,
      Number(min_stock) || 0,
      supplier_id ? Number(supplier_id) : null
    );
    const created = db.prepare('SELECT * FROM materials WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/materials/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, description, unit, unit_cost, current_stock, min_stock, supplier_id } = req.body;
    db.prepare(`
      UPDATE materials
      SET code = ?, name = ?, description = ?, unit = ?, unit_cost = ?, current_stock = ?, min_stock = ?, supplier_id = ?
      WHERE id = ?
    `).run(
      code,
      name,
      description || '',
      unit,
      Number(unit_cost) || 0,
      Number(current_stock) || 0,
      Number(min_stock) || 0,
      supplier_id ? Number(supplier_id) : null,
      id
    );
    const updated = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/materials/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM materials WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// FORNECEDORES
// ==========================================
apiRouter.get('/suppliers', (req: Request, res: Response) => {
  try {
    const suppliers = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM materials m WHERE m.supplier_id = s.id) as materials_count
      FROM suppliers s
      ORDER BY s.name ASC
    `).all();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/suppliers', (req: Request, res: Response) => {
  try {
    const { name, contact_name, phone, email, cnpj, city, supplied_products } = req.body;
    const stmt = db.prepare(`
      INSERT INTO suppliers (name, contact_name, phone, email, cnpj, city, supplied_products)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, contact_name || '', phone || '', email || '', cnpj || '', city || '', supplied_products || '');
    const created = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/suppliers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact_name, phone, email, cnpj, city, supplied_products } = req.body;
    db.prepare(`
      UPDATE suppliers
      SET name = ?, contact_name = ?, phone = ?, email = ?, cnpj = ?, city = ?, supplied_products = ?
      WHERE id = ?
    `).run(name, contact_name || '', phone || '', email || '', cnpj || '', city || '', supplied_products || '', id);
    const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/suppliers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// CLIENTES
// ==========================================
apiRouter.get('/customers', (req: Request, res: Response) => {
  try {
    const customers = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as orders_count
      FROM customers c
      ORDER BY c.name ASC
    `).all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  try {
    const { name, contact_name, phone, email, cnpj, address } = req.body;
    const stmt = db.prepare(`
      INSERT INTO customers (name, contact_name, phone, email, cnpj, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, contact_name || '', phone || '', email || '', cnpj || '', address || '');
    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/customers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact_name, phone, email, cnpj, address } = req.body;
    db.prepare(`
      UPDATE customers
      SET name = ?, contact_name = ?, phone = ?, email = ?, cnpj = ?, address = ?
      WHERE id = ?
    `).run(name, contact_name || '', phone || '', email || '', cnpj || '', address || '', id);
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/customers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// PRODUTOS & FICHA TÉCNICA (BOM & PROCESSO)
// ==========================================
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const products = db.prepare(`
      SELECT p.*, wc.name as work_center_name
      FROM products p
      LEFT JOIN work_centers wc ON wc.id = p.work_center_id
      ORDER BY p.name ASC
    `).all() as any[];

    // Attach BOM materials & stages to each product
    const fullProducts = products.map((prod) => {
      const materials = db.prepare(`
        SELECT pm.*, m.name as material_name, m.code as material_code, m.unit, m.unit_cost, m.current_stock
        FROM product_materials pm
        JOIN materials m ON m.id = pm.material_id
        WHERE pm.product_id = ?
      `).all(prod.id);

      const stages = db.prepare(`
        SELECT * FROM product_stages
        WHERE product_id = ?
        ORDER BY order_num ASC
      `).all(prod.id);

      // Calculate estimated material cost
      const rawMaterialCost = materials.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unit_cost || 0));
      }, 0);

      return {
        ...prod,
        materials,
        stages,
        raw_material_cost: rawMaterialCost,
      };
    });

    res.json(fullProducts);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = db.prepare(`
      SELECT p.*, wc.name as work_center_name
      FROM products p
      LEFT JOIN work_centers wc ON wc.id = p.work_center_id
      WHERE p.id = ?
    `).get(id) as any;

    if (!prod) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const materials = db.prepare(`
      SELECT pm.*, m.name as material_name, m.code as material_code, m.unit, m.unit_cost, m.current_stock
      FROM product_materials pm
      JOIN materials m ON m.id = pm.material_id
      WHERE pm.product_id = ?
    `).all(id);

    const stages = db.prepare(`
      SELECT * FROM product_stages
      WHERE product_id = ?
      ORDER BY order_num ASC
    `).all(id);

    const rawMaterialCost = materials.reduce((acc: number, item: any) => {
      return acc + (Number(item.quantity) * Number(item.unit_cost || 0));
    }, 0);

    res.json({
      ...prod,
      materials,
      stages,
      raw_material_cost: rawMaterialCost,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      specs,
      process_time_minutes,
      sale_price,
      work_center_id,
      stock_quantity,
      materials = [],
      stages = [],
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO products (code, name, description, specs, process_time_minutes, sale_price, work_center_id, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      code,
      name,
      description || '',
      specs || '',
      Number(process_time_minutes) || 60,
      Number(sale_price) || 0,
      work_center_id ? Number(work_center_id) : null,
      Number(stock_quantity) || 0
    );

    const productId = info.lastInsertRowid;

    // Insert materials
    const insertMat = db.prepare('INSERT INTO product_materials (product_id, material_id, quantity) VALUES (?, ?, ?)');
    for (const m of materials) {
      if (m.material_id && m.quantity > 0) {
        insertMat.run(productId, Number(m.material_id), Number(m.quantity));
      }
    }

    // Insert stages
    const insertStage = db.prepare('INSERT INTO product_stages (product_id, stage_name, duration_minutes, order_num) VALUES (?, ?, ?, ?)');
    let stageOrder = 1;
    for (const s of stages) {
      if (s.stage_name) {
        insertStage.run(productId, s.stage_name, Number(s.duration_minutes) || 15, stageOrder++);
      }
    }

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      specs,
      process_time_minutes,
      sale_price,
      work_center_id,
      stock_quantity,
      materials = [],
      stages = [],
    } = req.body;

    db.prepare(`
      UPDATE products
      SET code = ?, name = ?, description = ?, specs = ?, process_time_minutes = ?, sale_price = ?, work_center_id = ?, stock_quantity = ?
      WHERE id = ?
    `).run(
      code,
      name,
      description || '',
      specs || '',
      Number(process_time_minutes) || 60,
      Number(sale_price) || 0,
      work_center_id ? Number(work_center_id) : null,
      Number(stock_quantity) || 0,
      id
    );

    // Update materials: delete old, insert new
    db.prepare('DELETE FROM product_materials WHERE product_id = ?').run(id);
    const insertMat = db.prepare('INSERT INTO product_materials (product_id, material_id, quantity) VALUES (?, ?, ?)');
    for (const m of materials) {
      if (m.material_id && m.quantity > 0) {
        insertMat.run(id, Number(m.material_id), Number(m.quantity));
      }
    }

    // Update stages
    db.prepare('DELETE FROM product_stages WHERE product_id = ?').run(id);
    const insertStage = db.prepare('INSERT INTO product_stages (product_id, stage_name, duration_minutes, order_num) VALUES (?, ?, ?, ?)');
    let stageOrder = 1;
    for (const s of stages) {
      if (s.stage_name) {
        insertStage.run(id, s.stage_name, Number(s.duration_minutes) || 15, stageOrder++);
      }
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// PEDIDOS DE CLIENTES (ORDERS)
// ==========================================
apiRouter.get('/orders', (req: Request, res: Response) => {
  try {
    const orders = db.prepare(`
      SELECT o.*,
             c.name as customer_name,
             p.name as product_name,
             p.code as product_code,
             (SELECT po.id FROM production_orders po WHERE po.order_id = o.id LIMIT 1) as linked_po_id,
             (SELECT po.code FROM production_orders po WHERE po.order_id = o.id LIMIT 1) as linked_po_code,
             (SELECT po.status FROM production_orders po WHERE po.order_id = o.id LIMIT 1) as linked_po_status
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN products p ON p.id = o.product_id
      ORDER BY o.delivery_date ASC
    `).all();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      order_number,
      customer_id,
      product_id,
      quantity,
      order_date,
      delivery_date,
      unit_price,
      notes,
    } = req.body;

    const qty = Number(quantity) || 1;
    const price = Number(unit_price) || 0;
    const total = qty * price;

    // Generate order number if not provided
    let num = order_number;
    if (!num) {
      const count = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
      num = `PED-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    const stmt = db.prepare(`
      INSERT INTO orders (order_number, customer_id, product_id, quantity, order_date, delivery_date, unit_price, total_price, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendente', ?)
    `);

    const info = stmt.run(
      num,
      Number(customer_id),
      Number(product_id),
      qty,
      order_date || new Date().toISOString().slice(0, 10),
      delivery_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      price,
      total,
      notes || ''
    );

    const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.put('/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      order_number,
      customer_id,
      product_id,
      quantity,
      order_date,
      delivery_date,
      unit_price,
      status,
      notes,
    } = req.body;

    const qty = Number(quantity) || 1;
    const price = Number(unit_price) || 0;
    const total = qty * price;

    db.prepare(`
      UPDATE orders
      SET order_number = ?, customer_id = ?, product_id = ?, quantity = ?,
          order_date = ?, delivery_date = ?, unit_price = ?, total_price = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(
      order_number,
      Number(customer_id),
      Number(product_id),
      qty,
      order_date,
      delivery_date,
      price,
      total,
      status,
      notes || '',
      id
    );

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// ORDENS DE PRODUÇÃO (OP) - PCP CORE
// ==========================================
apiRouter.get('/production-orders', (req: Request, res: Response) => {
  try {
    const ops = db.prepare(`
      SELECT po.*,
             p.name as product_name,
             p.code as product_code,
             p.process_time_minutes,
             wc.name as work_center_name,
             o.order_number,
             c.name as customer_name
      FROM production_orders po
      JOIN products p ON p.id = po.product_id
      LEFT JOIN work_centers wc ON wc.id = po.work_center_id
      LEFT JOIN orders o ON o.id = po.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY
        CASE po.status
          WHEN 'Em Andamento' THEN 1
          WHEN 'Controle de Qualidade' THEN 2
          WHEN 'Aguardando Insumos' THEN 3
          WHEN 'Planejada' THEN 4
          WHEN 'Concluída' THEN 5
          WHEN 'Cancelada' THEN 6
          ELSE 7
        END,
        po.target_date ASC
    `).all() as any[];

    // Calculate BOM materials status for each OP
    const enriched = ops.map((op) => {
      const requiredMaterials = db.prepare(`
        SELECT pm.quantity as qty_per_unit,
               (pm.quantity * ?) as total_required,
               m.id as material_id,
               m.name as material_name,
               m.code as material_code,
               m.unit,
               m.current_stock
        FROM product_materials pm
        JOIN materials m ON m.id = pm.material_id
        WHERE pm.product_id = ?
      `).all(op.quantity, op.product_id) as any[];

      const hasMissingMaterials = requiredMaterials.some((rm) => rm.current_stock < rm.total_required);

      return {
        ...op,
        required_materials: requiredMaterials,
        has_missing_materials: hasMissingMaterials,
        total_estimated_hours: ((op.quantity * (op.process_time_minutes || 60)) / 60).toFixed(1),
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.get('/production-orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const op = db.prepare(`
      SELECT po.*,
             p.name as product_name,
             p.code as product_code,
             p.specs as product_specs,
             p.description as product_description,
             p.process_time_minutes,
             wc.name as work_center_name,
             o.order_number,
             o.delivery_date as order_delivery_date,
             c.name as customer_name,
             c.contact_name as customer_contact
      FROM production_orders po
      JOIN products p ON p.id = po.product_id
      LEFT JOIN work_centers wc ON wc.id = po.work_center_id
      LEFT JOIN orders o ON o.id = po.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE po.id = ?
    `).get(id) as any;

    if (!op) {
      return res.status(404).json({ error: 'Ordem de produção não encontrada' });
    }

    const materials = db.prepare(`
      SELECT pm.quantity as qty_per_unit,
             (pm.quantity * ?) as total_required,
             m.id as material_id,
             m.name as material_name,
             m.code as material_code,
             m.unit,
             m.current_stock,
             m.unit_cost
      FROM product_materials pm
      JOIN materials m ON m.id = pm.material_id
      WHERE pm.product_id = ?
    `).all(op.quantity, op.product_id) as any[];

    const stages = db.prepare(`
      SELECT * FROM product_stages
      WHERE product_id = ?
      ORDER BY order_num ASC
    `).all(op.product_id);

    const logs = db.prepare(`
      SELECT * FROM production_logs
      WHERE production_order_id = ?
      ORDER BY id DESC
    `).all(id);

    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();

    res.json({
      ...op,
      materials,
      stages,
      logs,
      company_settings: settings,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Criar OP (avulsa ou baseada em pedido)
apiRouter.post('/production-orders', (req: Request, res: Response) => {
  try {
    const {
      code,
      order_id,
      product_id,
      quantity,
      priority = 'Normal',
      start_date,
      target_date,
      operator_name,
      notes,
    } = req.body;

    const qty = Number(quantity) || 1;
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any;

    // Find product work center
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id) as any;
    if (!product) {
      return res.status(400).json({ error: 'Produto inválido' });
    }

    // Auto code
    let opCode = code;
    if (!opCode) {
      const count = (db.prepare('SELECT COUNT(*) as count FROM production_orders').get() as any).count;
      opCode = `OP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    // Batch number
    const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
    const batchNumber = `LOTE-${product.code || 'PRD'}-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

    const stmt = db.prepare(`
      INSERT INTO production_orders (
        code, order_id, product_id, quantity, priority, start_date, target_date,
        status, progress_percent, batch_number, technical_responsible, operator_name,
        work_center_id, notes, materials_deducted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Planejada', 0, ?, ?, ?, ?, ?, 0)
    `);

    const info = stmt.run(
      opCode,
      order_id ? Number(order_id) : null,
      Number(product_id),
      qty,
      priority,
      start_date || new Date().toISOString().slice(0, 10),
      target_date || new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      batchNumber,
      settings?.technical_responsible_name || 'Engenharia de Produção',
      operator_name || 'A definir',
      product.work_center_id,
      notes || ''
    );

    // If linked to an order, update order status to 'Em Produção'
    if (order_id) {
      db.prepare("UPDATE orders SET status = 'Em Produção' WHERE id = ?").run(order_id);
    }

    const created = db.prepare('SELECT * FROM production_orders WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Atualizar status e progresso da OP
apiRouter.put('/production-orders/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress_percent, operator_name } = req.body;

    const current = db.prepare('SELECT * FROM production_orders WHERE id = ?').get(id) as any;
    if (!current) {
      return res.status(404).json({ error: 'OP não encontrada' });
    }

    let completionDate = current.completion_date;
    if (status === 'Concluída' && !completionDate) {
      completionDate = new Date().toISOString().slice(0, 10);
    } else if (status !== 'Concluída') {
      completionDate = null;
    }

    db.prepare(`
      UPDATE production_orders
      SET status = ?, progress_percent = ?, operator_name = COALESCE(?, operator_name), completion_date = ?
      WHERE id = ?
    `).run(
      status,
      Number(progress_percent ?? current.progress_percent),
      operator_name,
      completionDate,
      id
    );

    const updated = db.prepare('SELECT * FROM production_orders WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// BAIXA / CONCLUSÃO DE ORDEM DE PRODUÇÃO (Movimentação de Estoque)
apiRouter.post('/production-orders/:id/baixa', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const op = db.prepare('SELECT * FROM production_orders WHERE id = ?').get(id) as any;
    if (!op) {
      return res.status(404).json({ error: 'OP não encontrada' });
    }

    if (op.status === 'Concluída' && op.materials_deducted === 1) {
      return res.status(400).json({ error: 'Esta ordem de produção já foi baixada e concluída anteriormente.' });
    }

    // Deduct materials from BOM if not yet deducted
    if (op.materials_deducted === 0) {
      const bomItems = db.prepare(`
        SELECT pm.quantity as qty_per_unit, m.id as material_id, m.name as material_name, m.current_stock
        FROM product_materials pm
        JOIN materials m ON m.id = pm.material_id
        WHERE pm.product_id = ?
      `).all(op.product_id) as any[];

      const updateStock = db.prepare('UPDATE materials SET current_stock = current_stock - ? WHERE id = ?');
      for (const item of bomItems) {
        const required = item.qty_per_unit * op.quantity;
        updateStock.run(required, item.material_id);
      }
    }

    // Add produced quantity to finished goods stock
    db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(op.quantity, op.product_id);

    // Update OP status to Concluída, 100%, completion_date, materials_deducted = 1
    const today = new Date().toISOString().slice(0, 10);
    db.prepare(`
      UPDATE production_orders
      SET status = 'Concluída', progress_percent = 100, completion_date = ?, materials_deducted = 1
      WHERE id = ?
    `).run(today, id);

    // If linked to an order, update order status to Concluído
    if (op.order_id) {
      db.prepare("UPDATE orders SET status = 'Concluído' WHERE id = ?").run(op.order_id);
    }

    // Add production log record
    db.prepare(`
      INSERT INTO production_logs (production_order_id, stage_name, operator, units_completed, log_date, notes)
      VALUES (?, 'Baixa e Conclusão Final de Produção', ?, ?, ?, 'OP concluída com baixa automatizada de materiais e entrada no estoque.')
    `).run(id, op.operator_name || 'Encarregado PCP', op.quantity, new Date().toISOString().replace('T', ' ').slice(0, 16));

    const updated = db.prepare('SELECT * FROM production_orders WHERE id = ?').get(id);
    res.json({
      success: true,
      message: `OP ${op.code} concluída com sucesso! ${op.quantity} unidades adicionadas ao estoque de produtos acabados.`,
      production_order: updated,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Adicionar apontamento de produção
apiRouter.post('/production-orders/:id/logs', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage_name, operator, units_completed, notes, update_op_progress } = req.body;

    const stmt = db.prepare(`
      INSERT INTO production_logs (production_order_id, stage_name, operator, units_completed, log_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      stage_name,
      operator || 'Operador',
      Number(units_completed) || 0,
      new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes || ''
    );

    if (update_op_progress !== undefined) {
      db.prepare(`
        UPDATE production_orders
        SET progress_percent = ?, status = CASE WHEN ? >= 100 THEN 'Controle de Qualidade' ELSE 'Em Andamento' END
        WHERE id = ?
      `).run(Number(update_op_progress), Number(update_op_progress), id);
    }

    const logs = db.prepare('SELECT * FROM production_logs WHERE production_order_id = ? ORDER BY id DESC').all(id);
    res.status(201).json(logs);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

apiRouter.delete('/production-orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM production_orders WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// RELATÓRIOS & INDICADORES DO PCP
// ==========================================
apiRouter.get('/reports/dashboard', (req: Request, res: Response) => {
  try {
    // 1. Status count of production orders
    const opStatusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM production_orders
      GROUP BY status
    `).all() as any[];

    // 2. Capacity analysis per work center
    const workCenters = db.prepare(`
      SELECT wc.*,
             COALESCE(SUM(CASE WHEN po.status IN ('Planejada', 'Em Andamento', 'Controle de Qualidade') THEN (po.quantity * p.process_time_minutes) / 60.0 ELSE 0 END), 0) as committed_hours
      FROM work_centers wc
      LEFT JOIN products p ON p.work_center_id = wc.id
      LEFT JOIN production_orders po ON po.product_id = p.id
      GROUP BY wc.id
    `).all() as any[];

    // 3. Materials below minimum stock
    const lowStockMaterials = db.prepare(`
      SELECT * FROM materials
      WHERE current_stock <= min_stock
      ORDER BY (current_stock - min_stock) ASC
    `).all();

    // 4. Pending customer orders
    const pendingOrders = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN products p ON p.id = o.product_id
      WHERE o.status != 'Entregue'
      ORDER BY o.delivery_date ASC
      LIMIT 5
    `).all();

    // 5. Total counts
    const totalOps = (db.prepare('SELECT COUNT(*) as count FROM production_orders').get() as any).count;
    const completedOps = (db.prepare("SELECT COUNT(*) as count FROM production_orders WHERE status = 'Concluída'").get() as any).count;
    const activeOps = (db.prepare("SELECT COUNT(*) as count FROM production_orders WHERE status IN ('Planejada', 'Em Andamento', 'Controle de Qualidade')").get() as any).count;
    const totalMaterials = (db.prepare('SELECT COUNT(*) as count FROM materials').get() as any).count;
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;

    res.json({
      summary: {
        total_ops: totalOps,
        completed_ops: completedOps,
        active_ops: activeOps,
        total_materials: totalMaterials,
        total_products: totalProducts,
        total_orders: totalOrders,
        low_stock_count: (lowStockMaterials as any[]).length,
      },
      op_status_counts: opStatusCounts,
      work_centers_capacity: workCenters,
      low_stock_materials: lowStockMaterials,
      pending_orders: pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});
