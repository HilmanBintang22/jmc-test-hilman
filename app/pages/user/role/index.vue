<template>
  <div class="card">
    <div class="card-header">
      <div class="ms-auto">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Cari..." />
          <button class="btn" type="button"><IconSearch stroke="2" /></button>
        </div>
      </div>
    </div>
    <div class="table-responsive card-body p-0">
      <table class="table table-vcenter">
        <thead>
          <tr>
            <th width="5">No</th>
            <th>Role</th>
            <th>Dibuat</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="text-center py-4">Memuat data...</td></tr>
          <tr v-else-if="data.length === 0"><td colspan="4" class="text-center py-4">Tidak ada data</td></tr>
          <tr v-for="(item, index) in data" :key="item.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ item.nama_role }}</td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td class="text-center">
              <NuxtLink :to="`/user/role/hak-akses/${item.id}`" class="btn btn-sm btn-primary">Hak Akses</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ title: "Manajemen Role", middleware: "auth" })
useSeoMeta({ title: "Manajemen Role" })
import { IconSearch } from "@tabler/icons-vue"
const { get } = useApi()

const data = ref([])
const loading = ref(true)

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("id-ID") : "-"
}

onMounted(async () => {
  try {
    const res = await get("/role")
    data.value = res.data
  } catch {} finally { loading.value = false }
})
</script>
