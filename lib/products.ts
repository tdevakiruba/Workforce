export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  images?: string[]
}

// This is the source of truth for all products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: 'career-acceleration-21-days',
    name: '21 DAYS - ACCELERATION PROGRAM',
    description: 'Your 21 Days of Career Acceleration Journey that transforms you into an AI-ready professional with the judgment, accountability, and clarity employers demand.',
    priceInCents: 5900, // $59.00
  },
]
