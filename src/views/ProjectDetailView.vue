<template>
  <div class="detail-view">

    <!-- Header -->
    <header class="page-header">
      <div class="page-header__left">
        <button class="btn-back" @click="router.push('/')">← Back</button>
        <div v-if="project" class="page-header__meta">
          <h1 class="page-header__title">{{ project.name }}</h1>
          <AppBadge :status="project.status" />
        </div>
      </div>

      <div v-if="project" class="view-toggle">
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': uiStore.viewMode === 'table' }"
          @click="uiStore.setViewMode('table')"
        >
          Table
        </button>
        <button
          class="view-toggle__btn"
          :class="{ 'view-toggle__btn--active': uiStore.viewMode === 'kanban' }"
          @click="uiStore.setViewMode('kanban')"
        >
          Kanban
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Content -->
    <main v-else-if="project" class="page-content">
      <TasksTable v-if="uiStore.viewMode === 'table'" :project-id="projectId" />
      <TaskKanban v-else :project-id="projectId" />
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects.store'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import AppBadge   from '@/components/base/AppBadge.vue'
import AppSpinner from '@/components/base/AppSpinner.vue'
import TasksTable from '@/components/tasks/TasksTable.vue'
import TaskKanban from '@/components/tasks/TaskKanban.vue'

const route          = useRoute()
const router         = useRouter()
const projectsStore  = useProjectsStore()
const tasksStore     = useTasksStore()
const uiStore        = useUiStore()

const loading = ref(true)

const projectId = computed(() => Number(route.params.id))
const project   = computed(() => projectsStore.projects.find(p => p.id === projectId.value))

onMounted(async () => {
  if (projectsStore.projects.length === 0) {
    await projectsStore.fetchAll()
  }
  await tasksStore.fetchByProject(projectId.value)
  loading.value = false
})

// Redirect if project not found after loading
watch(loading, (done) => {
  if (done && !project.value) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.detail-view {
  @include flex-column;
  min-height: 100vh;
  background: $color-bg-secondary;
}

.page-header {
  @include flex-between;
  padding: $spacing-6 $spacing-8;
  background: $color-bg-primary;
  border-bottom: 1px solid $color-border;
  gap: $spacing-4;

  &__left {
    @include flex-start;
    gap: $spacing-4;
    min-width: 0;
  }

  &__meta {
    @include flex-start;
    gap: $spacing-3;
    min-width: 0;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    @include text-truncate;
  }
}

.btn-back {
  @include button-reset;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  white-space: nowrap;
  transition: background $transition-fast, color $transition-fast;

  &:hover {
    background: $color-bg-hover;
    color: $color-text-primary;
  }
}

.view-toggle {
  @include flex-start;
  gap: 2px;
  background: $color-bg-secondary;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  padding: 2px;
  flex-shrink: 0;

  &__btn {
    @include button-reset;
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-secondary;
    border-radius: $radius-sm;
    transition: background $transition-fast, color $transition-fast;

    &:hover { color: $color-text-primary; }

    &--active {
      background: $color-bg-primary;
      color: $color-text-primary;
      box-shadow: $shadow-sm;
    }
  }
}

.state-box {
  @include flex-center;
  flex: 1;
  min-height: 300px;
}

.page-content {
  padding: $spacing-6 $spacing-8;
  flex: 1;
}
</style>
