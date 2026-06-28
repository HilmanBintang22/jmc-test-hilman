<template>
  <div>
    <h3 class="card-title">{{ detailData?.bulan || 'Detail' }}</h3>
    <div class="card">
      <div class="card-header d-flex gap-2">
        <button class="btn btn-primary" @click="hitungTunjangan" :disabled="hitungLoading">
          {{ hitungLoading ? 'Menghitung...' : 'Hitung Tunjangan' }}
        </button>
      </div>
      <div v-if="!detailData" class="card-body text-center py-4">Data belum dihitung. Klik "Hitung Tunjangan".</div>
      <template v-else>
        <div class="table-responsive card-body p-0">
          <table class="table table-vcenter">
            <thead>
              <tr>
                <th width="5">No</th>
                <th>Nama Penerima</th>
                <th class="text-center">Kilometer</th>
                <th class="text-center">Hari Kerja</th>
                <th class="text-center">Nominal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in detailData.penerima" :key="item.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nama || '-' }}</td>
                <td class="text-center">{{ item.km }}</td>
                <td class="text-center">{{ item.hari_kerja }}</td>
                <td class="text-end">{{ formatRupiah(item.nominal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ title: "Detail Tunjangan Transport", middleware: "auth" })
useSeoMeta({ title: "Detail Tunjangan Transport" })
import { formatRupiah } from "~/utils/formatRupiah.js"
const { get, post } = useApi()
const route = useRoute()

const detailData = ref(null)
const hitungLoading = ref(false)

async function fetchDetail() {
  try {
    const res = await get(`/tunjangan/transport/${route.params.id}`)
    detailData.value = res.data
  } catch {
    detailData.value = null
  }
}

async function hitungTunjangan() {
  hitungLoading.value = true
  try {
    const [tahun, bulan] = String(route.params.id).split("-")
    await post("/tunjangan/transport/hitung", { tahun: Number(tahun), bulan: Number(bulan) })
    await fetchDetail()
  } catch (err) {
    alert(err.message || "Gagal menghitung tunjangan")
  } finally {
    hitungLoading.value = false
  }
}

onMounted(fetchDetail)
</script>
