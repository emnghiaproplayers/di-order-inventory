import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly inventoryService: InventoryService) {}

  createOrder(createOrderDto: CreateOrderDto) {
    const { productId, qty } = createOrderDto;
    
    // Gọi reserveStock từ InventoryService
    const reservation = this.inventoryService.reserveStock(productId, qty);

    // Sinh orderId bằng định dạng custom thay vì UUID v4
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    const orderId = `ord_${timestamp}_${randomPart}`;

    return {
      orderId,
      productId: reservation.productId,
      reservedQty: reservation.reservedQty,
    };
  }
}

