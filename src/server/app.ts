import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Product } from '../types/types'

const client = createStorefrontApiClient({
  storeDomain: 'http://02ebb2-4d-2.myshopify.com',
  apiVersion: '2024-10',
  publicAccessToken: 'dbec8572019cfa3572efd7872268f583',
})

const app = new Hono()

// CORSミドルウェアの設定
app.use(
  '/*',
  cors({
    origin: 'https://mail.google.com',
    credentials: true,
  })
)

app.get('/', (c) => {
  return c.text('Hello World')
})

app.post('/proxy/cart/add', async (c) => {
  try {
    // const body = await c.req.json()
    // const { buyerIdentity, cartId } = await c.req.json()
    const buyerIdentity = {
      email: 'hideki.tsuruoka.fb@gmail.com',
    }
    const cartId = 'xx'

    const mutation = `
      mutation cartBuyerIdentityUpdate($buyerIdentity: CartBuyerIdentityInput!, $cartId: ID!) {
        cartBuyerIdentityUpdate(buyerIdentity: $buyerIdentity, cartId: $cartId) {
          cart {
            id
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

    const response = await client.request(mutation, { variables })
    const data = response.data

    return c.json(data, {
      headers: {
        'AMP-Access-Control-Allow-Source-Origin': 'https://02ebb2-4d-2',
        'Access-Control-Expose-Headers':
          'AMP-Access-Control-Allow-Source-Origin',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
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

  const { data } = await client.request(query)
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

export default app
