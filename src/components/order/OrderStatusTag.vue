<template>
  <a-tag :color="statusColor" @click="$emit('click')">
    <component :is="statusIcon" v-if="showIcon" style="margin-right: 4px" />
    {{ statusText }}
  </a-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons-vue";

interface Props {
  status: number;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
});

defineEmits<{
  click: [];
}>();

// 状态文本映射
const statusMap = {
  1: { text: "待支付", color: "orange", icon: ClockCircleOutlined },
  2: { text: "已支付", color: "green", icon: CheckCircleOutlined },
  3: { text: "已取消", color: "gray", icon: CloseCircleOutlined },
  4: { text: "已退款", color: "red", icon: UndoOutlined },
  5: { text: "已发货", color: "blue", icon: CarOutlined },
};

// 状态文本
const statusText = computed(() => {
  return statusMap[props.status as keyof typeof statusMap]?.text || "未知";
});

// 状态颜色
const statusColor = computed(() => {
  return statusMap[props.status as keyof typeof statusMap]?.color || "default";
});

// 状态图标
const statusIcon = computed(() => {
  return (
    statusMap[props.status as keyof typeof statusMap]?.icon ||
    ClockCircleOutlined
  );
});
</script>

<style scoped>
.ant-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.ant-tag:hover {
  transform: scale(1.05);
}
</style>
