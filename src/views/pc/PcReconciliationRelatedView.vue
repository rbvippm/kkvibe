<script setup lang="ts">
import WfPagePathMenu from '../../components/wireframe/WfPagePathMenu.vue'
import '../../styles/pc-wireframe.css'

const fieldChanges = [
  {
    id: 1,
    item: '账变增加金额',
    newName: '账变人工加分',
    scope: '平台对账、渠道对账',
    note: '不计入充值统计的人工加分账变',
  },
  {
    id: 2,
    item: '账变减少金额',
    newName: '账变人工减分',
    scope: '平台对账、渠道对账',
    note: '不计入充值统计的人工减分账变',
  },
  {
    id: 3,
    item: '充值加币 / 充值减币',
    newName: '保持不变',
    scope: '平台对账、渠道对账',
    note: '已计入充值统计，无需新增对账项',
  },
]

const relatedPages = [
  {
    id: 1,
    system: 'BI 后台',
    path: '账单管理-平台对账',
    desc: '平台维度汇总对账，展示账变人工加分 / 减分等新字段。',
  },
  {
    id: 2,
    system: 'BI 后台',
    path: '账单管理-渠道对账',
    desc: '按渠道汇总对账，字段与平台对账保持一致。',
  },
  {
    id: 3,
    system: '渠道后台',
    path: '账单管理-渠道对账详情',
    desc: '渠道侧查看明细对账，含账变方式细分后的统计项。',
  },
]
</script>

<template>
  <div class="pc-wireframe-page reconciliation-page">
    <WfPagePathMenu />

    <h1 class="reconciliation-page__title">对账相关</h1>

    <div class="wf-notice reconciliation-page__notice">
      <span class="wf-notice-label">v2 调整说明：</span>
      账变方式细化后，对账报表中原「账变增加金额 / 账变减少金额」分别更名为「账变人工加分 / 账变人工减分」；充值加币、充值减币仍沿用原逻辑，已计入充值统计。
    </div>

    <section class="wf-block">
      <h2 class="reconciliation-page__section-title">字段映射</h2>
      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">原对账项</th>
              <th class="wf-th">v2 对账项</th>
              <th class="wf-th">适用范围</th>
              <th class="wf-th">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in fieldChanges" :key="row.id">
              <td class="wf-td wf-td--center">{{ row.id }}</td>
              <td class="wf-td">{{ row.item }}</td>
              <td class="wf-td">{{ row.newName }}</td>
              <td class="wf-td">{{ row.scope }}</td>
              <td class="wf-td">{{ row.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="wf-block">
      <h2 class="reconciliation-page__section-title">关联页面</h2>
      <div class="wf-table-wrap">
        <table class="wf-table">
          <thead>
            <tr>
              <th class="wf-th wf-th--no">编号</th>
              <th class="wf-th">所属系统</th>
              <th class="wf-th">页面路径</th>
              <th class="wf-th">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in relatedPages" :key="row.id">
              <td class="wf-td wf-td--center">{{ row.id }}</td>
              <td class="wf-td">{{ row.system }}</td>
              <td class="wf-td">{{ row.path }}</td>
              <td class="wf-td">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reconciliation-page__title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pc-text, #333);
}

.reconciliation-page__notice {
  margin-bottom: 16px;
}

.reconciliation-page__section-title {
  margin: 0 0 12px;
  padding-left: 10px;
  border-left: 3px solid var(--pc-primary, #1890ff);
  font-size: 15px;
  font-weight: 600;
  color: var(--pc-text, #333);
}
</style>
