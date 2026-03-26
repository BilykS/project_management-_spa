<template>
  <div class="projects-view">
    <header class="page-header">
      <div>
        <h1 class="page-header__title">Проекти</h1>
        <p class="page-header__subtitle">Керуйте проектами та відстежуйте прогрес</p>
      </div>
    </header>

    <main class="page-content">
      <TaskStatusChart />
      <ProjectsTable />
    </main>
  </div>
</template>

<script setup lang="ts">
import ProjectsTable   from '@/components/projects/ProjectsTable.vue'
import TaskStatusChart from '@/components/projects/TaskStatusChart.vue'
</script>

<style scoped lang="scss">
.projects-view {
  @include flex-column;
  min-height: 100vh;
  background: $color-bg-secondary;
}

.page-header {
  @include flex-between;
  padding: $spacing-6 $spacing-8;
  background: $color-bg-primary;
  border-bottom: 1px solid $color-border;

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-top: $spacing-1;
  }
}

.page-content {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-6 $spacing-8;
  flex: 1;
}
</style>
