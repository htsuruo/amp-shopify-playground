import { Product } from '@shared/types'
import 'dotenv/config'
import { createAmpEmailTemplate } from './amp-email-template'
import { EmailService } from './email-service'

// const baseUrl = 'http://localhost:3000'
const baseUrl =
  'https://amp-shopify-playground-htsuruo-htsuruos-projects.vercel.app'

async function main() {
  // const template = loadTemplate('../amp_template/sample.html')

  const response = await fetch(`${baseUrl}/api/products`)
  const data = await response.json()
  const products = data as Product[]
  console.log(products)

  const template = createAmpEmailTemplate(
    // AMPメールのxhrで指定するURLは絶対パスかつHTTPSでなければならない
    `${baseUrl}/cart/create`,
    products
  )

  console.log(template)

  await new EmailService().sendAmpEmail({
    to: ['hideki.tsuruoka.fb@gmail.com'],
    from: 'hideki.tsuruoka.fb@htsuruo.com',
    subject: '[Test] AMP mail from SendGrid v3 API',
    ampHtml: template,
  })
}

main()
