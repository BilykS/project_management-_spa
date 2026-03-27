<template>
  <div class="projects-table">

    <!-- Toolbar -->
    <TableToolbar
      :search-value="uiStore.projectsFilter.name"
      :status-value="uiStore.projectsFilter.status"
      search-placeholder="Пошук за назвою"
      :status-options="PROJECT_STATUSES"
      @update:search-value="uiStore.setProjectsFilter({ name: $event })"
      @update:status-value="uiStore.setProjectsFilter({ status: $event as ProjectStatus | '' })"
    >
      <AppButton variant="primary" @click="showModal = true">+ Додати проект</AppButton>
    </TableToolbar>

    <!-- Loading -->
    <div v-if="projectsStore.loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="projectsStore.error" class="state-box state-box--error">
      <p>{{ projectsStore.error }}</p>
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
              :class="{ 'table__th--sorted': uiStore.projectsSort.key === col.key }"
            >
              <span class="th-content">
                {{ col.label }}
                <span v-if="col.sortable" class="sort-icon" @click.stop="uiStore.setProjectsSort(col.key)">
                  <ChevronUp v-if="uiStore.projectsSort.key === col.key && uiStore.projectsSort.direction === 'asc'" :size="12" />
                  <ChevronDown v-else-if="uiStore.projectsSort.key === col.key" :size="12" />
                  <ChevronsUpDown v-else :size="12" />
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
    <AppModal v-model="showModal" :persistent="formSaving" title="Додати проект">
      <ProjectForm
        @saving="formSaving = $event"
        @saved="showModal = false"
        @cancel="showModal = false"
      />
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects.store'
import { useUiStore } from '@/stores/ui.store'
import { useSort } from '@/composables/useSort'
import { useDebounce } from '@/composables/useDebounce'
import { useResizableColumns } from '@/composables/useResizableColumns'
import { PROJECT_STATUSES } from '@/types/models'
import type { Project, ProjectStatus } from '@/types/models'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { formatDate } from '@/utils/dateUtils'
import { PROJECT_COLUMNS } from '@/config/tableColumns'
import AppButton   from '@/components/base/AppButton.vue'
import AppSpinner  from '@/components/base/AppSpinner.vue'
import AppBadge    from '@/components/base/AppBadge.vue'
import AppModal    from '@/components/base/AppModal.vue'
import ProjectForm    from './ProjectForm.vue'
import TableToolbar  from '@/components/base/TableToolbar.vue'

const router        = useRouter()
const projectsStore = useProjectsStore()
const uiStore       = useUiStore()
const resizable     = useResizableColumns('project')

const showModal   = ref(false)
const formSaving  = ref(false)

const columns = PROJECT_COLUMNS

const projectsRef  = computed(() => projectsStore.projects as Record<string, unknown>[])
const sortStateRef = computed(() => uiStore.projectsSort)
const { sorted }   = useSort(projectsRef, sortStateRef)
const displayedProjects = computed(() => sorted.value as unknown as Project[])

function fetchWithFilters(): void {
  const { name, status } = uiStore.projectsFilter
  projectsStore.fetchAll({
    name:   name   || undefined,
    status: status || undefined,
  })
}

const debouncedFetch = useDebounce(fetchWithFilters)

watch(() => uiStore.projectsFilter.name,   () => debouncedFetch())
watch(() => uiStore.projectsFilter.status, () => fetchWithFilters())

onMounted(() => {
  fetchWithFilters()
})
</script>

<style scoped lang="scss">
.projects-table {
  @include flex-column;
  gap: $spacing-4;
}


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

  &--error p {
    color: $color-danger;
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
  @include flex-center;
  color: $color-text-muted;
  flex-shrink: 0;
  cursor: pointer;
  padding: 2px;
  border-radius: $radius-sm;
  transition: background $transition-fast, color $transition-fast;

  &:hover { background: $color-bg-hover; color: $color-text-primary; }
  .table__th--sorted & { color: $color-primary; }
}
</style>
