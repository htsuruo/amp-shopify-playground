import { Product } from '@shared/types'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { handle } from 'hono/vercel'
import executeGraphQLRequest from './client'

export const config = {
  runtime: 'edge',
}

const app = new Hono().basePath('/api')
const senderEmail = 'hideki.tsuruoka.fb@htsuruo.com'

app.use(logger())

app.use('/*', async (c, next) => {
  const requestHeaders = c.req.header()
  console.log('Request Headers:', requestHeaders)
  await next()
  // CORS in AMP for Email
  // ref. https://amp.dev/documentation/guides-and-tutorials/email/learn/cors-in-email
  c.res.headers.set('AMP-Email-Allow-Sender', senderEmail)
  c.res.headers.set('Content-Type', 'application/json')
  // レスポンスヘッダーのすべてのキーと値をログ出力
  for (const [key, value] of c.res.headers.entries()) {
    console.log(`${key}: ${value}`)
  }
})

app.get('/', async (c) => {
  return c.json({ message: 'Hello, World!(GET)' })
})
app.post('/', async (c) => {
  return c.json({ message: 'Hello, World!(POST)' })
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
      mutation cartCreate($input: CartInput!) {
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

  const json = await executeGraphQLRequest(mutation, variables)
  const cart = json['cartCreate']['cart']
  console.log('cart:', JSON.stringify(cart))
  return c.json(cart)
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

  return c.json(data)
})

app.post('/create/customer_token', async (c) => {
  const body = await c.req.json()
  const { email, password } = body
  const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
          }
          customerUserErrors {
            message
          }
        }
      }
    `
  const variables = {
    input: {
      email,
      password,
    },
  }
  const res = await executeGraphQLRequest(mutation, variables)
  const json = JSON.parse(JSON.stringify(res))
  const token =
    json['customerAccessTokenCreate']['customerAccessToken']['accessToken']
  return c.json(token)
})

app.post('/create/customer_create', async (c) => {
  const body = await c.req.json()
  const { email, password } = body
  const mutation = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            firstName
            lastName
            email
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }
    `
  const variables = {
    input: {
      email,
      password,
    },
  }
  const json = await executeGraphQLRequest(mutation, variables)
  const token = json['customerCreate']['customer']
  return c.json(token)
})

export default handle(app)
