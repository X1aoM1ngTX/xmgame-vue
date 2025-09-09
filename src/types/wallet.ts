export interface Wallet {
  walletId: number;
  userId: number;
  walletBalance: number;
  walletStatus: number;
  createdTime: string;
  updateTime: string;
}

export interface WalletTransaction {
  transactionId: number;
  userId: number;
  transactionType: number;
  transactionAmount: number;
  balanceAfter: number;
  transactionDescription?: string;
  orderId?: number;
  transactionStatus: number;
  paymentMethod?: string;
  thirdPartyTransactionId?: string;
  createdTime: string;
  updateTime: string;
}

export interface WalletRechargeRequest {
  amount: number;
  paymentMethod: string;
  description?: string;
  thirdPartyTransactionId?: string;
}

export interface WalletConsumeRequest {
  amount: number;
  description: string;
  orderId?: number;
}

export interface WalletTransferRequest {
  toUserId: number;
  amount: number;
  description?: string;
}

export interface WalletVO {
  walletId: number;
  userId: number;
  walletBalance: number;
  walletStatus: number;
  createdTime: string;
  updateTime: string;
}

export interface WalletTransactionVO {
  transactionId: number;
  userId: number;
  transactionType: number;
  transactionAmount: number;
  balanceAfter: number;
  transactionDescription?: string;
  orderId?: number;
  transactionStatus: number;
  paymentMethod?: string;
  thirdPartyTransactionId?: string;
  createdTime: string;
  updateTime: string;
  typeName?: string;
  statusName?: string;
}

// 交易类型枚举
export enum TransactionType {
  RECHARGE = 1,
  CONSUME = 2,
  REFUND = 3,
  TRANSFER = 4,
}

// 交易状态枚举
export enum TransactionStatus {
  PROCESSING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

// 钱包状态枚举
export enum WalletStatus {
  FROZEN = 0,
  NORMAL = 1,
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = "alipay",
  WECHAT = "wechat",
  BANK_CARD = "bank_card",
  WALLET = "wallet",
}
