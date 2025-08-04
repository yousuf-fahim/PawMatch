// supabase/functions/send-admin-invitation/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Send email using SMTP
    const client = new SmtpClient()
    
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com',
      port: 465,
      username: Deno.env.get('SMTP_USERNAME') || '',
      password: Deno.env.get('SMTP_PASSWORD') || '',
    })
    
    const adminPanelUrl = Deno.env.get('ADMIN_PANEL_URL') || 'https://admin.pawmatch.app'
    
    await client.send({
      from: Deno.env.get('SMTP_FROM') || 'noreply@pawmatch.app',
      to: email,
      subject: 'PawMatch Admin Invitation',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #FF6B6B, #FF8E8E); padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">PawMatch Admin Invitation</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have been invited to become an administrator for the PawMatch pet adoption platform.</p>
              <p>As an administrator, you'll have access to manage pets, users, content, and other aspects of the platform.</p>
              <p>To get started, please click the button below to access the admin panel:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${adminPanelUrl}" class="button">Access Admin Panel</a>
              </p>
              <p>If you don't have an account yet, you'll be able to create one when you first sign in, and you'll automatically be granted administrator privileges.</p>
              <p>If you have any questions, please contact the PawMatch team.</p>
              <p>Thank you,<br>The PawMatch Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply directly to this email.</p>
              <p>&copy; ${new Date().getFullYear()} PawMatch. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      html: true,
    })
    
    await client.close()
    
    return new Response(
      JSON.stringify({ success: true, message: 'Invitation email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Error sending invitation email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send invitation email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
