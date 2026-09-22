(function() {
    "use strict";

    const termsHTML = `
    <div class="modal-overlay bs-tm-overlay" id="termsModal" style="display:none; position:fixed; inset:0; background:rgba(5,5,8,0.92); z-index:9999; align-items:flex-end; justify-content:center; padding:0; opacity:0; transition: opacity 0.25s;">
       <div class="bs-tm-box" style="width:100%; max-width:720px; position:relative; max-height:92vh; display:flex; flex-direction:column; transform:translateY(24px); transition: transform 0.3s cubic-bezier(.2,.8,.2,1);">

          <div class="bs-tm-header">
             <div class="bs-tm-header-top">
                <span class="bs-tm-tag">⚠ WAJIB DIBACA</span>
                <button id="tmCloseBtn" class="bs-tm-close" aria-label="Tutup">&times;</button>
             </div>
             <h3 class="bs-tm-title">TERMS &amp; CONDITIONS</h3>
             <p class="bs-tm-subtitle">Pendaftaran Anggota BLUNDER SQUAD — ini form ANGGOTA, bukan form turnamen. Kalau salah form, itu bukan urusan kami. 🗿</p>
          </div>

          <div class="bs-tm-body" id="tmBody">

             <section class="bs-tm-warn">
                <p class="bs-tm-warn-title">🚨 BERHENTI. BACA INI SEBELUM MENEKAN TOMBOL DAFTAR.</p>
                <p><span class="bs-tm-strong">INI FORM PENDAFTARAN ANGGOTA BLUNDER SQUAD.</span> <span class="bs-tm-strong bs-tm-red">BUKAN FORM PENDAFTARAN TURNAMEN.</span></p>
                <p>Bukan turnamen. Bukan tiket ikut turnamen. Bukan jalur rahasia menuju bagan pertandingan. Bukan "sekalian daftar member biar bisa ikut turnamen". Dan bukan pula portal menuju hadiah turnamen yang entah bagaimana kalian pikir tersembunyi di sini.</p>
                <p>Kalau tujuanmu <span class="bs-tm-strong">HANYA</span> ingin mengikuti turnamen Blunder Squad, maka: <span class="bs-tm-strong bs-tm-red">BERHENTI. JANGAN ISI FORM INI.</span> Silakan scroll lagi, cari form pendaftaran turnamen, lalu daftar di sana. Ke bawah. Bukan ke tombol "Kirim".</p>
                <p>Kami tahu membaca sampai bagian ini rasanya seperti melawan bos akhir bagi sebagian orang, tapi percayalah: ini masih lebih mudah daripada mencari langkah Nf3.</p>
                <div class="bs-tm-quickbox">
                   <p><span class="bs-tm-strong">MAU JADI ANGGOTA BLUNDER SQUAD?</span> → Isi form ini.</p>
                   <p><span class="bs-tm-strong">MAU IKUT TURNAMEN BLUNDER SQUAD?</span> → Cari form turnamen.</p>
                   <p><span class="bs-tm-strong">MAU KEDUANYA?</span> → Ya sudah, isi keduanya sesuai kebutuhan.</p>
                   <p><span class="bs-tm-strong">CUMA MAU IKUT TURNAMEN TAPI MALAH MENGISI FORM ANGGOTA?</span> → Selamat, kamu berhasil salah form. Silakan kembali ke halaman sebelumnya, tarik napas, minum air putih, dan coba lagi.</p>
                </div>
                <p>Kami tidak akan menerima alasan "kirain ini form turnamen". Judulnya sudah jelas tertulis <span class="bs-tm-strong">ANGGOTA</span>. Kalau masih salah juga, mungkin yang perlu diperbaiki bukan form-nya. Mungkin koordinat matanya.</p>
             </section>

             <section class="bs-tm-intro">
                <p>Selamat datang di <span class="bs-tm-strong">Blunder Squad</span>.</p>
                <p>Dengan mendaftar sebagai anggota, kamu tidak sedang membeli tiket turnamen, tidak sedang mendaftar satu acara tertentu, dan tidak sedang mendapatkan jaminan kemenangan.</p>
                <p>Kamu sedang <span class="bs-tm-strong">mendaftarkan diri sebagai bagian dari komunitas.</span></p>
                <p>Artinya, ada beberapa aturan yang perlu dipatuhi. Tenang, tidak ada yang meminta kamu menjadi Grandmaster. Kami hanya meminta kamu <span class="bs-tm-strong">tidak menjadi sumber masalah.</span></p>
             </section>

             <article class="bs-tm-section" data-n="01">
                <h4>DATA DIRI ANGGOTA</h4>
                <p>Setiap calon anggota <span class="bs-tm-strong">WAJIB</span> memberikan nama asli sesuai identitas yang dimiliki. Nama asli digunakan untuk:</p>
                <ul>
                   <li>verifikasi;</li>
                   <li>administrasi internal;</li>
                   <li>pendataan anggota;</li>
                   <li>dan kebutuhan komunitas yang relevan.</li>
                </ul>
                <p>Nama asli <span class="bs-tm-strong">tidak wajib ditampilkan kepada publik.</span> Jika kamu lebih nyaman menggunakan nama panggilan di komunitas atau di Chess.com, silakan. Mau nama akunmu <span class="bs-tm-strong">"KudaMakanBenteng"</span>, <span class="bs-tm-strong">"RajaTidur"</span>, <span class="bs-tm-strong">"GagalPromosi"</span>, atau bahkan <span class="bs-tm-strong">"SayaBukanStockfish"</span> — silakan. Yang penting kami tetap tahu siapa manusia di balik nama akun tersebut.</p>
                <p>Data asli anggota hanya dapat diakses oleh pihak admin Blunder Squad yang berwenang.</p>
                <p class="bs-tm-callout">Dan tolong: <span class="bs-tm-strong bs-tm-red">JANGAN NGARANG IDENTITAS.</span> Kalau data yang diberikan ternyata palsu, dibuat-buat, atau sengaja dimanipulasi, keanggotaan dapat ditolak atau dicabut. Kami membangun komunitas catur. <span class="bs-tm-strong">Bukan program perlindungan identitas rahasia.</span></p>
             </article>

             <article class="bs-tm-section" data-n="02">
                <h4>SPORTIVITAS &amp; FAIR PLAY</h4>
                <p>Di Blunder Squad, kamu boleh: kalah, blunder, salah hitung, kehilangan ratu, kena garpu kuda, kena skakmat, atau melakukan langkah yang membuat seluruh anggota grup tepuk jidat.</p>
                <p>Yang <span class="bs-tm-strong bs-tm-red">tidak boleh</span> adalah curang. Dilarang menggunakan: mesin catur (chess engine), Stockfish, AI, bot, perangkat analisis waktu nyata, overlay, ekstensi peramban, integrasi pihak ketiga, bantuan teman, bantuan pelatih, bantuan penonton, atau bentuk bantuan luar lainnya. Baik dalam pertandingan biasa maupun turnamen.</p>
                <div class="bs-tm-rebut">
                   <p><span class="bs-tm-q">"Tapi saya cuma cek satu langkah."</span><span class="bs-tm-a">Tetap curang.</span></p>
                   <p><span class="bs-tm-q">"Tapi mesinnya cuma saya buka di HP."</span><span class="bs-tm-a">Tetap curang.</span></p>
                   <p><span class="bs-tm-q">"Tapi teman saya cuma bilang 'coba kuda'."</span><span class="bs-tm-a">Tetap curang.</span></p>
                   <p><span class="bs-tm-q">"Tapi saya cuma mau memastikan."</span><span class="bs-tm-a">Pastikan sendiri.</span></p>
                </div>
                <p>Kalau setiap kali posisi sulit kamu harus memanggil Stockfish, mungkin sebenarnya kamu bukan sedang bermain catur. <span class="bs-tm-strong">Kamu sedang menjadi operator Stockfish.</span> Dan itu bukan prestasi.</p>
             </article>

             <article class="bs-tm-section" data-n="03">
                <h4>KEBIJAKAN AKUN CHESS.COM</h4>
                <p>Setiap anggota bertanggung jawab penuh atas akun Chess.com miliknya. Apabila akun anggota terbukti mendapatkan pelanggaran Fair Play, sanksi curang, penangguhan, pemblokiran, atau sanksi lain dari Chess.com akibat pelanggaran Fair Play, maka keanggotaan dapat <span class="bs-tm-strong bs-tm-red">DICABUT SECARA LANGSUNG.</span></p>
                <p>Tanpa drama. Tanpa negosiasi. Tanpa:</p>
                <ul class="bs-tm-noexcuse">
                   <li>"Admin, kasih kesempatan kedua."</li>
                   <li>"Sebenarnya saya tidak sengaja."</li>
                   <li>"Itu sepupu saya."</li>
                   <li>"HP saya dipinjam teman."</li>
                </ul>
                <p>Dan terutama tanpa: <span class="bs-tm-strong">"Saya sumpah demi rating saya."</span></p>
                <p class="bs-tm-callout">Sumpah tidak menghapus pelanggaran Fair Play. Kami menghargai setiap anggota. Tetapi kami jauh lebih menghargai <span class="bs-tm-strong">integritas komunitas.</span> Kalau Chess.com sudah menjatuhkan palu, kami tidak akan sibuk menjadi pembela.</p>
             </article>

             <article class="bs-tm-section" data-n="04">
                <h4>TWIBBON ANGGOTA</h4>
                <p>Seluruh anggota wajib menggunakan Twibbon resmi Blunder Squad pada foto profil akun Chess.com sebagai identitas keanggotaan. Twibbon merupakan bentuk identitas, kebanggaan, dukungan, dan tanda bahwa kamu memang bagian dari komunitas. Dan ya — <span class="bs-tm-strong bs-tm-red">SEUMUR HIDUP KEANGGOTAAN.</span></p>
                <p>Bukan "pas daftar dipasang, seminggu kemudian hilang". Bukan "dipakai kalau lagi ada acara". Bukan "dipakai kalau admin lagi daring".</p>
                <p>Kalau kamu melepas Twibbon tanpa alasan yang dapat diterima, hal tersebut dapat menjadi bahan evaluasi keanggotaan. Karena kalau baru jadi anggota sudah malu mengakui komunitas sendiri — pertanyaannya sederhana: <span class="bs-tm-strong">ngapain daftar?</span></p>
             </article>

             <article class="bs-tm-section" data-n="05">
                <h4>ETIKA BERKOMUNITAS</h4>
                <p>Blunder Squad adalah komunitas. Artinya di dalamnya ada manusia. Dan seperti yang kita ketahui, manusia memiliki perasaan.</p>
                <div class="bs-tm-dual">
                   <div class="bs-tm-dual-col bs-tm-ok">
                      <p class="bs-tm-dual-title">WAJIB</p>
                      <ul>
                         <li>Saling menghormati</li>
                         <li>Menjaga komunikasi</li>
                         <li>Berbicara dengan sopan</li>
                         <li>Menghargai perbedaan kemampuan</li>
                         <li>Membantu anggota lain belajar</li>
                         <li>Menjaga suasana komunitas tetap nyaman</li>
                      </ul>
                   </div>
                   <div class="bs-tm-dual-col bs-tm-no">
                      <p class="bs-tm-dual-title">DILARANG</p>
                      <ul>
                         <li>Menghina</li>
                         <li>Perundungan (bullying)</li>
                         <li>Diskriminasi</li>
                         <li>Ujaran kebencian</li>
                         <li>Provokasi</li>
                         <li>Mempermalukan anggota lain</li>
                      </ul>
                   </div>
                </div>
                <p>Boleh saling ejek santai. <span class="bs-tm-strong">Tapi tahu batas.</span> Kalau candaanmu membuat satu grup tertawa dan satu orang ingin menghapus akun WhatsApp-nya — itu bukan lagi bercanda. Itu sudah pengadilan moral.</p>
             </article>

             <article class="bs-tm-section" data-n="06">
                <h4>NAMA BAIK BLUNDER SQUAD</h4>
                <p>Setelah menjadi anggota, kamu membawa nama Blunder Squad dalam perilaku tertentu di ruang publik. Maka: jangan gunakan nama Blunder Squad untuk melakukan hal-hal bodoh yang kemudian membuat kami harus menjelaskan ke orang lain bahwa "dia memang anggota kami, tapi kami juga bingung kenapa dia melakukan itu."</p>
                <p>Dilarang: menyebarkan informasi palsu, melakukan fitnah, membuat pernyataan yang mengatasnamakan komunitas tanpa izin, melakukan tindakan yang merusak reputasi komunitas, atau menggunakan nama Blunder Squad untuk kepentingan pribadi yang merugikan komunitas.</p>
                <p>Kami tidak meminta kamu menjadi duta besar. <span class="bs-tm-strong">Cukup jangan menjadi mimpi buruk hubungan masyarakat.</span></p>
             </article>

             <article class="bs-tm-section" data-n="07">
                <h4>PATUH PADA PERATURAN</h4>
                <p>Peraturan Blunder Squad dapat diperbarui seiring perkembangan komunitas. Semua anggota wajib mengikuti ketentuan yang berlaku.</p>
                <p>Dan ya — <span class="bs-tm-strong">"saya tidak tahu"</span> bukan kartu bebas hukuman. Ketidaktahuan terhadap peraturan tidak otomatis menghapus pelanggaran.</p>
                <p class="bs-tm-callout">Kalau kamu melewati lampu merah lalu bilang "saya tidak tahu itu lampu merah", lampunya tetap merah. Begitu juga aturan komunitas.</p>
             </article>

             <article class="bs-tm-section" data-n="08">
                <h4>HAK ADMIN</h4>
                <p>Admin berhak: melakukan verifikasi data, meminta klarifikasi, memberikan teguran, membatasi akses, menangguhkan keanggotaan, mencabut keanggotaan, atau mengambil tindakan lain yang diperlukan apabila terjadi pelanggaran.</p>
                <p>Admin tidak memiliki kewajiban untuk berdebat panjang lebar hanya karena seorang anggota tidak menerima konsekuensi dari tindakannya sendiri. Jika bukti sudah jelas dan pelanggaran sudah jelas: <span class="bs-tm-strong">ya, keputusan akan diambil.</span></p>
                <p>Dan tidak — <span class="bs-tm-strong">"tapi saya sudah lama jadi anggota"</span> tidak membuat aturan menjadi opsional. Senioritas bukan kartu bebas pelanggaran.</p>
             </article>

             <article class="bs-tm-section" data-n="09">
                <h4>PERUBAHAN KETENTUAN</h4>
                <p>Blunder Squad berhak mengubah, menambah, mengurangi, atau memperbarui Terms &amp; Conditions ini sewaktu-waktu sesuai kebutuhan dan perkembangan komunitas. Perubahan akan diumumkan melalui media resmi Blunder Squad dan berlaku setelah dipublikasikan.</p>
                <p>Jadi jangan nanti ketika ada aturan baru lalu berkata "kok baru sekarang?". Karena komunitas juga berkembang. <span class="bs-tm-strong">Bukan fosil.</span></p>
             </article>

             <article class="bs-tm-section bs-tm-agree" data-n="10">
                <h4>PERSETUJUAN</h4>
                <p>Dengan mendaftarkan diri sebagai anggota Blunder Squad, kamu menyatakan bahwa:</p>
                <ul class="bs-tm-checklist">
                   <li>Telah membaca Terms &amp; Conditions ini.</li>
                   <li>Memahami aturan yang berlaku.</li>
                   <li>Bersedia mematuhi peraturan komunitas.</li>
                   <li>Bersedia menjaga sportivitas.</li>
                   <li>Bersedia menjaga nama baik komunitas.</li>
                   <li>Bersedia menerima konsekuensi apabila melakukan pelanggaran.</li>
                   <li class="bs-tm-strong">Saya benar-benar sedang mendaftar menjadi ANGGOTA, bukan sedang mencari form turnamen yang saya lewatkan.</li>
                </ul>
             </article>

             <section class="bs-tm-final">
                <p class="bs-tm-final-tag">🗿 PENGINGAT TERAKHIR</p>
                <p class="bs-tm-strong">INI FORM ANGGOTA. BUKAN FORM TURNAMEN.</p>
                <p>Kalau kamu membaca sampai sini dan baru sadar "duh, saya sebenarnya cuma mau daftar turnamen" — <span class="bs-tm-strong">selamat</span>, kamu telah melakukan perjalanan panjang hanya untuk menemukan bahwa kamu berada di tempat yang salah.</p>
                <p>Sekarang: scroll lagi. Cari form pendaftaran turnamen. Klik yang benar. Isi data yang benar. Ikuti turnamennya. Dan jangan kembali ke sini sambil bertanya "bang, ini form turnamennya ya?" — <span class="bs-tm-strong bs-tm-red">TIDAK. INI. FORM. ANGGOTA. BLUNDER. SQUAD.</span></p>
                <p class="bs-tm-signoff">Kami tidak mengharuskanmu bermain seperti Grandmaster.<br>Kami hanya mengharuskanmu membaca seperti manusia normal.<br><span class="bs-tm-strong">Selamat bergabung di Squad.</span><br>Main jujur. Tetap rendah hati. Jangan curang.<br>Dan demi kecintaan pada catur, baca dulu form-nya sebelum menekan tombol kirim.</p>
             </section>

          </div>

          <div class="bs-tm-footer">
             <!-- TOMBOL INI AWALNYA DI-DISABLE UNTUK TIMER -->
             <button class="bs-tm-agree-btn" id="tmAgreeBtn" disabled style="opacity:0.5; cursor:not-allowed;">SAYA SUDAH BACA &amp; SAYA MENGERTI (Tunggu 80s)</button>
          </div>
       </div>
    </div>
    `;

    const termsCSS = `
    <style id="bsTermsStyle">
      .bs-tm-overlay { -webkit-tap-highlight-color: transparent; }

      .bs-tm-box {
        background: #0b0c10;
        border: 3px solid #ffffff;
        border-radius: 4px;
        box-shadow: 0 0 0 3px #0b0c10, 8px 8px 0 0 rgba(255,255,255,0.08);
        font-family: 'Poppins', system-ui, sans-serif;
      }

      .bs-tm-header {
        padding: 20px 20px 16px;
        border-bottom: 3px solid #ffffff;
        background:
          repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 10px, transparent 10px 20px),
          #101218;
        flex-shrink: 0;
      }
      .bs-tm-header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .bs-tm-tag {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #0b0c10;
        background: #ffe000;
        border: 2px solid #0b0c10;
        border-radius: 2px;
        padding: 3px 8px;
        text-transform: uppercase;
      }
      .bs-tm-close {
        background: #1a1c23;
        border: 2px solid #ffffff;
        border-radius: 3px;
        color: #ffffff;
        font-size: 1.4rem;
        line-height: 1;
        width: 34px;
        height: 34px;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, transform 0.15s;
      }
      .bs-tm-close:hover { background: #ff3b3b; border-color: #ff3b3b; transform: rotate(90deg); }

      .bs-tm-title {
        font-size: clamp(1.35rem, 6vw, 1.9rem);
        font-weight: 800;
        letter-spacing: 0.01em;
        color: #ffffff;
        margin: 0 0 8px;
        text-transform: uppercase;
      }
      .bs-tm-subtitle {
        font-size: 0.85rem;
        color: #d7d9e0;
        line-height: 1.55;
        margin: 0;
        font-weight: 400;
      }

      .bs-tm-body {
        overflow-y: auto;
        flex: 1;
        padding: 20px;
        font-size: 0.92rem;
        color: #e8e9ee;
        line-height: 1.65;
        font-weight: 400;
        -webkit-overflow-scrolling: touch;
      }
      .bs-tm-body::-webkit-scrollbar { width: 8px; }
      .bs-tm-body::-webkit-scrollbar-track { background: #101218; }
      .bs-tm-body::-webkit-scrollbar-thumb { background: #ffffff; border-radius: 0; }

      .bs-tm-body p { margin: 0 0 12px; }
      .bs-tm-body ul { margin: 0 0 14px; padding-left: 20px; }
      .bs-tm-body li { margin-bottom: 6px; }

      .bs-tm-strong { color: #ffffff; font-weight: 700; }
      .bs-tm-red { color: #ff5c5c; }

      /* Opening warning block */
      .bs-tm-warn {
        border: 2px solid #ff5c5c;
        background: rgba(255, 92, 92, 0.08);
        border-radius: 3px;
        padding: 16px;
        margin-bottom: 24px;
      }
      .bs-tm-warn-title {
        font-size: 1rem;
        font-weight: 800;
        color: #ff5c5c;
        margin: 0 0 12px;
        text-transform: uppercase;
      }
      .bs-tm-quickbox {
        background: #101218;
        border: 2px solid #ffffff;
        border-radius: 3px;
        padding: 14px;
        margin: 14px 0;
      }
      .bs-tm-quickbox p { margin: 0 0 10px; font-size: 0.88rem; }
      .bs-tm-quickbox p:last-child { margin-bottom: 0; }

      .bs-tm-intro {
        border-left: 4px solid #4dd4ff;
        padding-left: 14px;
        margin-bottom: 26px;
      }

      /* Numbered sections */
      .bs-tm-section {
        position: relative;
        padding: 18px 0 18px 44px;
        border-top: 1px dashed rgba(255,255,255,0.25);
      }
      .bs-tm-section:first-of-type { border-top: none; }
      .bs-tm-section::before {
        content: attr(data-n);
        position: absolute;
        left: 0;
        top: 18px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 800;
        color: #0b0c10;
        background: #4dd4ff;
        border: 2px solid #ffffff;
        border-radius: 2px;
      }
      .bs-tm-section h4 {
        font-size: 1.02rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 10px;
        letter-spacing: 0.01em;
        text-transform: uppercase;
      }

      .bs-tm-callout {
        background: #101218;
        border-left: 4px solid #ffe000;
        border-radius: 2px;
        padding: 12px 14px;
        margin-top: 10px;
        font-size: 0.88rem;
      }

      /* Rebuttal Q/A style (curang excuses) */
      .bs-tm-rebut {
        margin: 14px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bs-tm-rebut p {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        background: #101218;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 2px;
        padding: 10px 12px;
      }
      .bs-tm-q { font-style: italic; color: #b8bac4; font-size: 0.86rem; }
      .bs-tm-a {
        font-weight: 800;
        color: #ff5c5c;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        background: rgba(255,92,92,0.12);
        border: 1px solid #ff5c5c;
        border-radius: 2px;
        padding: 2px 8px;
      }

      .bs-tm-noexcuse { list-style: none; padding-left: 0; margin: 12px 0; }
      .bs-tm-noexcuse li {
        font-style: italic;
        color: #b8bac4;
        padding: 8px 12px;
        border-left: 3px solid #ff5c5c;
        background: rgba(255,92,92,0.06);
        margin-bottom: 6px;
        font-size: 0.86rem;
      }

      /* WAJIB / DILARANG two-column */
      .bs-tm-dual {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin: 14px 0;
      }
      .bs-tm-dual-col {
        border: 2px solid #ffffff;
        border-radius: 3px;
        padding: 14px;
      }
      .bs-tm-dual-col.bs-tm-ok { border-color: #3ddc84; background: rgba(61,220,132,0.06); }
      .bs-tm-dual-col.bs-tm-no { border-color: #ff5c5c; background: rgba(255,92,92,0.06); }
      .bs-tm-dual-title {
        font-weight: 800;
        font-size: 0.82rem;
        letter-spacing: 0.06em;
        margin: 0 0 8px;
        text-transform: uppercase;
      }
      .bs-tm-dual-col.bs-tm-ok .bs-tm-dual-title { color: #3ddc84; }
      .bs-tm-dual-col.bs-tm-no .bs-tm-dual-title { color: #ff5c5c; }
      .bs-tm-dual-col ul { margin: 0; padding-left: 18px; }
      .bs-tm-dual-col li { font-size: 0.85rem; margin-bottom: 5px; }

      /* Agreement checklist */
      .bs-tm-agree {
        border-top: 1px dashed rgba(255,255,255,0.25);
      }
      .bs-tm-checklist { list-style: none; padding-left: 0; margin: 10px 0 0; }
      .bs-tm-checklist li {
        position: relative;
        padding: 8px 10px 8px 32px;
        font-size: 0.88rem;
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 2px;
        margin-bottom: 6px;
        background: #101218;
      }
      .bs-tm-checklist li::before {
        content: "✔";
        position: absolute;
        left: 10px;
        top: 8px;
        color: #3ddc84;
        font-weight: 800;
      }

      /* Final section */
      .bs-tm-final {
        margin-top: 26px;
        padding: 18px;
        border: 2px solid #ffffff;
        border-radius: 3px;
        background: #101218;
        text-align: center;
      }
      .bs-tm-final-tag {
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #ffe000;
        text-transform: uppercase;
        margin: 0 0 10px;
      }
      .bs-tm-final .bs-tm-strong { display: inline-block; margin-bottom: 8px; }
      .bs-tm-signoff {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px dashed rgba(255,255,255,0.25);
        font-size: 0.85rem;
        color: #d7d9e0;
        line-height: 1.8;
      }

      .bs-tm-footer {
        flex-shrink: 0;
        padding: 16px 20px;
        border-top: 3px solid #ffffff;
        background: #101218;
      }
      .bs-tm-agree-btn {
        width: 100%;
        display: block;
        background: #ffe000;
        color: #0b0c10;
        border: 2px solid #ffffff;
        border-radius: 3px;
        font-weight: 800;
        font-size: 0.92rem;
        letter-spacing: 0.03em;
        padding: 14px 16px;
        cursor: pointer;
        text-transform: uppercase;
        transition: transform 0.12s, background 0.12s;
        box-shadow: 4px 4px 0 0 rgba(255,255,255,0.15);
      }
      .bs-tm-agree-btn:hover { background: #ffffff; }
      .bs-tm-agree-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 0 rgba(255,255,255,0.15); }

      /* Small phones */
      @media (max-width: 380px) {
        .bs-tm-body { padding: 16px; font-size: 0.88rem; }
        .bs-tm-section { padding-left: 38px; }
        .bs-tm-section::before { width: 28px; height: 28px; font-size: 0.78rem; }
      }

      /* Tablet and up: sheet becomes a centered dialog, WAJIB/DILARANG side by side */
      @media (min-width: 640px) {
        .bs-tm-overlay { align-items: center; padding: 20px; }
        .bs-tm-box { border-radius: 6px; max-height: 85vh; }
        .bs-tm-dual { grid-template-columns: 1fr 1fr; }
      }
    `;

    // Eksekusi ketika dipanggil dari main.js
    window.openTermsModal = function() {
        let modal = document.getElementById('termsModal');
        
        if (!modal) {
            if (!document.getElementById('bsTermsStyle')) {
                const styleWrapper = document.createElement('div');
                styleWrapper.innerHTML = termsCSS.trim();
                document.head.appendChild(styleWrapper.firstChild);
            }

            // Buat div pembungkus sementara untuk mengubah string ke elemen HTML
            const wrapper = document.createElement('div');
            wrapper.innerHTML = termsHTML.trim();
            document.body.appendChild(wrapper.firstChild);

            modal = document.getElementById('termsModal');

            // Logika Tutup
            const closeFn = () => {
                modal.style.opacity = '0';
                modal.querySelector('.bs-tm-box').style.transform = 'translateY(24px)';
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.remove(); // Hapus agar timer reset dari awal saat dibuka lagi
                }, 300);
            };

            document.getElementById('tmCloseBtn').addEventListener('click', closeFn);

            // Klik di luar kotak untuk menutup
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeFn();
            });
        }

        // ==========================================
        // LOGIKA COUNTDOWN TIMER 80 DETIK
        // ==========================================
        const agreeBtn = document.getElementById('tmAgreeBtn');
        const scrollArea = document.getElementById('tmBody');
        let timeLeft = 80;

        // Reset state setiap dibuka
        if (scrollArea) scrollArea.scrollTop = 0;
        agreeBtn.disabled = true;
        agreeBtn.style.opacity = '0.5';
        agreeBtn.style.cursor = 'not-allowed';
        agreeBtn.textContent = `SAYA SUDAH BACA & SAYA MENGERTI (Tunggu ${timeLeft}s)`;

        // Tampilkan Modal
        modal.style.display = 'flex';
        void modal.offsetWidth; // Memaksa browser merepaint sebelum memulai animasi CSS
        modal.style.opacity = '1';
        modal.querySelector('.bs-tm-box').style.transform = 'translateY(0)';

        // Jalankan Timer
        const countdown = setInterval(() => {
            timeLeft--;
            if (agreeBtn) agreeBtn.textContent = `SAYA SUDAH BACA & SAYA MENGERTI (Tunggu ${timeLeft}s)`;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                if (agreeBtn) {
                    agreeBtn.disabled = false;
                    agreeBtn.style.opacity = '1';
                    agreeBtn.style.cursor = 'pointer';
                    agreeBtn.textContent = 'SAYA SUDAH BACA & SAYA MENGERTI';
                }
            }
        }, 1000);

        // Aksi ketika tombol klik (setelah timer habis)
        agreeBtn.onclick = () => {
            if (timeLeft > 0) return;
            
            // Centang checkbox otomatis saat user klik setuju
            const checkbox = document.getElementById('fldTerms');
            if(checkbox) checkbox.checked = true;

            // Hilangkan pesan error validasi form jika ada
            const errTerms = document.getElementById('errTerms');
            if(errTerms) errTerms.classList.remove('show');

            // Tutup modal
            modal.style.opacity = '0';
            modal.querySelector('.bs-tm-box').style.transform = 'translateY(24px)';
            setTimeout(() => {
                modal.style.display = 'none';
                modal.remove(); 
            }, 300);
        };
    };

})();