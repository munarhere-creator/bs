document.addEventListener('DOMContentLoaded', () => {
    const bcForm = document.getElementById('form-broadcast');
    const bcTarget = document.getElementById('bc-target');
    const bcMessage = document.getElementById('bc-message');
    const bcResultArea = document.getElementById('bc-result-area');
    const tbodyBroadcast = document.getElementById('tbody-broadcast');
    const bcCount = document.getElementById('bc-count');
    const btnSendAll = document.createElement('button');
    btnSendAll.className = 'btn btn-primary mt-4 w-full justify-center';
    btnSendAll.innerHTML = '<i class="fas fa-paper-plane"></i> KIRIM BROADCAST SEKALIGUS SEKARANG';
    btnSendAll.style.padding = '15px';
    btnSendAll.style.fontSize = '16px';
    if (!bcForm) return;
    fetch('../api/get_events.php')
      .then(res => res.json())
      .then(res => {
         if(res.status === 'success') {
            const optgroup = document.getElementById('bc-turnamen-list');
            res.data.forEach(ev => {
                const opt = document.createElement('option');
                opt.value = 'event_' + ev.id;
                const tgl = new Date(ev.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year:'numeric' });
                opt.textContent = `${ev.judul} (${tgl})`;
                optgroup.appendChild(opt);
            });
         }
      });

    let currentTarget = '';
    let currentMessage = '';
    bcForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       currentTarget = bcTarget.value;
       currentMessage = bcMessage.value;
       if(!currentTarget || !currentMessage) return;
       bcResultArea.style.display = 'block';
       tbodyBroadcast.innerHTML = '<tr><td colspan="4" style="text-align:center;">Memuat data kontak...</td></tr>';
       bcCount.textContent = '0';
       btnSendAll.remove();
       let endpoint = '';
       let filterStatus = null;
       if (currentTarget === 'member_aktif') { endpoint = '../api/admin_get_members.php'; filterStatus = 'Aktif'; }
       else if (currentTarget === 'member_pending') { endpoint = '../api/get_pending_members.php'; }
       else if (currentTarget.startsWith('event_')) {
          const evId = currentTarget.replace('event_', '');
          endpoint = `../api/get_event_participants.php?event_id=${evId}`;
       }
       try {
          const res = await fetch(endpoint);
          const resData = await res.json();
          if(resData.status === 'success') {
              let recipients = resData.data;
              if (filterStatus) recipients = recipients.filter(m => m.status === filterStatus);
              bcCount.textContent = recipients.length;
              if(recipients.length === 0) {
                  tbodyBroadcast.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Tidak ada kontak pada target ini.</td></tr>';
                  return;
              }
              tbodyBroadcast.innerHTML = recipients.map((r, index) => {
                  const namaPenerima = r.nama || r.nama_asli || "Anggota";
                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${namaPenerima}</strong><br><small style="color:var(--text-muted);">${r.username_catur ? '@' + r.username_catur : '-'}</small></td>
                    <td>${r.whatsapp}</td>
                    <td id="status-bc-${index}"><span class="badge badge-pending">Menunggu Disubmit</span></td>
                  </tr>`;
              }).join('');
              
              bcResultArea.appendChild(btnSendAll);
          }
       } catch (err) {
          tbodyBroadcast.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--color-danger);">Gagal memuat data kontak.</td></tr>';
       }
    });
    btnSendAll.addEventListener('click', async () => {
        if(!confirm("Yakin ingin mengirim pesan ke semua kontak di atas secara serentak sekarang?")) return;

        const oriText = btnSendAll.innerHTML;
        btnSendAll.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Server sedang menembak API WhatsApp...';
        btnSendAll.disabled = true;

        try {
            const res = await fetch('../api/admin_broadcast_wa.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: currentTarget, message: currentMessage })
            });
            const data = await res.json();
            
            if(data.status === 'success') {
                // Tampilkan sukses (Gunakan fungsi toast dari adm.js jika Anda mau)
                alert(data.message); 
                
                // Ubah UI Badge menjadi sukses
                const badges = tbodyBroadcast.querySelectorAll('.badge-pending');
                badges.forEach(b => {
                    b.className = 'badge badge-aktif';
                    b.textContent = 'Diproses Fonnte / Terkirim';
                });
                btnSendAll.innerHTML = '<i class="fas fa-check-double"></i> Broadcast Berhasil Disubmit';
            } else {
                alert("Gagal: " + data.message);
                btnSendAll.innerHTML = oriText;
                btnSendAll.disabled = false;
            }
        } catch(e) {
            alert("Koneksi Error.");
            btnSendAll.innerHTML = oriText;
            btnSendAll.disabled = false;
        }
    });
});