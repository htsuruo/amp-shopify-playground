import 'dotenv/config'
import { Product } from '../types/types'
import { createAmpEmailTemplate } from './amp-email-template'
import { EmailService } from './email-service'

async function main() {
  // const template = loadTemplate('../amp_template/sample.html')

  const response = await fetch('http://localhost:3000/products')
  const data = await response.json()
  const products = data as Product[]
  console.log(products)

  const template = createAmpEmailTemplate(
    // AMPメールのxhrで指定するURLは絶対パスかつHTTPSでなければならない
    'https://localhost:3000/proxy/cart/add',
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
