<?php
session_start();
// Bersihkan sesi lama sebelum membuat token baru
session_unset();
session_destroy();

// Panggil file perlindungan CSRF
require_once '../config/CsrfProtect.php';
$csrfToken = CsrfProtect::generate('admin_login');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Blunder Squad</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #000;
            background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.9));
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-wrapper {
            width: 100%; max-width: 450px;
            padding: 60px 68px;
            background-color: rgba(0, 0, 0, 0.75);
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .login-wrapper h2 { font-size: 2rem; font-weight: 600; margin-bottom: 28px; }
        .form-group { margin-bottom: 16px; }
        .form-control {
            width: 100%; padding: 16px 20px;
            border-radius: 4px; border: none;
            background-color: #333; color: #fff;
            font-size: 1rem; transition: background-color 0.2s;
        }
        .form-control:focus { outline: none; background-color: #444; }
        .form-control::placeholder { color: #8c8c8c; }
        .btn-primary {
            width: 100%; padding: 16px; border-radius: 4px;
            border: none; background-color: #e50914; color: #fff;
            font-size: 1rem; font-weight: 600; cursor: pointer;
            margin-top: 24px; transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #c90812; }
        .btn-primary:disabled { background-color: #e5091480; cursor: not-allowed; }
        .login-switch { margin-top: 32px; color: #b3b3b3; font-size: 0.95rem; }
        .login-switch a { color: #fff; text-decoration: none; cursor: pointer; font-weight: 500; }
        .login-switch a:hover { text-decoration: underline; }
        .error-message {
            background-color: #e87c03; color: white;
            padding: 12px 16px; border-radius: 4px;
            margin-bottom: 20px; font-size: 0.85rem;
            display: none;
        }
        .hidden { display: none; }
    </style>
</head>
<body>

    <div class="login-wrapper">
        <h2 id="form-title">Sign In</h2>
        <div id="login-message" class="error-message"></div>

        <!-- Form Super Admin -->
        <form id="login-pass-form">
            <div class="form-group">
                <input type="text" id="login-username" class="form-control" placeholder="Username" required autocomplete="off">
            </div>
            <div class="form-group">
                <input type="password" id="login-password" class="form-control" placeholder="Password" required>
            </div>
            <button type="submit" class="btn-primary" id="btn-pass">Sign In</button>
            <div class="login-switch">
                Login sebagai Staff? <a onclick="toggleForm('token')">Gunakan Token</a>
            </div>
        </form>

        <!-- Form Admin Token -->
        <form id="login-token-form" class="hidden">
            <div class="form-group">
                <input type="text" id="login-token" class="form-control" placeholder="Masukkan Token Akses" required autocomplete="off">
            </div>
            <button type="submit" class="btn-primary" id="btn-token">Masuk dengan Token</button>
            <div class="login-switch">
                Anda Super Admin? <a onclick="toggleForm('pass')">Gunakan Sandi</a>
            </div>
        </form>
    </div>

    <script>
        const passForm = document.getElementById('login-pass-form');
        const tokenForm = document.getElementById('login-token-form');
        const errorMsg = document.getElementById('login-message');
        const formTitle = document.getElementById('form-title');

        sessionStorage.removeItem('adminRole');
        sessionStorage.removeItem('adminUsername');

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('timeout')) {
            errorMsg.textContent = "Sesi telah berakhir karena tidak ada aktivitas. Silakan login kembali.";
            errorMsg.style.display = 'block';
            window.history.replaceState({}, document.title, "login.php");
        }

        function toggleForm(type) {
            errorMsg.style.display = 'none';
            if (type === 'token') {
                passForm.classList.add('hidden');
                tokenForm.classList.remove('hidden');
                formTitle.textContent = "Akses Staff";
            } else {
                tokenForm.classList.add('hidden');
                passForm.classList.remove('hidden');
                formTitle.textContent = "Sign In";
            }
        }

        async function handleLogin(payload, btnElement) {
            const originalText = btnElement.textContent;
            btnElement.textContent = "Memverifikasi...";
            btnElement.disabled = true;
            errorMsg.style.display = 'none';

            try {
                const res = await fetch('../api/admin_login.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        // Suntikkan token ke header X-CSRF-TOKEN
                        'X-CSRF-TOKEN': "<?= $csrfToken ?>" 
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    sessionStorage.setItem('adminRole', data.role);
                    sessionStorage.setItem('adminUsername', data.username);
                    window.location.href = 'index.php';
                } else {
                    errorMsg.textContent = data.message;
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                errorMsg.textContent = "Koneksi ke server gagal.";
                errorMsg.style.display = 'block';
            } finally {
                btnElement.textContent = originalText;
                btnElement.disabled = false;
            }
        }

        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            handleLogin({ username, password }, document.getElementById('btn-pass'));
        });

        tokenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const token = document.getElementById('login-token').value;
            handleLogin({ token }, document.getElementById('btn-token'));
        });
    </script>
</body>
</html>