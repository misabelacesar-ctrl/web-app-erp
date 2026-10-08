import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'production_erp.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.exec(`
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      technical_responsible_name TEXT NOT NULL,
      technical_responsible_title TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS work_centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      daily_capacity_hours REAL NOT NULL,
      shifts_per_day INTEGER NOT NULL DEFAULT 1,
      operators_count INTEGER NOT NULL DEFAULT 1,
      efficiency_rate REAL NOT NULL DEFAULT 90.0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      cnpj TEXT,
      city TEXT,
      supplied_products TEXT
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT NOT NULL,
      unit_cost REAL NOT NULL DEFAULT 0,
      current_stock REAL NOT NULL DEFAULT 0,
      min_stock REAL NOT NULL DEFAULT 0,
      supplier_id INTEGER,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      cnpj TEXT,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      specs TEXT,
      process_time_minutes INTEGER NOT NULL DEFAULT 60,
      sale_price REAL NOT NULL DEFAULT 0,
      work_center_id INTEGER,
      stock_quantity REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS product_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      order_num INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      order_date TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      unit_price REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pendente',
      notes TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS production_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      order_id INTEGER,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Normal',
      start_date TEXT NOT NULL,
      target_date TEXT NOT NULL,
      completion_date TEXT,
      status TEXT NOT NULL DEFAULT 'Planejada',
      progress_percent INTEGER NOT NULL DEFAULT 0,
      batch_number TEXT NOT NULL,
      technical_responsible TEXT NOT NULL,
      operator_name TEXT,
      work_center_id INTEGER,
      notes TEXT,
      materials_deducted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS production_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      production_order_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      operator TEXT NOT NULL,
      units_completed REAL NOT NULL,
      log_date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
    );
  `);

  // Check if seed data is needed
  const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    seedDatabase();
  }
}

export function seedDatabase() {
  db.exec(`
    DELETE FROM production_logs;
    DELETE FROM production_orders;
    DELETE FROM orders;
    DELETE FROM product_stages;
    DELETE FROM product_materials;
    DELETE FROM products;
    DELETE FROM materials;
    DELETE FROM customers;
    DELETE FROM suppliers;
    DELETE FROM work_centers;
    DELETE FROM settings;

    INSERT INTO settings (id, company_name, cnpj, technical_responsible_name, technical_responsible_title, contact_email, contact_phone, address)
    VALUES (
      1,
      'Metalprint Manufatura Industrial Ltda',
      '12.345.678/0001-90',
      'Eng. Carlos Eduardo Ribeiro',
      'Resp. Técnico de Manufatura - CREA-SP 506.789/D',
      'pcp@metalprint.ind.br',
      '(11) 4892-3000',
      'Av. das Indústrias, 450 - Polo Metal-Mecânico, Campinas - SP'
    );

    INSERT INTO work_centers (id, name, daily_capacity_hours, shifts_per_day, operators_count, efficiency_rate, notes) VALUES
    (1, 'Célula de Usinagem & Torno CNC', 16.0, 2, 4, 88.0, 'Tornos Romi GL280 e Centros de Usinagem Haas'),
    (2, 'Célula de Corte Laser & Dobra', 14.0, 2, 3, 92.0, 'Laser Fibra Óptica 3kW e Dobradeira CNC 100t'),
    (3, 'Linha de Soldagem TIG / MIG', 8.0, 1, 3, 85.0, 'Gabaritos certificados para Inox e Alumínio'),
    (4, 'Montagem Final & Controle da Qualidade', 8.0, 1, 4, 95.0, 'Bancadas de teste elétrico, dimensional e embalagem');

    INSERT INTO suppliers (id, name, contact_name, phone, email, cnpj, city, supplied_products) VALUES
    (1, 'Açotec Metais & Ligas Ltda', 'Marcos Andrade', '(11) 3210-4400', 'vendas@acotec.com.br', '44.123.456/0001-11', 'São Paulo - SP', 'Chapas Aço Inox 304, Perfis Alumínio 6063, Tarugos SAE 1045'),
    (2, 'FixaTudo Parafusos Especiais', 'Fernanda Souza', '(19) 3888-1200', 'pedidos@fixatudo.com.br', '65.987.321/0001-44', 'Piracicaba - SP', 'Parafusos Inox M4/M6/M8, Porcas Autotravantes, Rebites'),
    (3, 'PolimerMax Componentes', 'Renato Prado', '(11) 4522-8000', 'comercial@polimermax.ind.br', '23.456.789/0001-88', 'Jundiaí - SP', 'Borrachas de vedação EPDM, Pés niveladores, Isoladores');

    INSERT INTO materials (id, code, name, description, unit, unit_cost, current_stock, min_stock, supplier_id) VALUES
    (1, 'MP-001', 'Chapa Aço Inox 304 (2.0mm)', 'Chapa escovada 2000x1000mm com película protetora', 'kg', 32.50, 480.0, 150.0, 1),
    (2, 'MP-002', 'Tubo Redondo Inox 304 Ø 25mm', 'Tubo polido espessura 1.5mm barras de 6m', 'm', 48.00, 120.0, 40.0, 1),
    (3, 'MP-003', 'Parafuso Allen Cabeça Cilíndrica Inox M6x20', 'Aço inoxidável A2 DIN 912', 'un', 0.85, 1450.0, 300.0, 2),
    (4, 'MP-004', 'Porca Sextavada Auto-travante Inox M6', 'Com inserto de nylon DIN 985', 'un', 0.40, 1800.0, 400.0, 2),
    (5, 'MP-005', 'Gaxeta de Vedação em Neoprene 15x5mm', 'Fita autoadesiva para vedação estanque IP65', 'm', 6.20, 350.0, 80.0, 3),
    (6, 'MP-006', 'Tinta Eletrostática a Pó Cinza RAL 7035', 'Poliéster semi-brilho padrão industrial', 'kg', 45.00, 65.0, 25.0, 3),
    (7, 'MP-007', 'Fecho Rápido com Chave em Zamac', 'Fecho lingueta cromado para painel industrial', 'un', 22.00, 75.0, 30.0, 2);

    INSERT INTO customers (id, name, contact_name, phone, email, cnpj, address) VALUES
    (1, 'AutomaSul Painéis Elétricos S/A', 'Mariana Alencar', '(41) 3344-9000', 'compras@automasul.com.br', '08.765.432/0001-55', 'Av. das Nações, 1400 - Curitiba - PR'),
    (2, 'Alimentos Sabor da Terra Indústria', 'Rodrigo Meirelles', '(19) 3991-5522', 'suprimentos@sabordaterra.ind.br', '19.456.123/0001-77', 'Rod. SP-340 Km 128 - Mogi Mirim - SP'),
    (3, 'BioTech Equipamentos Médicos', 'Dra. Vanessa Klein', '(11) 2299-7711', 'engenharia@biotechmed.com.br', '33.888.999/0001-02', 'Rua dos Laboratórios, 88 - São Paulo - SP');

    -- Produtos & Fichas Técnicas
    INSERT INTO products (id, code, name, description, specs, process_time_minutes, sale_price, work_center_id, stock_quantity) VALUES
    (
      1,
      'PRD-101',
      'Gabinete Industrial Inox 600x400x250mm',
      'Gabinete para abrigar comandos elétricos e automação, vedação IP66',
      'Norma NBR IEC 60529. Chapa inox 304 escovado #14 (2mm), soldas estancadas, dobradiças embutidas reforçadas.',
      135,
      890.00,
      2,
      12.0
    ),
    (
      2,
      'PRD-102',
      'Suporte Articulado Tubolar Reforçado',
      'Braço de sustentação para painéis HMI e monitores industriais',
      'Carga máxima recomendada: 45kg. Rotação 270°, freio manual de fricção, passagem interna de cabeamento.',
      75,
      340.00,
      1,
      28.0
    ),
    (
      3,
      'PRD-103',
      'Caixa de Passagem Estanque com Fecho',
      'Caixa de junção com placa de montagem zincada interna e fecho de segurança',
      'Dimensões: 300x200x150mm. Pintura eletrostática RAL 7035 sobre chapa tratada anticorrosão.',
      55,
      210.00,
      4,
      45.0
    );

    -- Ficha Técnica BOM (product_materials)
    -- Produto 1: Gabinete Inox 600x400
    INSERT INTO product_materials (product_id, material_id, quantity) VALUES
    (1, 1, 14.5), -- 14.5 kg chapa inox
    (1, 3, 8.0),  -- 8 parafusos M6
    (1, 4, 8.0),  -- 8 porcas M6
    (1, 5, 2.2),  -- 2.2 m gaxeta vedação
    (1, 7, 2.0);  -- 2 fechos com chave

    -- Produto 2: Suporte Tubolar
    INSERT INTO product_materials (product_id, material_id, quantity) VALUES
    (2, 2, 1.8),  -- 1.8 m tubo inox
    (2, 1, 3.2),  -- 3.2 kg chapa (bases e flanges)
    (2, 3, 6.0),  -- 6 parafusos M6
    (2, 4, 6.0);  -- 6 porcas M6

    -- Produto 3: Caixa de Passagem Estanque
    INSERT INTO product_materials (product_id, material_id, quantity) VALUES
    (3, 1, 4.0),  -- 4.0 kg chapa
    (3, 5, 1.1),  -- 1.1 m vedação
    (3, 6, 0.4),  -- 0.4 kg tinta pó
    (3, 7, 1.0);  -- 1 fecho

    -- Roteiro de Processo (product_stages)
    INSERT INTO product_stages (product_id, stage_name, duration_minutes, order_num) VALUES
    (1, 'Corte no Laser de Fibra', 25, 1),
    (1, 'Dobra CNC de Precisão', 35, 2),
    (1, 'Solda TIG com Purga Gasosa', 40, 3),
    (1, 'Acabamento & Escovamento', 20, 4),
    (1, 'Montagem de Vedação, Fechos e Teste IP66', 15, 5),

    (2, 'Corte e Usinagem de Terminais CNC', 30, 1),
    (2, 'Solda e Alinhamento Estrutural', 25, 2),
    (2, 'Ajuste de Articulação e Teste de Torque', 20, 3),

    (3, 'Estamparia e Corte', 15, 1),
    (3, 'Dobra e Solda de Ponto', 15, 2),
    (3, 'Pintura Eletrostática a Pó e Cura', 15, 3),
    (3, 'Montagem Final e Embalagem', 10, 4);

    -- Pedidos de Venda
    INSERT INTO orders (id, order_number, customer_id, product_id, quantity, order_date, delivery_date, unit_price, total_price, status, notes) VALUES
    (1, 'PED-2026-001', 1, 1, 20.0, '2026-10-01', '2026-10-18', 890.00, 17800.00, 'Em Produção', 'Entrega fracionada permitida. Embalagem reforçada para transporte rodoviário.'),
    (2, 'PED-2026-002', 2, 2, 15.0, '2026-10-03', '2026-10-22', 340.00, 5100.00, 'Em Produção', 'Incluir certificado de matéria-prima inox 304.'),
    (3, 'PED-2026-003', 3, 3, 50.0, '2026-10-05', '2026-10-29', 210.00, 10500.00, 'Pendente', 'Cor especial RAL 7035 com laudo de espessura de camada.'),
    (4, 'PED-2026-004', 1, 2, 10.0, '2026-09-20', '2026-10-05', 340.00, 3400.00, 'Concluído', 'Pedido entregue com sucesso e inspecionado.');

    -- Ordens de Produção (OP)
    INSERT INTO production_orders (
      id, code, order_id, product_id, quantity, priority, start_date, target_date, completion_date,
      status, progress_percent, batch_number, technical_responsible, operator_name, work_center_id, notes, materials_deducted
    ) VALUES
    (
      1,
      'OP-2026-0101',
      1,
      1,
      20.0,
      'Alta',
      '2026-10-04',
      '2026-10-17',
      NULL,
      'Em Andamento',
      65,
      'LOTE-INOX-2610-A',
      'Eng. Carlos Eduardo Ribeiro',
      'Marcio Silveira (Líder Turno 1)',
      2,
      'Etapas 1 e 2 concluídas. Liberado para solda TIG.',
      1
    ),
    (
      2,
      'OP-2026-0102',
      2,
      2,
      15.0,
      'Normal',
      '2026-10-06',
      '2026-10-21',
      NULL,
      'Controle de Qualidade',
      90,
      'LOTE-SUP-2610-B',
      'Eng. Carlos Eduardo Ribeiro',
      'José Ricardo Alencar',
      1,
      'Montagem concluída, aguardando inspeção dimensional e teste de torque.',
      1
    ),
    (
      3,
      'OP-2026-0103',
      3,
      3,
      50.0,
      'Normal',
      '2026-10-10',
      '2026-10-27',
      NULL,
      'Planejada',
      0,
      'LOTE-CX-2610-C',
      'Eng. Carlos Eduardo Ribeiro',
      'A definir pelo supervisor',
      4,
      'Aguardando agendamento na cabine de pintura.',
      0
    ),
    (
      4,
      'OP-2026-0098',
      4,
      2,
      10.0,
      'Normal',
      '2026-09-22',
      '2026-10-03',
      '2026-10-02',
      'Concluída',
      100,
      'LOTE-SUP-2609-F',
      'Eng. Carlos Eduardo Ribeiro',
      'José Ricardo Alencar',
      1,
      'Produção finalizada sem não-conformidades. 10 unidades transferidas para expedição.',
      1
    );

    -- Apontamentos de produção
    INSERT INTO production_logs (production_order_id, stage_name, operator, units_completed, log_date, notes) VALUES
    (1, 'Corte no Laser de Fibra', 'Marcio Silveira', 20.0, '2026-10-04 14:30', 'Corte de 20 chapas concluído com tolerância +-0.1mm'),
    (1, 'Dobra CNC de Precisão', 'Lucas Morais', 20.0, '2026-10-05 16:45', 'Dobra com raio padrão 3mm finalizada.'),
    (2, 'Corte e Usinagem de Terminais CNC', 'José Ricardo Alencar', 15.0, '2026-10-06 11:20', 'Usinagem de buchas e tubos em conformidade'),
    (2, 'Solda e Alinhamento Estrutural', 'José Ricardo Alencar', 15.0, '2026-10-07 15:00', 'Gabarito conferido pelo controle dimensional');
  `);
}
