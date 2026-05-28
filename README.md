# NestJS Order & Inventory Service (DI Implementation)

Hệ thống xử lý Đơn hàng (Order) và Tồn kho (Inventory) được thiết kế và triển khai bằng NestJS. Dự án này chứng minh việc áp dụng các nguyên lý Clean Architecture, Dependency Injection (DI) chuẩn của NestJS và đảm bảo ranh giới Module rõ ràng.

---

## 1. Challenge Description

Bài toán yêu cầu xây dựng hai dịch vụ nghiệp vụ chính độc lập và giao tiếp qua cơ chế DI của NestJS:
- **Order Service**: Tiếp nhận yêu cầu đặt hàng qua endpoint `POST /orders`, kiểm tra tính hợp lệ của dữ liệu (validation), yêu cầu giữ chỗ kho từ Inventory Service, sinh mã đơn hàng không dùng UUID v4 và trả về thông tin chi tiết.
- **Inventory Service**: Thực hiện giữ chỗ tồn kho (reserve stock) cho sản phẩm dựa trên số lượng yêu cầu.

### Ràng buộc và Nguyên tắc Nghiêm ngặt:
- **Cấm hành vi phá DI**: Không khởi tạo thủ công dịch vụ (`new InventoryService()`) ngoài DI container.
- **Cấm gộp module**: Phân chia `Order` và `Inventory` thành 2 module độc lập với ranh giới rõ ràng (`OrderModule` và `InventoryModule`), giao tiếp thông qua cơ chế `imports` và `exports` của NestJS.
- **Đáp ứng API Contract**: Trả về chính xác các trường: `orderId`, `productId`, `reservedQty`.
- **Response Correctness**: Không sử dụng UUID v4 cho `orderId`, sử dụng định dạng custom an toàn và dễ đọc.
- **Smoke Test thật**: Kết quả thực tế từ API chạy trên local máy, không làm giả dữ liệu.

---

## 2. Architecture / Stack

Dự án được xây dựng dựa trên các công nghệ cốt lõi:
- **Core Framework**: [NestJS](https://nestjs.com/) (v11.x) - Progressive Node.js framework.
- **Language**: TypeScript (v5.7) cho môi trường lập trình kiểu tĩnh an toàn.
- **Validation**: `class-validator` & `class-transformer` cho việc lọc và kiểm tra kiểu dữ liệu đầu vào thông qua ValidationPipe toàn cục.
- **Testing**: Jest và `@nestjs/testing` cho việc viết và chạy unit tests độc lập.

```
src/
├── app.module.ts              # Module gốc kết nối các Module chức năng
├── main.ts                    # Khởi chạy ứng dụng và đăng ký ValidationPipe
├── inventory/                 # Module Quản lý Tồn kho
│   ├── inventory.module.ts    # Khai báo exports InventoryService
│   └── inventory.service.ts   # Xử lý nghiệp vụ kho (reserveStock)
└── order/                     # Module Quản lý Đơn hàng
    ├── order.module.ts        # Import InventoryModule và quản lý Order Service/Controller
    ├── order.controller.ts    # Endpoint POST /orders
    ├── order.service.ts       # Xử lý đặt hàng & gọi InventoryService qua DI
    └── dto/
        └── create-order.dto.ts # Định nghĩa & validate payload đặt hàng
```

---

## 3. How to Run

### Yêu cầu hệ thống
- **Node.js**: >= 18.x
- **npm**: >= 9.x

### Các bước cài đặt và chạy ứng dụng

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

2. **Chạy các Unit Tests để xác nhận logic hoạt động tốt:**
   ```bash
   npm run test
   ```

3. **Biên dịch dự án:**
   ```bash
   npm run build
   ```

4. **Khởi chạy ứng dụng:**
   ```bash
   node dist/main.js
   ```

5. **Chạy script kiểm thử HTTP Request:**
   Mở một terminal khác và chạy:
   ```bash
   node test-req.js
   ```

---

## 4. Smoke Test (Kết quả thực tế từ terminal)

Dưới đây là log response thực tế khi chạy lệnh `node test-req.js` (gửi request đến server đang chạy trên cổng `3000`):

```bash
QTY: -5, Status: 400, Body: {"message":["qty must be a positive number"],"error":"Bad Request","statusCode":400}
QTY: 10, Status: 201, Body: {"orderId":"ord_mpp8d6no_kt09hty","productId":"prod-1","reservedQty":10}
```

### Phân tích kết quả:
- **Trường hợp lỗi validation (QTY: -5)**: Lọc dữ liệu qua Validation Pipe trả về HTTP Status `400 Bad Request` cùng với thông báo chi tiết lỗi `"qty must be a positive number"`.
- **Trường hợp thành công (QTY: 10)**: Trả về HTTP Status `201 Created` cùng JSON Object chứa định dạng ID custom `ord_mpp8d6no_kt09hty` (được sinh ngẫu nhiên kết hợp timestamp, không phải UUID v4) và dữ liệu chuẩn khớp API contract: `orderId`, `productId`, `reservedQty`.

---

## 5. Code Execution Trace

Dưới đây là trace đường đi của request qua 3 điểm chạm chính xác trong source code khi client thực hiện gọi `POST /orders`:

1. **Điểm chạm 1 - Controller Entry**:
   - **File & Dòng**: [src/order/order.controller.ts:10](file:///d:/Nghia-project/escape-beta/di-order-inventory/src/order/order.controller.ts#L10)
   - **Method**: `create(@Body() createOrderDto: CreateOrderDto)`
   - **Mô tả**: Tiếp nhận payload từ client, ValidationPipe tự động kiểm tra tính hợp lệ trước khi chuyển tiếp data vào phương thức.

2. **Điểm chạm 2 - Service Delegation**:
   - **File & Dòng**: [src/order/order.service.ts:9](file:///d:/Nghia-project/escape-beta/di-order-inventory/src/order/order.service.ts#L9)
   - **Method**: `createOrder(createOrderDto: CreateOrderDto)`
   - **Mô tả**: Trích xuất dữ liệu, thực hiện gọi logic kiểm kho từ `InventoryService` thông qua instance được inject tự động bởi DI Container.

3. **Điểm chạm 3 - Inventory Reservation**:
   - **File & Dòng**: [src/inventory/inventory.service.ts:5](file:///d:/Nghia-project/escape-beta/di-order-inventory/src/inventory/inventory.service.ts#L5)
   - **Method**: `reserveStock(productId: string, qty: number)`
   - **Mô tả**: Nhận thông tin sản phẩm và số lượng để thực hiện nghiệp vụ kho bãi, trả kết quả về cho `OrderService`.

---

## 6. Design Decisions

### A. Đảm bảo Nguyên lý Dependency Injection (DI) tuyệt đối
- **Không tự ý khởi tạo service**: Trong toàn bộ dự án, tuyệt đối không xuất hiện dòng code `new InventoryService()` hay khởi tạo thủ công.
- **Khai báo qua Constructor**: Việc giao tiếp giữa `OrderService` và `InventoryService` hoàn toàn thông qua khai báo trong Constructor:
  ```typescript
  constructor(private readonly inventoryService: InventoryService) {}
  ```
  NestJS IoC (Inversion of Control) Container chịu trách nhiệm quản lý vòng đời và tự động inject thực thể `InventoryService` vào `OrderService`.

### B. Giữ vững ranh giới Module (Module Boundaries)
- **Tách biệt module rõ ràng**: `Order` và `Inventory` được tổ chức ở hai thư mục hoàn toàn độc lập (`src/order` và `src/inventory`).
- **Xuất nhập tường minh**: 
  - `InventoryModule` dùng `exports: [InventoryService]` để công khai dịch vụ kho ra ngoài.
  - `OrderModule` sử dụng `imports: [InventoryModule]` để có quyền truy cập và sử dụng `InventoryService` trong DI container của nó.
  - Điều này giúp tránh cross-module wiring không hợp lệ hoặc gộp chung toàn bộ code vào một module duy nhất để tránh việc thiết lập DI.

### C. Định danh Order ID & Đúng Contract
- **Không dùng UUID v4**: Để bảo đảm tuân thủ yêu cầu nghiệp vụ thực tế, mã đơn hàng được tạo thủ công bằng sự kết hợp giữa hệ đếm cơ số 36 của thời gian thực tế `Date.now().toString(36)` và một chuỗi ngẫu nhiên giúp ID có tiền tố dễ đọc (`ord_...`), ngắn gọn nhưng vẫn đảm bảo tính duy nhất trên môi trường phân tán.
- **Chuẩn hóa API Contract**: Dữ liệu phản hồi khớp 100% với đặc tả kỹ thuật của khách hàng bao gồm 3 trường bắt buộc: `orderId`, `productId`, và `reservedQty`.
