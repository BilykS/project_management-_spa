<template>
  <div class="projects-table">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__filters">
        <input
          :value="uiStore.projectsFilter.name"
          class="filter-input"
          type="search"
          placeholder="Пошук за назвою"
          @input="uiStore.setProjectsFilter({ name: ($event.target as HTMLInputElement).value })"
        />
        <select
          :value="uiStore.projectsFilter.status"
          class="filter-select"
          @change="uiStore.setProjectsFilter({ status: ($event.target as HTMLSelectElement).value as ProjectStatus | '' })"
        >
          <option value="">Всі статуси</option>
          <option v-for="s in PROJECT_STATUSES" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>
      <AppButton variant="primary" @click="showModal = true">
        + Додати проект
      </AppButton>
    </div>

    <!-- Loading -->
    <div v-if="projectsStore.loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="displayedProjects.length === 0" class="state-box state-box--empty">
      <p>{{ projectsStore.projects.length === 0 ? 'Немає проектів. Створіть перший!' : 'Жоден проект не відповідає фільтрам.' }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              v-resize-column="resizable.getBinding(col.key)"
              class="table__th"
              :class="{ 'table__th--sortable': col.sortable, 'table__th--sorted': uiStore.projectsSort.key === col.key }"
              @click="col.sortable && uiStore.setProjectsSort(col.key)"
            >
              <span class="th-content">
                {{ col.label }}
                <span v-if="col.sortable" class="sort-icon">
                  <template v-if="uiStore.projectsSort.key === col.key">
                    {{ uiStore.projectsSort.direction === 'asc' ? '↑' : '↓' }}
                  </template>
                  <template v-else>⇅</template>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in displayedProjects"
            :key="project.id"
            class="table__row"
            @click="router.push(`/projects/${project.id}`)"
          >
            <td class="table__td">{{ project.id }}</td>
            <td class="table__td table__td--name">{{ project.name }}</td>
            <td class="table__td table__td--center">{{ project.taskCount }}</td>
            <td class="table__td">
              <AppBadge :status="project.status" />
            </td>
            <td class="table__td">{{ formatDate(project.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AppModal v-model="showModal" title="Додати проект">
      <ProjectForm
        @saved="showModal = false"
        @cancel="showModal = false"
      />
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects.store'
import { useUiStore } from '@/stores/ui.store'
import { useSort } from '@/composables/useSort'
import { useFilter } from '@/composables/useFilter'
import { useResizableColumns } from '@/composables/useResizableColumns'
import { PROJECT_STATUSES } from '@/types/models'
import type { Project, ProjectStatus } from '@/types/models'
import AppButton   from '@/components/base/AppButton.vue'
import AppSpinner  from '@/components/base/AppSpinner.vue'
import AppBadge    from '@/components/base/AppBadge.vue'
import AppModal    from '@/components/base/AppModal.vue'
import ProjectForm from './ProjectForm.vue'

const router        = useRouter()
const projectsStore = useProjectsStore()
const uiStore       = useUiStore()
const resizable     = useResizableColumns('project')

const showModal = ref(false)

const columns = [
  { key: 'id',        label: 'ID',                sortable: true  },
  { key: 'name',      label: 'Назва проекту',     sortable: true  },
  { key: 'taskCount', label: 'Кількість завдань', sortable: true  },
  { key: 'status',    label: 'Статус',            sortable: true  },
  { key: 'createdAt', label: 'Дата створення',    sortable: false },
]

const projectsRef = computed(() => projectsStore.projects as Record<string, unknown>[])
const sortStateRef = computed(() => uiStore.projectsSort)

const { sorted } = useSort(projectsRef, sortStateRef)

const filtersRef = computed<Record<string, string>>(() => ({
  name:   uiStore.projectsFilter.name,
  status: uiStore.projectsFilter.status,
}))

const { filtered } = useFilter(sorted, filtersRef, {
  name:   'text',
  status: 'exact',
})

const displayedProjects = computed(() => filtered.value as unknown as Project[])

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// fetch only if store is empty (persist may already have data)
onMounted(() => {
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchAll()
  }
})
</script>

<style scoped lang="scss">
.projects-table {
  @include flex-column;
  gap: $spacing-4;
}

.toolbar {
  @include flex-between;
  gap: $spacing-4;
  flex-wrap: wrap;

  &__filters {
    @include flex-start;
    gap: $spacing-3;
    flex: 1;
    min-width: 0;
  }
}

.filter-input,
.filter-select {
  padding: $spacing-2 $spacing-3;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $color-text-primary;
  background: $color-bg-primary;
  outline: none;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.12);
  }
}

.filter-input  { width: 220px; }
.filter-select { width: 150px; cursor: pointer; }

.state-box {
  @include flex-center;
  min-height: 200px;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-primary;

  &--empty p {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-primary;
  @include custom-scrollbar;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  &__th {
    padding: $spacing-3 $spacing-4;
    background: $color-bg-secondary;
    border-bottom: 2px solid $color-border;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    position: relative;
    overflow: hidden;

    &--sortable { cursor: pointer; }

    &--sortable:hover {
      background: $color-bg-hover;
      color: $color-text-primary;
    }

    &--sorted { color: $color-primary; }
  }

  &__row {
    cursor: pointer;
    transition: background $transition-fast;

    &:hover { background: $color-bg-hover; }
    &:not(:last-child) td { border-bottom: 1px solid $color-border; }
  }

  &__td {
    padding: $spacing-3 $spacing-4;
    font-size: $font-size-sm;
    color: $color-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--name { font-weight: $font-weight-medium; }
    &--center { text-align: center; }
  }
}

.th-content {
  @include flex-start;
  gap: $spacing-2;
}

.sort-icon {
  font-size: $font-size-xs;
  color: $color-text-muted;
  flex-shrink: 0;

  .table__th--sorted & { color: $color-primary; }
}
</style>
