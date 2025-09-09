<template>
  <div class="wallet-container">
    <!-- 钱包信息卡片 -->
    <a-card class="wallet-info-card" :bordered="false">
      <div class="wallet-header">
        <div class="wallet-title">
          <wallet-outlined />
          <span>我的钱包</span>
        </div>
        <div class="wallet-status">
          <a-tag :color="walletInfo.walletStatus === 1 ? 'green' : 'red'">
            {{ walletInfo.walletStatus === 1 ? "正常" : "冻结" }}
          </a-tag>
        </div>
      </div>

      <div class="wallet-balance">
        <div class="balance-label">账户余额</div>
        <div class="balance-amount">
          ¥{{ walletInfo.walletBalance?.toFixed(2) || "0.00" }}
        </div>
      </div>

      <div class="wallet-actions">
        <a-button 
          type="primary" 
          @click="showRechargeModal"
          :disabled="walletInfo.walletStatus !== 1"
        >
          <plus-outlined />
          充值
        </a-button>
        <a-button
          @click="showTransferModal"
          :disabled="walletInfo.walletStatus !== 1"
        >
          <swap-outlined />
          转账
        </a-button>
        <a-button
          :type="walletInfo.walletStatus === 1 ? 'default' : 'primary'"
          @click="handleFreezeWallet"
          :loading="freezeLoading"
        >
          <lock-outlined v-if="walletInfo.walletStatus === 1" />
          <unlock-outlined v-else />
          {{ walletInfo.walletStatus === 1 ? "冻结" : "解冻" }}
        </a-button>
      </div>
    </a-card>

    <!-- 交易记录 -->
    <a-card class="transactions-card" :bordered="false" title="交易记录">
      <div class="transactions-filter">
        <a-select
          v-model:value="filterType"
          style="width: 120px"
          placeholder="交易类型"
          allowClear
        >
          <a-select-option :value="1">充值</a-select-option>
          <a-select-option :value="2">消费</a-select-option>
          <a-select-option :value="3">退款</a-select-option>
          <a-select-option :value="4">转账</a-select-option>
        </a-select>
        <a-range-picker
          v-model:value="dateRange"
          style="width: 240px; margin-left: 8px"
          placeholder="['开始日期', '结束日期']"
        />
        <a-button style="margin-left: 8px" @click="loadTransactions"
          >查询</a-button
        >
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="transactionId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'transactionType'">
            <a-tag :color="getTransactionTypeColor(record.transactionType)">
              {{ getTransactionTypeName(record.transactionType) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'transactionAmount'">
            <span
              :class="
                record.transactionAmount > 0
                  ? 'amount-income'
                  : 'amount-expense'
              "
            >
              {{ record.transactionAmount > 0 ? "+" : "" }}¥{{
                Math.abs(record.transactionAmount).toFixed(2)
              }}
            </span>
          </template>
          <template v-if="column.key === 'balanceAfter'">
            <span>¥{{ record.balanceAfter?.toFixed(2) || "0.00" }}</span>
          </template>
          <template v-if="column.key === 'transactionStatus'">
            <a-tag :color="getTransactionStatusColor(record.transactionStatus)">
              {{ getTransactionStatusName(record.transactionStatus) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'paymentMethod'">
            <span>{{ record.paymentMethod || "-" }}</span>
          </template>
          <template v-if="column.key === 'transactionDescription'">
            <span>{{ record.transactionDescription || "-" }}</span>
          </template>
          <template v-if="column.key === 'createdTime'">
            <span>{{ formatDateTime(record.createdTime) || "-" }}</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 充值弹窗 -->
    <a-modal
      v-model:open="rechargeModalVisible"
      title="钱包充值"
      @ok="handleRecharge"
      @cancel="resetRechargeForm"
      :confirmLoading="rechargeLoading"
    >
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="充值金额" required>
          <a-input-number
            v-model:value="rechargeForm.amount"
            :min="0.01"
            :precision="2"
            style="width: 100%"
            placeholder="请输入充值金额"
          />
        </a-form-item>
        <a-form-item label="支付方式" required>
          <a-select
            v-model:value="rechargeForm.paymentMethod"
            placeholder="请选择支付方式"
          >
            <a-select-option value="alipay">支付宝</a-select-option>
            <a-select-option value="wechat">微信支付</a-select-option>
            <a-select-option value="bank_card">银行卡</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea
            v-model:value="rechargeForm.description"
            :rows="3"
            placeholder="请输入充值备注（可选）"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 转账弹窗 -->
    <a-modal
      v-model:open="transferModalVisible"
      title="转账"
      @ok="handleTransfer"
      @cancel="resetTransferForm"
      :confirmLoading="transferLoading"
    >
      <a-form :model="transferForm" layout="vertical">
        <a-form-item label="转入用户ID" required>
          <a-input-number
            v-model:value="transferForm.toUserId"
            :min="1"
            style="width: 100%"
            placeholder="请输入转入用户ID"
          />
        </a-form-item>
        <a-form-item label="转账金额" required>
          <a-input-number
            v-model:value="transferForm.amount"
            :min="0.01"
            :max="walletInfo.walletBalance"
            :precision="2"
            style="width: 100%"
            placeholder="请输入转账金额"
          />
        </a-form-item>
        <a-form-item label="转账说明">
          <a-textarea
            v-model:value="transferForm.description"
            :rows="3"
            placeholder="请输入转账说明（可选）"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  WalletOutlined,
  PlusOutlined,
  SwapOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons-vue";
import {
  WalletAPI,
  type WalletVO,
  type WalletTransactionVO,
} from "@/api/wallet";
import type { TableProps } from "ant-design-vue";

// 钱包信息
const walletInfo = reactive<WalletVO>({
  walletId: 0,
  userId: 0,
  walletBalance: 0,
  walletStatus: 1,
  createdTime: "",
  updateTime: "",
});

// 交易记录
const transactions = ref<WalletTransactionVO[]>([]);

// 确保数据源始终是数组
const tableData = computed(() => {
  return Array.isArray(transactions.value) ? transactions.value : [];
});
const loading = ref(false);
const freezeLoading = ref(false);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 筛选条件
const filterType = ref<number>();
const dateRange = ref<any[]>([]);

// 充值相关
const rechargeModalVisible = ref(false);
const rechargeLoading = ref(false);
const rechargeForm = reactive({
  amount: 0,
  paymentMethod: "",
  description: "",
});

// 转账相关
const transferModalVisible = ref(false);
const transferLoading = ref(false);
const transferForm = reactive({
  toUserId: 0,
  amount: 0,
  description: "",
});

// 表格列
const columns = [
  {
    title: "交易类型",
    key: "transactionType",
    width: 100,
  },
  {
    title: "金额",
    key: "transactionAmount",
    width: 120,
  },
  {
    title: "余额",
    key: "balanceAfter",
    width: 120,
  },
  {
    title: "交易状态",
    key: "transactionStatus",
    width: 100,
  },
  {
    title: "支付方式",
    key: "paymentMethod",
    width: 100,
  },
  {
    title: "交易描述",
    key: "transactionDescription",
    ellipsis: true,
  },
  {
    title: "创建时间",
    key: "createdTime",
    width: 180,
  },
];

// 加载钱包信息
const loadWalletInfo = async () => {
  try {
    const response = await WalletAPI.getWalletInfo();
    if (response.data && response.data.data) {
      Object.assign(walletInfo, response.data.data);
    }
  } catch (error) {
    message.error("获取钱包信息失败");
  }
};

// 加载交易记录
const loadTransactions = async () => {
  loading.value = true;
  try {
    const response = await WalletAPI.getTransactions({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    });
    if (response.data && response.data.data) {
      transactions.value = response.data.data;
      pagination.total = response.data.data.length;
    }
  } catch (error) {
    message.error("获取交易记录失败");
  } finally {
    loading.value = false;
  }
};

// 显示充值弹窗
const showRechargeModal = () => {
  rechargeModalVisible.value = true;
};

// 重置充值表单
const resetRechargeForm = () => {
  rechargeForm.amount = 0;
  rechargeForm.paymentMethod = "";
  rechargeForm.description = "";
};

// 处理充值
const handleRecharge = async () => {
  if (!rechargeForm.amount || !rechargeForm.paymentMethod) {
    message.error("请填写必填项");
    return;
  }

  rechargeLoading.value = true;
  try {
    await WalletAPI.recharge(rechargeForm);
    message.success("充值成功");
    rechargeModalVisible.value = false;
    resetRechargeForm();
    loadWalletInfo();
    loadTransactions();
  } catch (error) {
    message.error("充值失败");
  } finally {
    rechargeLoading.value = false;
  }
};

// 显示转账弹窗
const showTransferModal = () => {
  transferModalVisible.value = true;
};

// 重置转账表单
const resetTransferForm = () => {
  transferForm.toUserId = 0;
  transferForm.amount = 0;
  transferForm.description = "";
};

// 处理转账
const handleTransfer = async () => {
  if (!transferForm.toUserId || !transferForm.amount) {
    message.error("请填写必填项");
    return;
  }

  if (transferForm.amount > walletInfo.walletBalance) {
    message.error("转账金额不能超过余额");
    return;
  }

  transferLoading.value = true;
  try {
    await WalletAPI.transfer(transferForm);
    message.success("转账成功");
    transferModalVisible.value = false;
    resetTransferForm();
    loadWalletInfo();
    loadTransactions();
  } catch (error) {
    message.error("转账失败");
  } finally {
    transferLoading.value = false;
  }
};

// 处理冻结/解冻钱包
const handleFreezeWallet = async () => {
  freezeLoading.value = true;
  try {
    if (walletInfo.walletStatus === 1) {
      await WalletAPI.freezeWallet();
      message.success("钱包已冻结");
    } else {
      await WalletAPI.unfreezeWallet();
      message.success("钱包已解冻");
    }
    loadWalletInfo();
  } catch (error) {
    message.error("操作失败");
  } finally {
    freezeLoading.value = false;
  }
};

// 处理表格变化
const handleTableChange: TableProps["onChange"] = (pag) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
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

// 获取交易类型颜色
const getTransactionTypeColor = (type: number) => {
  const map: Record<number, string> = {
    1: "green",
    2: "red",
    3: "orange",
    4: "blue",
  };
  return map[type] || "default";
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

// 获取交易状态颜色
const getTransactionStatusColor = (status: number) => {
  const map: Record<number, string> = {
    0: "orange",
    1: "green",
    2: "red",
  };
  return map[status] || "default";
};

// 格式化日期时间
const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return "";
  
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return dateTime;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateTime;
  }
};

onMounted(() => {
  loadWalletInfo();
  loadTransactions();
});
</script>

<style scoped>
.wallet-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.wallet-info-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.wallet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
}

.wallet-balance {
  text-align: center;
  margin-bottom: 24px;
}

.balance-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
}

.wallet-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.transactions-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transactions-filter {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.amount-income {
  color: #52c41a;
  font-weight: 500;
}

.amount-expense {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
