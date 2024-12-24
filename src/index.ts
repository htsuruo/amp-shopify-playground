import 'dotenv/config'
import { createAmpEmailTemplate } from './amp-email-template'
import { EmailService } from './email-service'
import { Product } from './type'

const product: Product = {
  title: '素敵な商品',
  description: '商品の説明文がここに入ります',
  price: 2000,
  variantId: 44047455944900,
}

async function main() {
  // const template = loadTemplate('../amp_template/sample.html')
  const template = createAmpEmailTemplate(
    // AMPメールのxhrで指定するURLは絶対パスかつHTTPSでなければならない
    'http://localhost:3000/proxy/cart/add',
    product
  )

  await new EmailService().sendAmpEmail({
    to: ['hideki.tsuruoka.fb@gmail.com'],
    from: 'hideki.tsuruoka.fb@htsuruo.com',
    subject: '[Test] AMP mail from SendGrid v3 API',
    ampHtml: template,
  })
}

main()
