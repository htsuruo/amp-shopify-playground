import { Product } from '@shared/types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { handle } from 'hono/vercel'
import executeGraphQLRequest from './client'

export const config = {
  runtime: 'edge',
}

const app = new Hono().basePath('/api')
const senderEmail = 'hideki.tsuruoka.fb@htsuruo.com'

app.use(logger())
// CORSミドルウェアの設定
// ref. https://amp.dev/documentation/guides-and-tutorials/email/learn/cors-in-email
app.use(
  '/*',
  cors({
    origin: 'https://mail.google.com',
    credentials: true,
    // フォーム送信後のリダイレクト処理を許可
    // ref. https://amp.dev/ja/documentation/components/email/amp-form#%E9%80%81%E4%BF%A1%E5%BE%8C%E3%81%AE%E3%83%AA%E3%83%80%E3%82%A4%E3%83%AC%E3%82%AF%E3%83%88
    exposeHeaders: [
      'AMP-Access-Control-Allow-Source-Origin',
      'AMP-Redirect-To',
    ],
  })
)

app.use('/*', async (c, next) => {
  const requestHeaders = c.req.header()
  console.log('Request Headers:', requestHeaders)
  await next()
  c.header('AMP-Email-Allow-Sender', senderEmail)
})

app.get('/products', async (c) => {
  const query = `
      query {
          products(first: 3) {
              edges {
                  node {
                  id
                  title
                  description
                  images(first: 1) {
                      edges {
                          node {
                              transformedSrc
                          }
                      }
                  }
                  variants(first: 1) {
                      edges {
                          node {
                              id
                              price {
                                  amount
                                  currencyCode
                              }
                          }
                      }
                  }
                  }
              }
          }
      }
    `

  const data = await executeGraphQLRequest(query)
  let products: Product[] = []
  for (const edge of data.products.edges) {
    const product = {
      title: edge.node.title,
      description: edge.node.description,
      imageUrl: edge.node.images.edges[0].node.transformedSrc,
      price: edge.node.variants.edges[0].node.price.amount,
      variantId: edge.node.variants.edges[0].node.id,
    } as Product
    products.push(product)
  }
  return c.json(products)
})

app.post('/cart/create', async (c) => {
  const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `

  const variables = {
    input: {
      lines: [
        {
          quantity: 1,
          merchandiseId: 'gid://shopify/ProductVariant/44047455944900',
        },
      ],
    },
  }

  const { data } = await executeGraphQLRequest(mutation, variables)
  return c.json(data, {
    headers: {
      // TODO(htsuruo): 仮のリダイレクト先を設定
      'AMP-Redirect-To': 'https://hono.dev/',
    },
  })
})

app.post('/cart/associate', async (c) => {
  // const body = await c.req.json()
  // const { buyerIdentity, cartId } = await c.req.json()
  const buyerIdentity = {
    email: 'hideki.tsuruoka.fb@gmail.com',
  }
  const cartId =
    'gid://shopify/Cart/Z2NwLWFzaWEtc291dGhlYXN0MTowMUpGWVpRM1REWlY5VFFLRUY5QUYwQVFQUg?key=d7f222f24009f2baaf98760718281fe1'

  const mutation = `
      mutation cartBuyerIdentityUpdate($buyerIdentity: CartBuyerIdentityInput!, $cartId: ID!) {
        cartBuyerIdentityUpdate(buyerIdentity: $buyerIdentity, cartId: $cartId) {
          cart {
            id
            checkoutUrl
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `
  const variables = {
    buyerIdentity,
    cartId,
  }

  const data = await executeGraphQLRequest(mutation, variables)

  return c.json(data, {
    headers: {
      'AMP-Access-Control-Allow-Source-Origin': 'https://02ebb2-4d-2',
      'Access-Control-Expose-Headers': 'AMP-Access-Control-Allow-Source-Origin',
    },
  })
})

export default handle(app)
