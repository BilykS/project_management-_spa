<template>
  <div class="chart-card">
    <p class="chart-card__title">Завдання за статусом проекту</p>

    <div v-if="hasData" class="chart-card__body">
      <div class="chart-card__canvas">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
      <ul class="chart-card__legend">
        <li v-for="(item, i) in legendItems" :key="item.label" class="legend-item">
          <span class="legend-item__dot" :style="{ background: COLORS[i] }" />
          <span class="legend-item__label">{{ item.label }}</span>
          <span class="legend-item__count">{{ item.count }}</span>
        </li>
      </ul>
    </div>

    <p v-else class="chart-card__empty">Завдань поки немає</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useProjectsStore } from '@/stores/projects.store'

Chart.register(ArcElement, DoughnutController, Tooltip)

const STATUSES = ['active', 'completed', 'on-hold'] as const
const LABELS   = ['Active', 'Completed', 'On Hold']
const COLORS   = ['#3b82f6', '#10b981', '#94a3b8']

const projectsStore = useProjectsStore()

const counts  = computed(() => STATUSES.map(s => projectsStore.taskStatsByStatus[s] ?? 0))
const hasData = computed(() => counts.value.some(c => c > 0))

const chartData = computed(() => ({
  labels: LABELS,
  datasets: [{
    data:            counts.value,
    backgroundColor: COLORS,
    borderWidth:     0,
    hoverOffset:     4,
  }],
}))

const chartOptions = {
  responsive:          true,
  maintainAspectRatio: true,
  cutout:              '65%',
  plugins: {
    legend:  { display: false },
    tooltip: { enabled: true },
  },
}

const legendItems = computed(() =>
  LABELS.map((label, i) => ({ label, count: counts.value[i] }))
)
</script>

<style scoped lang="scss">
.chart-card {
  @include card;
  padding: $spacing-4 $spacing-5;
  align-self: flex-start;

  &__title {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: $spacing-3;
  }

  &__body {
    @include flex-start;
    align-items: center;
    gap: $spacing-5;
  }

  &__canvas {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
  }

  &__legend {
    @include flex-column;
    gap: $spacing-2;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__empty {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }
}

.legend-item {
  @include flex-start;
  gap: $spacing-2;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: $radius-full;
    flex-shrink: 0;
  }

  &__label {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    flex: 1;
  }

  &__count {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
  }
}
</style>
