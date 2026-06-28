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
            <div class="mb-3" style="position: relative;">
              <label class="form-label">Nama Pegawai</label>
              <input
                ref="pegawaiInput"
                v-model="pegawaiSearch"
                type="text"
                class="form-control"
                placeholder="Ketik minimal 2 karakter"
                @input="onPegawaiSearch"
                @blur="onPegawaiBlur"
                @focus="onPegawaiFocus"
              />
              <ul
                v-if="pegawaiSuggestions.length > 0 && pegawaiDropdownOpen"
                class="list-group position-absolute w-100"
                style="z-index: 1000; max-height: 200px; overflow-y: auto;"
              >
                <li
                  v-for="p in pegawaiSuggestions"
                  :key="p.id"
                  class="list-group-item list-group-item-action"
                  style="cursor: pointer;"
                  @mousedown.prevent="pilihPegawai(p)"
                >
                  {{ p.nama }} ({{ p.nip }})
                </li>
              </ul>
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
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control" />
                <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                  <IconEye v-if="!showPassword" :stroke="1.5" size="20" />
                  <IconEyeOff v-else :stroke="1.5" size="20" />
                </button>
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
import { IconPencil, IconPlus, IconSearch, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-vue"
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

const pegawaiInput = ref(null)
const pegawaiSearch = ref("")
const pegawaiSuggestions = ref([])
const pegawaiDropdownOpen = ref(false)
const showPassword = ref(false)
let pegawaiDebounce = null

const form = reactive({
  username: "",
  nama: "",
  password: "",
  id_pegawai: "",
  id_role: "",
  disabled: false,
})

async function onPegawaiSearch() {
  if (pegawaiDebounce) clearTimeout(pegawaiDebounce)
  const val = pegawaiSearch.value.trim()
  if (val.length < 2) {
    pegawaiSuggestions.value = []
    pegawaiDropdownOpen.value = false
    return
  }
  pegawaiDebounce = setTimeout(async () => {
    try {
      const res = await get(`/pegawai?search=${encodeURIComponent(val)}&limit=10`)
      pegawaiSuggestions.value = res.data || []
      pegawaiDropdownOpen.value = pegawaiSuggestions.value.length > 0
    } catch {
      pegawaiSuggestions.value = []
    }
  }, 300)
}

function onPegawaiFocus() {
  if (pegawaiSuggestions.value.length > 0) {
    pegawaiDropdownOpen.value = true
  }
}

function onPegawaiBlur() {
  setTimeout(() => { pegawaiDropdownOpen.value = false }, 200)
}

function pilihPegawai(p) {
  pegawaiSearch.value = p.nama
  form.id_pegawai = p.id
  form.nama = p.nama || ""
  pegawaiSuggestions.value = []
  pegawaiDropdownOpen.value = false
}

function resetForm() {
  form.username = ""
  form.nama = ""
  form.password = ""
  form.id_pegawai = ""
  form.id_role = ""
  form.disabled = false
  pegawaiSearch.value = ""
  editing.value = false
  editId.value = null
}

function validasiUsername() {
  form.username = form.username.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const special = "!@#$%&*"
  const all = upper + lower + digits + special
  let pwd = ""
  pwd += upper.charAt(Math.floor(Math.random() * upper.length))
  pwd += lower.charAt(Math.floor(Math.random() * lower.length))
  pwd += digits.charAt(Math.floor(Math.random() * digits.length))
  pwd += special.charAt(Math.floor(Math.random() * special.length))
  for (let i = 0; i < 6; i++) pwd += all.charAt(Math.floor(Math.random() * all.length))
  pwd = pwd.split("").sort(() => Math.random() - 0.5).join("")
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

    const res = await get(`/user?${params.toString()}`)
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
  pegawaiSearch.value = item.nama_pegawai || item.nama || ""
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
    const roleRes = await get("/role")
    roleList.value = roleRes.data
  } catch {}
  await fetchData()
})
</script>
