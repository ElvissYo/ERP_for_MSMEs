import { type Inventory } from '../data/index';

export function deductInventoryState(args: {
  inventory: Inventory[];
  inventoryId: string;
  qty: number;
}): Inventory[] {
  return args.inventory.map((item) =>
    item.inventory_id === args.inventoryId ? { ...item, stock: Math.max(0, item.stock - args.qty) } : item,
  );
}

