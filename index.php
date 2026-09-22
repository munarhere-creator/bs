<?php
session_start();
if (file_exists('config/maintenance.flag')) {
    include 'maintenance.html';
    exit;
}

// Cek apakah user sedang login
$is_logged_in = isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true;
$user_avatar = 'avatar1.png'; // Avatar default

if ($is_logged_in) {
    require_once 'config/db.php';
    $user_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT avatar FROM anggota WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $user_avatar = !empty($row['avatar']) ? $row['avatar'] : 'avatar1.png';
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BLUNDER SQUAD — Klub Catur Online</title>
<meta name="description" content="BLUNDER SQUAD adalah komunitas catur online tempat setiap blunder jadi pelajaran. Bergabung, main, dan naik rating bareng.">
<meta name="keywords" content="catur online, klub catur, blunder squad, komunitas catur, main catur online, belajar catur">
<meta name="author" content="BLUNDER SQUAD">
<link rel="icon" type="image/png" href="assets/logo2.png">
<link rel="apple-touch-icon" href="assets/logo2.png">

<!-- Open Graph / Facebook / WhatsApp / Discord -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://blundersquad.com/">
<meta property="og:site_name" content="BLUNDER SQUAD">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="BLUNDER SQUAD — Klub Catur Online">
<meta property="og:description" content="BLUNDER SQUAD adalah komunitas catur online tempat setiap blunder jadi pelajaran. Bergabung, main, dan naik rating bareng.">
<meta property="og:image" content="assets/logo2.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://blundersquad.com/">
<meta name="twitter:title" content="BLUNDER SQUAD — Klub Catur Online">
<meta name="twitter:description" content="BLUNDER SQUAD adalah komunitas catur online tempat setiap blunder jadi pelajaran. Bergabung, main, dan naik rating bareng.">
<meta name="twitter:image" content="assets/logo2.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<link rel="stylesheet" href="style.css?v=<?php echo filemtime('style.css'); ?>">
<link rel="stylesheet" href="blog.css?v=<?php echo filemtime('blog.css'); ?>">

</head>
<body>

<div class="bg-glow" aria-hidden="true"></div>
<div class="bg-noise" aria-hidden="true"></div>
<div class="bg-vignette" aria-hidden="true"></div>
<div class="cine-bars" aria-hidden="true"><span class="cine-bar top"></span><span class="cine-bar bottom"></span></div>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
<div class="preloader" id="preloader" aria-hidden="true">
  <div class="preloader-bg"></div>
  <div class="preloader-content">
    <div class="preloader-knight">
      <img src="assets/logo.png" alt="Blunder Squad Logo" style="width: 130px; height: auto;">
    </div>
    <div class="preloader-word" id="preloaderWord">
      <span class="pw-line">SAATNYA</span><span class="pw-line pw-accent">BLUNDER</span>
    </div>
    <div class="preloader-bar"><div class="preloader-bar-fill" id="preloaderFill"></div></div>
    <div class="preloader-pct" id="preloaderPct">0%</div>
  </div>
</div>

<div id="app-root"></div>

<div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="false"></div>
<div id="chatWidgetRoot"></div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script src="terms.js?v=<?php echo filemtime('terms.js'); ?>"></script>
<script src="termsturnamen.js?v=<?php echo filemtime('termsturnamen.js'); ?>"></script>
<script src="main.js?v=<?php echo filemtime('main.js'); ?>"></script>
<script src="blog.js?v=<?php echo filemtime('blog.js'); ?>"></script>
<script src="spinwheel.js?v=<?php echo filemtime('spinwheel.js'); ?>"></script>
<script src="tournament-form.js?v=<?php echo filemtime('tournament-form.js'); ?>"></script>
<script>
  window.USER_SESSION = {
    isLoggedIn: <?php echo $is_logged_in ? 'true' : 'false'; ?>,
    avatar: "<?php echo htmlspecialchars($user_avatar); ?>"
  };
</script>
</body>
</html>