// ====== STORAGE ======
let produk = JSON.parse(localStorage.getItem('produk')) || [];
let pelanggan = JSON.parse(localStorage.getItem('pelanggan')) || [];
let supplier = JSON.parse(localStorage.getItem('supplier')) || [];
let transaksi = JSON.parse(localStorage.getItem('transaksi')) || [];
let cart = [];

// ====== NAV ======
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('d-none'));
  document.getElementById(id).classList.remove('d-none');
}

// ====== PRODUK CRUD ======
function addProduk() {
  produk.push({ nama: pNama.value, harga: +pHarga.value, stok: +pStok.value });
  save(); renderProduk();
}
function deleteProduk(i) {
  produk.splice(i,1);
  save(); renderProduk();
}
function renderProduk() {
  produkTable.innerHTML = produk.map((p,i)=>
    `<tr><td>${p.nama}</td><td>${p.harga}</td><td>${p.stok}</td>
    <td><button class='btn btn-sm btn-danger' onclick='deleteProduk(${i})'>Hapus</button></td></tr>`
  ).join('');
  produkSelect.innerHTML = produk.map((p,i)=>`<option value='${i}'>${p.nama}</option>`).join('');
}

// ====== PELANGGAN CRUD ======
function addPelanggan() {
  pelanggan.push({ nama: cNama.value, hp: cHp.value });
  save(); renderPelanggan();
}
function deletePelanggan(i) {
  pelanggan.splice(i,1);
  save(); renderPelanggan();
}
function renderPelanggan() {
  pelangganTable.innerHTML = pelanggan.map((c,i)=>
    `<tr><td>${c.nama}</td><td>${c.hp}</td>
    <td><button class='btn btn-sm btn-danger' onclick='deletePelanggan(${i})'>Hapus</button></td></tr>`
  ).join('');
}

// ====== SUPPLIER CRUD ======
function addSupplier(){
  supplier.push({ nama:sNama.value, hp:sHp.value });
  save(); renderSupplier();
}
function deleteSupplier(i){ supplier.splice(i,1); save(); renderSupplier(); }
function renderSupplier(){
  supplierTable.innerHTML = supplier.map((s,i)=>
    `<tr><td>${s.nama}</td><td>${s.hp}</td>
    <td><button class='btn btn-sm btn-danger' onclick='deleteSupplier(${i})'>Hapus</button></td></tr>`
  ).join('');
}

// ====== TRANSAKSI + PEMBAYARAN + CICILAN ======
function addCart() {
  let p = produk[produkSelect.value];
  let q = +qty.value;
  if(!q || q <= 0) return Swal.fire('Qty tidak valid','','warning');
  if(q > p.stok) return Swal.fire('Stok kurang','','error');
  cart.push({ nama:p.nama, qty:q, harga:p.harga, sub:p.harga*q });
  renderCart();
}

function renderCart() {
  cartTable.innerHTML = cart.map((c,i)=>
    `<tr>
      <td>${c.nama}</td>
      <td>${c.qty}</td>
      <td>${c.sub}</td>
      <td><button class='btn btn-sm btn-danger' onclick='removeCart(${i})'>x</button></td>
    </tr>`
  ).join('');
  total.innerText = cart.reduce((a,b)=>a+b.sub,0);
}

function removeCart(i){
  cart.splice(i,1);
  renderCart();
}

function checkout(){
  if(cart.length===0) return Swal.fire('Keranjang kosong','','warning');

  Swal.fire({
    title:'Metode Pembayaran',
    input:'select',
    inputOptions:{ cash:'Cash', transfer:'Transfer', kredit:'Kredit / Cicilan' },
    showCancelButton:true
  }).then(res=>{
    if(!res.isConfirmed) return;
    let metode = res.value;
    if(metode==='kredit') prosesKredit();
    else prosesLunas(metode);
  });
}

function prosesLunas(metode){
  let totalBayar = +total.innerText;
  transaksi.push({
    tanggal:new Date().toISOString(),
    metode,
    total:totalBayar,
    status:'Lunas',
    items:cart
  });
  kurangiStok();
  selesaiTransaksi();
}

function prosesKredit(){
  Swal.fire({
    title:'Pembayaran Kredit',
    html:`<input id="dp" class="swal2-input" placeholder="Uang Muka">
          <input id="tenor" class="swal2-input" placeholder="Tenor (bulan)">`,
    preConfirm:()=>({ dp:+dp.value, tenor:+tenor.value })
  }).then(r=>{
    let totalBayar = +total.innerText;
    transaksi.push({
      tanggal:new Date().toISOString(),
      metode:'Kredit',
      total:totalBayar,
      dp:r.value.dp,
      sisa: totalBayar - r.value.dp,
      tenor:r.value.tenor,
      status:'Belum Lunas',
      items:cart,
      cicilan:[]
    });
    kurangiStok();
    selesaiTransaksi();
  });
}

function kurangiStok(){
  cart.forEach(c=>{
    let p = produk.find(x=>x.nama===c.nama);
    p.stok -= c.qty;
  });
}

function selesaiTransaksi(){
  Swal.fire('Sukses','Transaksi tersimpan','success');
  cart=[];
  save();
  renderProduk();
  renderCart();
  renderLaporan();
  renderInvoice(transaksi.length-1);
}

// ====== INVOICE ======
function renderInvoice(i){
  let t = transaksi[i];
  let html = `
  <h5>INVOICE</h5>
  <p>Tanggal: ${new Date(t.tanggal).toLocaleString()}</p>
  <p>Metode: ${t.metode}</p>
  <table border="1" width="100%">
    <tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
    ${t.items.map(it=>`<tr><td>${it.nama}</td><td>${it.qty}</td><td>${it.harga}</td><td>${it.sub}</td></tr>`).join('')}
  </table>
  <h6>Total: Rp ${t.total}</h6>
  <h6>Status: ${t.status}</h6>
  `;
  Swal.fire({ title:'Invoice', html, width:600 });
}

// ====== CICILAN PAYMENT ======
function bayarCicilan(index){
  let t = transaksi[index];
  if(t.status==='Lunas') return Swal.fire('Sudah lunas','','info');

  Swal.fire({
    title:'Bayar Cicilan',
    input:'number',
    inputLabel:`Sisa hutang: ${t.sisa}`,
    showCancelButton:true
  }).then(r=>{
    if(!r.isConfirmed) return;
    let bayar = +r.value;
    t.cicilan.push({ tanggal:new Date().toISOString(), bayar });
    t.sisa -= bayar;
    if(t.sisa <= 0){ t.status='Lunas'; t.sisa=0; }
    save(); renderLaporan();
    Swal.fire('Berhasil','Pembayaran cicilan disimpan','success');
  });
}
}

// ====== LAPORAN (HARIAN / BULANAN / TAHUNAN) ======
function renderLaporan(){
  laporanTable.innerHTML = transaksi.map((t,i)=>
    `<tr>
      <td>${new Date(t.tanggal).toLocaleDateString()}</td>
      <td>${t.metode}</td>
      <td>${t.total}</td>
      <td>${t.status}</td>
    </tr>`
  ).join('');
}

function filterLaporan(mode){
  let now = new Date();
  let data = transaksi.filter(t=>{
    let d = new Date(t.tanggal);
    if(mode==='harian') return d.toDateString()===now.toDateString();
    if(mode==='bulanan') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    if(mode==='tahunan') return d.getFullYear()===now.getFullYear();
  });
  laporanTable.innerHTML = data.map(t=>
    `<tr><td>${new Date(t.tanggal).toLocaleDateString()}</td><td>${t.metode}</td><td>${t.total}</td><td>${t.status}</td></tr>`
  ).join('');
}('');
}

// ====== SAVE ======
function save() {
  localStorage.setItem('produk', JSON.stringify(produk));
  localStorage.setItem('pelanggan', JSON.stringify(pelanggan));
  localStorage.setItem('supplier', JSON.stringify(supplier));
  localStorage.setItem('transaksi', JSON.stringify(transaksi));
}

renderProduk(); renderPelanggan(); renderSupplier(); renderLaporan();
