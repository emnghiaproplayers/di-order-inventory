import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly inventoryService: InventoryService) {}

  createOrder(createOrderDto: CreateOrderDto) {
    const { productId, qty } = createOrderDto;
    
    // Gọi reserveStock từ InventoryService
    const reservation = this.inventoryService.reserveStock(productId, qty);

    // Sinh orderId bằng UUID v4
    const orderId = uuidv4();

    return {
      orderId,
      productId: reservation.productId,
      reservedQty: reservation.reservedQty,
    };
  }
}
