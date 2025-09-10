export interface Order {
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
}

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

// 订单状态枚举
export enum OrderStatus {
  PENDING = 1,
  PAID = 2,
  CANCELLED = 3,
  REFUNDED = 4,
  DELIVERED = 5,
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = "alipay",
  WECHAT = "wechat",
  BANK_CARD = "bank_card",
  WALLET = "wallet",
}

// 订单状态显示映射
export const ORDER_STATUS_MAP: Record<number, { text: string; color: string }> =
  {
    [OrderStatus.PENDING]: { text: "待支付", color: "orange" },
    [OrderStatus.PAID]: { text: "已支付", color: "green" },
    [OrderStatus.CANCELLED]: { text: "已取消", color: "gray" },
    [OrderStatus.REFUNDED]: { text: "已退款", color: "red" },
    [OrderStatus.DELIVERED]: { text: "已发货", color: "blue" },
  };

// 支付方式显示映射
export const PAYMENT_METHOD_MAP: Record<
  string,
  { text: string; icon: string }
> = {
  [PaymentMethod.ALIPAY]: { text: "支付宝", icon: "alipay" },
  [PaymentMethod.WECHAT]: { text: "微信支付", icon: "wechat" },
  [PaymentMethod.BANK_CARD]: { text: "银行卡", icon: "credit-card" },
  [PaymentMethod.WALLET]: { text: "钱包支付", icon: "wallet" },
};
