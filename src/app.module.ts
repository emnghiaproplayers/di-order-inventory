import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [InventoryModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
