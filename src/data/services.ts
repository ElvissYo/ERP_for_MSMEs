import type { Service } from '../types';

export const services: Service[] = [
  // PRINTING B&W
  {
    service_id: 'SRV-00001',
    service_name: 'Print B&W A4 (1 sided)',
    category: 'Printing',
    unit_price: 300,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00002',
    service_name: 'Print B&W A4 (2 sided)',
    category: 'Printing',
    unit_price: 500,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00003',
    service_name: 'Print B&W Legal (1 sided)',
    category: 'Printing',
    unit_price: 400,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00003', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00004',
    service_name: 'Print B&W Legal (2 sided)',
    category: 'Printing',
    unit_price: 700,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00003', quantity_per_unit: 1 }]
  },
  // PRINTING COLOR
  {
    service_id: 'SRV-00005',
    service_name: 'Print Color A4 (1 sided)',
    category: 'Printing',
    unit_price: 1500,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.02 }]
  },
  {
    service_id: 'SRV-00006',
    service_name: 'Print Color A4 (2 sided)',
    category: 'Printing',
    unit_price: 2500,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.03 }]
  },
  {
    service_id: 'SRV-00007',
    service_name: 'Print Color A3 (1 sided)',
    category: 'Printing',
    unit_price: 3000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00004', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.04 }]
  },
  {
    service_id: 'SRV-00008',
    service_name: 'Print Color A3 (2 sided)',
    category: 'Printing',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00004', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.05 }]
  },
  // PHOTOCOPY
  {
    service_id: 'SRV-00009',
    service_name: 'Photocopy B&W A4 (1 sided)',
    category: 'Printing',
    unit_price: 250,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00010',
    service_name: 'Photocopy B&W A4 (2 sided)',
    category: 'Printing',
    unit_price: 450,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00011',
    service_name: 'Photocopy Color A4 (1 sided)',
    category: 'Printing',
    unit_price: 1200,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.02 }]
  },
  {
    service_id: 'SRV-00012',
    service_name: 'Photocopy Color A4 (2 sided)',
    category: 'Printing',
    unit_price: 2000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }, { inventory_id: 'INV-00017', quantity_per_unit: 0.03 }]
  },
  // BINDING
  {
    service_id: 'SRV-00013',
    service_name: 'Spiral Binding',
    category: 'Binding',
    unit_price: 15000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00018', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00014',
    service_name: 'Hard Cover Binding',
    category: 'Binding',
    unit_price: 35000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00021', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00015',
    service_name: 'Soft Cover Binding',
    category: 'Binding',
    unit_price: 25000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00022', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00016',
    service_name: 'Staple Binding',
    category: 'Binding',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00024', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00017',
    service_name: 'Ring Binding',
    category: 'Binding',
    unit_price: 20000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00023', quantity_per_unit: 1 }]
  },
  // LAMINATING
  {
    service_id: 'SRV-00018',
    service_name: 'Laminating A4',
    category: 'Laminating',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00025', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00019',
    service_name: 'Laminating A3',
    category: 'Laminating',
    unit_price: 10000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00026', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00020',
    service_name: 'Laminating KTP Size',
    category: 'Laminating',
    unit_price: 3000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00027', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00021',
    service_name: 'Laminating F4',
    category: 'Laminating',
    unit_price: 7000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00028', quantity_per_unit: 1 }]
  },
  // PHOTO
  {
    service_id: 'SRV-00022',
    service_name: 'Photo Print 2R',
    category: 'Photo Service',
    unit_price: 2000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00007', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00023',
    service_name: 'Photo Print 3R',
    category: 'Photo Service',
    unit_price: 3000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00008', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00024',
    service_name: 'Photo Print 4R',
    category: 'Photo Service',
    unit_price: 4000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00009', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00025',
    service_name: 'Passport Photo (4 x 6 cm)',
    category: 'Photo Service',
    unit_price: 25000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00009', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00026',
    service_name: 'ID Photo (3 x 4 cm)',
    category: 'Photo Service',
    unit_price: 20000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00009', quantity_per_unit: 1 }]
  },
  // SCANNING (no consumables)
  {
    service_id: 'SRV-00027',
    service_name: 'Scan to PDF (per page)',
    category: 'Scanning',
    unit_price: 1000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00028',
    service_name: 'Scan to JPG (per page)',
    category: 'Scanning',
    unit_price: 1000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00029',
    service_name: 'Scan to Email (per doc)',
    category: 'Scanning',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00030',
    service_name: 'Scan High Resolution A4',
    category: 'Scanning',
    unit_price: 3000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  // DESIGN
  {
    service_id: 'SRV-00031',
    service_name: 'Document Typing (per page)',
    category: 'Design & Editing',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00032',
    service_name: 'Simple Design (flyer/poster)',
    category: 'Design & Editing',
    unit_price: 50000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00033',
    service_name: 'Banner Design',
    category: 'Design & Editing',
    unit_price: 75000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00034',
    service_name: 'Photo Editing',
    category: 'Design & Editing',
    unit_price: 15000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  // SPECIAL PRINTING
  {
    service_id: 'SRV-00035',
    service_name: 'Print on Sticker A4',
    category: 'Printing',
    unit_price: 8000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00010', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00036',
    service_name: 'Print on Art Paper A4',
    category: 'Printing',
    unit_price: 6000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00005', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00037',
    service_name: 'Print on Photo Paper A4',
    category: 'Printing',
    unit_price: 7000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00006', quantity_per_unit: 1 }]
  },
  // OTHER
  {
    service_id: 'SRV-00038',
    service_name: 'CD/DVD Burning',
    category: 'Other Services',
    unit_price: 10000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00029', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00039',
    service_name: 'Paper Cutting (per sheet)',
    category: 'Other Services',
    unit_price: 500,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00040',
    service_name: 'Resume/CV Formatting',
    category: 'Design & Editing',
    unit_price: 25000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00041',
    service_name: 'Thesis/Report Formatting',
    category: 'Design & Editing',
    unit_price: 100000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    service_id: 'SRV-00042',
    service_name: 'Business Card Print (100 pcs)',
    category: 'Printing',
    unit_price: 50000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00005', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00043',
    service_name: 'Certificate Print A4',
    category: 'Printing',
    unit_price: 10000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00044',
    service_name: 'Photocopy ID Card (both sides)',
    category: 'Printing',
    unit_price: 2000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00001', quantity_per_unit: 1 }]
  },
  {
    service_id: 'SRV-00045',
    service_name: 'Flash Disk Data Copy',
    category: 'Other Services',
    unit_price: 5000,
    service_status: 'ACTIVE',
    created_at: '2024-01-01T08:00:00Z',
    cogs_mapping: [{ inventory_id: 'INV-00031', quantity_per_unit: 1 }]
  },
];

export const getServiceById = (serviceId: string): Service | undefined => services.find(s => s.service_id === serviceId);
export const getServicesByCategory = (category: string): Service[] => services.filter(s => s.category === category);
export const getActiveServices = (): Service[] => services.filter(s => s.service_status === 'ACTIVE');
export const getServiceCategories = (): string[] => [...new Set(services.map(s => s.category))];