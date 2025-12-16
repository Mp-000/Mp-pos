let produk = JSON.parse(localStorage.getItem('produk')) || [];
let pelanggan = JSON.parse(localStorage.getItem('pelanggan')) || [];
let supplier = JSON.parse(localStorage.getItem('supplier')) || [];
let transaksi = JSON.parse(localStorage.getItem('transaksi')) || [];
let cart = [];

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('d-none'));
  document.getElementById(id).classList.remove('d-none');
}

/* ===== PRODUK ===== */
function addProduk(){
  produk.push({nama:pNama.value, harga:+pHarga.value, stok:+pStok.value});
  save(); renderProduk();
}
function deleteProduk(i){ produk.splice(i,1); save(); renderProduk(); }
function renderProduk(){
  produkTable.innerHTML = produk.map((p,i)=>`
    <tr>
      <td>${p.nama}</td><td>${p.harga}</td><td>${p.stok}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteProduk(${i})">Hapus</button></td>
    </tr>`).join('');
  produkSelect.innerHTML = produk.map((p,i)=>`<option value="${i}">${p.nama}</option>`).join('');
}

/* ===== PELANGGAN ===== */
function addPelanggan(){
  pelanggan.push({nama:cNama.value, hp:cHp.value});
  save(); renderPelanggan();
}
function deletePelanggan(i){ pelanggan.splice(i,1); save(); renderPelanggan(); }
function renderPelanggan(){
  pelangganTable.innerHTML = pelanggan.map((c,i)=>`
    <tr><td>${c.nama}</td><td>${c.hp}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deletePelanggan(${i})">Hapus</button></td></tr>`).join('');
}

/* ===== SUPPLIER ===== */
function addSupplier(){
  supplier.push({nama:sNama.value, hp:sHp.value});
  save(); renderSupplier();
}
function deleteSupplier(i){ supplier.splice(i,1); save(); renderSupplier(); }
function renderSupplier(){
  supplierTable.innerHTML = supplier.map((s,i)=>`
    <tr><td>${s.nama}</td><td>${s.hp}</td>
    <td><button class="btn btn-danger btn-sm" onclick="deleteSupplier(${i})">Hapus</button></td></tr>`).join('');
}

/* ===== TRANSAKSI ===== */
function addCart(){
  let p = produk[produkSelect.value];
  let q = +qty.value;
  if(q > p.stok) return Swal.fire('Stok tidak cukup','','error');
  cart.push({nama:p.nama, sub:p.harga*q});
  renderCart();
}
function renderCart(){
  cartTable.innerHTML = cart.map(c=>`
    <tr><td>${c.nama}</td><td>1</td><td>${c.sub}</td></tr>`).join('');
  total.innerText = cart.reduce((a,b)=>a+b.sub,0);
}
function checkout(){
  transaksi.push({tanggal:new Date().toLocaleDateString(), total:+total.innerText});
  Swal.fire('Berhasil','Transaksi tersimpan','success');
  cart=[]; save(); renderCart(); renderLaporan();
}

/* ===== LAPORAN ===== */
function renderLaporan(){
  laporanTable.innerHTML = transaksi.map(t=>`
    <tr><td>${t.tanggal}</td><td>${t.total}</td></tr>`).join('');
}

/* ===== STORAGE ===== */
function save(){
  localStorage.setItem('produk',JSON.stringify(produk));
  localStorage.setItem('pelanggan',JSON.stringify(pelanggan));
  localStorage.setItem('supplier',JSON.stringify(supplier));
  localStorage.setItem('transaksi',JSON.stringify(transaksi));
}

renderProduk(); renderPelanggan(); renderSupplier(); renderLaporan();
                                                  
