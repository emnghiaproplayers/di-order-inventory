import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  reserveStock(productId: string, qty: number) {
    return {
      productId,
      reservedQty: qty,
    };
  }
}
