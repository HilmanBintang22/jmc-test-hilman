<script setup>
definePageMeta({
  title: "Data Pegawai",
  layout: false,
  middleware: "auth",
})

useSeoMeta({ title: "Data Pegawai" })
useSession()

import {
  IconPencil, IconPlus, IconSearch, IconTrash, IconFileDescription, IconCloudDownload,
} from "@tabler/icons-vue"

const { get, put, del } = useApi()

const data = ref([])
const loading = ref(true)
const pagination = ref(null)
const search = ref("")
const filterJabatan = ref("")
const filterStatus = ref("")
const masaKerjaMin = ref("")
const masaKerjaMax = ref("")
const page = ref(1)
const selected = ref([])

async function fetchData() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set("page", String(page.value))
    params.set("limit", "10")
    if (search.value) params.set("search", search.value)
    if (filterJabatan.value) params.set("jabatan", filterJabatan.value)
    if (filterStatus.value) params.set("status", filterStatus.value)
    if (masaKerjaMin.value) params.set("masa_kerja_min", masaKerjaMin.value)
    if (masaKerjaMax.value) params.set("masa_kerja_max", masaKerjaMax.value)

    const res = await get<any>(`/pegawai?${params.toString()}`)
    data.value = res.data
    pagination.value = res.pagination
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const jabatanList = ref([])
onMounted(async () => {
  try {
    const res = await get<any>("/master/jabatan")
    jabatanList.value = res.data
  } catch {}
  await fetchData()
})

watch([search, filterJabatan, filterStatus, masaKerjaMin, masaKerjaMax, page], fetchData)

function formatDate(dateStr) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })
}

function toggleSelect(id) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value.push(id)
  else selected.value.splice(idx, 1)
}

function toggleAll() {
  if (selected.value.length === data.value.length) {
    selected.value = []
  } else {
    selected.value = data.value.map((d) => d.id)
  }
}

async function deleteItem(id) {
  if (!confirm("Hapus data ini?")) return
  try {
    await del(`/pegawai/${id}`)
    await fetchData()
  } catch (err) {
    alert(err.message)
  }
}

async function batchStatus(status) {
  if (selected.value.length === 0) return alert("Pilih pegawai terlebih dahulu")
  try {
    await put("/pegawai/status", { ids: selected.value, status })
    selected.value = []
    await fetchData()
  } catch (err) {
    alert(err.message)
  }
}

function downloadPDF(id) {
  window.open(`/api/export/pegawai/${id}.pdf`, "_blank")
}

const formatMasaKerja = (row) => {
  if (!row.masa_kerja_tahun && row.masa_kerja_tahun !== 0) return "-"
  return `${row.masa_kerja_tahun} th ${row.masa_kerja_bulan || 0} bln`
}
</script>

<template>
  <NuxtLayout name="default">
    <template #actions>
      <NuxtLink to="/pegawai/form" class="btn btn-primary">
        <IconPlus stroke="3" size="20" />Tambah
      </NuxtLink>
    </template>
    <div class="card">
      <div class="card-header">
        <div class="d-flex gap-2 ms-auto flex-wrap">
          <div class="d-flex align-items-center gap-1">
            <span class="text-nowrap">Masa Kerja</span>
            <input type="number" v-model="masaKerjaMin" class="form-control" style="width: 60px" placeholder="Min" />
            <span>-</span>
            <input type="number" v-model="masaKerjaMax" class="form-control" style="width: 60px" placeholder="Max" />
          </div>
          <select v-model="filterJabatan" class="form-select" style="width: 160px">
            <option value="">Semua Jabatan</option>
            <option v-for="j in jabatanList" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
          <select v-model="filterStatus" class="form-select" style="width: 140px">
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <div class="input-group" style="width: 200px">
            <input type="text" v-model="search" class="form-control" placeholder="Cari Nama/NIP..." />
            <button class="btn" type="button"><IconSearch stroke="2" /></button>
          </div>
        </div>
      </div>

      <div v-if="selected.length > 0" class="card-body border-bottom py-2">
        <div class="d-flex gap-2 align-items-center">
          <span>{{ selected.length }} terpilih</span>
          <button class="btn btn-sm btn-success" @click="batchStatus('Aktif')">Aktifkan</button>
          <button class="btn btn-sm btn-warning" @click="batchStatus('Nonaktif')">Nonaktifkan</button>
        </div>
      </div>

      <div class="table-responsive card-body p-0">
        <table class="table table-vcenter">
          <thead>
            <tr>
              <th width="5"><input type="checkbox" :checked="selected.length === data.length && data.length > 0" @change="toggleAll" /></th>
              <th width="5">No</th>
              <th width="15" class="text-center">Aksi</th>
              <th>NIP</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Tanggal Masuk</th>
              <th>Masa Kerja</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="8" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="data.length === 0"><td colspan="8" class="text-center py-4">Tidak ada data</td></tr>
            <tr v-for="(item, index) in data" :key="item.id">
              <td><input type="checkbox" :checked="selected.includes(item.id)" @change="toggleSelect(item.id)" /></td>
              <td class="text-center">{{ pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1 }}</td>
              <td class="text-nowrap">
                <div class="d-flex">
                  <NuxtLink :to="`/pegawai/form/${item.id}`" class="text-dark" title="Edit">
                    <IconPencil stroke="1" size="20" />
                  </NuxtLink>
                  <NuxtLink :to="`/pegawai/${item.id}`" class="text-dark" title="Detail">
                    <IconFileDescription stroke="1" size="20" />
                  </NuxtLink>
                  <a href="javascript:;" class="text-dark" title="Download PDF" @click="downloadPDF(item.id)">
                    <IconCloudDownload stroke="1" size="20" />
                  </a>
                  <a href="javascript:;" class="text-danger" title="Hapus" @click="deleteItem(item.id)">
                    <IconTrash stroke="1" size="20" />
                  </a>
                </div>
              </td>
              <td>{{ item.nip }}</td>
              <td>
                <div class="d-flex align-items-center gap-1">
                  <img v-if="item.foto" :src="`/images/pegawai/${item.foto}`" alt="" style="width: 28px; height: 28px" class="rounded-pill" />
                  {{ item.nama }}
                </div>
              </td>
              <td>{{ item.jabatan || '-' }}</td>
              <td>{{ formatDate(item.tanggal_masuk) }}</td>
              <td>{{ formatMasaKerja(item) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pagination" class="card-footer d-flex align-items-center">
        <span class="text-secondary">Total: {{ pagination.total }} data</span>
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
  </NuxtLayout>
</template>
