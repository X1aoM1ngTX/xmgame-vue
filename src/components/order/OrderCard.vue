<template>
  <div class="order-card" @click="$emit('click')">
    <div class="card-header">
      <div class="order-number">
        <span class="label">订单号：</span>
        <span class="value">{{ order.orderNo }}</span>
      </div>
      <order-status-tag :status="order.orderStatus" />
    </div>

    <div class="card-content">
      <div class="game-info">
        <div class="game-name">{{ order.gameName }}</div>
        <div class="order-price">
          ¥{{ order.finalPrice?.toFixed(2) || "0.00" }}
        </div>
      </div>

      <div class="order-meta">
        <div class="meta-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatTime(order.createdTime) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">支付方式：</span>
          <span class="value">{{
            getPaymentMethodText(order.paymentMethod) || "-"
          }}</span>
        </div>
      </div>
    </div>

    <div v-if="showActions" class="card-footer" @click.stop>
      <order-actions
        :status="order.orderStatus"
        :payment-method="order.paymentMethod"
        @pay="$emit('pay')"
        @cancel="$emit('cancel')"
        @refund="$emit('refund')"
        @view="$emit('view')"
        @delete="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type OrderVO } from "@/api/order";
import OrderStatusTag from "./OrderStatusTag.vue";
import OrderActions from "./OrderActions.vue";

interface Props {
  order: OrderVO;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

defineEmits<{
  click: [];
  pay: [];
  cancel: [];
  refund: [];
  view: [];
  delete: [];
}>();

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return "";

  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return (
      "今天 " +
      date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

// 获取支付方式文本
const getPaymentMethodText = (method?: string) => {
  const map: Record<string, string> = {
    alipay: "支付宝",
    wechat: "微信支付",
    bank_card: "银行卡",
    wallet: "钱包支付",
  };
  return method ? map[method] || method : "-";
};
</script>

<style scoped>
.order-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-number {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.order-number .label {
  color: #666;
}

.order-number .value {
  color: #262626;
  font-family: monospace;
  font-weight: 500;
}

.card-content {
  margin-bottom: 12px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.game-name {
  font-weight: 500;
  color: #262626;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-price {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
  margin-left: 12px;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.meta-item .label {
  color: #666;
}

.meta-item .value {
  color: #262626;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
