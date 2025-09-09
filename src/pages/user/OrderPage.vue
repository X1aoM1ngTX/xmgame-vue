<template>
  <div class="order-container">
    <!-- 订单统计卡片 -->
    <div class="order-stats">
      <a-card :bordered="false" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon pending">
            <clock-circle-outlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStats.pending || 0 }}</div>
            <div class="stat-label">待支付</div>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon paid">
            <check-circle-outlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStats.paid || 0 }}</div>
            <div class="stat-label">已支付</div>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon delivered">
            <car-outlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStats.delivered || 0 }}</div>
            <div class="stat-label">已发货</div>
          </div>
        </div>
      </a-card>

      <a-card :bordered="false" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon cancelled">
            <close-circle-outlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ orderStats.cancelled || 0 }}</div>
            <div class="stat-label">已取消</div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 订单列表 -->
    <a-card :bordered="false" title="我的订单">
      <div class="order-filter">
        <a-select
          v-model:value="filterStatus"
          style="width: 120px"
          placeholder="订单状态"
          allowClear
        >
          <a-select-option :value="1">待支付</a-select-option>
          <a-select-option :value="2">已支付</a-select-option>
          <a-select-option :value="3">已取消</a-select-option>
          <a-select-option :value="4">已退款</a-select-option>
          <a-select-option :value="5">已发货</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索订单号或游戏名称"
          style="width: 240px; margin-left: 8px"
          @search="loadOrders"
        />
        <a-range-picker
          v-model:value="dateRange"
          style="width: 240px; margin-left: 8px"
          placeholder="['开始日期', '结束日期']"
        />
        <a-button style="margin-left: 8px" @click="loadOrders">查询</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="orderId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'orderStatus'">
            <a-tag :color="getOrderStatusColor(record.orderStatus)">
              {{ getOrderStatusText(record.orderStatus) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'finalPrice'">
            <span class="order-price"
              >¥{{ record.finalPrice?.toFixed(2) || "0.00" }}</span
            >
          </template>
          <template v-if="column.key === 'paymentMethod'">
            <span>{{ getPaymentMethodText(record.paymentMethod) || "-" }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-button
                v-if="record.orderStatus === 1"
                type="primary"
                size="small"
                @click="showPayModal(record)"
              >
                支付
              </a-button>
              <a-button
                v-if="record.orderStatus === 1"
                size="small"
                @click="showCancelModal(record)"
              >
                取消
              </a-button>
              <a-button
                v-if="record.orderStatus === 2"
                size="small"
                @click="showRefundModal(record)"
              >
                退款
              </a-button>
              <a-button size="small" @click="showOrderDetail(record)">
                详情
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 支付弹窗 -->
    <a-modal
      v-model:open="payModalVisible"
      title="支付订单"
      @ok="handlePay"
      @cancel="resetPayForm"
      :confirmLoading="payLoading"
    >
      <div v-if="currentOrder" class="pay-info">
        <div class="pay-item">
          <span class="label">订单号：</span>
          <span>{{ currentOrder.orderNo }}</span>
        </div>
        <div class="pay-item">
          <span class="label">商品名称：</span>
          <span>{{ currentOrder.gameName }}</span>
        </div>
        <div class="pay-item">
          <span class="label">支付金额：</span>
          <span class="price"
            >¥{{ currentOrder.finalPrice?.toFixed(2) || "0.00" }}</span
          >
        </div>
      </div>

      <a-form :model="payForm" layout="vertical">
        <a-form-item label="支付方式" required>
          <a-select
            v-model:value="payForm.paymentMethod"
            placeholder="请选择支付方式"
          >
            <a-select-option value="wallet">钱包支付</a-select-option>
            <a-select-option value="alipay">支付宝</a-select-option>
            <a-select-option value="wechat">微信支付</a-select-option>
            <a-select-option value="bank_card">银行卡</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 取消订单弹窗 -->
    <a-modal
      v-model:open="cancelModalVisible"
      title="取消订单"
      @ok="handleCancel"
      @cancel="resetCancelForm"
      :confirmLoading="cancelLoading"
    >
      <div v-if="currentOrder" class="cancel-info">
        <div class="cancel-item">
          <span class="label">订单号：</span>
          <span>{{ currentOrder.orderNo }}</span>
        </div>
        <div class="cancel-item">
          <span class="label">商品名称：</span>
          <span>{{ currentOrder.gameName }}</span>
        </div>
      </div>

      <a-form :model="cancelForm" layout="vertical">
        <a-form-item label="取消原因" required>
          <a-textarea
            v-model:value="cancelForm.reason"
            :rows="3"
            placeholder="请输入取消原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 退款弹窗 -->
    <a-modal
      v-model:open="refundModalVisible"
      title="申请退款"
      @ok="handleRefund"
      @cancel="resetRefundForm"
      :confirmLoading="refundLoading"
    >
      <div v-if="currentOrder" class="refund-info">
        <div class="refund-item">
          <span class="label">订单号：</span>
          <span>{{ currentOrder.orderNo }}</span>
        </div>
        <div class="refund-item">
          <span class="label">商品名称：</span>
          <span>{{ currentOrder.gameName }}</span>
        </div>
        <div class="refund-item">
          <span class="label">退款金额：</span>
          <span class="price"
            >¥{{ currentOrder.finalPrice?.toFixed(2) || "0.00" }}</span
          >
        </div>
      </div>

      <a-form :model="refundForm" layout="vertical">
        <a-form-item label="退款原因" required>
          <a-textarea
            v-model:value="refundForm.reason"
            :rows="3"
            placeholder="请输入退款原因"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="订单详情"
      :footer="null"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span>{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单状态：</span>
            <a-tag :color="getOrderStatusColor(currentOrder.orderStatus)">
              {{ getOrderStatusText(currentOrder.orderStatus) }}
            </a-tag>
          </div>
          <div class="detail-item">
            <span class="label">创建时间：</span>
            <span>{{ currentOrder.createdTime }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <div class="detail-item">
            <span class="label">游戏名称：</span>
            <span>{{ currentOrder.gameName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">原价：</span>
            <span>¥{{ currentOrder.originalPrice?.toFixed(2) || "0.00" }}</span>
          </div>
          <div class="detail-item">
            <span class="label">实付金额：</span>
            <span class="price"
              >¥{{ currentOrder.finalPrice?.toFixed(2) || "0.00" }}</span
            >
          </div>
        </div>

        <div class="detail-section">
          <h4>支付信息</h4>
          <div class="detail-item">
            <span class="label">支付方式：</span>
            <span>{{
              getPaymentMethodText(currentOrder.paymentMethod) || "-"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">支付时间：</span>
            <span>{{ currentOrder.paymentTime || "-" }}</span>
          </div>
        </div>

        <div v-if="currentOrder.cancelReason" class="detail-section">
          <h4>取消信息</h4>
          <div class="detail-item">
            <span class="label">取消原因：</span>
            <span>{{ currentOrder.cancelReason }}</span>
          </div>
        </div>

        <div v-if="currentOrder.refundReason" class="detail-section">
          <h4>退款信息</h4>
          <div class="detail-item">
            <span class="label">退款原因：</span>
            <span>{{ currentOrder.refundReason }}</span>
          </div>
          <div class="detail-item">
            <span class="label">退款时间：</span>
            <span>{{ currentOrder.refundTime || "-" }}</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { OrderAPI, type OrderVO } from "@/api/order";
import type { TableProps } from "ant-design-vue";
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "@/types/order";

// 订单统计
const orderStats = reactive({
  pending: 0,
  paid: 0,
  delivered: 0,
  cancelled: 0,
});

// 订单列表
const orders = ref<OrderVO[]>([]);

// 确保数据源始终是数组
const tableData = computed(() => {
  return Array.isArray(orders.value) ? orders.value : [];
});
const loading = ref(false);

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
const filterStatus = ref<number>();
const searchKeyword = ref("");
const dateRange = ref<any[]>([]);

// 支付相关
const payModalVisible = ref(false);
const payLoading = ref(false);
const payForm = reactive({
  paymentMethod: "",
});

// 取消相关
const cancelModalVisible = ref(false);
const cancelLoading = ref(false);
const cancelForm = reactive({
  reason: "",
});

// 退款相关
const refundModalVisible = ref(false);
const refundLoading = ref(false);
const refundForm = reactive({
  reason: "",
});

// 详情相关
const detailModalVisible = ref(false);
const currentOrder = ref<OrderVO>();

// 表格列
const columns = [
  {
    title: "订单号",
    key: "orderNo",
    width: 180,
  },
  {
    title: "游戏名称",
    key: "gameName",
    ellipsis: true,
  },
  {
    title: "订单状态",
    key: "orderStatus",
    width: 100,
  },
  {
    title: "支付金额",
    key: "finalPrice",
    width: 120,
  },
  {
    title: "支付方式",
    key: "paymentMethod",
    width: 100,
  },
  {
    title: "创建时间",
    key: "createdTime",
    width: 180,
  },
  {
    title: "操作",
    key: "action",
    width: 200,
    fixed: "right",
  },
];

// 加载订单列表
const loadOrders = async () => {
  loading.value = true;
  try {
    const response = await OrderAPI.getUserOrders();
    if (response.data && response.data.data) {
      orders.value = response.data.data;
      calculateOrderStats();
    }
  } catch (error) {
    message.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

// 计算订单统计
const calculateOrderStats = () => {
  const stats = {
    pending: 0,
    paid: 0,
    delivered: 0,
    cancelled: 0,
  };

  orders.value.forEach((order) => {
    switch (order.orderStatus) {
      case 1:
        stats.pending++;
        break;
      case 2:
        stats.paid++;
        break;
      case 5:
        stats.delivered++;
        break;
      case 3:
      case 4:
        stats.cancelled++;
        break;
    }
  });

  Object.assign(orderStats, stats);
};

// 显示支付弹窗
const showPayModal = (order: OrderVO) => {
  currentOrder.value = order;
  payModalVisible.value = true;
};

// 重置支付表单
const resetPayForm = () => {
  payForm.paymentMethod = "";
  currentOrder.value = undefined;
};

// 处理支付
const handlePay = async () => {
  if (!payForm.paymentMethod || !currentOrder.value) {
    message.error("请选择支付方式");
    return;
  }

  payLoading.value = true;
  try {
    await OrderAPI.payOrder(currentOrder.value.orderId, payForm.paymentMethod);
    message.success("支付成功");
    payModalVisible.value = false;
    resetPayForm();
    loadOrders();
  } catch (error) {
    message.error("支付失败");
  } finally {
    payLoading.value = false;
  }
};

// 显示取消弹窗
const showCancelModal = (order: OrderVO) => {
  currentOrder.value = order;
  cancelModalVisible.value = true;
};

// 重置取消表单
const resetCancelForm = () => {
  cancelForm.reason = "";
  currentOrder.value = undefined;
};

// 处理取消
const handleCancel = async () => {
  if (!cancelForm.reason || !currentOrder.value) {
    message.error("请输入取消原因");
    return;
  }

  cancelLoading.value = true;
  try {
    await OrderAPI.cancelOrder(currentOrder.value.orderId);
    message.success("订单已取消");
    cancelModalVisible.value = false;
    resetCancelForm();
    loadOrders();
  } catch (error) {
    message.error("取消失败");
  } finally {
    cancelLoading.value = false;
  }
};

// 显示退款弹窗
const showRefundModal = (order: OrderVO) => {
  currentOrder.value = order;
  refundModalVisible.value = true;
};

// 重置退款表单
const resetRefundForm = () => {
  refundForm.reason = "";
  currentOrder.value = undefined;
};

// 处理退款
const handleRefund = async () => {
  if (!refundForm.reason || !currentOrder.value) {
    message.error("请输入退款原因");
    return;
  }

  refundLoading.value = true;
  try {
    await OrderAPI.refundOrder(currentOrder.value.orderId, refundForm.reason);
    message.success("退款申请已提交");
    refundModalVisible.value = false;
    resetRefundForm();
    loadOrders();
  } catch (error) {
    message.error("退款失败");
  } finally {
    refundLoading.value = false;
  }
};

// 显示订单详情
const showOrderDetail = (order: OrderVO) => {
  currentOrder.value = order;
  detailModalVisible.value = true;
};

// 处理表格变化
const handleTableChange: TableProps["onChange"] = (pag) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  loadOrders();
};

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
  return ORDER_STATUS_MAP[status]?.text || "未知";
};

// 获取订单状态颜色
const getOrderStatusColor = (status: number) => {
  return ORDER_STATUS_MAP[status]?.color || "default";
};

// 获取支付方式文本
const getPaymentMethodText = (method?: string) => {
  return method ? PAYMENT_METHOD_MAP[method]?.text || method : "-";
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.pending {
  background: #faad14;
}

.stat-icon.paid {
  background: #52c41a;
}

.stat-icon.delivered {
  background: #1890ff;
}

.stat-icon.cancelled {
  background: #ff4d4f;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.order-filter {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.order-price {
  color: #1890ff;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pay-info,
.cancel-info,
.refund-info {
  margin-bottom: 16px;
}

.pay-item,
.cancel-item,
.refund-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.pay-item:last-child,
.cancel-item:last-child,
.refund-item:last-child {
  border-bottom: none;
}

.price {
  color: #ff4d4f;
  font-weight: 500;
}

.order-detail {
  max-height: 400px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h4 {
  margin-bottom: 12px;
  color: #262626;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-item .label {
  color: #666;
}

.detail-item .price {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
