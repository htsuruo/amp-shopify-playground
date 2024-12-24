import { MailDataRequired, MailService } from '@sendgrid/mail'

type EmailAttachment = {
  content: string
  filename: string
  type: string
  disposition: 'attachment' | 'inline'
  content_id?: string
}

type EmailOptions = {
  to: string | string[]
  from: string
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

export class EmailService {
  private client: MailService

  constructor() {
    this.client = new MailService()
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured')
    }
    this.client.setApiKey(process.env.SENDGRID_API_KEY)
  }

  // AMP Emailを送信するメソッド
  async sendAmpEmail(options: EmailOptions & { ampHtml: string }) {
    try {
      const message = {
        ...options,
        content: [
          {
            type: 'text/plain',
            value: options.text || 'This is TEXT MIME part',
          },
          {
            type: 'text/html',
            value: options.html || 'This is HTML MIME part',
          },
          {
            type: 'text/x-amp-html',
            value: options.ampHtml,
          },
        ],
      } as MailDataRequired

      const response = await this.client.send(message)
      return response
    } catch (error) {
      console.error('AMP メール送信エラー:', error)
      throw error
    }
  }
}
