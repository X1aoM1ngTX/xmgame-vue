import request from "@/request";

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
    return request({
      url: "/api/order/create",
      method: "post",
      data,
    });
  }

  // 根据订单ID获取订单信息
  static getOrderById(orderId: number) {
    return request({
      url: `/api/order/${orderId}`,
      method: "get",
    });
  }

  // 根据订单编号获取订单信息
  static getOrderByOrderNo(orderNo: string) {
    return request({
      url: `/api/order/by-order-no/${orderNo}`,
      method: "get",
    });
  }

  // 获取用户的订单列表
  static getUserOrders() {
    return request({
      url: "/api/order/list",
      method: "get",
    });
  }

  // 支付订单
  static payOrder(orderId: number, paymentMethod: string) {
    return request({
      url: `/api/order/${orderId}/pay`,
      method: "post",
      params: { paymentMethod },
    });
  }

  // 取消订单
  static cancelOrder(orderId: number) {
    return request({
      url: `/api/order/${orderId}/cancel`,
      method: "post",
    });
  }

  // 退款订单
  static refundOrder(orderId: number, reason: string) {
    return request({
      url: `/api/order/${orderId}/refund`,
      method: "post",
      params: { reason },
    });
  }

  // 检查订单状态
  static checkOrderStatus(orderId: number) {
    return request({
      url: `/api/order/${orderId}/status`,
      method: "get",
    });
  }
}
