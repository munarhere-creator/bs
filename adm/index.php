<?php
session_set_cookie_params(['lifetime' => 0]);
session_start();

// --- Generate CSRF Token ---
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login.php");
    exit;
}
$timeout_duration = 1800; 
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
    session_unset();
    session_destroy();
    header("Location: login.php?timeout=1");
    exit;
}
$_SESSION['last_activity'] = time();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chess Club Dashboard</title>
  <!-- Simpan CSRF Token di Meta Tag -->
  <meta name="csrf-token" content="<?php echo $_SESSION['csrf_token']; ?>">
  <link rel="icon" type="image/png" href="../assets/logo2.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link rel="stylesheet" href="adm.css" />
</head>
<body>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <img src="../assets/logo.png" alt="Chess Club Logo" class="logo-icon" />
        <span class="logo-text">Blunder Squad</span>
      </div>
    </div>
    <nav class="sidebar-nav" id="sidebar-nav">
      <a href="#" class="nav-item active" data-page="dashboard">
        <i class="fas fa-tachometer-alt"></i>
        <span>Dashboard</span>
      </a>
      <a href="#" class="nav-item" data-page="agenda">
        <i class="fas fa-calendar-alt"></i>
        <span>Kelola Kalender</span>
      </a>
      <a href="#" class="nav-item" data-page="feedback">
        <i class="fas fa-comments"></i>
        <span>Kritik & Saran</span>
      </a>
      <a href="#" class="nav-item" data-page="turnamen">
        <i class="fas fa-trophy"></i>
        <span>Kelola Turnamen</span>
      </a>
      <a href="#" class="nav-item" data-page="calon-anggota">
        <i class="fas fa-bell"></i>
        <span>Calon Anggota</span>
      </a>
      <a href="#" class="nav-item" data-page="daftar-ulang">
        <i class="fas fa-clipboard-list"></i>
        <span>Pendaftaran Ulang</span>
      </a>
      <a href="#" class="nav-item" data-page="anggota">
        <i class="fas fa-users"></i>
        <span>Kelola Anggota</span>
      </a>
      <a href="#" class="nav-item" data-page="ebook">
        <i class="fas fa-book"></i>
        <span>Input Ebook</span>
      </a>
      <a href="#" class="nav-item" data-page="galeri">
        <i class="fas fa-images"></i>
        <span>Galeri Komunitas</span>
      </a>
      <a href="#" class="nav-item" data-page="pengaturan">
        <i class="fas fa-cog"></i>
        <span>Pengaturan</span>
      </a>
      <a href="#" class="nav-item" data-page="broadcast">
        <i class="fas fa-bullhorn"></i>
        <span>Broadcast WA</span>
      </a>
      <a href="#" class="nav-item" data-page="livechat">
        <i class="fas fa-comments"></i>
        <span>Live Chat</span>
        <span class="chat-nav-badge" id="chatNavBadge" hidden>0</span>
      </a>
      <div style="flex: 1;"></div>
      <a href="logout.php" class="nav-item" style="color: #ef4444; margin-top: 20px;">
        <i class="fas fa-sign-out-alt"></i>
        <span>Keluar</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="user-details">
          <span class="user-name"><?php echo htmlspecialchars($_SESSION['admin_username'] ?? 'Admin'); ?></span>
          <span class="user-role"><?php echo ($_SESSION['admin_role'] ?? '') === 'super_admin' ? 'Super Administrator' : 'Administrator'; ?></span>
        </div>
      </div>
    </div>
  </aside>
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <main class="main-content" id="main-content">
    <header class="mobile-header" id="mobile-header">
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu">
        <i class="fas fa-bars"></i>
      </button>
      <div class="header-logo">
        <img src="../assets/logo2.png" alt="Logo" class="header-logo-icon" />
        <span>blunder squad</span>
      </div>
      <div class="header-spacer"></div>
    </header>
    <div class="page-container" id="page-container">
      <section class="page active" id="page-dashboard">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Ringkasan aktivitas klub catur</p>
        </div>
        <div class="stats-grid" id="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="stat-total-anggota">0</span>
              <span class="stat-label">Total Anggota</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-user-clock"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="stat-pending">0</span>
              <span class="stat-label">Pendaftaran Pending</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-book"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="stat-ebook">0</span>
              <span class="stat-label">Total Ebook</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-image"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="stat-galeri">0</span>
              <span class="stat-label">Foto Galeri</span>
            </div>
          </div>
        </div>
        <div class="dashboard-sections">
          <div class="section-card">
            <h2 class="section-title"><i class="fas fa-chart-line"></i> Distribusi Jabatan</h2>
            <div class="position-chart" id="position-chart"></div>
          </div>
          <div class="section-card">
            <h2 class="section-title"><i class="fas fa-clock"></i> Aktivitas Terbaru</h2>
            <div class="activity-list" id="activity-list">
              <p class="empty-text">Belum ada aktivitas terbaru.</p>
            </div>
          </div>
        </div>
      </section>
      <section class="page" id="page-agenda">
        <div class="page-header">
          <h1 class="page-title">Kelola Kalender Kegiatan</h1>
          <p class="page-subtitle">Jadwalkan latihan, turnamen, rapat, atau acara sosial</p>
        </div>
        <div class="form-card mb-6">
          <form id="form-agenda" class="data-form">
            <input type="hidden" id="agenda-id" />
            <div class="form-grid">
              <div class="form-group">
                <label for="agenda-judul">Judul Agenda <span class="required">*</span></label>
                <input type="text" id="agenda-judul" required placeholder="Contoh: Latihan Rutin Mingguan" />
              </div>
              <div class="form-group">
                <label for="agenda-tanggal">Tanggal <span class="required">*</span></label>
                <input type="date" id="agenda-tanggal" required />
              </div>
              <div class="form-group">
                <label for="agenda-waktu">Waktu (Jam) <span class="required">*</span></label>
                <input type="text" id="agenda-waktu" required placeholder="Contoh: 19:00 WIB" />
              </div>
              <div class="form-group">
                <label for="agenda-tipe">Tipe Agenda <span class="required">*</span></label>
                <select id="agenda-tipe" required>
                  <option value="latihan">Latihan</option>
                  <option value="turnamen">Turnamen</option>
                  <option value="rapat">Rapat</option>
                  <option value="sosial">Acara Sosial (Kopdar dll)</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label for="agenda-lokasi">Lokasi / Platform <span class="required">*</span></label>
                <input type="text" id="agenda-lokasi" required placeholder="Contoh: Sekretariat Blunder Squad atau Zoom" />
              </div>
              <div class="form-group full-width">
                <label for="agenda-deskripsi">Deskripsi Singkat</label>
                <textarea id="agenda-deskripsi" rows="2" placeholder="Persiapan atau catatan khusus acara..."></textarea>
              </div>
              <div class="form-group full-width">
                <label for="agenda-cp">Contact Person (Opsional)</label>
                <input type="text" id="agenda-cp" placeholder="Contoh: Bro Rangga (08123xxx)" />
              </div>
            </div>
            <div class="form-actions mt-4">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Simpan Agenda
              </button>
            </div>
          </form>
        </div>
        <div class="table-container mt-6">
          <table class="data-table" id="table-agenda">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul & Tipe</th>
                <th>Waktu & Lokasi</th>
                <th>Contact Person</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-agenda">
            </tbody>
          </table>
        </div>
      </section>
      <section class="page" id="page-broadcast">
        <div class="page-header">
          <h1 class="page-title">Broadcast WhatsApp</h1>
          <p class="page-subtitle">Kirim pesan massal otomatis ke anggota klub atau peserta turnamen.</p>
        </div>
        <div class="form-card">
          <form id="form-broadcast" class="data-form">
            <div class="form-group">
              <label>Target Penerima <span class="required">*</span></label>
              <select id="bc-target" required>
                <option value="">-- Pilih Target Penerima --</option>
                <option value="member_aktif">Semua Anggota Aktif</option>
                <option value="member_pending">Calon Anggota (Belum Disetujui)</option>
                <optgroup label="Peserta Turnamen" id="bc-turnamen-list">
                </optgroup>
              </select>
            </div>
            <div class="form-group mt-3">
              <label>Isi Pesan <span class="required">*</span></label>
              <textarea id="bc-message" rows="6" placeholder="Halo {nama}, turnamen malam ini akan segera dimulai..." required></textarea>
              <small style="color:var(--text-muted); font-size: 12px; margin-top: 5px;">Gunakan variabel <strong>{nama}</strong> di dalam teks. Sistem akan otomatis mengubahnya menjadi nama asli masing-masing penerima.</small>
            </div>
            <div class="form-actions mt-4">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-list-ol"></i> Cek Daftar Penerima
              </button>
            </div>
          </form>
        </div>
        <div id="bc-result-area" style="display: none; margin-top: 32px;">
          <h2 class="section-title">Daftar Penerima (<span id="bc-count">0</span> Kontak)</h2>
          <p style="color:var(--text-muted); font-size:13px; margin-bottom: 15px;">Periksa kembali daftar kontak di bawah. Jika sudah benar, klik tombol kirim di bawah tabel untuk mengeksekusi broadcast massal.</p>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Penerima</th>
                  <th>No. WhatsApp</th>
                  <th>Status Pengiriman</th>
                </tr>
              </thead>
              <tbody id="tbody-broadcast">
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section class="page" id="page-livechat">
        <div class="page-header">
          <h1 class="page-title">Live Chat</h1>
          <p class="page-subtitle">Balas pesan pengunjung website secara langsung</p>
        </div>
        <div class="chat-container form-card" style="padding: 0; display: flex; height: 600px; overflow: hidden;">
          <div class="chat-sidebar" style="width: 300px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column;">
            <div style="padding: 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-tertiary);">
              <h4 style="margin:0; color: var(--text-primary); font-size: 15px;">Daftar Pengunjung</h4>
            </div>
            <div id="chatSessionsList" style="flex: 1; overflow-y: auto;">
            </div>
          </div>
          <div class="chat-main" id="chatMainArea" style="flex: 1; display: none; flex-direction: column; background: var(--bg-primary);">
            <div class="chat-header" style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 id="activeChatId" style="margin: 0; font-size: 16px; color: var(--text-primary);">Pengunjung</h3>
                <small style="color: var(--text-muted);">IP: <span id="activeChatIp">-</span></small>
              </div>
            </div>
            <div id="chatMessagesArea" style="flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--bg-secondary); display: flex; gap: 12px;">
              <input type="text" id="adminChatInput" class="form-control" placeholder="Tulis balasan pesan..." autocomplete="off">
              <button id="adminChatSend" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Kirim</button>
            </div>
          </div>
          <div id="chatEmptyState" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted);">
            <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p>Pilih sesi obrolan dari daftar untuk mulai membalas.</p>
          </div>
        </div>
      </section>
      <section class="page" id="page-feedback">
        <div class="page-header">
          <h1 class="page-title">Kritik & Saran</h1>
          <p class="page-subtitle">Daftar masukan dan pesan anonim dari pengunjung website.</p>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 200px;">Waktu Kirim</th>
                <th style="width: 200px;">Pengirim</th>
                <th>Isi Masukan / Saran</th>
              </tr>
            </thead>
            <tbody id="tbody-feedback">
            </tbody>
          </table>
        </div>
      </section>
      <section class="page" id="page-calon-anggota">
        <div class="page-header">
          <h1 class="page-title">Daftar Calon Anggota</h1>
          <p class="page-subtitle">Notifikasi dan daftar pendaftar baru yang menunggu persetujuan</p>
        </div>
        <div class="table-container">
          <table class="data-table" id="table-calon-anggota">
  <thead>
    <tr>
      <th>Waktu Daftar</th>
      <th>Nama & Kontak</th>
      <th>Chess.com & Rating</th>
      <th>Alasan Gabung</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody id="tbody-calon-anggota">
  </tbody>
</table>
        </div>
      </section>
      <section class="page" id="page-daftar-ulang">
        <div class="page-header">
          <h1 class="page-title">Pendaftaran Ulang</h1>
          <p class="page-subtitle">Pantau progres registrasi ulang member komunitas</p>
        </div>
        <div class="tabs-container" style="margin-bottom: 20px; display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; gap: 10px;">
            <button id="tab-btn-sudah" class="btn btn-primary">Sudah Daftar Ulang</button>
            <button id="tab-btn-belum" class="btn btn-secondary">Belum Daftar Ulang</button>
          </div>
          <button id="btn-export-daftar-ulang" class="btn" style="background: var(--color-success); color: white;">
            <i class="fas fa-file-excel"></i> Export Excel
          </button>
        </div>
        <div id="container-sudah-daftar">
          <div class="table-responsive">
            <table class="table data-table" id="table-daftar-ulang">
              <thead>
                <tr>
                  <th>Waktu Submit</th>
                  <th>Nama Lengkap</th>
                  <th>Info Catur</th>
                  <th>TikTok</th>
                  <th>WhatsApp</th>
                  <th>DANA</th>
                </tr>
              </thead>
              <tbody id="tbody-daftar-ulang">
                <tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="container-belum-daftar" style="display: none;">
          <div class="table-responsive">
            <table class="table data-table" id="table-belum-daftar">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Member</th>
                  <th>Username Catur</th>
                  <th>WhatsApp</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="tbody-belum-daftar">
                <tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section class="page" id="page-turnamen">
        <div class="page-header">
          <h1 class="page-title">Kelola Turnamen</h1>
          <p class="page-subtitle">Tambah dan kelola jadwal event catur</p>
        </div>
        <div class="form-card mb-6">
          <form id="form-turnamen" class="data-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="turnamen-judul">Judul Turnamen <span class="required">*</span></label>
                <input type="text" id="turnamen-judul" required placeholder="Contoh: Turnamen Blitz Mingguan" />
              </div>
              <div class="form-group">
                <label for="turnamen-tanggal">Tanggal <span class="required">*</span></label>
                <input type="date" id="turnamen-tanggal" required />
              </div>
              <div class="form-group">
                <label for="turnamen-waktu">Waktu Mulai <span class="required">*</span></label>
                <input type="text" id="turnamen-waktu" required placeholder="Contoh: 19.30 WIB" />
              </div>
                <div class="form-group">
  <label>Rating Minimal</label>
  <input type="number" id="turnamen-rating-min" class="form-control" placeholder="Contoh: 100" value="0">
</div>
<div class="form-group">
  <label>Rating Maksimal</label>
  <input type="number" id="turnamen-rating-max" class="form-control" placeholder="Contoh: 2000" value="3000">
</div>
              <div class="form-group">
                <label for="turnamen-mode">Platform / Mode <span class="required">*</span></label>
                <input type="text" id="turnamen-mode" required placeholder="Contoh: Online via Chess.com" />
              </div>
              <div class="form-group">
                <label for="turnamen-slot">Batas Slot <span class="required">*</span></label>
                <input type="text" id="turnamen-slot" required placeholder="Contoh: 32 slot" />
              </div>
              <div class="form-group">
                <label for="turnamen-status">Status <span class="required">*</span></label>
                <select id="turnamen-status" required>
                  <option value="buka">Pendaftaran Buka</option>
                  <option value="segera">Segera Dibuka</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label for="turnamen-deskripsi">Deskripsi Singkat <span class="required">*</span></label>
                <textarea id="turnamen-deskripsi" rows="3" required placeholder="Format turnamen, aturan main, atau hadiah..."></textarea>
                <div class="form-group full-width">
                <label for="turnamen-link">Link Turnamen Chess.com <span class="required">*</span></label>
                <input type="url" id="turnamen-link" required placeholder="https://www.chess.com/play/..." />
              </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-plus"></i> Tambah Turnamen
              </button>
            </div>
          </form>
        </div>
        <div class="table-container mt-6">
          <table class="data-table" id="table-turnamen">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul Turnamen</th>
                <th>Mode & Waktu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-turnamen">
            </tbody>
          </table>
        </div>
      </section>
      <section class="page" id="page-anggota">
        <div class="page-header">
          <h1 class="page-title">Kelola Anggota</h1>
          <p class="page-subtitle">Manajemen daftar anggota komunitas</p>
        </div>
        <div class="toolbar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="search-anggota" placeholder="Cari anggota..." />
          </div>
          <div class="filter-box">
            <select id="filter-jabatan">
              <option value="">Semua Jabatan</option>
              <option value="Ketua">Ketua</option>
              <option value="Wakil Ketua">Wakil Ketua</option>
              <option value="Sekretaris">Sekretaris</option>
              <option value="Bendahara">Bendahara</option>
              <option value="Pelatih">Pelatih</option>
              <option value="Asisten Pelatih">Asisten Pelatih</option>
              <option value="Ujung Tombak">Ujung Tombak</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
              <option value="Anggota">Anggota</option>
            </select>
          </div>
          <button class="btn" id="btn-export-anggota" style="background: var(--color-success); color: white;">
            <i class="fas fa-file-excel"></i> Export Excel
          </button>
          <button class="btn btn-primary" id="btn-tambah-anggota">
            <i class="fas fa-plus"></i> Tambah
          </button>
        </div>
        <div class="table-container">
          <table class="data-table" id="table-anggota">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-anggota">
              <tr class="empty-row">
                <td colspan="7">
                  <div class="empty-state">
                    <img src="/manus-storage/empty-state-chess_16ef3629.png" alt="Empty" class="empty-icon" />
                    <p>Belum ada anggota terdaftar.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" id="pagination-anggota"></div>
      </section>
      <section class="page" id="page-ebook">
        <div class="page-header">
          <h1 class="page-title">Input Ebook</h1>
          <p class="page-subtitle">Tambahkan ebook baru ke perpustakaan</p>
        </div>
        <div class="form-card">
          <form id="form-ebook" class="data-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="ebook-cover">Cover Ebook <span class="required">*</span></label>
                <div class="file-upload-wrapper">
                  <label for="ebook-cover-input" class="file-upload-label">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Pilih gambar cover</span>
                  </label>
                  <input type="file" id="ebook-cover-input" name="cover" accept="image/*" class="file-input" />
                  <span class="file-name" id="ebook-cover-name"></span>
                </div>
              </div>
              <div class="form-group">
                <label for="ebook-judul">Judul <span class="required">*</span></label>
                <input type="text" id="ebook-judul" name="judul" required placeholder="Judul ebook" />
              </div>
              <div class="form-group">
                <label for="ebook-penulis">Penulis <span class="required">*</span></label>
                <input type="text" id="ebook-penulis" name="penulis" required placeholder="Nama penulis" />
              </div>
              <div class="form-group">
                <label for="ebook-kategori">Kategori <span class="required">*</span></label>
                <input type="text" id="ebook-kategori" name="kategori" required placeholder="Contoh: Opening, Middlegame" />
              </div>
              <div class="form-group">
                <label for="ebook-file">File PDF <span class="required">*</span></label>
                <div class="file-upload-wrapper">
                  <label for="ebook-file-input" class="file-upload-label">
                    <i class="fas fa-file-pdf"></i>
                    <span>Pilih file PDF</span>
                  </label>
                  <input type="file" id="ebook-file-input" name="file" accept=".pdf" class="file-input" />
                  <span class="file-name" id="ebook-file-name"></span>
                </div>
              </div>
              <div class="form-group full-width">
                <label for="ebook-deskripsi">Deskripsi <span class="required">*</span></label>
                <textarea id="ebook-deskripsi" name="deskripsi" rows="4" required placeholder="Deskripsi singkat tentang ebook"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Simpan Ebook
              </button>
            </div>
          </form>
        </div>
        <div class="section-card mt-4" id="ebook-list-section">
          <h2 class="section-title"><i class="fas fa-book-open"></i> Daftar Ebook</h2>
          <div class="ebook-grid" id="ebook-grid">
            <p class="empty-text">Belum ada ebook yang ditambahkan.</p>
          </div>
        </div>
      </section>
      <section class="page" id="page-galeri">
        <div class="page-header">
          <h1 class="page-title">Galeri Komunitas</h1>
          <p class="page-subtitle">Dokumentasi kegiatan komunitas catur</p>
        </div>
        <div class="form-card">
          <form id="form-galeri" class="data-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="galeri-judul">Judul <span class="required">*</span></label>
                <input type="text" id="galeri-judul" name="judul" required placeholder="Judul kegiatan" />
              </div>
              <div class="form-group">
                <label for="galeri-tanggal">Tanggal <span class="required">*</span></label>
                <input type="date" id="galeri-tanggal" name="tanggal" required />
              </div>
              <div class="form-group full-width">
                <label for="galeri-deskripsi">Deskripsi <span class="required">*</span></label>
                <textarea id="galeri-deskripsi" name="deskripsi" rows="3" required placeholder="Deskripsi kegiatan"></textarea>
              </div>
              <div class="form-group full-width">
                <label for="galeri-foto">Foto <span class="required">*</span></label>
                <div class="file-upload-wrapper">
                  <label for="galeri-foto-input" class="file-upload-label">
                    <i class="fas fa-camera"></i>
                    <span>Pilih foto kegiatan</span>
                  </label>
                  <input type="file" id="galeri-foto-input" name="foto" accept="image/*" class="file-input" />
                  <span class="file-name" id="galeri-foto-name"></span>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-upload"></i> Unggah Foto
              </button>
            </div>
          </form>
        </div>
        <div class="section-card mt-4" id="galeri-list-section">
          <h2 class="section-title"><i class="fas fa-images"></i> Galeri Foto</h2>
          <div class="gallery-grid" id="gallery-grid">
            <p class="empty-text">Belum ada foto yang diunggah.</p>
          </div>
        </div>
      </section>
      <section class="page" id="page-pengaturan">
        <div class="page-header">
          <h1 class="page-title">Pengaturan</h1>
          <p class="page-subtitle">Konfigurasi informasi komunitas</p>
        </div>
        <div class="form-card">
          <form id="form-pengaturan" class="data-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="settings-nama">Nama Komunitas <span class="required">*</span></label>
                <input type="text" id="settings-nama" name="nama_komunitas" required placeholder="Nama klub catur" />
              </div>
              <div class="form-group">
                <label for="settings-logo">Logo Komunitas</label>
                <div class="file-upload-wrapper">
                  <label for="settings-logo-input" class="file-upload-label">
                    <i class="fas fa-image"></i>
                    <span>Pilih logo</span>
                  </label>
                  <input type="file" id="settings-logo-input" name="logo" accept="image/*" class="file-input" />
                  <span class="file-name" id="settings-logo-name"></span>
                </div>
              </div>
              <div class="form-group">
                <label for="settings-email">Email <span class="required">*</span></label>
                <input type="email" id="settings-email" name="email" required placeholder="email@komunitas.com" />
              </div>
              <div class="form-group">
                <label for="settings-whatsapp">WhatsApp</label>
                <input type="tel" id="settings-whatsapp" name="whatsapp" placeholder="08xxxxxxxxxx" />
              </div>
              <div class="form-group">
                <label for="settings-instagram">Instagram</label>
                <input type="text" id="settings-instagram" name="instagram" placeholder="@username_instagram" />
              </div>
              <div class="form-group">
                <label for="settings-discord">Discord</label>
                <input type="text" id="settings-discord" name="discord" placeholder="Link server Discord" />
              </div>
              <div class="form-group">
                <label for="settings-website">Website</label>
                <input type="url" id="settings-website" name="website" placeholder="https://website-komunitas.com" />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
        <?php if (isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'super_admin'): ?>
          <div id="maintenance-panel" style="margin-bottom: 30px; padding:24px; border:1px solid #f59e0b; border-radius:12px; background: rgba(245, 158, 11, 0.05);">
          <h3 style="color:#f59e0b; margin-bottom: 10px;"><i class="fas fa-tools"></i> Mode Maintenance</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:15px;">
            Aktifkan mode ini untuk menutup website utama dan menampilkan halaman <b>maintenance.html</b>. Hanya Super Admin yang dapat mengubah status ini.
          </p>
          <button id="btn-toggle-maintenance" class="btn btn-secondary">
             <i class="fas fa-spinner fa-spin"></i> Cek Status...
          </button>
        </div>
        <div id="registration-panel" style="margin-bottom: 30px; padding:24px; border:1px solid #10b981; border-radius:12px; background: rgba(16, 185, 129, 0.05);">
  <h3 style="color:#10b981; margin-bottom: 10px;"><i class="fas fa-door-open"></i> Status Pendaftaran Anggota</h3>
  <p style="font-size:13px; color:var(--text-muted); margin-bottom:15px;">
    Buka atau tutup form pendaftaran anggota baru di website utama.
  </p>
  <button id="btn-toggle-registration" class="btn btn-secondary">
     <i class="fas fa-spinner fa-spin"></i> Cek Status...
  </button>
</div>
        <div id="super-admin-panel" style="margin-top: 30px; padding:24px; border:1px solid var(--accent-primary); border-radius:12px; background: rgba(124, 58, 237, 0.05);">
          <h3 style="color:var(--accent-light); margin-bottom: 15px;"><i class="fas fa-user-shield"></i> Manajemen Akses Admin</h3>
          <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:15px;">
            <div class="form-group" style="flex:1; margin:0;">
              <label style="font-size:12px; color:var(--text-muted);">Username Admin Baru</label>
              <input type="text" id="new-admin-username" class="form-control" placeholder="Contoh: admin_sabri">
            </div>
            <button id="btn-create-admin" class="btn btn-primary">Buat Token</button>
          </div>
          <div id="new-admin-token-display" style="margin-bottom: 20px; color: var(--color-success);"></div>
          <h4 style="font-size:14px; margin-bottom:10px; color:var(--text-primary); border-top:1px solid var(--border-color); padding-top:20px;">Daftar Staff Admin Aktif</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Token Akses</th>
                  <th style="width: 80px; text-align:center;">Aksi</th>
                </tr>
              </thead>
              <tbody id="tbody-admin-tokens">
              </tbody>
            </table>
          </div>
        </div>
        <?php endif; ?>
      </section>
    </div>
  </main>
  
  <!-- MODAL EXISTING -->
  <div class="modal-overlay" id="modal-anggota">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-anggota-title">Tambah Anggota</h2>
        <button class="modal-close" id="modal-anggota-close" aria-label="Tutup modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form id="form-anggota-modal" class="data-form">
          <input type="hidden" id="anggota-edit-id" />
          <div class="form-grid">
            <div class="form-group">
              <label for="anggota-nama">Nama Lengkap <span class="required">*</span></label>
              <input type="text" id="anggota-nama" name="nama" required placeholder="Nama lengkap" />
            </div>
            <div class="form-group">
              <label for="anggota-email">Email <span class="required">*</span></label>
              <input type="email" id="anggota-email" name="email" required placeholder="contoh@email.com" />
            </div>
            <div class="form-group">
              <label for="anggota-whatsapp">No. WhatsApp <span class="required">*</span></label>
              <input type="tel" id="anggota-whatsapp" name="whatsapp" required placeholder="08xxxxxxxxxx" />
            </div>
            <div class="form-group">
              <label for="anggota-username">Username Chess.com / Lichess</label>
              <input type="text" id="anggota-username" name="username_catur" placeholder="username catur online" />
            </div>
            <div class="form-group">
              <label for="anggota-jabatan">Jabatan <span class="required">*</span></label>
              <select id="anggota-jabatan" name="jabatan" required>
                <option value="">-- Pilih Jabatan --</option>
                <option value="Ketua">Ketua</option>
                <option value="Wakil Ketua">Wakil Ketua</option>
                <option value="Sekretaris">Sekretaris</option>
                <option value="Bendahara">Bendahara</option>
                <option value="Pelatih">Pelatih</option>
                <option value="Asisten Pelatih">Asisten Pelatih</option>
                <option value="Ujung Tombak">Ujung Tombak</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
                <option value="Anggota">Anggota</option>
              </select>
            </div>
            <div class="form-group">
              <label for="anggota-status">Status <span class="required">*</span></label>
              <select id="anggota-status" name="status" required>
                <option value="Pending">Pending</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="anggota-alamat">Alamat</label>
              <textarea id="anggota-alamat" name="alamat" rows="2" placeholder="Alamat lengkap"></textarea>
            </div>
            <div class="form-group full-width">
              <label for="anggota-foto-input-label">Foto Profil</label>
              <div class="file-upload-wrapper">
                <label for="anggota-foto-input" class="file-upload-label">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Pilih file foto</span>
                </label>
                <input type="file" id="anggota-foto-input" name="foto" accept="image/*" class="file-input" />
                <span class="file-name" id="anggota-foto-name"></span>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-anggota-cancel">Batal</button>
        <button class="btn btn-primary" id="modal-anggota-save">
          <i class="fas fa-save"></i> Simpan
        </button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-detail">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Detail Anggota</h2>
        <button class="modal-close" id="modal-detail-close" aria-label="Tutup modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body" id="modal-detail-body">
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-hapus">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2 class="modal-title">Konfirmasi Hapus</h2>
        <button class="modal-close" id="modal-hapus-close" aria-label="Tutup modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-hapus-cancel">Batal</button>
        <button class="btn btn-danger" id="modal-hapus-confirm">
          <i class="fas fa-trash"></i> Hapus
        </button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-tolak">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h2 class="modal-title">Alasan Penolakan</h2>
        <button class="modal-close" id="modal-tolak-close" aria-label="Tutup modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form id="form-tolak">
          <input type="hidden" id="tolak-id">
          <input type="hidden" id="tolak-wa">
          <input type="hidden" id="tolak-nama">
          <div class="form-group">
            <label style="margin-bottom:8px; display:block;">Pilih Alasan <span class="required">*</span></label>
            <select id="tolak-alasan" class="form-control" required>
              <option value="">-- Pilih Alasan --</option>
              <option value="Data profil atau form yang diisi belum lengkap.">Data belum lengkap</option>
              <option value="Data akun Chess.com yang ditelusuri tidak valid/tidak ditemukan.">Data Chess.com tidak ditemukan</option>
              <option value="Terdapat indikasi manipulasi/kecurangan pada data pendaftaran.">Indikasi manipulasi data</option>
              <option value="Lainnya">Lainnya (Ketik sendiri)</option>
            </select>
          </div>
          <div class="form-group" id="tolak-alasan-lain-group" style="display: none; margin-top: 15px;">
            <label style="margin-bottom:8px; display:block;">Ketik Alasan Spesifik <span class="required">*</span></label>
            <textarea id="tolak-alasan-lain" class="form-control" rows="3" placeholder="Tuliskan alasan penolakan di sini..."></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-tolak-cancel">Batal</button>
        <button class="btn btn-danger" id="modal-tolak-confirm">
          <i class="fas fa-paper-plane"></i> Tolak & Kirim WA
        </button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-peserta">
    <div class="modal" style="max-width: 800px;">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-peserta-title">Daftar Pendaftar Turnamen</h2>
        <button class="modal-close" id="modal-peserta-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <div class="toolbar" style="margin-bottom: 15px; display:flex; gap:10px; flex-wrap:wrap;">
          <div style="flex:1; display:flex; gap:10px; min-width: 250px;">
             <button class="btn btn-primary" id="tab-btn-pending" style="flex:1; justify-content:center;">Menunggu Persetujuan</button>
             <button class="btn btn-secondary" id="tab-btn-approved" style="flex:1; justify-content:center;">Sudah Disetujui</button>
          </div>
          <button class="btn" id="btn-tambah-peserta-manual" style="background: var(--blue); color: white; display: none; white-space: nowrap;">
            <i class="fas fa-user-plus"></i> Tambah Manual
          </button>
          <button class="btn" id="btn-export-peserta" style="background: var(--color-success); color: white; white-space: nowrap;">
            <i class="fas fa-file-excel"></i> Export
          </button>
        </div>
          <div class="search-box" style="flex:1;">
            <i class="fas fa-search"></i>
            <input type="text" id="search-peserta" placeholder="Cari Username Chess.com..." />
          </div>
        </div>
        <div class="table-container" id="container-pending">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama & Kontak</th>
                <th>Chess.com</th>
                <th>Waktu Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-peserta-pending"></tbody>
          </table>
        </div>
        <div class="table-container" id="container-approved" style="display:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama & Kontak</th>
                <th>Chess.com</th>
                <th>Waktu Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-peserta-approved"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-sertifikat">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Kirim Sertifikat Pemenang</h2>
        <button class="modal-close" id="modal-sertifikat-close" aria-label="Tutup modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="cert-event-id" />
        <h3 id="cert-event-title" style="margin-bottom: 20px; color: var(--accent-light); text-align: center;"></h3>
        <div class="form-group" style="margin-bottom: 20px;">
           <label style="color:var(--text-primary); font-weight:600;">Peringkat Pemenang:</label>
           <select id="cert-juara" class="form-control">
              <option value="1">Juara 1 (Emas)</option>
              <option value="2">Juara 2 (Perak)</option>
              <option value="3">Juara 3 (Perunggu)</option>
           </select>
        </div>
        <div class="search-box" style="margin-bottom: 20px;">
          <i class="fas fa-search"></i>
          <input type="text" id="cert-search" placeholder="Cari nama peserta... (Filter Instan)" />
        </div>
        <div class="table-container" style="max-height: 350px; overflow-y: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama Peserta</th>
                <th style="text-align: right;">Aksi Generate</th>
              </tr>
            </thead>
            <tbody id="tbody-cert-peserta">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-form-peserta">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="form-peserta-title">Tambah Peserta Manual</h2>
        <button class="modal-close" onclick="document.getElementById('modal-form-peserta').classList.remove('active')"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form id="form-peserta-manual" class="data-form">
          <input type="hidden" id="peserta-form-id" />
          <div class="form-grid">
            <div class="form-group"><label>Panggilan <span class="required">*</span></label><input type="text" id="peserta-form-nama" required></div>
            <div class="form-group"><label>Nama Asli</label><input type="text" id="peserta-form-asli"></div>
            <div class="form-group"><label>Tgl Lahir</label><input type="date" id="peserta-form-lahir"></div>
            <div class="form-group"><label>Domisili</label><input type="text" id="peserta-form-domisili"></div>
            <div class="form-group"><label>WhatsApp <span class="required">*</span></label><input type="text" id="peserta-form-wa" required></div>
            <div class="form-group"><label>No DANA</label><input type="text" id="peserta-form-dana"></div>
            <div class="form-group"><label>Chess.com <span class="required">*</span></label><input type="text" id="peserta-form-catur" required></div>
            <div class="form-group"><label>TikTok</label><input type="text" id="peserta-form-tiktok"></div>
            <div class="form-group full-width">
              <label>Status <span class="required">*</span></label>
              <select id="peserta-form-status" required>
                <option value="Pending">Pending</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
          <div class="form-actions mt-4">
            <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="modal-rekap-absensi">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Rekap Absensi: <span id="rekap-judul-agenda" style="color: var(--accent-light);"></span></h2>
      <button class="modal-close" onclick="document.getElementById('modal-rekap-absensi').classList.remove('active')" aria-label="Tutup modal">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="table-container" style="max-height: 400px; overflow-y: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Member</th>
              <th>Jabatan</th>
              <th>Status Kehadiran</th>
            </tr>
          </thead>
          <tbody id="tbody-rekap-absensi">
            <!-- Data akan dimuat melalui JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modal-lencana">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h2 class="modal-title">Beri Lencana (Badge)</h2>
      <button class="modal-close" id="modal-lencana-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <form id="form-lencana">
        <input type="hidden" id="lencana-anggota-id">
        <div class="form-group">
          <label>Pilih Jenis Lencana <span class="required">*</span></label>
          <select id="lencana-tipe" class="form-control" required>
            <option value="">-- Pilih Lencana --</option>
            <option value="juara_turnamen">🏆 Juara Turnamen</option>
            <option value="donatur">💎 Donatur</option>
            <option value="member_aktif">🔥 Member Paling Aktif</option>
            <option value="pecandu_kelas">📚 Pecandu Kelas</option>
            <option value="penonton_terbaik">🍿 Penonton Terbaik</option>
            <option value="pelatih">🧠 Pelatih</option>
            <option value="pentolan">👑 Pentolan</option>
            <option value="pelawak">🤡 Pelawak</option>
            <option value="member_setia">🛡️ Member Setia</option>
            <option value="pemain_gambit">♟️ Pemain Gambit</option>
          </select>
        </div>
        <!-- Input ini awalnya disembunyikan, akan muncul otomatis via JS jika 'Juara Turnamen' dipilih -->
        <div class="form-group" id="lencana-keterangan-group" style="display: none; margin-top: 15px;">
          <label>Nama Turnamen <span class="required">*</span></label>
          <input type="text" id="lencana-keterangan" class="form-control" placeholder="Cth: Blunder Squad Open 2026">
        </div>
      </form>
    </div>
    <div class="modal-footer" style="margin-top: 15px;">
      <button class="btn btn-secondary" id="modal-lencana-cancel">Batal</button>
      <button class="btn btn-primary" id="modal-lencana-save"><i class="fas fa-medal"></i> Berikan</button>
    </div>
  </div>
</div>

  <div class="toast-container" id="toast-container"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"></script>
  <script src="adm.js"></script>
  <script src="broadcast.js"></script>
</body>
</html>