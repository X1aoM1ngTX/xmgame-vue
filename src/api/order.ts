import myAxios from "@/request";

export interface CreateOrderRequest {
  gameId: number;
  orderAmount: number;
  paymentMethod: string;
  description?: string;
}

export interface OrderVO {
  orderId: number;
  orderNo: string;
  userId: number;
  gameId: number;
  gameName: string;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  orderStatus: number;
  paymentMethod?: string;
  paymentTime?: string;
  cancelReason?: string;
  refundReason?: string;
  refundTime?: string;
  remark?: string;
  createdTime: string;
  updateTime: string;
  userName?: string;
  orderStatusDesc?: string;
}

export class OrderAPI {
  // 创建订单
  static createOrder(data: CreateOrderRequest) {
    return myAxios.post<OrderVO>("/api/order/create", data);
  }

  // 根据订单ID获取订单信息
  static getOrderById(orderId: number) {
    return myAxios.get<OrderVO>(`/api/order/${orderId}`);
  }

  // 根据订单编号获取订单信息
  static getOrderByOrderNo(orderNo: string) {
    return myAxios.get<OrderVO>(`/api/order/by-order-no/${orderNo}`);
  }

  // 获取用户的订单列表
  static getUserOrders() {
    return myAxios.get<OrderVO[]>("/api/order/list");
  }

  // 支付订单
  static payOrder(orderId: number, paymentMethod: string) {
    return myAxios.post<boolean>(`/api/order/${orderId}/pay`, null, {
      params: { paymentMethod },
    });
  }

  // 取消订单
  static cancelOrder(orderId: number) {
    return myAxios.post<boolean>(`/api/order/${orderId}/cancel`);
  }

  // 退款订单
  static refundOrder(orderId: number, reason: string) {
    return myAxios.post<boolean>(`/api/order/${orderId}/refund`, null, {
      params: { reason },
    });
  }

  // 检查订单状态
  static checkOrderStatus(orderId: number) {
    return myAxios.get<number>(`/api/order/${orderId}/status`);
  }
}
