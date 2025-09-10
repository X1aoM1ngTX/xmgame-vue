import myAxios from "@/request";

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
    return myAxios.get("/api/wallet/info");
  }

  // 钱包充值
  static recharge(data: WalletRechargeRequest) {
    return myAxios.post("/api/wallet/recharge", data);
  }

  // 钱包消费
  static consume(data: WalletConsumeRequest) {
    return myAxios.post("/api/wallet/consume", data);
  }

  // 获取钱包余额
  static getBalance() {
    return myAxios.get("/api/wallet/balance");
  }

  // 获取交易记录
  static getTransactions(params?: { pageNum?: number; pageSize?: number }) {
    return myAxios.get("/api/wallet/transactions", { params });
  }

  // 获取所有交易记录
  static getAllTransactions() {
    return myAxios.get("/api/wallet/transactions/all");
  }

  // 转账
  static transfer(toUserId: number, amount: number, description?: string) {
    const data = { toUserId, amount, description };
    return myAxios.post("/api/wallet/transfer", data);
  }

  // 冻结钱包
  static freezeWallet() {
    return myAxios.post("/api/wallet/freeze");
  }

  // 解冻钱包
  static unfreezeWallet() {
    return myAxios.post("/api/wallet/unfreeze");
  }

  // 检查钱包状态
  static checkWalletStatus() {
    return myAxios.get("/api/wallet/status");
  }
}
