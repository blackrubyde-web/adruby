const nodemailer = require('nodemailer');

// Strato SMTP Configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.strato.de',
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.STRATO_EMAIL,
            pass: process.env.STRATO_PASSWORD,
        },
    });
};

// Premium Welcome Email Template (German)
const getWelcomeEmailTemplate = (userName) => {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei AdRuby</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 16px 24px; border-radius: 16px; margin-bottom: 24px;">
                <span style="color: white; font-size: 28px; font-weight: 800; letter-spacing: -1px;">AdRuby</span>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 16px; letter-spacing: -1px;">
                Willkommen an Bord, ${userName || 'Partner'}! 🚀
              </h1>
              <p style="color: #a1a1aa; font-size: 18px; line-height: 1.6; margin: 0;">
                Deine 7-Tage Testversion ist jetzt aktiv.<br/>
                Zeit, deine Meta Ads auf das nächste Level zu bringen.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, #333, transparent);"></div>
            </td>
          </tr>

          <!-- Features Grid -->
          <tr>
            <td style="padding: 32px 48px;">
              <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 24px; text-align: center;">
                Was dich erwartet:
              </h2>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 12px; vertical-align: top;">
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 20px;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🎨</div>
                      <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px;">KI Creative Studio</h3>
                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0;">Erstelle atemberaubende Ads in Sekunden</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 12px; vertical-align: top;">
                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 20px;">
                      <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                      <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Smart Analytics</h3>
                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0;">KI-gestützte Insights für deine Campaigns</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 12px; vertical-align: top;">
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 20px;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                      <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Campaign Builder</h3>
                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0;">Wizardgeführte Kampagnen-Erstellung</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 12px; vertical-align: top;">
                    <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 20px;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🤖</div>
                      <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px;">AI Autopilot</h3>
                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0;">24/7 Optimierung deiner Ads</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 16px 48px 32px; text-align: center;">
              <a href="https://adruby.ai/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">
                Jetzt Dashboard öffnen →
              </a>
            </td>
          </tr>

          <!-- Trial Info -->
          <tr>
            <td style="padding: 24px 48px; background: rgba(239, 68, 68, 0.05); border-top: 1px solid rgba(239, 68, 68, 0.1);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0 0 4px;">
                      ⏰ 7 Tage kostenlos testen
                    </p>
                    <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
                      Nach der Testphase startet dein Abo automatisch. Jederzeit kündbar.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 13px; margin: 0 0 8px;">
                © 2026 AdRuby - KI-gestützte Meta Ads Plattform
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                BlackRuby Digital | Frankfurt am Main
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { type, to, subject, html, userName, recipients } = body;

        // Validate required env vars
        if (!process.env.STRATO_EMAIL || !process.env.STRATO_PASSWORD) {
            console.error('[Email] Missing STRATO_EMAIL or STRATO_PASSWORD env vars');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Email configuration missing' }),
            };
        }

        const transporter = createTransporter();

        // Handle different email types
        let emailConfig;

        switch (type) {
            case 'welcome':
                // Welcome email after trial start
                emailConfig = {
                    from: `"AdRuby" <${process.env.STRATO_EMAIL}>`,
                    to: to,
                    subject: '🚀 Willkommen bei AdRuby - Deine Testversion ist aktiv!',
                    html: getWelcomeEmailTemplate(userName),
                };
                break;

            case 'custom':
                // Custom email from admin panel
                if (!subject || !html) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Subject and HTML required for custom emails' }),
                    };
                }

                // If recipients is an array, send to multiple
                if (Array.isArray(recipients) && recipients.length > 0) {
                    const results = [];
                    for (const recipient of recipients) {
                        try {
                            await transporter.sendMail({
                                from: `"AdRuby" <${process.env.STRATO_EMAIL}>`,
                                to: recipient,
                                subject: subject,
                                html: html,
                            });
                            results.push({ email: recipient, success: true });
                        } catch (err) {
                            results.push({ email: recipient, success: false, error: err.message });
                        }
                    }
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ success: true, results, sent: results.filter(r => r.success).length }),
                    };
                }

                emailConfig = {
                    from: `"AdRuby" <${process.env.STRATO_EMAIL}>`,
                    to: to,
                    subject: subject,
                    html: html,
                };
                break;

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid email type. Use: welcome, custom' }),
                };
        }

        // Send single email
        const result = await transporter.sendMail(emailConfig);
        console.log('[Email] Sent successfully:', result.messageId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, messageId: result.messageId }),
        };

    } catch (error) {
        console.error('[Email] Send failed:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to send email', details: error.message }),
        };
    }
};
