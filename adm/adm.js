(function () {
  'use strict';
  const API_BASE_URL = '';
  const Store = {
    anggota: [],
    pendaftaran: [],
    ebooks: [],
    galeri: [],
    settings: {
      nama_komunitas: 'Chess Club Indonesia',
      logo: '',
      email: '',
      whatsapp: '',
      instagram: '',
      discord: '',
      website: ''
    },
    aktivitas: []
  };
  let anggotaIdCounter = 1;
  let ebookIdCounter = 1;
  let galeriIdCounter = 1;
  let pendaftaranIdCounter = 1;
  const Utils = {
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    formatDate(dateStr) {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    },
    formatDateTime(date) {
      const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleString('id-ID', options);
    },
    timeAgo(date) {
      const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return 'Baru saja';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} menit lalu`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} jam lalu`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} hari lalu`;
      return Utils.formatDate(date);
    },
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
    getBadgeClass(status) {
      const map = {
        'Aktif': 'badge-aktif',
        'Pending': 'badge-pending',
        'Nonaktif': 'badge-nonaktif',
        'Disetujui': 'badge-disetujui',
        'Ditolak': 'badge-ditolak'
      };
      return map[status] || 'badge-pending';
    }
  };
  const Toast = {
    container: null,
    init() {
      this.container = document.getElementById('toast-container');
    },
    show(message, type = 'success', duration = 3000) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      };
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${Utils.escapeHtml(message)}</span>`;
      this.container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 200);
      }, duration);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
  };
  const Router = {
    currentPage: 'dashboard',
    init() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const page = item.dataset.page;
          this.navigateTo(page);
          Sidebar.close();
        });
      });
      const menuToggle = document.getElementById('menu-toggle');
      menuToggle.addEventListener('click', () => Sidebar.toggle());
    },
    navigateTo(page) {
      if (page === this.currentPage) return;
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
      });
      const pages = document.querySelectorAll('.page');
      pages.forEach(p => p.classList.remove('active'));
      const targetPage = document.getElementById(`page-${page}`);
      if (targetPage) {
        void targetPage.offsetWidth;
        targetPage.classList.add('active');
      }
      this.currentPage = page;
      const pageTitles = {
        dashboard: 'Dashboard',
        'turnamen': 'Kelola Turnamen',
        anggota: 'Kelola Anggota',
        ebook: 'Input Ebook',
        galeri: 'Galeri Komunitas',
        pengaturan: 'Pengaturan',
        'calon-anggota': 'Daftar Calon Anggota',
        'agenda': 'Kelola Kalender',
        'daftar-ulang': 'Pendaftaran Ulang',
        broadcast: 'Broadcast WhatsApp',
        feedback: 'Kritik dan Saran',
        livechat: 'Live Chat'
      };
      document.title = `${pageTitles[page] || 'Dashboard'} — Chess Club`;
      if (page === 'feedback') FeedbackManager.fetchData();
      if (page === 'dashboard') Dashboard.refresh();
      if (page === 'calon-anggota') CalonAnggotaManager.renderTable();
      if (page === 'daftar-ulang') DaftarUlangManager.fetchData();
      if (page === 'agenda') AgendaManager.fetchAgendas();
      if (page === 'livechat') ChatManager.enterPage();
      else ChatManager.leavePage();
    }
  };
  const Sidebar = {
    isOpen: false,
    init() {
      const overlay = document.getElementById('sidebar-overlay');
      overlay.addEventListener('click', () => this.close());
    },
    toggle() {
      this.isOpen ? this.close() : this.open();
    },
    open() {
      this.isOpen = true;
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('sidebar-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    close() {
      this.isOpen = false;
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
      document.body.style.overflow = '';
    }
  };
  const AgendaManager = {
    agendas: [],
    editingId: null,
    init() {
      const form = document.getElementById('form-agenda');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit(form);
        });
      }
      const tbody = document.getElementById('tbody-agenda');
      if (tbody) {
        tbody.addEventListener('click', (e) => this.handleTableClick(e));
      }
    },
    async fetchAgendas() {
      const tbody = document.getElementById('tbody-agenda');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Memuat data...</td></tr>';
      try {
        const res = await fetch('../api/admin_get_agendas.php');
        const result = await res.json();
        if (result.status === 'success') {
          this.agendas = result.data;
          this.renderTable();
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:red;">Gagal memuat.</td></tr>';
      }
    },
    renderTable() {
      const tbody = document.getElementById('tbody-agenda');
      if (this.agendas.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Belum ada agenda terjadwal.</td></tr>';
        return;
      }
      tbody.innerHTML = this.agendas.map(a => `
        <tr>
          <td>${Utils.formatDate(a.tanggal)}</td>
          <td>
            <strong>${Utils.escapeHtml(a.judul)}</strong><br>
            <span class="badge badge-disetujui" style="font-size:10px; margin-top:4px;">${Utils.escapeHtml(a.tipe.toUpperCase())}</span>
          </td>
          <td>
            <small style="color:var(--text-muted)"><i class="fas fa-clock"></i> ${Utils.escapeHtml(a.waktu)}</small><br>
            <small style="color:var(--text-muted)"><i class="fas fa-map-marker-alt"></i> ${Utils.escapeHtml(a.lokasi)}</small>
          </td>
          <td>${Utils.escapeHtml(a.cp || '-')}</td>
          <td>
            <div class="table-actions">
              <button class="btn-icon view" data-action="rekap" data-id="${a.id}" data-judul="${Utils.escapeHtml(a.judul)}" title="Lihat Rekap Absensi">
                <i class="fas fa-clipboard-check"></i>
              </button>
              <button class="btn-icon edit" data-action="edit" data-id="${a.id}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" data-action="delete" data-id="${a.id}" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },
    async handleSubmit(form) {
      const payload = {
        id: this.editingId || '',
        judul: document.getElementById('agenda-judul').value,
        tanggal: document.getElementById('agenda-tanggal').value,
        waktu: document.getElementById('agenda-waktu').value,
        tipe: document.getElementById('agenda-tipe').value,
        lokasi: document.getElementById('agenda-lokasi').value,
        deskripsi: document.getElementById('agenda-deskripsi').value,
        cp: document.getElementById('agenda-cp').value
      };
      try {
        const res = await fetch('../api/admin_save_agenda.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
          Toast.success('Agenda berhasil disimpan!');
          Dashboard.addActivity('pengaturan', `Menjadwalkan agenda: ${payload.judul}`);
          form.reset();
          this.editingId = null;
          this.fetchAgendas();
        } else {
          Toast.error(data.message);
        }
      } catch (err) {
        Toast.error('Koneksi terputus.');
      }
    },
    handleTableClick(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'edit') {
        const agenda = this.agendas.find(a => String(a.id) === String(id));
        if (agenda) {
          this.editingId = agenda.id;
          document.getElementById('agenda-judul').value = agenda.judul;
          document.getElementById('agenda-tanggal').value = agenda.tanggal;
          document.getElementById('agenda-waktu').value = agenda.waktu;
          document.getElementById('agenda-tipe').value = agenda.tipe;
          document.getElementById('agenda-lokasi').value = agenda.lokasi;
          document.getElementById('agenda-deskripsi').value = agenda.deskripsi;
          document.getElementById('agenda-cp').value = agenda.cp;
          document.getElementById('form-agenda').scrollIntoView({ behavior: 'smooth' });
        }
      } else if (action === 'delete') {
        if (confirm('Yakin ingin menghapus agenda ini?')) {
          fetch('../api/admin_delete_agenda.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
          }).then(r => r.json()).then(data => {
            if (data.status === 'success') {
              Toast.success('Agenda dihapus.');
              this.fetchAgendas();
            }
          });
        }
      } else if (action === 'rekap') {
        const judul = btn.dataset.judul;
        document.getElementById('rekap-judul-agenda').textContent = judul;
        const tbody = document.getElementById('tbody-rekap-absensi');
        tbody.innerHTML = '<tr><td colspan="3" class="text-center"><i class="fas fa-spinner fa-spin"></i> Memuat rekap absensi...</td></tr>';
        document.getElementById('modal-rekap-absensi').classList.add('active');
        fetch(`../api_user/agenda_rekap.php?agenda_id=${id}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color:var(--text-muted);">Belum ada member yang merespon (RSVP).</td></tr>';
                return;
              }
              tbody.innerHTML = data.data.map(m => {
                let badgeColor = m.status_kehadiran === 'Ikut' ? 'badge-disetujui' : (m.status_kehadiran === 'Tidak' ? 'badge-ditolak' : 'badge-pending');
                return `
                  <tr>
                    <td><strong>${Utils.escapeHtml(m.nama)}</strong></td>
                    <td>${Utils.escapeHtml(m.jabatan)}</td>
                    <td><span class="badge ${badgeColor}">${Utils.escapeHtml(m.status_kehadiran)}</span></td>
                  </tr>
                `;
              }).join('');
            } else {
              tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="color:var(--color-danger);">${Utils.escapeHtml(data.message)}</td></tr>`;
            }
          })
          .catch(() => {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color:var(--color-danger);">Koneksi terputus. Gagal memuat data.</td></tr>';
          });
      }
    }
  };
  const Dashboard = {
    refresh() {
      this.updateStats();
      this.updatePositionChart();
      this.updateActivityList();
    },
    updateStats() {
      const totalAnggota = Store.anggota.length;
      const pendingCount = Store.anggota.filter(a => a.status === 'Pending').length;
      const totalEbook = Store.ebooks.length;
      const totalGaleri = Store.galeri.length;
      this.animateCounter('stat-total-anggota', totalAnggota);
      this.animateCounter('stat-pending', pendingCount);
      this.animateCounter('stat-ebook', totalEbook);
      this.animateCounter('stat-galeri', totalGaleri);
    },
    animateCounter(elementId, target) {
      const el = document.getElementById(elementId);
      if (!el) return;
      const start = parseInt(el.textContent) || 0;
      const duration = 400;
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },
    updatePositionChart() {
      const chart = document.getElementById('position-chart');
      const jabatanList = ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Pelatih', 'Asisten Pelatih', 'Ujung Tombak', 'Moderator', 'Admin', 'Anggota'];
      const counts = {};
      jabatanList.forEach(j => counts[j] = 0);
      Store.anggota.forEach(a => {
        if (counts[a.jabatan] !== undefined) counts[a.jabatan]++;
      });
      const maxCount = Math.max(...Object.values(counts), 1);
      chart.innerHTML = jabatanList
        .filter(j => counts[j] > 0)
        .map(j => {
          const percentage = (counts[j] / maxCount) * 100;
          return `
            <div class="position-bar">
              <span class="position-label">${Utils.escapeHtml(j)}</span>
              <div class="position-track">
                <div class="position-fill" style="width: ${percentage}%"></div>
              </div>
              <span class="position-count">${counts[j]}</span>
            </div>
          `;
        }).join('');
      if (jabatanList.every(j => counts[j] === 0)) {
        chart.innerHTML = '<p class="empty-text">Belum ada data jabatan.</p>';
      }
    },
    async updateActivityList() {
      const list = document.getElementById('activity-list');
      try {
          const res = await fetch('../api/admin_get_activity_log.php');
          const data = await res.json();
          if (data.status === 'success') {
              if (data.data.length === 0) {
                  list.innerHTML = '<p class="empty-text">Belum ada aktivitas terbaru.</p>';
                  return;
              }
              const icons = {
                  login: 'fas fa-sign-in-alt',
                  anggota_tambah: 'fas fa-user-plus', anggota_edit: 'fas fa-user-edit', anggota_hapus: 'fas fa-user-minus',
                  pendaftaran: 'fas fa-user-check', pendaftaran_hapus: 'fas fa-user-times',
                  ebook_tambah: 'fas fa-book', ebook_hapus: 'fas fa-book-dead',
                  galeri_tambah: 'fas fa-camera', galeri_hapus: 'fas fa-trash-alt',
                  turnamen: 'fas fa-trophy', turnamen_hapus: 'fas fa-calendar-times',
                  sertifikat: 'fas fa-award', pengaturan: 'fas fa-cog'
              };
              list.innerHTML = data.data.map(act => `
                <div class="activity-item">
                  <div class="activity-icon"><i class="${icons[act.type] || 'fas fa-circle'}"></i></div>
                  <div class="activity-content">
                    <p class="activity-text">${Utils.escapeHtml(act.message)}</p>
                    <p class="activity-time">${Utils.timeAgo(act.timestamp)}</p>
                  </div>
                </div>
              `).join('');
          }
      } catch(err) {
          list.innerHTML = '<p class="empty-text">Gagal memuat log aktivitas.</p>';
      }
    },
    addActivity(type, message) {
      fetch('../api/admin_save_log.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: type, message: message })
      }).then(() => this.updateActivityList());
    }
  };
  const CalonAnggotaManager = {
     init() {
       document.getElementById('table-calon-anggota').addEventListener('click', (e) => {
         this.handleTableClick(e);
       });
     },
          async renderTable() {
       const tbody = document.getElementById('tbody-calon-anggota');
       tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>';
       try {
         const response = await fetch('../api/get_pending_members.php'); 
         const result = await response.json();
                  if (result.status === 'success' && result.data.length > 0) {
           tbody.innerHTML = '';
           for (const p of result.data) {
             let ratingInfo = '<span style="color:var(--text-muted)">-</span>';
             if (p.username_catur && p.username_catur.trim() !== '') {
               try {
                 const statRes = await fetch(`https://api.chess.com/pub/player/${p.username_catur.trim().toLowerCase()}/stats`);
                 if (statRes.ok) {
                   const stats = await statRes.json();
                   let rapid = stats.chess_rapid?.last?.rating || '-';
                   let blitz = stats.chess_blitz?.last?.rating || '-';
                   ratingInfo = `<strong>@${Utils.escapeHtml(p.username_catur)}</strong><br><small style="color:var(--accent-light)">Rapid: ${rapid} | Blitz: ${blitz}</small>`;
                 } else {
                   ratingInfo = `<strong>@${Utils.escapeHtml(p.username_catur)}</strong><br><small style="color:var(--color-warning)">Rating tidak ditemukan</small>`;
                 }
               } catch (err) {
                 ratingInfo = `<strong>@${Utils.escapeHtml(p.username_catur)}</strong>`;
               }
             }
             const tr = document.createElement('tr');
             tr.innerHTML = `
               <td>${Utils.formatDateTime(p.tanggal_daftar || new Date())}</td>
               <td class="table-name">
                 <strong>${Utils.escapeHtml(p.nama)}</strong><br>
                 <small style="color:var(--text-muted)">
                   <i class="fas fa-id-card"></i> Asli: ${Utils.escapeHtml(p.nama_asli || '-')}<br>
                   <i class="fas fa-birthday-cake"></i> Lahir: ${p.tanggal_lahir ? Utils.formatDate(p.tanggal_lahir) : '-'}<br>
                   <i class="fas fa-map-marker-alt"></i> Lokasi: ${Utils.escapeHtml(p.lokasi || '-')}<br>
                   <i class="fab fa-whatsapp"></i> WA: ${Utils.escapeHtml(p.whatsapp || '-')}
                 </small>
               </td>
               <td>${ratingInfo}</td>
               <td>
                  <span style="font-size: 13px; color: var(--text-secondary);"><strong>Motivasi:</strong> ${Utils.escapeHtml(p.motivasi || '-')}</span><br>
                  <span style="font-size: 13px; color: var(--text-secondary);"><strong>Tentang:</strong> ${Utils.escapeHtml(p.seputar_saya || '-')}</span><br>
                  <span style="font-size: 13px; color: var(--text-secondary);"><strong>TikTok:</strong> ${Utils.escapeHtml(p.tiktok || '-')}</span>
                </td>
               <td>
                 <div class="table-actions">
                   <button class="btn-icon view" data-action="approve" data-id="${p.id}" data-wa="${p.whatsapp}" data-nama="${p.nama}" title="Terima">
                     <i class="fas fa-check"></i>
                   </button>
                   <button class="btn-icon delete" data-action="reject" data-id="${p.id}" title="Tolak">
                     <i class="fas fa-times"></i>
                   </button>
                 </div>
               </td>
             `;
             tbody.appendChild(tr);
           }
         } else {
           tbody.innerHTML = `
             <tr class="empty-row">
               <td colspan="5">
                 <div class="empty-state">
                   <img src="/manus-storage/empty-state-chess_16ef3629.png" alt="Empty" class="empty-icon" />
                   <p>Tidak ada pendaftar baru yang menunggu persetujuan.</p>
                 </div>
               </td>
             </tr>`;
         }
       } catch (error) {
         tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Gagal memuat data API.</td></tr>`;
       }
     },
     async handleTableClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const waNumber = btn.dataset.wa;
        const namaPendaftar = btn.dataset.nama;
        if (action === 'reject') {
           ModalTolak.open(id, waNumber, namaPendaftar);
           return;
        }
        const newStatus = 'Aktif';
        try {
          const response = await fetch('../api/update_status.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id, status: newStatus })
          });
          const data = await response.json();
          if(data.status === 'success') {
              Toast.success('Pendaftaran disetujui!');
              Dashboard.addActivity('pendaftaran', `Menyetujui pendaftaran dari "${namaPendaftar}"`);
              if (waNumber) {
                  let cleanWa = waNumber.replace(/\D/g, '');
                  if (cleanWa.startsWith('0')) {
                      cleanWa = '62' + cleanWa.substring(1);
                  }
                  const linkGrupWa = "https://chat.whatsapp.com/KZtjZSFnifb4p7axMOuPEi?s=cl&p=a&mlu=0&ilr=0"; 
                  const pesan = `Halo ${namaPendaftar}, selamat! Pendaftaran kamu di klub catur BLUNDER SQUAD telah disetujui.%0A%0ASilakan bergabung ke grup WhatsApp utama kami melalui link berikut ini: %0A${linkGrupWa}%0A%0ASampai jumpa di grup! ♟️`;
                  window.open(`https://wa.me/${cleanWa}?text=${pesan}`, '_blank');
              }
              this.renderTable();
          } else {
              Toast.error('Gagal memperbarui status');
          }
        } catch (error) {
            Toast.error('Koneksi ke server gagal');
        }
      }
   };
  const DaftarUlangManager = {
    unregisteredData: [],
    registeredData: [],
    init() {
      this.setupTabs();
      const tbodyBelum = document.getElementById('tbody-belum-daftar');
      if (tbodyBelum) {
        tbodyBelum.addEventListener('click', (e) => this.handleActionClick(e));
      }
      const btnExport = document.getElementById('btn-export-daftar-ulang');
      if (btnExport) {
        btnExport.addEventListener('click', () => this.exportExcel());
      }
    },
    async fetchData() {
      if (!this.initialized) {
        this.init();
        this.initialized = true;
      }
      await Promise.all([
        this.fetchRegisteredData(),
        this.fetchUnregisteredData()
      ]);
    },
    setupTabs() {
      const tabSudah = document.getElementById('tab-btn-sudah');
      const tabBelum = document.getElementById('tab-btn-belum');
      const containerSudah = document.getElementById('container-sudah-daftar');
      const containerBelum = document.getElementById('container-belum-daftar');
      const btnExport = document.getElementById('btn-export-daftar-ulang');
      if (!tabSudah || !tabBelum) return;
      tabSudah.addEventListener('click', () => {
        tabSudah.className = 'btn btn-primary';
        tabBelum.className = 'btn btn-secondary';
        containerSudah.style.display = 'block';
        containerBelum.style.display = 'none';
        if (btnExport) btnExport.style.display = 'inline-flex';
      });
      tabBelum.addEventListener('click', () => {
        tabBelum.className = 'btn btn-primary';
        tabSudah.className = 'btn btn-secondary';
        containerBelum.style.display = 'block';
        containerSudah.style.display = 'none';
        if (btnExport) btnExport.style.display = 'none';
      });
    },
    async fetchRegisteredData() {
      const tbody = document.getElementById('tbody-daftar-ulang');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Memuat data... <i class="fas fa-spinner fa-spin"></i></td></tr>';
      try {
        const res = await fetch('../api/admin_get_reregister.php');
        const result = await res.json();
        if (result.status === 'success') {
          this.registeredData = result.data;
          if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Belum ada anggota yang mendaftar ulang.</td></tr>';
          } else {
            tbody.innerHTML = result.data.map(item => `
                    <tr>
                        <td style="white-space:nowrap; color:var(--text-muted); font-size:12px;">
                            ${Utils.formatDateTime(item.waktu_submit)}
                        </td>
                        <td><strong>${Utils.escapeHtml(item.nama_lengkap)}</strong></td>
                        <td>
                            <strong style="color:var(--accent-primary)">@${Utils.escapeHtml(item.username_catur)}</strong><br>
                            <small style="color:var(--text-muted)">Rap: ${item.rating_rapid} | Bli: ${item.rating_blitz} | Bul: ${item.rating_bullet}</small>
                        </td>
                        <td>${Utils.escapeHtml(item.tiktok)}</td>
                        <td>${Utils.escapeHtml(item.whatsapp)}</td>
                        <td>${Utils.escapeHtml(item.dana)}</td>
                    </tr>
                `).join('');
          }
        } else {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--color-danger);">Gagal memuat data.</td></tr>';
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--color-danger);">Koneksi terputus.</td></tr>';
      }
    },
    async fetchUnregisteredData() {
      const tbody = document.getElementById('tbody-belum-daftar');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat data... <i class="fas fa-spinner fa-spin"></i></td></tr>';
      try {
        const res = await fetch('../api/admin_get_belum_daftar_ulang.php');
        const result = await res.json();
        if (result.status === 'success') {
          this.unregisteredData = result.data;
          if (this.unregisteredData.length === 0) {
            tbody.innerHTML = `
              <tr class="empty-row">
                  <td colspan="5">
                      <div class="empty-state">
                          <img src="/manus-storage/empty-state-chess_16ef3629.png" alt="Empty" class="empty-icon" />
                          <p>Luar biasa! Semua anggota aktif telah melakukan pendaftaran ulang.</p>
                      </div>
                  </td>
              </tr>`;
          } else {
            tbody.innerHTML = this.unregisteredData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="table-name">
                        <strong>${Utils.escapeHtml(item.nama)}</strong>
                    </td>
                    <td>
                        <a href="https://www.chess.com/member/${encodeURIComponent(item.username_catur)}" target="_blank" style="color:var(--accent-primary); text-decoration:none;">
                            @${Utils.escapeHtml(item.username_catur || '-')} <i class="fas fa-external-link-alt" style="font-size:0.7em;"></i>
                        </a>
                    </td>
                    <td>
                        <span style="color:var(--text-secondary);"><i class="fab fa-whatsapp"></i> ${Utils.escapeHtml(item.whatsapp || '-')}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon view" data-action="remind-wa" data-nama="${Utils.escapeHtml(item.nama)}" data-wa="${Utils.escapeHtml(item.whatsapp)}" title="Kirim Pengingat via WA">
                                <i class="fab fa-whatsapp" style="color:#25D366; font-size:1.2rem;"></i> Remind
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
          }
        } else {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--color-danger);">Gagal memuat data dari server.</td></tr>';
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--color-danger);">Koneksi terputus.</td></tr>';
      }
    },
    handleActionClick(e) {
      const btn = e.target.closest('[data-action="remind-wa"]');
      if (!btn) return;
      const nama = btn.dataset.nama;
      const waNumber = btn.dataset.wa;
      if (!waNumber || waNumber === '-' || waNumber.trim() === '') {
        Toast.warning(`Nomor WhatsApp untuk ${nama} tidak ditemukan di database.`);
        return;
      }
      let cleanWa = waNumber.replace(/\D/g, '');
      if (cleanWa.startsWith('0')) {
        cleanWa = '62' + cleanWa.substring(1);
      }
      const linkForm = `${window.location.origin}/form.html`;
      const pesan = `Halo ${nama},%0A%0AKami dari pengurus klub catur *BLUNDER SQUAD* menginformasikan bahwa data kamu belum tercatat pada sistem pendaftaran ulang kami.%0A%0AMohon segera melakukan pengisian form pendaftaran ulang melalui link berikut ini agar status keanggotaan kamu tetap aktif:%0A${linkForm}%0A%0ATerima kasih atas kerjasamanya! ♟️`;
      if (typeof Dashboard !== 'undefined' && typeof Dashboard.addActivity === 'function') {
        Dashboard.addActivity('pendaftaran', `Mengirim peringatan daftar ulang ke WA "${nama}"`);
      }
      Toast.success('Mengalihkan ke WhatsApp...');
      setTimeout(() => {
        window.open(`https://wa.me/${cleanWa}?text=${pesan}`, '_blank');
      }, 500);
    },
    async exportExcel() {
      const sudahData = this.registeredData || [];
      const belumData = this.unregisteredData || [];
      if (sudahData.length === 0 && belumData.length === 0) {
        Toast.warning('Tidak ada data pendaftaran ulang untuk diexport.');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Chess Club Indonesia';
      workbook.created = new Date();
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      const thinBorder = {
        top: { style: 'thin', color: { argb: 'FFD8D2F0' } },
        left: { style: 'thin', color: { argb: 'FFD8D2F0' } },
        bottom: { style: 'thin', color: { argb: 'FFD8D2F0' } },
        right: { style: 'thin', color: { argb: 'FFD8D2F0' } }
      };
      const styleSheet = (sheet, rowCount) => {
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = headerFont;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = thinBorder;
        });
        headerRow.height = 22;
        for (let i = 2; i <= rowCount + 1; i++) {
          const row = sheet.getRow(i);
          const isEven = i % 2 === 0;
          row.eachCell((cell) => {
            cell.border = thinBorder;
            cell.alignment = { vertical: 'middle' };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEven ? 'FFF3EEFF' : 'FFFFFFFF' }
            };
          });
        }
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };
      };
      const sheetSudah = workbook.addWorksheet('Sudah Daftar Ulang');
      sheetSudah.columns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Waktu Submit', key: 'waktu', width: 20 },
        { header: 'Nama Lengkap', key: 'nama', width: 24 },
        { header: 'Username Catur', key: 'username', width: 20 },
        { header: 'Rating Rapid', key: 'rapid', width: 14 },
        { header: 'Rating Blitz', key: 'blitz', width: 14 },
        { header: 'Rating Bullet', key: 'bullet', width: 14 },
        { header: 'TikTok', key: 'tiktok', width: 20 },
        { header: 'WhatsApp', key: 'whatsapp', width: 18 },
        { header: 'DANA', key: 'dana', width: 18 }
      ];
      sudahData.forEach((item, index) => {
        sheetSudah.addRow({
          no: index + 1,
          waktu: item.waktu_submit ? Utils.formatDateTime(item.waktu_submit) : '-',
          nama: item.nama_lengkap || '-',
          username: item.username_catur || '-',
          rapid: item.rating_rapid || 0,
          blitz: item.rating_blitz || 0,
          bullet: item.rating_bullet || 0,
          tiktok: item.tiktok || '-',
          whatsapp: item.whatsapp || '-',
          dana: item.dana || '-'
        });
      });
      styleSheet(sheetSudah, sudahData.length);
      const sheetBelum = workbook.addWorksheet('Belum Daftar Ulang');
      sheetBelum.columns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Nama Lengkap', key: 'nama', width: 24 },
        { header: 'Username Catur', key: 'username', width: 20 },
        { header: 'WhatsApp', key: 'whatsapp', width: 18 }
      ];
      belumData.forEach((item, index) => {
        sheetBelum.addRow({
          no: index + 1,
          nama: item.nama || '-',
          username: item.username_catur || '-',
          whatsapp: item.whatsapp || '-'
        });
      });
      styleSheet(sheetBelum, belumData.length);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Data_Pendaftaran_Ulang_BlunderSquad.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Toast.success('Data pendaftaran ulang berhasil diunduh!');
    }
  };
  const AnggotaManager = {
    currentPage: 1,
    perPage: 10,
    deleteTargetId: null,
    init() {
      const searchInput = document.getElementById('search-anggota');
      const filterSelect = document.getElementById('filter-jabatan');
      const btnTambah = document.getElementById('btn-tambah-anggota');
      searchInput.addEventListener('input', () => {
        this.currentPage = 1;
        this.renderTable();
      });
      filterSelect.addEventListener('change', () => {
        this.currentPage = 1;
        this.renderTable();
      });
      btnTambah.addEventListener('click', () => ModalAnggota.open());
      document.getElementById('modal-anggota-close').addEventListener('click', () => ModalAnggota.close());
      document.getElementById('modal-anggota-cancel').addEventListener('click', () => ModalAnggota.close());
      document.getElementById('modal-anggota-save').addEventListener('click', () => this.handleModalSave());
      document.getElementById('modal-anggota').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) ModalAnggota.close();
      });
      document.getElementById('modal-detail-close').addEventListener('click', () => ModalDetail.close());
      document.getElementById('modal-detail').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) ModalDetail.close();
      });
      document.getElementById('modal-hapus-close').addEventListener('click', () => ModalHapus.close());
      document.getElementById('modal-hapus-cancel').addEventListener('click', () => ModalHapus.close());
      document.getElementById('modal-hapus-confirm').addEventListener('click', () => this.handleConfirmDelete());
      document.getElementById('modal-hapus').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) ModalHapus.close();
      });
      document.getElementById('modal-lencana-close')?.addEventListener('click', () => ModalLencana.close());
      document.getElementById('modal-lencana-cancel')?.addEventListener('click', () => ModalLencana.close());
      document.getElementById('modal-lencana-save')?.addEventListener('click', () => ModalLencana.save());
      document.getElementById('modal-lencana')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) ModalLencana.close();
      });
      const fotoInput = document.getElementById('anggota-foto-input');
      fotoInput.addEventListener('change', (e) => {
        const fileName = document.getElementById('anggota-foto-name');
        fileName.textContent = e.target.files[0] ? e.target.files[0].name : '';
      });
      const btnExport = document.getElementById('btn-export-anggota');
      if (btnExport) {
        btnExport.addEventListener('click', () => this.exportExcel());
      }
      this.fetchMembers();
    },
    exportExcel() {
      const dataAnggota = this.getFilteredData();
      if (dataAnggota.length === 0) {
        Toast.warning('Tidak ada data anggota untuk diexport.');
        return;
      }
      const dataToExport = dataAnggota.map((a, index) => ({
        'No': index + 1,
        'Nama Panggilan': a.nama || '-',
        'Nama Asli': a.nama_asli || '-',
        'Username Catur': a.username_catur || '-',
        'Email': a.email || '-',
        'WhatsApp': a.whatsapp || '-',
        'Jabatan': a.jabatan || '-',
        'Status': a.status || '-',
        'Domisili': a.lokasi || '-',
        'Alamat Lengkap': a.alamat || '-',
        'Tanggal Daftar': a.tanggal_daftar ? Utils.formatDateTime(a.tanggal_daftar) : '-'
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Anggota");
      XLSX.writeFile(wb, "Data_Anggota_ChessClub.xlsx");
      Toast.success('File Excel berhasil diunduh!');
    },
    async fetchMembers() {
        try {
            const response = await fetch('../api/admin_get_members.php');
            const result = await response.json();
            if (result.status === 'success') {
                Store.anggota = result.data;
                this.renderTable();
            }
        } catch (err) {
            console.error("Gagal memuat data anggota:", err);
            Toast.error('Gagal mengambil data dari database.');
        }
    },
    getFilteredData() {
      const query = document.getElementById('search-anggota').value.toLowerCase().trim();
      const filter = document.getElementById('filter-jabatan').value;
      return Store.anggota.filter(a => {
        const matchSearch = !query ||
          a.nama.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          (a.whatsapp && a.whatsapp.includes(query));
        const matchFilter = !filter || a.jabatan === filter;
        return matchSearch && matchFilter;
      });
    },
    renderTable() {
      const tbody = document.getElementById('tbody-anggota');
      const filtered = this.getFilteredData();
      const totalPages = Math.ceil(filtered.length / this.perPage);
      const start = (this.currentPage - 1) * this.perPage;
      const pageData = filtered.slice(start, start + this.perPage);
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr class="empty-row">
            <td colspan="7">
              <div class="empty-state">
                <img src="/manus-storage/empty-state-chess_16ef3629.png" alt="Empty" class="empty-icon" />
                <p>Belum ada anggota yang cocok dengan pencarian.</p>
              </div>
            </td>
          </tr>`;
        this.renderPagination(0);
        return;
      }
      tbody.innerHTML = pageData.map(a => `
        <tr>
          <td>
            <div class="table-avatar">
              ${a.foto ? `<img src="${a.foto}" alt="${Utils.escapeHtml(a.nama)}" />` : '<i class="fas fa-user"></i>'}
            </div>
          </td>
          <td class="table-name">${Utils.escapeHtml(a.nama)}</td>
          <td>${Utils.escapeHtml(a.email)}</td>
          <td>${Utils.escapeHtml(a.whatsapp)}</td>
          <td>${Utils.escapeHtml(a.jabatan)}</td>
          <td><span class="badge ${Utils.getBadgeClass(a.status)}">${Utils.escapeHtml(a.status)}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn-icon" style="color:#f59e0b; background:rgba(245, 158, 11, 0.12);" data-action="badge" data-id="${a.id}" title="Beri Lencana">
                <i class="fas fa-medal"></i>
              </button>
              <button class="btn-icon view" data-action="view" data-id="${a.id}" title="Detail">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon edit" data-action="edit" data-id="${a.id}" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" data-action="delete" data-id="${a.id}" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      this.renderPagination(totalPages);
    },
    renderPagination(totalPages) {
      const container = document.getElementById('pagination-anggota');
      if (totalPages <= 1) {
        container.innerHTML = '';
        return;
      }
      let html = `<button class="page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      html += `<button class="page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
      container.innerHTML = html;
    },
    handleTableClick(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      switch (action) {
        case 'view':
          ModalDetail.open(id);
          break;
        case 'edit':
          ModalAnggota.open(id);
          break;
        case 'delete':
          ModalHapus.open(id);
          break;
        case 'badge':
          ModalLencana.open(id);
          break;
      }
    },
    handlePaginationClick(e) {
      const btn = e.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      const page = btn.dataset.page;
      const totalPages = Math.ceil(this.getFilteredData().length / this.perPage);
      if (page === 'prev') {
        if (this.currentPage > 1) this.currentPage--;
      } else if (page === 'next') {
        if (this.currentPage < totalPages) this.currentPage++;
      } else {
        this.currentPage = parseInt(page);
      }
      this.renderTable();
    },
    async handleModalSave() {
      const editId = document.getElementById('anggota-edit-id').value;
      const nama = document.getElementById('anggota-nama').value.trim();
      const email = document.getElementById('anggota-email').value.trim();
      const whatsapp = document.getElementById('anggota-whatsapp').value.trim();
      const jabatan = document.getElementById('anggota-jabatan').value;
      const status = document.getElementById('anggota-status').value;
      if (!nama || !email || !whatsapp || !jabatan) {
        Toast.warning('Mohon isi semua field yang wajib.');
        return;
      }
      const fotoInput = document.getElementById('anggota-foto-input');
      let foto = null;
      if (fotoInput.files[0]) {
        try {
          foto = await Utils.fileToBase64(fotoInput.files[0]);
        } catch (err) {
          Toast.error('Gagal memproses foto.');
          return;
        }
      }
      const payload = {
        id: editId,
        nama: nama,
        email: email,
        whatsapp: whatsapp,
        username_catur: document.getElementById('anggota-username').value.trim(),
        jabatan: jabatan,
        status: status,
        alamat: document.getElementById('anggota-alamat').value.trim(),
        foto: foto
      };
      try {
        const response = await fetch('../api/save_member.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if(data.status === 'success') {
            Toast.success(editId ? 'Data anggota diperbarui!' : 'Anggota baru ditambahkan!');
            Dashboard.addActivity(editId ? 'anggota_edit' : 'anggota_tambah', `Data "${nama}" disimpan.`);
            ModalAnggota.close();
            this.currentPage = 1;
            this.fetchMembers();
        } else {
            Toast.error('Gagal menyimpan: ' + data.message);
        }
      } catch (error) {
          Toast.error('Koneksi ke server gagal.');
      }
    },
    async handleConfirmDelete() {
      if (!this.deleteTargetId) return;
      try {
          const response = await fetch('../api/delete_member.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: this.deleteTargetId })
          });
          const data = await response.json();
          if(data.status === 'success') {
              Toast.success('Anggota berhasil dihapus!');
              const member = Store.anggota.find(a => String(a.id) === String(this.deleteTargetId));
              const memberName = member ? member.nama : 'Seseorang';
              Dashboard.addActivity('anggota_hapus', `menghapus anggota "${memberName}"`);
              ModalHapus.close();
              this.fetchMembers();
          } else {
              Toast.error('Gagal menghapus: ' + data.message);
          }
      } catch (error) {
          Toast.error('Koneksi ke server gagal.');
      }
    }
  };
  document.getElementById('lencana-tipe')?.addEventListener('change', (e) => {
      const ketGroup = document.getElementById('lencana-keterangan-group');
      const ketInput = document.getElementById('lencana-keterangan');
      if (e.target.value === 'juara_turnamen') {
          ketGroup.style.display = 'block';
          ketInput.setAttribute('required', 'true');
      } else {
          ketGroup.style.display = 'none';
          ketInput.removeAttribute('required');
          ketInput.value = '';
      }
  });

  const ModalLencana = {
    open(id) {
      document.getElementById('lencana-anggota-id').value = id;
      document.getElementById('form-lencana').reset();
      document.getElementById('lencana-keterangan-group').style.display = 'none';
      document.getElementById('lencana-keterangan').removeAttribute('required');
      const modal = document.getElementById('modal-lencana');
      modal.classList.add('active');
      void modal.offsetWidth;
    },
    close() {
      document.getElementById('modal-lencana').classList.remove('active');
    },
    async save() {
      const id = document.getElementById('lencana-anggota-id').value;
      const tipe = document.getElementById('lencana-tipe').value;
      const keterangan = document.getElementById('lencana-keterangan').value.trim();
      if (!tipe) { Toast.warning('Pilih jenis lencana terlebih dahulu.'); return; }
      if (tipe === 'juara_turnamen' && !keterangan) { Toast.warning('Nama turnamen wajib diisi.'); return; }
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const btn = document.getElementById('modal-lencana-save');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      btn.disabled = true;
      try {
        const res = await fetch('../api/admin_award_badge.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ anggota_id: id, tipe_lencana: tipe, keterangan: keterangan })
        });
        const data = await res.json();
        if (data.status === 'success') {
          Toast.success('Lencana berhasil disematkan!');
          this.close();
        } else {
          Toast.error(data.message || 'Gagal menyimpan lencana');
        }
      } catch (err) {
        Toast.error('Koneksi terputus. Gagal mencapai server.');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };
  const ModalAnggota = {
    open(id = null) {
      const modal = document.getElementById('modal-anggota');
      const title = document.getElementById('modal-anggota-title');
      const form = document.getElementById('form-anggota-modal');
      form.reset();
      document.getElementById('anggota-edit-id').value = '';
      document.getElementById('anggota-foto-name').textContent = '';
      if (id) {
        const anggota = Store.anggota.find(a => String(a.id) === String(id));
        if (!anggota) return;
        title.textContent = 'Edit Anggota';
        document.getElementById('anggota-edit-id').value = anggota.id;
        document.getElementById('anggota-nama').value = anggota.nama;
        document.getElementById('anggota-email').value = anggota.email;
        document.getElementById('anggota-whatsapp').value = anggota.whatsapp;
        document.getElementById('anggota-username').value = anggota.username_catur || '';
        document.getElementById('anggota-jabatan').value = anggota.jabatan;
        document.getElementById('anggota-status').value = anggota.status;
        document.getElementById('anggota-alamat').value = anggota.alamat || '';
      } else {
        title.textContent = 'Tambah Anggota';
      }
      modal.classList.add('active');
      void modal.offsetWidth;
    },
    close() {
      const modal = document.getElementById('modal-anggota');
      modal.classList.remove('active');
    }
  };
  const ModalDetail = {
    open(id) {
      const anggota = Store.anggota.find(a => String(a.id) === String(id));
      if (!anggota) return;
      const modal = document.getElementById('modal-detail');
      const body = document.getElementById('modal-detail-body');
      body.innerHTML = `
        ${anggota.foto ? `<img src="${anggota.foto}" alt="${Utils.escapeHtml(anggota.nama)}" class="detail-photo" />` : ''}
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Nama Panggilan</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.nama)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Nama Asli</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.nama_asli || '-')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tanggal Lahir</span>
            <span class="detail-value">${anggota.tanggal_lahir ? Utils.formatDate(anggota.tanggal_lahir) : '-'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Lokasi Domisili</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.lokasi || '-')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.email)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">No. WhatsApp</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.whatsapp)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Jabatan</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.jabatan)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge ${Utils.getBadgeClass(anggota.status)}">${Utils.escapeHtml(anggota.status)}</span></span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">Seputar Saya</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.seputar_saya || '-')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Akun TikTok</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.tiktok || '-')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Username Catur</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.username_catur || '-')}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">Alamat</span>
            <span class="detail-value">${Utils.escapeHtml(anggota.alamat || '-')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tanggal Daftar</span>
            <span class="detail-value">${anggota.tanggal_daftar ? Utils.formatDateTime(anggota.tanggal_daftar) : '-'}</span>
          </div>
        </div>
      `;
      modal.classList.add('active');
      void modal.offsetWidth;
    },
    close() {
      const modal = document.getElementById('modal-detail');
      modal.classList.remove('active');
    }
  };
  const ModalHapus = {
    open(id) {
      AnggotaManager.deleteTargetId = id;
      const modal = document.getElementById('modal-hapus');
      modal.classList.add('active');
      void modal.offsetWidth;
    },
    close() {
      const modal = document.getElementById('modal-hapus');
      modal.classList.remove('active');
      AnggotaManager.deleteTargetId = null;
    }
  };
  const ModalTolak = {
    open(id, wa, nama) {
      document.getElementById('tolak-id').value = id;
      document.getElementById('tolak-wa').value = wa;
      document.getElementById('tolak-nama').value = nama;
      document.getElementById('tolak-alasan').value = '';
      document.getElementById('tolak-alasan-lain').value = '';
      document.getElementById('tolak-alasan-lain-group').style.display = 'none';
      const modal = document.getElementById('modal-tolak');
      modal.classList.add('active');
    },
    close() {
      document.getElementById('modal-tolak').classList.remove('active');
    },
    async confirm() {
      const id = document.getElementById('tolak-id').value;
      const wa = document.getElementById('tolak-wa').value;
      const nama = document.getElementById('tolak-nama').value;
      const dropdownVal = document.getElementById('tolak-alasan').value;
      let alasanFinal = dropdownVal;
      if (!dropdownVal) {
        Toast.warning('Pilih alasan penolakan terlebih dahulu.');
        return;
      }
      if (dropdownVal === 'Lainnya') {
        const txtLain = document.getElementById('tolak-alasan-lain').value.trim();
        if (!txtLain) {
          Toast.warning('Alasan lainnya wajib diisi.');
          return;
        }
        alasanFinal = txtLain;
      }
      try {
        const response = await fetch('../api/update_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: 'Ditolak' })
        });
        const data = await response.json();
        if(data.status === 'success') {
            Toast.success('Pendaftaran ditolak! Membuka WhatsApp...');
            Dashboard.addActivity('pendaftaran_hapus', `Menolak pendaftaran dari "${nama}" (Alasan: ${alasanFinal})`);
            if (wa) {
                let cleanWa = wa.replace(/\D/g, '');
                if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
                const pesan = `Halo ${nama},%0A%0AMohon maaf, pendaftaran kamu di klub catur BLUNDER SQUAD *ditolak* untuk saat ini.%0A%0A*Alasan:*%0A${alasanFinal}%0A%0ASilakan perbaiki data kamu dan mendaftar kembali di lain waktu. Tetap semangat! ♟️`;
                window.open(`https://wa.me/${cleanWa}?text=${pesan}`, '_blank');
            }
            this.close();
            CalonAnggotaManager.renderTable();
        } else {
            Toast.error('Gagal memperbarui status');
        }
      } catch (error) {
          Toast.error('Koneksi ke server gagal');
      }
    }
  };
  const EbookManager = {
    init() {
      const form = document.getElementById('form-ebook');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
      const coverInput = document.getElementById('ebook-cover-input');
      coverInput.addEventListener('change', (e) => {
        document.getElementById('ebook-cover-name').textContent = e.target.files[0] ? e.target.files[0].name : '';
      });
      const fileInput = document.getElementById('ebook-file-input');
      fileInput.addEventListener('change', (e) => {
        document.getElementById('ebook-file-name').textContent = e.target.files[0] ? e.target.files[0].name : '';
      });
      this.fetchEbooks();
    },
    async fetchEbooks() {
      const grid = document.getElementById('ebook-grid');
      grid.innerHTML = '<p class="empty-text">Memuat e-book...</p>';
      try {
        const response = await fetch('../api/get_ebooks.php');
        const result = await response.json();
        if (result.status === 'success') {
          Store.ebooks = result.data;
          this.renderGrid();
        }
      } catch (err) {
        grid.innerHTML = '<p class="empty-text" style="color:var(--color-danger);">Gagal memuat e-book dari server.</p>';
      }
    },
    renderGrid() {
      const grid = document.getElementById('ebook-grid');
      if (Store.ebooks.length === 0) {
        grid.innerHTML = '<p class="empty-text">Belum ada ebook yang ditambahkan.</p>';
        return;
      }
      grid.innerHTML = Store.ebooks.map(ebook => `
        <div class="ebook-card" data-id="${ebook.id}">
          <img src="../${ebook.cover}" alt="${Utils.escapeHtml(ebook.judul)}" class="ebook-cover" style="object-fit:cover;" />
          <div class="ebook-info">
            <h3 class="ebook-title">${Utils.escapeHtml(ebook.judul)}</h3>
            <p class="ebook-author">${Utils.escapeHtml(ebook.penulis)}</p>
            <span class="ebook-category">${Utils.escapeHtml(ebook.kategori)}</span>
            <a href="../${ebook.file_pdf}" target="_blank" style="display:block; margin-top:10px; font-size:0.8rem; color:var(--accent-light);"><i class="fas fa-file-pdf"></i> Lihat PDF</a>
          </div>
          <div class="ebook-actions">
            <button class="btn-icon delete" data-action="delete-ebook" data-id="${ebook.id}" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    },
    async handleSubmit(form) {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah File...';
      btn.disabled = true;
      try {
        const formData = new FormData(form);
        const response = await fetch('../api/admin_save_ebook.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if(data.status === 'success') {
            Toast.success('E-book & PDF berhasil diunggah!');
            Dashboard.addActivity('ebook_tambah', `Ebook "${formData.get('judul')}" ditambahkan.`);
            form.reset();
            document.getElementById('ebook-cover-name').textContent = '';
            document.getElementById('ebook-file-name').textContent = '';
            this.fetchEbooks();
        } else {
            Toast.error('Gagal mengunggah: ' + data.message);
        }
      } catch (error) {
          Toast.error('Koneksi ke server gagal. Ukuran file mungkin terlalu besar.');
      } finally {
          btn.innerHTML = originalText;
          btn.disabled = false;
      }
    },
    handleGridClick(e) {
      const btn = e.target.closest('[data-action="delete-ebook"]');
      if (!btn) return;
      const id = btn.dataset.id;
      if(confirm('Yakin ingin menghapus e-book ini dari database?')) {
         fetch('../api/admin_delete_ebook.php', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ id: id })
         }).then(res => res.json()).then(data => {
             if(data.status === 'success') {
                 Toast.success('E-book berhasil dihapus!');
                 Dashboard.addActivity('ebook_hapus', `Ebook ID ${id} dihapus dari perpustakaan.`);
                 this.fetchEbooks();
             }
         });
      }
    }
  };
  const GaleriManager = {
    init() {
      const form = document.getElementById('form-galeri');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
      const fotoInput = document.getElementById('galeri-foto-input');
      fotoInput.addEventListener('change', (e) => {
        document.getElementById('galeri-foto-name').textContent = e.target.files[0] ? e.target.files[0].name : '';
      });
    },
    async handleSubmit(form) {
      const judul = document.getElementById('galeri-judul').value.trim();
      const tanggal = document.getElementById('galeri-tanggal').value;
      const deskripsi = document.getElementById('galeri-deskripsi').value.trim();
      if (!judul || !tanggal || !deskripsi) {
        Toast.warning('Mohon isi semua field yang wajib.');
        return;
      }
      const fotoInput = document.getElementById('galeri-foto-input');
      if (!fotoInput.files[0]) {
        Toast.warning('Mohon pilih foto kegiatan.');
        return;
      }
      const galeriData = {
        id: Utils.generateId(),
        judul,
        tanggal,
        deskripsi,
        foto: null
      };
      try {
        galeriData.foto = await Utils.fileToBase64(fotoInput.files[0]);
      } catch (err) {
        Toast.error('Gagal memproses foto.');
        return;
      }
      Store.galeri.push(galeriData);
      Dashboard.addActivity('galeri_tambah', `Foto galeri "${judul}" diunggah.`);
      Toast.success('Foto galeri berhasil diunggah!');
      form.reset();
      document.getElementById('galeri-foto-name').textContent = '';
      this.renderGrid();
    },
    renderGrid() {
      const grid = document.getElementById('gallery-grid');
      if (Store.galeri.length === 0) {
        grid.innerHTML = '<p class="empty-text">Belum ada foto yang diunggah.</p>';
        return;
      }
      grid.innerHTML = Store.galeri.map(item => `
        <div class="gallery-card" data-id="${item.id}">
          <img src="${item.foto}" alt="${Utils.escapeHtml(item.judul)}" class="gallery-image" />
          <div class="gallery-info">
            <h3 class="gallery-title">${Utils.escapeHtml(item.judul)}</h3>
            <p class="gallery-date"><i class="fas fa-calendar-alt"></i> ${Utils.formatDate(item.tanggal)}</p>
            <p class="gallery-desc">${Utils.escapeHtml(item.deskripsi)}</p>
          </div>
          <div class="gallery-actions">
            <button class="btn-icon delete" data-action="delete-galeri" data-id="${item.id}" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    },
    handleGridClick(e) {
      const btn = e.target.closest('[data-action="delete-galeri"]');
      if (!btn) return;
      const id = btn.dataset.id;
      const idx = Store.galeri.findIndex(g => g.id === id);
      if (idx !== -1) {
        const judul = Store.galeri[idx].judul;
        Store.galeri.splice(idx, 1);
        Toast.success(`Foto "${judul}" berhasil dihapus!`);
        Dashboard.addActivity('galeri_hapus', `Foto galeri berjudul "${judul}" dihapus.`);
        this.renderGrid();
      }
    }
  };
  const TurnamenManager = {
    pesertaData: [],
    currentEventId: null,
    currentEventTitle: '',
    currentEventLink: '',
    editingId: null,
    init() {
      const form = document.getElementById('form-turnamen');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
      document.getElementById('table-turnamen').addEventListener('click', (e) => {
        this.handleTableClick(e);
      });
      document.getElementById('modal-peserta-close').addEventListener('click', () => {
        document.getElementById('modal-peserta').classList.remove('active');
      });
      document.getElementById('modal-peserta').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.target.classList.remove('active');
      });
      const searchPeserta = document.getElementById('search-peserta');
      if (searchPeserta) {
        searchPeserta.addEventListener('input', (e) => {
          this.renderPesertaTable(e.target.value);
        });
      }
      const tabPending = document.getElementById('tab-btn-pending');
      const tabApproved = document.getElementById('tab-btn-approved');
      if (tabPending && tabApproved) {
        tabPending.addEventListener('click', () => {
          tabPending.className = 'btn btn-primary';
          tabApproved.className = 'btn btn-secondary';
          document.getElementById('container-pending').style.display = 'block';
          document.getElementById('container-approved').style.display = 'none';
        });
        tabApproved.addEventListener('click', () => {
          tabApproved.className = 'btn btn-primary';
          tabPending.className = 'btn btn-secondary';
          document.getElementById('container-approved').style.display = 'block';
          document.getElementById('container-pending').style.display = 'none';
        });
      }
      document.getElementById('container-pending').addEventListener('click', (e) => {
        this.handlePesertaAction(e);
      });
      document.getElementById('container-approved').addEventListener('click', (e) => {
        this.handlePesertaAction(e);
      });
      const btnExportPeserta = document.getElementById('btn-export-peserta');
      if (btnExportPeserta) {
        btnExportPeserta.addEventListener('click', () => this.exportExcel());
      }
      const role = sessionStorage.getItem('adminRole');
      const btnTambah = document.getElementById('btn-tambah-peserta-manual');
      if (btnTambah && role === 'super_admin') {
        btnTambah.style.display = 'inline-flex';
        btnTambah.addEventListener('click', () => this.openFormPesertaModal());
      }
      const formPeserta = document.getElementById('form-peserta-manual');
      if (formPeserta) {
        formPeserta.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFormPesertaSubmit();
        });
      }
      this.fetchEvents();
    },
    exportExcel() {
      if (!this.pesertaData || this.pesertaData.length === 0) {
        Toast.warning('Tidak ada pendaftar untuk diexport.');
        return;
      }
      const dataToExport = this.pesertaData.map((p, index) => ({
        'No': index + 1,
        'Nama Panggilan': p.nama || '-',
        'Nama Asli': p.nama_asli || '-',
        'Username Catur': p.username_catur || '-',
        'No WhatsApp': p.whatsapp || '-',
        'Domisili': p.domisili || '-',
        'No DANA': p.no_dana || '-',
        'Status': p.status || 'Pending',
        'Alasan / Motivasi': p.motivasi || '-',
        'Waktu Mendaftar': p.waktu_daftar ? Utils.formatDateTime(p.waktu_daftar) : '-'
      }));
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Peserta");
      const judulAman = this.currentEventTitle.replace(/[^a-z0-9]/gi, '_');
      const filename = `Peserta_${judulAman}.xlsx`;
      XLSX.writeFile(wb, filename);
      Toast.success('Data peserta berhasil diexport!');
    },
    async fetchEvents() {
      const tbody = document.getElementById('tbody-turnamen');
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Memuat data...</td></tr>';
      try {
        const response = await fetch('../api/get_events.php?admin=1');
        const result = await response.json();
        if (result.status === 'success') {
          if (result.data.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Belum ada turnamen</td></tr>';
          } else {
            tbody.innerHTML = result.data.map(ev => `
              <tr>
                <td>${Utils.formatDate(ev.tanggal)}</td>
                <td class="table-name">${Utils.escapeHtml(ev.judul)}</td>
                <td>
                    <small style="color:var(--text-muted);"><i class="fas fa-clock"></i> ${Utils.escapeHtml(ev.waktu)}</small><br>
                    <small style="color:var(--text-muted);"><i class="fas fa-gamepad"></i> ${Utils.escapeHtml(ev.mode)}</small>
                </td>
                <td><span class="badge ${ev.status === 'buka' ? 'badge-aktif' : 'badge-pending'}">${Utils.escapeHtml(ev.status.toUpperCase())}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn-icon edit" data-action="edit" data-id="${ev.id}" data-ev='${JSON.stringify(ev).replace(/'/g, "&#39;")}' title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" style="color:var(--accent-primary);" data-action="copy-link" data-id="${ev.id}" data-judul="${Utils.escapeHtml(ev.judul)}" title="Salin Link Pendaftaran">
                      <i class="fas fa-link"></i>
                    </button>
                    <button class="btn-icon view" data-action="view-peserta" data-id="${ev.id}" data-judul="${Utils.escapeHtml(ev.judul)}" data-link="${Utils.escapeHtml(ev.link_turnamen)}" title="Lihat Pendaftar">
                      <i class="fas fa-users"></i>
                    </button>
                    <button class="btn-icon" style="color:var(--color-success);" data-action="status" data-id="${ev.id}" data-status="buka" title="Buka">
                      <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" style="color:var(--color-warning);" data-action="status" data-id="${ev.id}" data-status="tutup" title="Tutup">
                      <i class="fas fa-stop"></i>
                    </button>
                    <button class="btn-icon" style="color:var(--text-muted);" data-action="status" data-id="${ev.id}" data-status="arsip" title="Arsipkan (Sembunyikan dari Web Utama)">
                      <i class="fas fa-archive"></i>
                    </button>
                    <button class="btn-icon" style="color:#f59e0b; background:rgba(245, 158, 11, 0.12);" data-action="sertifikat" data-id="${ev.id}" data-judul="${Utils.escapeHtml(ev.judul)}" title="Kirim Sertifikat">
                      <i class="fas fa-award"></i>
                    </button>
                    <button class="btn-icon delete" data-action="delete" data-id="${ev.id}" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('');
          }
        }
      } catch (err) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Gagal memuat data turnamen</td></tr>';
      }
    },
    async ubahStatus(id, statusBaru) {
      if (!confirm(`Yakin ingin mengubah status turnamen ini menjadi "${statusBaru}"?`)) return;
      try {
        const response = await fetch('../api/admin_update_event_status.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id, status: statusBaru })
        });
        const result = await response.json();
        if (result.status === 'success') {
          Toast.success(result.message || 'Status turnamen berhasil diubah.');
          Dashboard.addActivity('turnamen', `Status turnamen ID ${id} diubah menjadi "${statusBaru}".`);
          this.fetchEvents();
        } else {
          Toast.error(result.message || 'Gagal mengubah status turnamen.');
        }
      } catch (err) {
        Toast.error('Terjadi kesalahan jaringan.');
      }
    },
    openEditForm(ev) {
      this.editingId = ev.id;
      document.getElementById('turnamen-judul').value = ev.judul || '';
      document.getElementById('turnamen-tanggal').value = ev.tanggal || '';
      document.getElementById('turnamen-waktu').value = ev.waktu || '';
      document.getElementById('turnamen-mode').value = ev.mode || '';
      document.getElementById('turnamen-slot').value = ev.slot || '';
      document.getElementById('turnamen-status').value = ev.status || 'tutup';
      if (document.getElementById('turnamen-rating-min')) {
        document.getElementById('turnamen-rating-min').value = ev.rating_min || 0;
      }
      if (document.getElementById('turnamen-rating-max')) {
        document.getElementById('turnamen-rating-max').value = ev.rating_max || 3000;
      }
      document.getElementById('turnamen-deskripsi').value = ev.deskripsi || '';
      document.getElementById('turnamen-link').value = ev.link_turnamen || '';
      document.getElementById('form-turnamen').scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    async handleSubmit(form) {
      const payload = {
        judul: document.getElementById('turnamen-judul').value.trim(),
        tanggal: document.getElementById('turnamen-tanggal').value,
        waktu: document.getElementById('turnamen-waktu').value.trim(),
        mode: document.getElementById('turnamen-mode').value.trim(),
        slot: document.getElementById('turnamen-slot').value.trim(),
        status: document.getElementById('turnamen-status').value,
        rating_min: document.getElementById('turnamen-rating-min') ? document.getElementById('turnamen-rating-min').value : 0,
        rating_max: document.getElementById('turnamen-rating-max') ? document.getElementById('turnamen-rating-max').value : 3000,
        deskripsi: document.getElementById('turnamen-deskripsi').value.trim(),
        link_turnamen: document.getElementById('turnamen-link').value.trim()
      };
      const isEdit = !!this.editingId;
      if (isEdit) payload.id = this.editingId;
      try {
        const response = await fetch('../api/admin_save_event.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.status === 'success') {
          Toast.success(isEdit ? 'Turnamen berhasil diperbarui!' : 'Turnamen berhasil ditambahkan!');
          Dashboard.addActivity('turnamen', isEdit ? `Turnamen "${payload.judul}" diperbarui.` : `Turnamen baru "${payload.judul}" dijadwalkan.`);
          form.reset();
          this.editingId = null;
          this.fetchEvents();
        } else {
          Toast.error(isEdit ? 'Gagal memperbarui turnamen.' : 'Gagal menambahkan turnamen.');
        }
      } catch (err) {
        Toast.error('Koneksi ke server gagal.');
      }
    },
    async handleTableClick(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'edit') {
        const ev = JSON.parse(btn.dataset.ev);
        this.openEditForm(ev);
      } else if (action === 'copy-link') {
        const judul = btn.dataset.judul;
        const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const basePath = window.location.pathname.replace(/\/adm\/?.*$/, '');
        const link = window.location.origin + basePath + '/daftar-turnamen/' + slug;
        navigator.clipboard.writeText(link).then(() => {
          Toast.success('Link berhasil disalin: ' + link);
        }).catch(() => {
          Toast.error('Gagal menyalin link');
        });
      } else if (action === 'status') {
        const statusBaru = btn.dataset.status;
        this.ubahStatus(id, statusBaru);
      } else if (action === 'delete') {
        if (confirm('Yakin ingin menghapus turnamen ini?')) {
          try {
            const response = await fetch('../api/admin_delete_event.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (data.status === 'success') {
              Toast.success('Turnamen dihapus!');
              Dashboard.addActivity('turnamen_hapus', `Jadwal Turnamen ID ${id} dibatalkan/dihapus.`);
              this.fetchEvents();
            }
          } catch (err) {
            Toast.error('Gagal menghapus turnamen.');
          }
        }
      } else if (action === 'view-peserta') {
        const modal = document.getElementById('modal-peserta');
        const searchPeserta = document.getElementById('search-peserta');
        if (searchPeserta) searchPeserta.value = '';
        this.currentEventId = id;
        this.currentEventTitle = btn.dataset.judul;
        this.currentEventLink = btn.dataset.link;
        document.getElementById('tbody-peserta-pending').innerHTML = '<tr><td colspan="5" class="text-center">Memuat...</td></tr>';
        document.getElementById('tbody-peserta-approved').innerHTML = '<tr><td colspan="5" class="text-center">Memuat...</td></tr>';
        document.getElementById('tab-btn-pending').click();
        modal.classList.add('active');
        try {
          const response = await fetch(`../api/get_event_participants.php?event_id=${id}`);
          const result = await response.json();
          if (result.status === 'success') {
            this.pesertaData = result.data;
            this.renderPesertaTable('');
          } else {
            document.getElementById('tbody-peserta-pending').innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--color-danger);">Gagal memuat peserta.</td></tr>';
          }
        } catch (err) {
          document.getElementById('tbody-peserta-pending').innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--color-danger);">Koneksi terputus.</td></tr>';
        }
      } else if (action === 'sertifikat') {
        const judul = btn.dataset.judul;
        SertifikatManager.openModal(id, judul);
      }
    },
    renderPesertaTable(query) {
      const tbodyPending = document.getElementById('tbody-peserta-pending');
      const tbodyApproved = document.getElementById('tbody-peserta-approved');
      const lowerQuery = query.toLowerCase().trim();
      const filtered = this.pesertaData.filter(p => (p.username_catur || '').toLowerCase().includes(lowerQuery));
      const pending = filtered.filter(p => p.status === 'Pending' || !p.status);
      const approved = filtered.filter(p => p.status === 'Disetujui');
      const renderRow = (p, index, isPending) => {
        let tiktokLink = '-';
        if (p.tiktok && p.tiktok.trim() !== '') {
          const cleanTiktok = p.tiktok.replace('@', '');
          tiktokLink = `<a href="https://www.tiktok.com/@${encodeURIComponent(cleanTiktok)}" target="_blank" style="color:var(--accent-light); text-decoration:none;"><i class="fab fa-tiktok"></i> @${Utils.escapeHtml(cleanTiktok)}</a>`;
        }
        const role = sessionStorage.getItem('adminRole');
        const isSuperAdmin = role === 'super_admin';
        return `
            <tr>
               <td>${index + 1}</td>
               <td class="table-name">
                  <strong>${Utils.escapeHtml(p.nama)}</strong> <small style="color:var(--accent-light);">(${Utils.escapeHtml(p.nama_asli || '-')})</small><br>
                  <small style="color:var(--text-muted)">
                    <i class="fas fa-map-marker-alt"></i> ${Utils.escapeHtml(p.domisili || '-')} | <i class="fas fa-birthday-cake"></i> ${p.tanggal_lahir ? Utils.formatDate(p.tanggal_lahir) : '-'}<br>
                    <i class="fab fa-whatsapp"></i> WA: ${Utils.escapeHtml(p.whatsapp)} | DANA: ${Utils.escapeHtml(p.no_dana || '-')}
                  </small>
               </td>
               <td>
                  <a href="https://www.chess.com/member/${encodeURIComponent(p.username_catur)}" target="_blank" style="color:var(--accent-primary); font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
                     @${Utils.escapeHtml(p.username_catur)} <i class="fas fa-external-link-alt" style="font-size:0.7em;"></i>
                  </a><br>
                  <small>${tiktokLink}</small>
               </td>
               <td>${Utils.formatDateTime(p.waktu_daftar)}</td>
               <td>
                  <div class="table-actions">
                      ${isPending ? `
                      <button class="btn-icon view" data-action="approve-peserta" data-pid="${p.id}" data-nama="${Utils.escapeHtml(p.nama)}" data-wa="${Utils.escapeHtml(p.whatsapp)}" title="Terima & Kirim WA">
                         <i class="fas fa-check"></i>
                      </button>
                      ` : ''}
                      ${isSuperAdmin ? `
                      <button class="btn-icon edit" data-action="edit-peserta" data-pid="${p.id}" title="Edit Data">
                         <i class="fas fa-edit"></i>
                      </button>
                      ` : ''}
                      <button class="btn-icon delete" data-action="delete-peserta" data-pid="${p.id}" title="Hapus">
                         <i class="fas fa-trash"></i>
                      </button>
                  </div>
               </td>
            </tr>
            `;
      };
      tbodyPending.innerHTML = pending.length ? pending.map((p, i) => renderRow(p, i, true)).join('') : '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);">Tidak ada pendaftar pending.</td></tr>';
      tbodyApproved.innerHTML = approved.length ? approved.map((p, i) => renderRow(p, i, false)).join('') : '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);">Belum ada peserta yang disetujui.</td></tr>';
    },
    async handlePesertaAction(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const pid = btn.dataset.pid;
      if (action === 'approve-peserta') {
        const wa = btn.dataset.wa;
        const nama = btn.dataset.nama;
        try {
          const res = await fetch('../api/admin_update_participant_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: pid, status: 'Disetujui' })
          });
          const data = await res.json();
          if (data.status === 'success') {
            Toast.success('Peserta disetujui! Mengalihkan ke WhatsApp...');
            const p = this.pesertaData.find(x => x.id == pid);
            if (p) p.status = 'Disetujui';
            this.renderPesertaTable(document.getElementById('search-peserta').value || '');
            let cleanWa = wa.replace(/\D/g, '');
            if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
            const pesan = `Halo ${nama}, pendaftaran turnamen *${this.currentEventTitle}* kamu telah diverifikasi!%0A%0ASilakan bergabung ke arena turnamen melalui link berikut ini:%0A${this.currentEventLink}%0A%0ASemangat bertanding! ♟️`;
            window.open(`https://wa.me/${cleanWa}?text=${pesan}`, '_blank');
          } else {
            Toast.error('Gagal menyetujui peserta.');
          }
        } catch (err) {
          Toast.error('Koneksi ke server gagal.');
        }
      }
      else if (action === 'edit-peserta') {
        const p = this.pesertaData.find(x => String(x.id) === String(pid));
        if (p) this.openFormPesertaModal(p);
      }
      else if (action === 'delete-peserta') {
        if (confirm('Yakin ingin menghapus peserta ini dari turnamen?')) {
          try {
            const response = await fetch('../api/admin_delete_participant.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: pid })
            });
            const data = await response.json();
            if (data.status === 'success') {
              Toast.success('Peserta berhasil dihapus dari turnamen!');
              Dashboard.addActivity('pendaftaran_hapus', `Menghapus peserta (ID: ${pid}) dari turnamen.`);
              this.pesertaData = this.pesertaData.filter(p => String(p.id) !== String(pid));
              this.renderPesertaTable(document.getElementById('search-peserta').value || '');
            } else {
              Toast.error('Gagal menghapus: ' + data.message);
            }
          } catch (err) {
            Toast.error('Koneksi ke server gagal.');
          }
        }
      }
    },
    openFormPesertaModal(p = null) {
      const modal = document.getElementById('modal-form-peserta');
      const form = document.getElementById('form-peserta-manual');
      form.reset();
      document.getElementById('form-peserta-title').textContent = p ? 'Edit Data Peserta' : 'Tambah Peserta Manual';
      document.getElementById('peserta-form-id').value = p ? p.id : '';
      if (p) {
        document.getElementById('peserta-form-nama').value = p.nama || '';
        document.getElementById('peserta-form-asli').value = p.nama_asli || '';
        document.getElementById('peserta-form-lahir').value = p.tanggal_lahir || '';
        document.getElementById('peserta-form-domisili').value = p.domisili || '';
        document.getElementById('peserta-form-wa').value = p.whatsapp || '';
        document.getElementById('peserta-form-dana').value = p.no_dana || '';
        document.getElementById('peserta-form-catur').value = p.username_catur || '';
        document.getElementById('peserta-form-tiktok').value = p.tiktok || '';
        document.getElementById('peserta-form-status').value = p.status || 'Pending';
      } else {
        document.getElementById('peserta-form-status').value = 'Disetujui';
      }
      modal.classList.add('active');
    },
    async handleFormPesertaSubmit() {
      const payload = {
        id: document.getElementById('peserta-form-id').value,
        turnamen_id: this.currentEventId,
        nama: document.getElementById('peserta-form-nama').value,
        nama_asli: document.getElementById('peserta-form-asli').value,
        tanggal_lahir: document.getElementById('peserta-form-lahir').value,
        domisili: document.getElementById('peserta-form-domisili').value,
        whatsapp: document.getElementById('peserta-form-wa').value,
        no_dana: document.getElementById('peserta-form-dana').value,
        username_catur: document.getElementById('peserta-form-catur').value,
        tiktok: document.getElementById('peserta-form-tiktok').value,
        status: document.getElementById('peserta-form-status').value,
      };
      try {
        const res = await fetch('../api/admin_save_participant.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
          Toast.success(data.message);
          document.getElementById('modal-form-peserta').classList.remove('active');
          const refreshRes = await fetch(`../api/get_event_participants.php?event_id=${this.currentEventId}`);
          const refreshResult = await refreshRes.json();
          if (refreshResult.status === 'success') {
            this.pesertaData = refreshResult.data;
            this.renderPesertaTable(document.getElementById('search-peserta').value || '');
          }
        } else {
          Toast.error(data.message);
        }
      } catch (err) {
        Toast.error('Koneksi ke server gagal.');
      }
    }
  };
  const SertifikatManager = {
    pesertaData: [],
    init() {
      document.getElementById('modal-sertifikat-close').addEventListener('click', () => {
        document.getElementById('modal-sertifikat').classList.remove('active');
      });
      document.getElementById('modal-sertifikat').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.target.classList.remove('active');
      });
      document.getElementById('cert-search').addEventListener('input', (e) => {
        this.renderTable(e.target.value);
      });
      document.getElementById('tbody-cert-peserta').addEventListener('click', (e) => {
        this.handleGenerate(e);
      });
    },
    async openModal(eventId, eventTitle) {
      document.getElementById('cert-event-id').value = eventId;
      document.getElementById('cert-event-title').textContent = "Turnamen: " + eventTitle;
      document.getElementById('cert-search').value = "";
      const tbody = document.getElementById('tbody-cert-peserta');
      const modal = document.getElementById('modal-sertifikat');
      tbody.innerHTML = '<tr><td colspan="2" class="text-center">Memuat daftar peserta...</td></tr>';
      modal.classList.add('active');
      try {
        const res = await fetch(`../api/get_event_participants.php?event_id=${eventId}`);
        const result = await res.json();
        if (result.status === 'success') {
          this.pesertaData = result.data;
          this.renderTable('');
        } else {
          tbody.innerHTML = '<tr><td colspan="2" class="text-center" style="color:var(--color-danger);">Gagal memuat peserta.</td></tr>';
        }
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center" style="color:var(--color-danger);">Koneksi terputus.</td></tr>';
      }
    },
    renderTable(query) {
      const tbody = document.getElementById('tbody-cert-peserta');
      const lowerQuery = query.toLowerCase().trim();
      const filtered = this.pesertaData.filter(p => (p.username_catur || '').toLowerCase().includes(lowerQuery));
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center" style="color:var(--text-muted);">Tidak ada peserta yang cocok.</td></tr>';
        return;
      }
      tbody.innerHTML = filtered.map(p => `
        <tr>
          <td>
             <strong>${Utils.escapeHtml(p.nama)}</strong> <span style="color:var(--accent-primary)">(@${Utils.escapeHtml(p.username_catur)})</span><br>
             <small style="color:var(--text-muted)"><i class="fab fa-whatsapp"></i> ${Utils.escapeHtml(p.whatsapp)}</small>
          </td>
          <td style="text-align: right;">
             <button class="btn btn-primary btn-sm" data-action="generate-cert" data-pid="${p.id}">
               <i class="fas fa-paper-plane"></i> Buat & WA
             </button>
          </td>
        </tr>
      `).join('');
    },
    async handleGenerate(e) {
       const btn = e.target.closest('[data-action="generate-cert"]');
       if (!btn) return;
       const pesertaId = btn.dataset.pid;
       const eventId = document.getElementById('cert-event-id').value;
       const juara = document.getElementById('cert-juara').value;
       const originalText = btn.innerHTML;
       btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Proses...';
       btn.disabled = true;
       try {
         const response = await fetch('../api/admin_generate_certificate.php', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ event_id: eventId, peserta_id: pesertaId, juara: juara })
         });
         const data = await response.json();
         if (data.status === 'success') {
             let cleanWa = data.wa.replace(/\D/g, '');
             if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
             const pesan = `Halo ${Utils.escapeHtml(data.nama)}, selamat! Anda berhasil meraih *Juara ${juara}* di turnamen catur BLUNDER SQUAD.%0A%0ASilakan unduh e-Sertifikat resmi Anda melalui tautan berikut:%0A${data.url}%0A%0ATerima kasih atas partisipasinya!`;
             Dashboard.addActivity('sertifikat', `meng-generate sertifikat turnamen juara ${juara} kepada "${data.nama}"`);
             btn.innerHTML = originalText;
             btn.disabled = false;
             Toast.success('Mengalihkan ke WhatsApp...');
             setTimeout(() => {
                 window.location.href = `https://wa.me/${cleanWa}?text=${pesan}`;
             }, 1500);
         } else {
             Toast.error('Gagal: ' + data.message);
             btn.innerHTML = originalText;
             btn.disabled = false;
         }
       } finally {
           btn.innerHTML = originalText;
           btn.disabled = false;
       }
    }
  };
  const SettingsManager = {
    init() {
      const form = document.getElementById('form-pengaturan');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
      this.loadSettings();
      const logoInput = document.getElementById('settings-logo-input');
      logoInput.addEventListener('change', (e) => {
        document.getElementById('settings-logo-name').textContent = e.target.files[0] ? e.target.files[0].name : '';
      });
    },
    loadSettings() {
      document.getElementById('settings-nama').value = Store.settings.nama_komunitas;
      document.getElementById('settings-email').value = Store.settings.email;
      document.getElementById('settings-whatsapp').value = Store.settings.whatsapp;
      document.getElementById('settings-instagram').value = Store.settings.instagram;
      document.getElementById('settings-discord').value = Store.settings.discord;
      document.getElementById('settings-website').value = Store.settings.website;
    },
    async handleSubmit(form) {
      const nama = document.getElementById('settings-nama').value.trim();
      const email = document.getElementById('settings-email').value.trim();
      if (!nama || !email) {
        Toast.warning('Mohon isi nama komunitas dan email.');
        return;
      }
      const logoInput = document.getElementById('settings-logo-input');
      const settingsData = {
        nama_komunitas: nama,
        email,
        whatsapp: document.getElementById('settings-whatsapp').value.trim(),
        instagram: document.getElementById('settings-instagram').value.trim(),
        discord: document.getElementById('settings-discord').value.trim(),
        website: document.getElementById('settings-website').value.trim(),
        logo: Store.settings.logo
      };
      if (logoInput.files[0]) {
        try {
          settingsData.logo = await Utils.fileToBase64(logoInput.files[0]);
        } catch (err) {
          Toast.error('Gagal memproses logo.');
          return;
        }
      }
      Store.settings = { ...Store.settings, ...settingsData };
      Dashboard.addActivity('pengaturan', `Pengaturan sistem & profil komunitas diperbarui.`);
      Toast.success('Pengaturan berhasil disimpan!');
    }
  };
  const ChatManager = {
    currentSessionId: null,
    listTimer: null,
    msgTimer: null,
    isOnLivechatPage: false,
    init() {
      const sendBtn = document.getElementById('adminChatSend');
      const input = document.getElementById('adminChatInput');
      const listEl = document.getElementById('chatSessionsList');
      if (listEl) {
        listEl.addEventListener('click', (e) => {
          const item = e.target.closest('[data-session-id]');
          if (!item) return;
          this.openChat(item.dataset.sessionId);
        });
      }
      if (sendBtn) sendBtn.addEventListener('click', () => this.sendReply());
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendReply();
          }
        });
      }
      this.ensureSenderLabelStyle();
      this.loadChatList(true);
      this.listTimer = setInterval(() => this.loadChatList(true), 8000);
    },
    enterPage() {
      this.isOnLivechatPage = true;
      this.loadChatList(false);
      if (this.msgTimer) clearInterval(this.msgTimer);
      this.msgTimer = setInterval(() => {
        this.loadChatList(false);
        if (this.currentSessionId) this.fetchMessages(true);
      }, 4000);
    },
    leavePage() {
      this.isOnLivechatPage = false;
      if (this.msgTimer) {
        clearInterval(this.msgTimer);
        this.msgTimer = null;
      }
    },
    ensureSenderLabelStyle() {
      if (document.getElementById('chat-sender-label-style')) return;
      const style = document.createElement('style');
      style.id = 'chat-sender-label-style';
      style.textContent = `
        .msg-sender-label {
          font-size: 11px;
          font-weight: 700;
          opacity: 0.75;
          margin-bottom: 3px;
        }
      `;
      document.head.appendChild(style);
    },
    async loadChatList(backgroundOnly) {
      const listEl = document.getElementById('chatSessionsList');
      try {
        const res = await fetch('../api/admin_get_chat_list.php');
        const data = await res.json();
        if (data.status !== 'success') return;
        const totalUnread = data.data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        const navBadge = document.getElementById('chatNavBadge');
        if (navBadge) {
          navBadge.hidden = totalUnread === 0;
          navBadge.textContent = totalUnread;
        }
        if (backgroundOnly && !this.isOnLivechatPage) return;
        if (!listEl) return;
        if (data.data.length === 0) {
          listEl.innerHTML = '<p class="empty-text" style="padding:16px; color:var(--text-muted);">Belum ada percakapan.</p>';
          return;
        }
        listEl.innerHTML = data.data.map(chat => {
          const label = chat.visitor_name && chat.visitor_name.trim() !== ''
            ? Utils.escapeHtml(chat.visitor_name)
            : 'Pengunjung ' + chat.session_id.substring(0, 6);
          return `
            <div class="chat-session-item ${chat.session_id === this.currentSessionId ? 'active' : ''}" data-session-id="${chat.session_id}" data-visitor-label="${label}">
              <h4 style="display:flex; align-items:center; justify-content:space-between;">
                <span>${label}</span>
                ${chat.unread_count > 0 ? `<span class="chat-session-unread">${chat.unread_count}</span>` : ''}
              </h4>
              <p>${chat.last_sender === 'admin' ? 'Kamu: ' : ''}${Utils.escapeHtml(chat.last_message || '')}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <small class="chat-session-ip"><i class="fas fa-globe"></i> ${Utils.escapeHtml(chat.ip_address || '-')}</small>
                <small style="color:var(--text-muted);">${Utils.timeAgo(chat.last_update)}</small>
              </div>
            </div>
          `;
        }).join('');
      } catch (err) {
        if (listEl && this.isOnLivechatPage) {
          listEl.innerHTML = '<p class="empty-text" style="padding:16px; color:var(--color-danger);">Koneksi ke server gagal.</p>';
        }
      }
    },
    openChat(sessionId) {
      this.currentSessionId = sessionId;
      document.getElementById('chatEmptyState').style.display = 'none';
      document.getElementById('chatMainArea').style.display = 'flex';
      document.querySelectorAll('#chatSessionsList [data-session-id]').forEach(el => {
        el.classList.toggle('active', el.dataset.sessionId === sessionId);
      });
      const clicked = document.querySelector(`#chatSessionsList [data-session-id="${CSS.escape(sessionId)}"]`);
      document.getElementById('activeChatId').textContent = clicked ? clicked.dataset.visitorLabel : 'Pengunjung';
      this.fetchMessages(false);
    },
    parseAdminMessage(rawMessage) {
      const match = /^\s*<strong>\(([^)]+)\)<\/strong>\s*/i.exec(rawMessage || '');
      if (match) {
        return {
          senderLabel: match[1].trim(),
          text: rawMessage.slice(match[0].length)
        };
      }
      return { senderLabel: null, text: rawMessage || '' };
    },
    async fetchMessages(silent) {
      if (!this.currentSessionId) return;
      const msgArea = document.getElementById('chatMessagesArea');
      if (!msgArea) return;
      try {
        const res = await fetch(`../api/admin_get_chat_messages.php?session_id=${encodeURIComponent(this.currentSessionId)}`);
        const data = await res.json();
        if (data.status !== 'success') return;
        document.getElementById('activeChatIp').textContent = data.ip_address || '-';
        msgArea.innerHTML = data.messages.map(m => {
          const { senderLabel, text } = this.parseAdminMessage(m.message);
          const labelHtml = senderLabel
            ? `<div class="msg-sender-label">${Utils.escapeHtml(senderLabel)}</div>`
            : '';
          return `
          <div class="msg-bubble ${m.sender_type === 'admin' ? 'admin' : 'user'}">
            ${labelHtml}${Utils.escapeHtml(text)}
            <div class="msg-time">${Utils.timeAgo(m.created_at)}</div>
          </div>
        `;
        }).join('');
        if (!silent) msgArea.scrollTop = msgArea.scrollHeight;
        else msgArea.scrollTop = msgArea.scrollHeight;
        this.loadChatList(true);
      } catch (err) {
        if (!silent) Toast.error('Gagal memuat pesan.');
      }
    },
    async sendReply() {
      const input = document.getElementById('adminChatInput');
      if (!input || !this.currentSessionId) return;
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      try {
        const res = await fetch('../api/admin_chat_reply.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: this.currentSessionId,
            message: text
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          this.fetchMessages(false);
        } else {
          Toast.error('Gagal mengirim pesan: ' + data.message);
          input.value = text;
        }
      } catch (err) {
        Toast.error('Koneksi ke server gagal.');
        input.value = text;
      }
    }
  };
  const FeedbackManager = {
      async fetchData() {
          const tbody = document.getElementById('tbody-feedback');
          tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Memuat data...</td></tr>';
          try {
              const res = await fetch('../api/admin_get_feedback.php');
              const result = await res.json();
              if(result.status === 'success') {
                  if(result.data.length === 0) {
                      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Belum ada kritik dan saran.</td></tr>';
                  } else {
                      tbody.innerHTML = result.data.map(f => `
                          <tr>
                              <td style="white-space:nowrap; color:var(--text-muted); font-size:12px;">
                                  ${Utils.formatDateTime(f.tanggal)}
                              </td>
                              <td><strong style="color:var(--accent-light);">${Utils.escapeHtml(f.nama)}</strong></td>
                              <td style="line-height:1.6;">${Utils.escapeHtml(f.pesan)}</td>
                          </tr>
                      `).join('');
                  }
              } else {
                 tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--color-danger);">Gagal memuat data.</td></tr>';
              }
          } catch(e) {
              tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--color-danger);">Koneksi terputus.</td></tr>';
          }
      }
  };
  function setupEventDelegation() {
    document.getElementById('table-anggota').addEventListener('click', (e) => {
      AnggotaManager.handleTableClick(e);
    });
    document.getElementById('pagination-anggota').addEventListener('click', (e) => {
      AnggotaManager.handlePaginationClick(e);
    });
    document.getElementById('ebook-grid').addEventListener('click', (e) => {
      EbookManager.handleGridClick(e);
    });
    document.getElementById('gallery-grid').addEventListener('click', (e) => {
      GaleriManager.handleGridClick(e);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ModalAnggota.close();
        ModalDetail.close();
        ModalHapus.close();
        ModalTolak.close();
        Sidebar.close();
      }
    });
    document.getElementById('modal-tolak-close')?.addEventListener('click', () => ModalTolak.close());
    document.getElementById('modal-tolak-cancel')?.addEventListener('click', () => ModalTolak.close());
    document.getElementById('modal-tolak-confirm')?.addEventListener('click', () => ModalTolak.confirm());
    document.getElementById('tolak-alasan')?.addEventListener('change', (e) => {
      document.getElementById('tolak-alasan-lain-group').style.display = e.target.value === 'Lainnya' ? 'block' : 'none';
    });
  }
  function init() {
    Toast.init();
    Router.init();
    Sidebar.init();
    setupEventDelegation();
    TurnamenManager.init();
    AnggotaManager.init();
    EbookManager.init();
    GaleriManager.init();
    SettingsManager.init();
    CalonAnggotaManager.init();
    SertifikatManager.init();
    ChatManager.init();
    AgendaManager.init();
    Dashboard.refresh();
    EbookManager.renderGrid();
    GaleriManager.renderGrid();
    CalonAnggotaManager.renderTable();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('DOMContentLoaded', () => {
    const role = sessionStorage.getItem('adminRole');
    if (role === 'super_admin') {
      const panel = document.getElementById('super-admin-panel');
      if (panel) panel.style.display = 'block';
      const loadAdminTokens = async () => {
        try {
            const res = await fetch('../api/admin_get_tokens.php');
            const data = await res.json();
            const tbody = document.getElementById('tbody-admin-tokens');
            if (data.status === 'success') {
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color:var(--text-muted);">Belum ada admin staff yang didaftarkan.</td></tr>';
                } else {
                    tbody.innerHTML = data.data.map(admin => `
                        <tr>
                            <td style="font-weight:600;">${Utils.escapeHtml(admin.username)}</td>
                            <td style="font-family: monospace; color: var(--accent-light); letter-spacing:1px;">${Utils.escapeHtml(admin.token)}</td>
                            <td style="text-align:center;">
                                <button class="btn-icon delete" onclick="deleteAdminToken(${admin.id}, '${Utils.escapeHtml(admin.username)}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (e) {
            console.error("Gagal memuat token");
        }
      };
      window.deleteAdminToken = async (id, username) => {
        if (!confirm(`Yakin ingin menghapus akses untuk admin "${username}"?\nToken ini akan hangus selamanya.`)) return;
        try {
            const res = await fetch('../api/admin_delete_token.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const data = await res.json();
            if (data.status === 'success') {
                Toast.success(`Akses admin ${username} berhasil dicabut.`);
                loadAdminTokens();
            } else {
                Toast.error(data.message);
            }
        } catch (e) {
            Toast.error("Gagal menghapus token.");
        }
      };
      const btnCreateAdmin = document.getElementById('btn-create-admin');
      if (btnCreateAdmin) {
        btnCreateAdmin.addEventListener('click', async () => {
          const newUsername = document.getElementById('new-admin-username').value;
          if (!newUsername) return Toast.warning("Username harus diisi");
          const originalText = btnCreateAdmin.innerHTML;
          btnCreateAdmin.innerHTML = "Memproses...";
          btnCreateAdmin.disabled = true;
          try {
            const res = await fetch('../api/admin_create_token.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ new_admin_username: newUsername })
            });
            const data = await res.json();
            if (data.status === 'success') {
              document.getElementById('new-admin-token-display').innerHTML = `
                Berhasil! Token untuk <strong>${newUsername}</strong>: <br>
                <div style="background:rgba(255,255,255,0.1); padding:8px 12px; margin-top:5px; border-radius:6px; font-family:monospace; user-select:all;">${data.token}</div>
                <small style="color:var(--text-muted);">(Token ini juga bisa dilihat di tabel bawah)</small>
              `;
              document.getElementById('new-admin-username').value = '';
              loadAdminTokens();
            } else {
              Toast.error(data.message);
            }
          } catch (err) {
            Toast.error("Gagal membuat admin");
          } finally {
            btnCreateAdmin.innerHTML = originalText;
            btnCreateAdmin.disabled = false;
          }
        });
      }
      loadAdminTokens();
      const btnReg = document.getElementById('btn-toggle-registration');
      if (btnReg) {
        fetch('../api/admin_toggle_registration.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' })
        })
        .then(r => r.json())
        .then(d => updateRegBtn(d.is_open))
        .catch(() => btnReg.innerHTML = 'Gagal memuat status');
        btnReg.addEventListener('click', () => {
          const isCurrentlyOpen = btnReg.dataset.status === 'open';
          const action = isCurrentlyOpen ? 'close' : 'open';
          const confirmMsg = isCurrentlyOpen
            ? 'Tutup form pendaftaran anggota dari website utama sekarang?'
            : 'Buka kembali form pendaftaran anggota?';
          if (confirm(confirmMsg)) {
            const originalText = btnReg.innerHTML;
            btnReg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btnReg.disabled = true;
            fetch('../api/admin_toggle_registration.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: action })
            })
            .then(r => r.json())
            .then(d => {
              if (d.status === 'success') {
                updateRegBtn(d.is_open);
                Toast.success(d.is_open ? 'Form Pendaftaran Dibuka' : 'Form Pendaftaran Ditutup');
                Dashboard.addActivity('pengaturan', d.is_open ? 'Membuka form pendaftaran' : 'Menutup form pendaftaran');
              } else {
                Toast.error(d.message);
                btnReg.innerHTML = originalText;
              }
            })
            .catch(() => {
              Toast.error('Gagal terhubung ke server');
              btnReg.innerHTML = originalText;
            })
            .finally(() => btnReg.disabled = false);
          }
        });
        function updateRegBtn(isOpen) {
          if (isOpen) {
            btnReg.dataset.status = 'open';
            btnReg.className = 'btn btn-danger';
            btnReg.innerHTML = '<i class="fas fa-door-closed"></i> Tutup Pendaftaran';
          } else {
            btnReg.dataset.status = 'closed';
            btnReg.style.background = '#10b981';
            btnReg.style.color = '#fff';
            btnReg.innerHTML = '<i class="fas fa-door-open"></i> Buka Pendaftaran';
          }
        }
      }
      const btnMaintenance = document.getElementById('btn-toggle-maintenance');
      if (btnMaintenance) {
        fetch('../api/admin_toggle_maintenance.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' })
        })
        .then(r => r.json())
        .then(d => updateMaintenanceBtn(d.maintenance))
        .catch(() => btnMaintenance.innerHTML = 'Gagal memuat status');
        btnMaintenance.addEventListener('click', () => {
          const isCurrentlyOn = btnMaintenance.dataset.status === 'on';
          const action = isCurrentlyOn ? 'off' : 'on';
          const confirmMsg = isCurrentlyOn
            ? 'Web utama akan kembali ONLINE. Lanjutkan?'
            : 'Aktifkan Maintenance? Pengunjung akan dialihkan ke halaman maintenance.html.';
          if (confirm(confirmMsg)) {
            const originalText = btnMaintenance.innerHTML;
            btnMaintenance.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            btnMaintenance.disabled = true;
            fetch('../api/admin_toggle_maintenance.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: action })
            })
            .then(r => r.json())
            .then(d => {
              if (d.status === 'success') {
                updateMaintenanceBtn(d.maintenance);
                Toast.success(d.maintenance ? 'Web sekarang offline (Maintenance)' : 'Web sekarang online');
                Dashboard.addActivity('pengaturan', d.maintenance ? 'Mengaktifkan mode maintenance' : 'Mematikan mode maintenance');
              } else {
                Toast.error(d.message);
                btnMaintenance.innerHTML = originalText;
              }
            })
            .catch(() => {
              Toast.error('Gagal terhubung ke server');
              btnMaintenance.innerHTML = originalText;
            })
            .finally(() => btnMaintenance.disabled = false);
          }
        });
        function updateMaintenanceBtn(isOn) {
          if (isOn) {
            btnMaintenance.dataset.status = 'on';
            btnMaintenance.className = 'btn btn-danger';
            btnMaintenance.innerHTML = '<i class="fas fa-power-off"></i> Matikan Maintenance (Web Offline)';
          } else {
            btnMaintenance.dataset.status = 'off';
            btnMaintenance.style.background = '#f59e0b';
            btnMaintenance.style.color = '#fff';
            btnMaintenance.innerHTML = '<i class="fas fa-tools"></i> Aktifkan Maintenance (Web Online)';
          }
        }
      }
    }
  });
})();