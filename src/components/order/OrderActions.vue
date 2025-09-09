<template>
  <div class="order-actions">
    <a-button
      v-if="canPay"
      type="primary"
      size="small"
      @click="$emit('pay')"
      :loading="payLoading"
    >
      <credit-card-outlined />
      支付
    </a-button>

    <a-button
      v-if="canCancel"
      size="small"
      @click="$emit('cancel')"
      :loading="cancelLoading"
    >
      <close-outlined />
      取消
    </a-button>

    <a-button
      v-if="canRefund"
      size="small"
      @click="$emit('refund')"
      :loading="refundLoading"
    >
      <undo-outlined />
      退款
    </a-button>

    <a-button size="small" @click="$emit('view')">
      <eye-outlined />
      详情
    </a-button>

    <a-button
      v-if="canDelete"
      size="small"
      danger
      @click="$emit('delete')"
      :loading="deleteLoading"
    >
      <delete-outlined />
      删除
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  CreditCardOutlined,
  CloseOutlined,
  UndoOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

interface Props {
  status: number;
  paymentMethod?: string;
  payLoading?: boolean;
  cancelLoading?: boolean;
  refundLoading?: boolean;
  deleteLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  payLoading: false,
  cancelLoading: false,
  refundLoading: false,
  deleteLoading: false,
});

defineEmits<{
  pay: [];
  cancel: [];
  refund: [];
  view: [];
  delete: [];
}>();

// 是否可以支付
const canPay = computed(() => {
  return props.status === 1; // 待支付状态
});

// 是否可以取消
const canCancel = computed(() => {
  return props.status === 1; // 待支付状态可以取消
});

// 是否可以退款
const canRefund = computed(() => {
  return props.status === 2 && props.paymentMethod === "wallet"; // 已支付且使用钱包支付可以退款
});

// 是否可以删除
const canDelete = computed(() => {
  return [3, 4].includes(props.status); // 已取消或已退款可以删除
});
</script>

<style scoped>
.order-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.order-actions :deep(.ant-btn) {
  font-size: 12px;
  padding: 2px 8px;
  height: 24px;
}
</style>
