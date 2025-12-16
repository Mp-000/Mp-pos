// ===== Data LocalStorage =====
let userList = JSON.parse(localStorage.getItem("userList")) || [];
let pelangganList = JSON.parse(localStorage.getItem("pelangganList")) || [];
let supplierList = JSON.parse(localStorage.getItem("supplierList")) || [];
let produkList = JSON.parse(localStorage.getItem("produkList")) || [];
let transaksiList = JSON.parse(localStorage.getItem("transaksiList")) || [];
let keranjang = [];
let currentUser = null;

// ===== Render Functions =====
function renderUser(){
  const tbody=document.querySelector("#tabelUser tbody");
  tbody.innerHTML="";
  userList.forEach((u,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${u.nama}</td><td>${u.email}</td>
      <td><button class="btn btn-sm btn-danger" onclick="hapusUser(${i})">Hapus</button></td>
    </tr>`;
  });
}
function renderPelanggan(){
  const tbody=document.querySelector("#tabelPelanggan tbody");
  tbody.innerHTML="";
  pelangganList.forEach((p,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${p.nama}</td><td>${p.telp}</td>
      <td><button class="btn btn-sm btn-danger" onclick="hapusPelanggan(${i})">Hapus</button></td>
    </tr>`;
  });
}
function renderSupplier(){
  const tbody=document.querySelector("#tabelSupplier tbody");
  tbody.innerHTML="";
  supplierList.forEach((s,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${s.nama}</td><td>${s.kontak}</td>
      <td><button class="btn btn-sm btn-danger" onclick="hapusSupplier(${i})">Hapus</button></td>
    </tr>`;
  });
}
function renderProduk(){
  const tbody=document.querySelector("#tabelProduk tbody");
  tbody.innerHTML="";
  produkList.forEach((p,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${p.nama}</td><td>Rp ${p.harga}</td><td>${p.kategori}</td>
      <td>
        <button class="btn btn-sm btn-success" onclick="tambahKeranjang(${i})">Tambah ke Keranjang</button>
        <button class="btn btn-sm btn-danger" onclick="hapusProduk(${i})">Hapus</button>
      </td>
    </tr>`;
  });
}
function renderKeranjang(){
  const tbody=document.querySelector("#tabelKeranjang tbody");
  tbody.innerHTML="";
  keranjang.forEach((item,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${item.nama}</td><td>Rp ${item.harga}</td>
      <td><button class="btn btn-sm btn-danger" onclick="hapusKeranjang(${i})">Hapus</button></td>
    </tr>`;
  });
}

// ===== Add Functions =====
document.getElementById("formUser").addEventListener("submit",e=>{
  e.preventDefault();
  userList.push({nama:namaUser.value,email:emailUser.value,password:passUser.value});
  localStorage.setItem("userList",JSON.stringify(userList));
  renderUser(); e.target.reset();
});
document.getElementById("formPelanggan").addEventListener("submit",e=>{
  e.preventDefault();
  pelangganList.push({nama:namaPelanggan.value,telp:telpPelanggan.value});
  localStorage.setItem("pelangganList",JSON.stringify(pelangganList));
  renderPelanggan(); e.target.reset();
});
document.getElementById("formSupplier").addEventListener("submit",e=>{
  e.preventDefault();
  supplierList.push({nama:namaSupplier.value,kontak:kontakSupplier.value});
  localStorage.setItem("supplierList",JSON.stringify(supplierList));
  renderSupplier(); e.target.reset();
});
document.getElementById("formProduk").addEventListener("submit",e=>{
  e.preventDefault();
  produkList.push({nama:namaProduk.value,harga:parseFloat(hargaProduk.value),kategori:kategoriProduk.value});
  localStorage.setItem("produkList",JSON.stringify(produkList));
  renderProduk(); e.target.reset();
});

// ===== Hapus Functions =====
function hapusUser(i){ userList.splice(i,1); localStorage.setItem("userList",JSON.stringify(userList)); renderUser(); }
function hapusPelanggan(i){ pelangganList.splice(i,1); localStorage.setItem("pelangganList",JSON.stringify(pelangganList)); renderPelanggan(); }
function hapusSupplier(i){ supplierList.splice(i,1); localStorage.setItem("supplierList",JSON.stringify(supplierList)); renderSupplier(); }
function hapusProduk(i){ produkList.splice(i,1); localStorage.setItem("produkList",JSON.stringify(produkList)); renderProduk(); }
function hapusKeranjang(i){ keranjang.splice(i,1); renderKeranjang(); }

// ===== Keranjang =====
function tambahKeranjang(i){ keranjang.push(produkList[i]); renderKeranjang(); }

// ===== Login =====
document.getElementById("formLogin").addEventListener("submit",e=>{
  e.preventDefault();
  let email=loginEmail.value, pass=loginPass.value;
  let user=userList.find(u=>u.email===email && u.password===pass);
  if(user){
    currentUser=user;
    document.getElementById("statusLogin").innerText="Login sebagai: "+user.nama;
    Swal.fire("Berhasil","Login sukses","success");
  } else {
    Swal.fire("Gagal","User tidak ditemukan","error");
  }
});

// ===== Checkout =====
function checkout(){
  if(!currentUser){ Swal.fire("Oops","Harus login dulu","error"); return; }
  if(keranjang.length===0){ Swal.fire("Oops","Keranjang kosong","error"); return; }

  let total=keranjang.reduce((sum,p)=>sum+p.harga,0);
  Swal.fire({
    title:"Pilih Metode Pembayaran",
    input:"select",
    inputOptions:{
      "Tunai":"Tunai","QRIS":"QRIS","Cicilan":"Cicilan"
    },
    showCancelButton:true
  }).then(result=>{
    if(result.isConfirmed){
      let metode=result.value;
      if(metode==="Cicilan"){
        Swal.fire({
          title:"Pilih Tenor Cicilan",
          input:"select",
          inputOptions:{
            "1":"1 bulan (4.90%)","2":"2 bulan (4.80%)","3":"3 bulan (4.70%)",
            "6":"6 bulan (4.55%)","9":"9 bulan (4.30%)","12":"12 bulan (4.10%)",
            "18":"18 bulan (4.00%)","24":"24 bulan (3.70%)"
          }
        }).then(r2=>{
          if(r2.isConfirmed){
            let tenor=parseInt(r2.value);
            let bunga={1:4.90,2:4.80,3:4.70,6:4.55,9:4.30,12:4.10,18:4.00,24:3.70}[tenor];
            let totalBunga=total+(total*bunga/100);
            let cicilan=(totalBunga/tenor).toFixed(2);
            transaksiList.push({
              tanggal:new Date().toLocaleDateString(),
              total,metode,tenor,cicilan,
              detail:keranjang,
              pelanggan: pelangganList.length>0 ? pelangganList[0].nama : "Umum",
              kasir: currentUser.nama
            });
            localStorage.setItem("transaksiList",JSON.stringify(transaksiList));
            Swal.fire("Berhasil",`Total Rp ${totalBunga} dibayar ${tenor}x cicilan Rp ${cicilan}`,"success");
            keranjang=[]; renderKeranjang(); updateChart();
          }
        });
      } else {
        transaksiList.push({
          tanggal:new Date().toLocaleDateString(),
          total,metode,
          detail:keranjang,
          pelanggan: pelangganList.length>0 ? pelangganList[0].nama : "Umum",
          kasir: currentUser.nama
        });
        localStorage.setItem("transaksiList",JSON.stringify(transaksiList));
        Swal.fire("Berhasil",`Total Rp ${total} dibayar dengan ${metode}`,"success");
        keranjang=[]; renderKeranjang(); updateChart();
      }
    }
  });
}

// ===== Laporan Chart =====
function updateChart(){
  let ctx=document.getElementById("laporanChart");
  let labels=transaksiList.map(t=>t.tanggal);
  let data=transaksiList.map(t=>t.total);
  new Chart(ctx,{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{label:"Total Penjualan",data:data,backgroundColor:"rgba(75,192,192,0.6)"}]
    }
  });
}

// ===== Init Render =====
renderUser(); renderPelanggan(); renderSupplier(); renderProduk(); renderKeranjang(); updateChart();
