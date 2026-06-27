<template>
  <NuxtLayout name="default">
    <template #actions>
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-add" @click="openAdd">
        <IconPlus stroke="3" size="20" />Tambah
      </button>
    </template>
    <div class="card">
      <div class="card-header">
        <div class="d-flex gap-2 ms-auto">
          <select v-model="filterRole" class="form-select" style="width: 160px">
            <option value="">Semua Role</option>
            <option v-for="r in roleList" :key="r.id" :value="r.id">{{ r.nama_role }}</option>
          </select>
          <div class="input-group">
            <input type="text" v-model="search" class="form-control" placeholder="Cari..." @input="fetchData" />
            <button class="btn" type="button"><IconSearch stroke="2" /></button>
          </div>
        </div>
      </div>
      <div class="table-responsive card-body p-0">
        <table class="table table-vcenter">
          <thead>
            <tr>
              <th width="5">No</th>
              <th width="15">Aksi</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
            <tr v-else-if="data.length === 0"><td colspan="6" class="text-center py-4">Tidak ada data</td></tr>
            <tr v-for="(item, index) in data" :key="item.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td class="text-nowrap">
                <a href="javascript:;" class="text-dark" title="Edit" @click="openEdit(item)">
                  <IconPencil stroke="1" size="20" />
                </a>
                <a href="javascript:;" class="text-danger" title="Hapus" @click="hapusUser(item.id)">
                  <IconTrash stroke="1" size="20" />
                </a>
              </td>
              <td>{{ item.nama }}</td>
              <td>{{ item.username }}</td>
              <td>{{ item.role || '-' }}</td>
              <td>{{ item.isActive ? 'Aktif' : 'Nonaktif' }}</td>
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

    <div class="modal modal-blur fade" id="modal-add" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Edit' : 'Tambah' }} User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama Pegawai</label>
              <select v-model="form.id_pegawai" class="form-select">
                <option value="">Pilih pegawai</option>
                <option v-for="p in pegawaiList" :key="p.id" :value="p.id">{{ p.nama }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Username <span class="text-danger">*</span></label>
              <input v-model="form.username" type="text" class="form-control" minlength="6" @keyup="validasiUsername" />
              <small class="text-secondary">Min 6 karakter, huruf kecil & angka</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Nama</label>
              <input v-model="form.nama" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Role</label>
              <select v-model="form.id_role" class="form-select">
                <option value="">Pilih role</option>
                <option v-for="r in roleList" :key="r.id" :value="r.id">{{ r.nama_role }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <div class="input-group">
                <input v-model="form.password" type="text" class="form-control" />
                <button type="button" class="btn btn-primary" @click="generatePassword">Generate</button>
              </div>
            </div>
            <div>
              <label class="form-check">
                <input v-model="form.disabled" type="checkbox" class="form-check-input" />
                <span class="form-check-label">Nonaktif</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <div class="d-flex gap-2 ms-auto">
              <button type="button" class="btn" data-bs-dismiss="modal">Batal</button>
              <button type="button" class="btn btn-primary" @click="simpanUser" :disabled="submitting">
                {{ submitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({ title: "Manajemen User", layout: false, middleware: "auth" })
useSeoMeta({ title: "Manajemen User" })
useSession()

import { IconPencil, IconPlus, IconSearch, IconTrash } from "@tabler/icons-vue"
const { get, post, put, del } = useApi()

const data = ref([])
const roleList = ref([])
const pegawaiList = ref([])
const loading = ref(true)
const submitting = ref(false)
const search = ref("")
const filterRole = ref("")
const page = ref(1)
const pagination = ref(null)
const editing = ref(false)
const editId = ref(null)

const form = reactive({
  username: "",
  nama: "",
  password: "",
  id_pegawai: "",
  id_role: "",
  disabled: false,
})

function resetForm() {
  form.username = ""
  form.nama = ""
  form.password = ""
  form.id_pegawai = ""
  form.id_role = ""
  form.disabled = false
  editing.value = false
  editId.value = null
}

function validasiUsername() {
  form.username = form.username.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let pwd = ""
  for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  form.password = pwd
}

async function fetchData() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set("page", String(page.value))
    params.set("limit", "10")
    if (search.value) params.set("search", search.value)
    if (filterRole.value) params.set("id_role", filterRole.value)

    const res = await get<any>(`/user?${params.toString()}`)
    data.value = res.data
    pagination.value = res.pagination
  } catch {} finally { loading.value = false }
}

function openAdd() {
  resetForm()
}

function openEdit(item) {
  editing.value = true
  editId.value = item.id
  form.username = item.username
  form.nama = item.nama || ""
  form.password = ""
  form.id_pegawai = item.id_pegawai || ""
  form.id_role = item.id_role || ""
  form.disabled = !item.isActive
}

async function simpanUser() {
  if (!form.username || form.username.length < 6) return alert("Username minimal 6 karakter")
  if (!editing.value && !form.password) return alert("Password wajib diisi")

  submitting.value = true
  try {
    const payload = { ...form }
    if (payload.id_pegawai) payload.id_pegawai = Number(payload.id_pegawai)
    if (payload.id_role) payload.id_role = Number(payload.id_role)

    if (editing.value) {
      await put(`/user/${editId.value}`, payload)
    } else {
      await post("/user", payload)
    }

    resetForm()
    document.querySelector("[data-bs-dismiss='modal']")?.dispatchEvent(new Event("click"))
    await fetchData()
  } catch (err) {
    alert(err.message)
  } finally {
    submitting.value = false
  }
}

async function hapusUser(id) {
  if (!confirm("Hapus user ini?")) return
  try {
    await del(`/user/${id}`)
    await fetchData()
  } catch (err) {
    alert(err.message)
  }
}

watch([search, filterRole, page], fetchData)

onMounted(async () => {
  try {
    const [roleRes, pegawaiRes] = await Promise.all([
      get<any>("/role"),
      get<any>("/pegawai?limit=100"),
    ])
    roleList.value = roleRes.data
    pegawaiList.value = pegawaiRes.data || []
  } catch {}
  await fetchData()
})
</script>
