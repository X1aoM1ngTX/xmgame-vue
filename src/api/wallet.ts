import request from "@/request";

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

export class WalletAPI {
  // 获取钱包信息
  static getWalletInfo() {
    return request({
      url: "/api/wallet/info",
      method: "get",
    });
  }

  // 钱包充值
  static recharge(data: WalletRechargeRequest) {
    return request({
      url: "/api/wallet/recharge",
      method: "post",
      data,
    });
  }

  // 钱包消费
  static consume(data: WalletConsumeRequest) {
    return request({
      url: "/api/wallet/consume",
      method: "post",
      data,
    });
  }

  // 获取钱包余额
  static getBalance() {
    return request({
      url: "/api/wallet/balance",
      method: "get",
    });
  }

  // 获取交易记录
  static getTransactions(params?: { pageNum?: number; pageSize?: number }) {
    return request({
      url: "/api/wallet/transactions",
      method: "get",
      params,
    });
  }

  // 获取所有交易记录
  static getAllTransactions() {
    return request({
      url: "/api/wallet/transactions/all",
      method: "get",
    });
  }

  // 转账
  static transfer(data: {
    toUserId: number;
    amount: number;
    description?: string;
  }) {
    return request({
      url: "/api/wallet/transfer",
      method: "post",
      data,
    });
  }

  // 冻结钱包
  static freezeWallet() {
    return request({
      url: "/api/wallet/freeze",
      method: "post",
    });
  }

  // 解冻钱包
  static unfreezeWallet() {
    return request({
      url: "/api/wallet/unfreeze",
      method: "post",
    });
  }

  // 检查钱包状态
  static checkWalletStatus() {
    return request({
      url: "/api/wallet/status",
      method: "get",
    });
  }
}
