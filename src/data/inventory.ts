import { Inventory } from '../types';

export const inventory: Inventory[] = [
  // PAPER STOCK
  {
    inventory_id: 'INV-00001',
    item_name: 'Paper HVS A4 80gsm (Ream)',
    category: 'Paper',
    stock: 120,
    reorder_point: 30,
    unit_cost: 35000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-10T08:00:00Z'
  },
  {
    inventory_id: 'INV-00002',
    item_name: 'Paper HVS A4 70gsm (Ream)',
    category: 'Paper',
    stock: 85,
    reorder_point: 25,
    unit_cost: 32000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-10T08:00:00Z'
  },
  {
    inventory_id: 'INV-00003',
    item_name: 'Paper HVS Legal 80gsm (Ream)',
    category: 'Paper',
    stock: 45,
    reorder_point: 20,
    unit_cost: 42000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-08T08:00:00Z'
  },
  {
    inventory_id: 'INV-00004',
    item_name: 'Paper A3 80gsm (Ream)',
    category: 'Paper',
    stock: 18,
    reorder_point: 15,
    unit_cost: 65000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'LOW_STOCK',
    last_restock_date: '2024-05-01T08:00:00Z'
  },
  {
    inventory_id: 'INV-00005',
    item_name: 'Art Paper A4 120gsm (Pack 100)',
    category: 'Paper',
    stock: 25,
    reorder_point: 10,
    unit_cost: 75000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-05T08:00:00Z'
  },
  {
    inventory_id: 'INV-00006',
    item_name: 'Photo Paper A4 Glossy (Pack 100)',
    category: 'Paper',
    stock: 12,
    reorder_point: 8,
    unit_cost: 95000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-12T08:00:00Z'
  },
  {
    inventory_id: 'INV-00007',
    item_name: 'Photo Paper 2R (Pack 100)',
    category: 'Paper',
    stock: 8,
    reorder_point: 5,
    unit_cost: 40000,
    supplier_name: 'PT Cahaya Photo',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-14T08:00:00Z'
  },
  {
    inventory_id: 'INV-00008',
    item_name: 'Photo Paper 3R (Pack 100)',
    category: 'Paper',
    stock: 6,
    reorder_point: 5,
    unit_cost: 50000,
    supplier_name: 'PT Cahaya Photo',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-14T08:00:00Z'
  },
  {
    inventory_id: 'INV-00009',
    item_name: 'Photo Paper 4R (Pack 100)',
    category: 'Paper',
    stock: 7,
    reorder_point: 5,
    unit_cost: 65000,
    supplier_name: 'PT Cahaya Photo',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-14T08:00:00Z'
  },
  {
    inventory_id: 'INV-00010',
    item_name: 'Sticker Paper A4 (Pack 100)',
    category: 'Paper',
    stock: 15,
    reorder_point: 8,
    unit_cost: 120000,
    supplier_name: 'PT Indah Paper',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-03T08:00:00Z'
  },

  // INK & TONER
  {
    inventory_id: 'INV-00011',
    item_name: 'Toner HP LaserJet Black',
    category: 'Ink & Toner',
    stock: 8,
    reorder_point: 5,
    unit_cost: 850000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-28T08:00:00Z'
  },
  {
    inventory_id: 'INV-00012',
    item_name: 'Toner Canon Color Cyan',
    category: 'Ink & Toner',
    stock: 3,
    reorder_point: 3,
    unit_cost: 950000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-25T08:00:00Z'
  },
  {
    inventory_id: 'INV-00013',
    item_name: 'Toner Canon Color Magenta',
    category: 'Ink & Toner',
    stock: 2,
    reorder_point: 3,
    unit_cost: 950000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'LOW_STOCK',
    last_restock_date: '2024-04-20T08:00:00Z'
  },
  {
    inventory_id: 'INV-00014',
    item_name: 'Toner Canon Color Yellow',
    category: 'Ink & Toner',
    stock: 4,
    reorder_point: 3,
    unit_cost: 950000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-25T08:00:00Z'
  },
  {
    inventory_id: 'INV-00015',
    item_name: 'Toner Canon Color Black',
    category: 'Ink & Toner',
    stock: 5,
    reorder_point: 4,
    unit_cost: 950000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-28T08:00:00Z'
  },
  {
    inventory_id: 'INV-00016',
    item_name: 'Ink Cartridge Epson Black',
    category: 'Ink & Toner',
    stock: 12,
    reorder_point: 8,
    unit_cost: 185000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-15T08:00:00Z'
  },
  {
    inventory_id: 'INV-00017',
    item_name: 'Ink Cartridge Epson Color',
    category: 'Ink & Toner',
    stock: 10,
    reorder_point: 8,
    unit_cost: 195000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-15T08:00:00Z'
  },

  // BINDING SUPPLIES
  {
    inventory_id: 'INV-00018',
    item_name: 'Spiral Plastic 6mm (Box 100)',
    category: 'Binding Supplies',
    stock: 28,
    reorder_point: 10,
    unit_cost: 45000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-06T08:00:00Z'
  },
  {
    inventory_id: 'INV-00019',
    item_name: 'Spiral Plastic 8mm (Box 100)',
    category: 'Binding Supplies',
    stock: 22,
    reorder_point: 10,
    unit_cost: 52000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-06T08:00:00Z'
  },
  {
    inventory_id: 'INV-00020',
    item_name: 'Spiral Plastic 10mm (Box 100)',
    category: 'Binding Supplies',
    stock: 18,
    reorder_point: 10,
    unit_cost: 60000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-06T08:00:00Z'
  },
  {
    inventory_id: 'INV-00021',
    item_name: 'Hard Cover Binding Board (Pack 50)',
    category: 'Binding Supplies',
    stock: 12,
    reorder_point: 8,
    unit_cost: 180000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-30T08:00:00Z'
  },
  {
    inventory_id: 'INV-00022',
    item_name: 'Soft Cover Clear (Pack 100)',
    category: 'Binding Supplies',
    stock: 35,
    reorder_point: 15,
    unit_cost: 75000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-08T08:00:00Z'
  },
  {
    inventory_id: 'INV-00023',
    item_name: 'Ring Binder 20 Ring (Box 50)',
    category: 'Binding Supplies',
    stock: 8,
    reorder_point: 5,
    unit_cost: 95000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-02T08:00:00Z'
  },
  {
    inventory_id: 'INV-00024',
    item_name: 'Stapler Wire No. 10 (Box 1000)',
    category: 'Binding Supplies',
    stock: 45,
    reorder_point: 20,
    unit_cost: 8000,
    supplier_name: 'CV Jaya Binding',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-12T08:00:00Z'
  },

  // LAMINATING SUPPLIES
  {
    inventory_id: 'INV-00025',
    item_name: 'Laminating Film A4 (Pack 100)',
    category: 'Laminating Supplies',
    stock: 40,
    reorder_point: 15,
    unit_cost: 125000,
    supplier_name: 'PT Laminasi Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-09T08:00:00Z'
  },
  {
    inventory_id: 'INV-00026',
    item_name: 'Laminating Film A3 (Pack 100)',
    category: 'Laminating Supplies',
    stock: 22,
    reorder_point: 10,
    unit_cost: 185000,
    supplier_name: 'PT Laminasi Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-09T08:00:00Z'
  },
  {
    inventory_id: 'INV-00027',
    item_name: 'Laminating Film KTP (Pack 100)',
    category: 'Laminating Supplies',
    stock: 35,
    reorder_point: 15,
    unit_cost: 65000,
    supplier_name: 'PT Laminasi Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-11T08:00:00Z'
  },
  {
    inventory_id: 'INV-00028',
    item_name: 'Laminating Film F4 (Pack 100)',
    category: 'Laminating Supplies',
    stock: 18,
    reorder_point: 10,
    unit_cost: 145000,
    supplier_name: 'PT Laminasi Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-07T08:00:00Z'
  },

  // OFFICE SUPPLIES
  {
    inventory_id: 'INV-00029',
    item_name: 'CD-R Blank (Pack 50)',
    category: 'Office Supplies',
    stock: 8,
    reorder_point: 5,
    unit_cost: 85000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-22T08:00:00Z'
  },
  {
    inventory_id: 'INV-00030',
    item_name: 'DVD-R Blank (Pack 50)',
    category: 'Office Supplies',
    stock: 6,
    reorder_point: 5,
    unit_cost: 95000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-22T08:00:00Z'
  },
  {
    inventory_id: 'INV-00031',
    item_name: 'Flash Disk 16GB (Unit)',
    category: 'Office Supplies',
    stock: 12,
    reorder_point: 8,
    unit_cost: 65000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-05T08:00:00Z'
  },
  {
    inventory_id: 'INV-00032',
    item_name: 'Paper Cutter Blade (Unit)',
    category: 'Office Supplies',
    stock: 5,
    reorder_point: 3,
    unit_cost: 45000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-18T08:00:00Z'
  },
  {
    inventory_id: 'INV-00033',
    item_name: 'Tissue Roll',
    category: 'Office Supplies',
    stock: 25,
    reorder_point: 15,
    unit_cost: 12000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-16T08:00:00Z'
  },
  {
    inventory_id: 'INV-00034',
    item_name: 'Marker Permanent Black (Pack 12)',
    category: 'Office Supplies',
    stock: 8,
    reorder_point: 5,
    unit_cost: 48000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-10T08:00:00Z'
  },
  {
    inventory_id: 'INV-00035',
    item_name: 'Correction Tape (Unit)',
    category: 'Office Supplies',
    stock: 20,
    reorder_point: 10,
    unit_cost: 8500,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-13T08:00:00Z'
  },

  // MAINTENANCE & CLEANING
  {
    inventory_id: 'INV-00036',
    item_name: 'Printer Cleaning Kit',
    category: 'Maintenance',
    stock: 4,
    reorder_point: 3,
    unit_cost: 125000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-15T08:00:00Z'
  },
  {
    inventory_id: 'INV-00037',
    item_name: 'Air Duster Spray',
    category: 'Maintenance',
    stock: 6,
    reorder_point: 4,
    unit_cost: 35000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-02T08:00:00Z'
  },
  {
    inventory_id: 'INV-00038',
    item_name: 'Alcohol 70% (1 Liter)',
    category: 'Maintenance',
    stock: 8,
    reorder_point: 5,
    unit_cost: 25000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-14T08:00:00Z'
  },
  {
    inventory_id: 'INV-00039',
    item_name: 'Microfiber Cloth (Pack 10)',
    category: 'Maintenance',
    stock: 12,
    reorder_point: 8,
    unit_cost: 45000,
    supplier_name: 'CV Maju Jaya',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-05-08T08:00:00Z'
  },
  {
    inventory_id: 'INV-00040',
    item_name: 'Lubricating Oil for Machines',
    category: 'Maintenance',
    stock: 3,
    reorder_point: 2,
    unit_cost: 55000,
    supplier_name: 'PT Prima Toner',
    inventory_status: 'NORMAL',
    last_restock_date: '2024-04-10T08:00:00Z'
  },
];

// Helper functions
export const getInventoryById = (inventoryId: string): Inventory | undefined => {
  return inventory.find(item => item.inventory_id === inventoryId);
};

export const getLowStockItems = (): Inventory[] => {
  return inventory.filter(item => item.stock < item.reorder_point);
};

export const getInventoryByCategory = (category: string): Inventory[] => {
  return inventory.filter(item => item.category === category);
};

export const getInventoryCategories = (): string[] => {
  return [...new Set(inventory.map(item => item.category))];
};

export const getTotalInventoryValue = (): number => {
  return inventory.reduce((total, item) => total + (item.stock * item.unit_cost), 0);
};