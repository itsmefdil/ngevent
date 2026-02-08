/**
 * Email Templates
 * Centralized location for all email HTML templates
 */

interface EmailTemplateBase {
    frontendUrl: string;
}

interface VerificationEmailParams extends EmailTemplateBase {
    verificationUrl: string;
}

interface PasswordResetParams extends EmailTemplateBase {
    resetUrl: string;
}

interface WelcomeEmailParams extends EmailTemplateBase {
    fullName: string;
    dashboardUrl: string;
    profileUrl: string;
}

interface EventNotificationParams {
    eventTitle: string;
    message: string;
}

interface EventRegistrationParams extends EmailTemplateBase {
    fullName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventId: string;
    eventUrl: string;
}

/**
 * Base email template with consistent styling
 * Uses NGEvent brand colors from frontend
 */
const getBaseEmailStyle = () => `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      background: white;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      background: #f97316;
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 5px;
      font-weight: 600;
      transition: background 0.3s;
    }
    .button:hover {
      background: #ea580c;
    }
    .button-secondary {
      background: #0B1120;
    }
    .button-secondary:hover {
      background: #1a1d1f;
    }
    .feature {
      background: #fff7ed;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
      border-left: 4px solid #f97316;
    }
    .feature strong {
      color: #ea580c;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }
    .feature p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #999;
      font-size: 13px;
    }
    .footer p {
      margin: 5px 0;
    }
    .alert {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #9a3412;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    ol, ul {
      padding-left: 20px;
    }
    ol li, ul li {
      margin: 10px 0;
      color: #666;
    }
    a {
      color: #f97316;
      word-break: break-all;
    }
    h3 {
      color: #ea580c;
    }
  </style>
`;

/**
 * Email Verification Template
 */
export const getVerificationEmailTemplate = (params: VerificationEmailParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifikasi Email - NGEvent</title>
      ${getBaseEmailStyle()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Verifikasi Email Anda</h1>
          <p>Satu langkah lagi untuk mengaktifkan akun Anda</p>
        </div>
        <div class="content">
          <p>Terima kasih telah mendaftar di <strong>NGEvent</strong>!</p>
          
          <p>Untuk melanjutkan, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.verificationUrl}" class="button">Verifikasi Email Saya</a>
          </div>
          
          <p>Atau salin dan tempel URL berikut di browser Anda:</p>
          <p style="word-break: break-all; color: #f97316; font-size: 14px;">${params.verificationUrl}</p>
          
          <div class="alert">
            ⏱️ <strong>Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam <strong>24 jam</strong>.
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Jika Anda tidak mendaftar di NGEvent, abaikan email ini.
          </p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} NGEvent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Password Reset Email Template
 */
export const getPasswordResetEmailTemplate = (params: PasswordResetParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password - NGEvent</title>
      ${getBaseEmailStyle()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Password</h1>
          <p>Permintaan reset password untuk akun Anda</p>
        </div>
        <div class="content">
          <p>Kami menerima permintaan untuk mereset password akun NGEvent Anda.</p>
          
          <p>Klik tombol di bawah ini untuk membuat password baru:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.resetUrl}" class="button">Reset Password Saya</a>
          </div>
          
          <p>Atau salin dan tempel URL berikut di browser Anda:</p>
          <p style="word-break: break-all; color: #f97316; font-size: 14px;">${params.resetUrl}</p>
          
          <div class="alert">
            ⏱️ <strong>Penting:</strong> Link reset password ini akan kedaluwarsa dalam <strong>1 jam</strong>.
          </div>
          
          <div class="alert-danger" style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>🛡️ Keamanan:</strong> Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap aman. Kami merekomendasikan untuk mengubah password Anda jika Anda mencurigai aktivitas yang tidak sah pada akun Anda.
          </div>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} NGEvent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Welcome Email Template
 */
export const getWelcomeEmailTemplate = (params: WelcomeEmailParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Selamat Datang di NGEvent</title>
      ${getBaseEmailStyle()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Selamat Datang di NGEvent!</h1>
          <p>Hai, ${params.fullName}!</p>
        </div>
        <div class="content">
          <p>Terima kasih telah bergabung dengan <strong>NGEvent</strong> - platform manajemen event terpercaya untuk membantu Anda menemukan dan mengelola event dengan mudah.</p>
          
          <h3 style="color: #ea580c; margin-top: 30px;">Apa yang bisa Anda lakukan di NGEvent?</h3>
          
          <div class="feature">
            <strong>🔍 Temukan Event Menarik</strong>
            <p>Jelajahi berbagai event, seminar, workshop, dan konferensi yang sesuai dengan minat Anda.</p>
          </div>
          
          <div class="feature">
            <strong>📝 Daftar Event dengan Mudah</strong>
            <p>Proses pendaftaran yang cepat dan aman untuk semua event yang Anda minati.</p>
          </div>
          
          <div class="feature">
            <strong>📊 Kelola Pendaftaran Anda</strong>
            <p>Lihat dan kelola semua event yang telah Anda daftarkan di satu tempat.</p>
          </div>
          
          <div class="feature">
            <strong>🎪 Buat Event Sendiri</strong>
            <p>Menjadi organizer? Buat dan kelola event Anda sendiri dengan mudah.</p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${params.dashboardUrl}" class="button">Lihat Dashboard</a>
            <a href="${params.profileUrl}/edit" class="button button-secondary" style="background: #0B1120;">Lengkapi Profil</a>
          </div>
          
          <h3 style="color: #ea580c; margin-top: 30px;">💡 Tips untuk Memulai:</h3>
          <ol>
            <li><strong>Lengkapi profil Anda</strong> untuk pengalaman yang lebih personal</li>
            <li><strong>Jelajahi event</strong> yang tersedia di halaman discover</li>
            <li><strong>Aktifkan notifikasi</strong> untuk tidak ketinggalan update event</li>
            <li><strong>Bagikan event favorit</strong> Anda ke teman-teman</li>
          </ol>
          
          <p style="margin-top: 30px;">Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.</p>
          
          <p style="font-weight: 600; color: #ea580c; font-size: 16px; margin-top: 20px;">
            Selamat menjelajah dan semoga menemukan event yang sempurna untuk Anda! 🚀
          </p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} NGEvent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Event Notification Template
 */
export const getEventNotificationTemplate = (params: EventNotificationParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Update Event - NGEvent</title>
      ${getBaseEmailStyle()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Update Event</h1>
          <p>${params.eventTitle}</p>
        </div>
        <div class="content">
          <div style="font-size: 15px; line-height: 1.8; color: #333;">
            ${params.message}
          </div>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} NGEvent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Event Registration Confirmation Template
 */
export const getEventRegistrationTemplate = (params: EventRegistrationParams): string => {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pendaftaran Event - NGEvent</title>
      ${getBaseEmailStyle()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pendaftaran Berhasil!</h1>
          <p>Terima kasih telah mendaftar</p>
        </div>
        <div class="content">
          <p>Hai <strong>${params.fullName}</strong>,</p>
          
          <p>Selamat! Pendaftaran Anda untuk event berikut telah <strong>berhasil dikonfirmasi</strong>.</p>
          
          <div class="feature">
            <strong>📅 ${params.eventTitle}</strong>
            <p style="margin-top: 15px;">
              <strong>📆 Tanggal:</strong> ${params.eventDate}<br/>
              <strong>⏰ Waktu:</strong> ${params.eventTime}<br/>
              <strong>📍 Lokasi:</strong> ${params.eventLocation}
            </p>
          </div>
          
          <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 6px;">
            <strong style="color: #ea580c;">💡 Catatan Penting:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Simpan email ini sebagai bukti pendaftaran</li>
              <li>Datang 15-30 menit lebih awal</li>
              <li>Bawa kartu identitas yang valid</li>
              <li>Pantau email untuk update event</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${params.eventUrl}" class="button">Lihat Detail Event</a>
          </div>
          
          <h3 style="color: #ea580c; margin-top: 30px;">📋 Informasi Tambahan</h3>
          
          <p>Anda dapat melihat detail lengkap event dan status pendaftaran Anda kapan saja melalui dashboard NGEvent.</p>
          
          <p><strong>Event ID:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${params.eventId}</code></p>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>⚠️ Pembatalan Pendaftaran:</strong><br/>
            Jika Anda berhalangan hadir, mohon batalkan pendaftaran Anda melalui dashboard agar peserta lain dapat mengambil slot Anda.
          </div>
          
          <p style="margin-top: 30px;">Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi penyelenggara event.</p>
          
          <p style="font-weight: 600; color: #ea580c; font-size: 16px; margin-top: 20px;">
            Sampai jumpa di event! 🎉
          </p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} NGEvent. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
