<template>
  <div class="wallet-balance">
    <div class="balance-header">
      <wallet-outlined class="wallet-icon" />
      <span class="balance-title">账户余额</span>
    </div>
    <div class="balance-amount">
      <span class="currency">¥</span>
      <span class="amount">{{ formattedBalance }}</span>
    </div>
    <div class="balance-status">
      <a-tag :color="statusColor">
        {{ statusText }}
      </a-tag>
    </div>
    <div v-if="showActions" class="balance-actions">
      <a-button size="small" type="primary" @click="$emit('recharge')">
        <plus-outlined />
        充值
      </a-button>
      <a-button size="small" @click="$emit('transfer')" :disabled="isFrozen">
        <swap-outlined />
        转账
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  WalletOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons-vue";

interface Props {
  balance?: number;
  status?: number;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  balance: 0,
  status: 1,
  showActions: true,
});

defineEmits<{
  recharge: [];
  transfer: [];
}>();

// 格式化余额
const formattedBalance = computed(() => {
  return props.balance?.toFixed(2) || "0.00";
});

// 状态文本
const statusText = computed(() => {
  return props.status === 1 ? "正常" : "冻结";
});

// 状态颜色
const statusColor = computed(() => {
  return props.status === 1 ? "green" : "red";
});

// 是否冻结
const isFrozen = computed(() => {
  return props.status !== 1;
});
</script>

<style scoped>
.wallet-balance {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.wallet-icon {
  font-size: 20px;
}

.balance-title {
  font-size: 14px;
  opacity: 0.9;
}

.balance-amount {
  margin-bottom: 12px;
}

.currency {
  font-size: 20px;
  font-weight: 300;
}

.amount {
  font-size: 32px;
  font-weight: 600;
}

.balance-status {
  margin-bottom: 16px;
}

.balance-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.balance-actions :deep(.ant-btn) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.balance-actions :deep(.ant-btn:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.balance-actions :deep(.ant-btn:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
}
</style>
