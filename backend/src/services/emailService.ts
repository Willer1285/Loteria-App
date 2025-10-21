import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailService = process.env.EMAIL_SERVICE;
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    // Si no hay configuración de email, trabajar en modo desarrollo
    if (!emailUser || !emailPassword) {
      console.log('⚠️  Email no configurado - Modo desarrollo');
      return;
    }

    try {
      // Configuración para diferentes servicios
      if (emailService === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword, // Usar contraseña de aplicación de Gmail
          },
        });
      } else if (emailService === 'sendgrid') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: emailPassword, // API Key de SendGrid
          },
        });
      } else if (emailService === 'smtp') {
        // Configuración SMTP genérica
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      } else {
        console.log('⚠️  Servicio de email no reconocido - Modo desarrollo');
      }

      if (this.transporter) {
        console.log(`✅ Email service configured: ${emailService}`);
      }
    } catch (error) {
      console.error('❌ Error configurando servicio de email:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Si no hay transporter configurado, mostrar en consola (modo desarrollo)
    if (!this.transporter) {
      console.log('\n📧 ===== EMAIL (Modo Desarrollo) =====');
      console.log('Para:', options.to);
      console.log('Asunto:', options.subject);
      console.log('Contenido:');
      console.log(options.text || 'Ver HTML en navegador');
      console.log('=====================================\n');
      return true;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Lotería App'}" <${
          process.env.EMAIL_USER
        }>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Lotería App</strong>.</p>

            <p>Haz click en el siguiente botón para crear una nueva contraseña:</p>

            <center>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </center>

            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>

            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Tu contraseña actual seguirá siendo válida</li>
              </ul>
            </div>

            <p>Si tienes problemas con el enlace, contacta a nuestro soporte.</p>

            <p>Saludos,<br><strong>El equipo de Lotería App</strong></p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Lotería App. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hola ${userName},

      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Lotería App.

      Haz click en el siguiente enlace para crear una nueva contraseña:
      ${resetUrl}

      Este enlace expirará en 1 hora.

      Si no solicitaste este cambio, ignora este email. Tu contraseña actual seguirá siendo válida.

      Saludos,
      El equipo de Lotería App
    `;

    return this.sendEmail({
      to: email,
      subject: 'Recuperación de Contraseña - Lotería App',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a Lotería App!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>

            <p>¡Gracias por registrarte en Lotería App! 🎉</p>

            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
              <li>✨ Participar en sorteos activos</li>
              <li>🎫 Comprar boletos de lotería</li>
              <li>🏆 Ganar increíbles premios</li>
              <li>📊 Ver rankings de jugadores</li>
            </ul>

            <center>
              <a href="${process.env.FRONTEND_URL}/login" class="button">Comenzar Ahora</a>
            </center>

            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

            <p>¡Buena suerte!<br><strong>El equipo de Lotería App</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido a Lotería App! 🎉',
      html,
      text: `Hola ${userName},\n\n¡Gracias por registrarte en Lotería App!\n\nTu cuenta ha sido creada exitosamente.\n\nSaludos,\nEl equipo de Lotería App`,
    });
  }
}

// Exportar instancia única
export const emailService = new EmailService();
