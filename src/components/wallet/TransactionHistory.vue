<template>
  <div class="transaction-history">
    <div class="history-header">
      <h3>交易记录</h3>
      <a-button size="small" @click="refreshTransactions">
        <reload-outlined />
        刷新
      </a-button>
    </div>

    <div class="history-filter">
      <a-select
        v-model:value="filterType"
        style="width: 120px"
        placeholder="交易类型"
        allowClear
        size="small"
      >
        <a-select-option :value="1">充值</a-select-option>
        <a-select-option :value="2">消费</a-select-option>
        <a-select-option :value="3">退款</a-select-option>
        <a-select-option :value="4">转账</a-select-option>
      </a-select>
      <a-range-picker
        v-model:value="dateRange"
        style="width: 200px; margin-left: 8px"
        placeholder="['开始日期', '结束日期']"
        size="small"
      />
      <a-button size="small" style="margin-left: 8px" @click="loadTransactions">
        查询
      </a-button>
    </div>

    <div class="history-list">
      <a-spin :spinning="loading">
        <div v-if="transactions.length === 0" class="empty-state">
          <a-empty description="暂无交易记录" />
        </div>

        <div v-else class="transaction-items">
          <div
            v-for="transaction in transactions"
            :key="transaction.transactionId"
            class="transaction-item"
          >
            <div class="transaction-left">
              <div
                class="transaction-icon"
                :class="getTypeClass(transaction.transactionType)"
              >
                <component
                  :is="getTransactionIcon(transaction.transactionType)"
                />
              </div>
              <div class="transaction-info">
                <div class="transaction-type">
                  {{ getTransactionTypeName(transaction.transactionType) }}
                </div>
                <div class="transaction-desc">
                  {{ transaction.transactionDescription || "无描述" }}
                </div>
                <div class="transaction-time">
                  {{ formatTime(transaction.createdTime) }}
                </div>
              </div>
            </div>

            <div class="transaction-right">
              <div
                class="transaction-amount"
                :class="getAmountClass(transaction.transactionAmount)"
              >
                {{ transaction.transactionAmount > 0 ? "+" : "" }}¥{{
                  Math.abs(transaction.transactionAmount).toFixed(2)
                }}
              </div>
              <div class="transaction-balance">
                余额: ¥{{ transaction.balanceAfter?.toFixed(2) || "0.00" }}
              </div>
              <div class="transaction-status">
                <a-tag
                  :color="getStatusColor(transaction.transactionStatus)"
                  size="small"
                >
                  {{ getTransactionStatusName(transaction.transactionStatus) }}
                </a-tag>
              </div>
              <div class="transaction-payment" v-if="transaction.paymentMethod">
                {{ getPaymentMethodName(transaction.paymentMethod) }}
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <div v-if="hasMore" class="load-more">
      <a-button @click="loadMore" :loading="loadingMore"> 加载更多 </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ReloadOutlined } from "@ant-design/icons-vue";
import { WalletAPI, type WalletTransactionVO } from "@/api/wallet";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RetweetOutlined,
  UndoOutlined,
} from "@ant-design/icons-vue";

interface Props {
  userId?: number;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
});

// 交易记录
const transactions = ref<WalletTransactionVO[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const currentPage = ref(1);

// 筛选条件
const filterType = ref<number>();
const dateRange = ref<any[]>([]);

// 加载交易记录
const loadTransactions = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
    currentPage.value++;
  } else {
    loading.value = true;
    currentPage.value = 1;
    transactions.value = [];
  }

  try {
    const response = await WalletAPI.getTransactions({
      pageNum: currentPage.value,
      pageSize: props.limit,
    });

    if (response.data) {
      if (isLoadMore) {
        transactions.value.push(...response.data);
      } else {
        transactions.value = response.data;
      }

      hasMore.value = response.data.length >= props.limit;
    }
  } catch (error) {
    console.error("加载交易记录失败:", error);
  } finally {
    if (isLoadMore) {
      loadingMore.value = false;
    } else {
      loading.value = false;
    }
  }
};

// 加载更多
const loadMore = () => {
  loadTransactions(true);
};

// 刷新交易记录
const refreshTransactions = () => {
  filterType.value = undefined;
  dateRange.value = [];
  loadTransactions();
};

// 获取交易类型名称
const getTransactionTypeName = (type: number) => {
  const map: Record<number, string> = {
    1: "充值",
    2: "消费",
    3: "退款",
    4: "转账",
  };
  return map[type] || "未知";
};

// 获取交易类型图标
const getTransactionIcon = (type: number) => {
  const map: Record<number, any> = {
    1: ArrowUpOutlined,
    2: ArrowDownOutlined,
    3: UndoOutlined,
    4: RetweetOutlined,
  };
  return map[type] || ArrowUpOutlined;
};

// 获取交易类型样式类
const getTypeClass = (type: number) => {
  const map: Record<number, string> = {
    1: "type-recharge",
    2: "type-consume",
    3: "type-refund",
    4: "type-transfer",
  };
  return map[type] || "type-default";
};

// 获取金额样式类
const getAmountClass = (amount: number) => {
  return amount > 0 ? "amount-income" : "amount-expense";
};

// 获取交易状态名称
const getTransactionStatusName = (status: number) => {
  const map: Record<number, string> = {
    0: "处理中",
    1: "成功",
    2: "失败",
  };
  return map[status] || "未知";
};

// 获取支付方式中文名称
const getPaymentMethodName = (method: string) => {
  const map: Record<string, string> = {
    alipay: "支付宝",
    wechat: "微信支付",
    bank_card: "银行卡",
    wallet: "钱包余额",
    WALLET: "钱包余额",
  };
  return map[method] || method;
};

// 获取交易状态颜色
const getStatusColor = (status: number) => {
  const map: Record<number, string> = {
    0: "orange",
    1: "green",
    2: "red",
  };
  return map[status] || "default";
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return "";

  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (days === 1) {
    return (
      "昨天 " +
      date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.transaction-history {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  color: #262626;
}

.history-filter {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.history-list {
  min-height: 200px;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.transaction-items {
  max-height: 400px;
  overflow-y: auto;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.type-recharge {
  background: #52c41a;
}

.type-consume {
  background: #ff4d4f;
}

.type-refund {
  background: #faad14;
}

.type-transfer {
  background: #1890ff;
}

.type-default {
  background: #8c8c8c;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-type {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.transaction-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-time {
  font-size: 12px;
  color: #999;
}

.transaction-right {
  text-align: right;
  flex-shrink: 0;
}

.transaction-amount {
  font-weight: 500;
  margin-bottom: 4px;
}

.amount-income {
  color: #52c41a;
}

.amount-expense {
  color: #ff4d4f;
}

.transaction-balance {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.transaction-status {
  margin-bottom: 4px;
}

.transaction-payment {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}
</style>
