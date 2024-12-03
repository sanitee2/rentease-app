interface EmailTemplateProps {
  title: string
  preheader: string
  content: string
}

export function EmailTemplate({ title, preheader, content }: EmailTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${title}</title>
        <span class="preheader">${preheader}</span>
        <style>
          /* Base styles */
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
          }
          @media only screen and (max-width: 620px) {
            .container {
              width: 100% !important;
              padding: 10px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #0066cc;">${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>This is an automated message from RentEase. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
} 