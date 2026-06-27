<template>
  <div class="card">
    <div class="card-header">
      <div class="ms-auto">
        <div class="input-group">
          <input type="text" v-model="search" class="form-control" placeholder="Cari..." />
          <button class="btn" type="button"><IconSearch stroke="2" /></button>
        </div>
      </div>
    </div>
    <div class="table-responsive card-body p-0">
      <table class="table table-vcenter">
        <thead>
          <tr>
            <th width="5">No</th>
            <th>User</th>
            <th>Aktivitas</th>
            <th>Detail</th>
            <th>IP</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
          <tr v-else-if="data.length === 0"><td colspan="6" class="text-center py-4">Tidak ada data</td></tr>
          <tr v-for="(item, index) in data" :key="item.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ item.user_name || '-' }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.content }}</td>
            <td>{{ item.ip || '-' }}</td>
            <td>{{ formatDateTime(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="pagination" class="card-footer d-flex align-items-center">
      <span>Total: {{ pagination.total }}</span>
      <ul class="pagination ms-auto m-0">
        <li class="page-item" :class="{ disabled: page <= 1 }">
          <a class="page-link" href="javascript:;" @click="page = Math.max(1, page - 1)">Prev</a>
        </li>
        <li v-for="p in pagination.totalPages" :key="p" class="page-item" :class="{ active: p === page }">
          <a class="page-link" href="javascript:;" @click="page = p">{{ p }}</a>
        </li>
        <li class="page-item" :class="{ disabled: page >= pagination.totalPages }">
          <a class="page-link" href="javascript:;" @click="page = Math.min(pagination.totalPages, page + 1)">Next</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ title: "Log Aktifitas", middleware: "auth" })
useSeoMeta({ title: "Log Aktifitas" })
useSession()

import { IconSearch } from "@tabler/icons-vue"
const { get } = useApi()

const data = ref([])
const loading = ref(true)
const search = ref("")
const page = ref(1)
const pagination = ref(null)

function formatDateTime(d) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

watch([search, page], fetchData)

async function fetchData() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set("page", String(page.value))
    params.set("limit", "15")
    if (search.value) params.set("search", search.value)

    const res = await get<any>(`/activity?${params.toString()}`)
    data.value = res.data
    pagination.value = res.pagination
  } catch {} finally { loading.value = false }
}

onMounted(fetchData)
</script>
