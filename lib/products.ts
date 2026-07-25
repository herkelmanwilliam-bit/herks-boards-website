export interface Product {
  id: string
  name: string
  category: 'cutting-boards' | 'custom' | 'plaques'
  description: string
  price: number
  unit: string
  image: string
  inStock: boolean
  featured: boolean
  details: string[]
}

export const products: Product[] = [
  {
    id: 'board-standard-8x12',
    name: 'Classic 8"x12" Cutting Board',
    category: 'cutting-boards',
    description: 'A beautiful, everyday 8"x12" cutting board. Perfect for everyday kitchen prep, cutting fruit, or serving cheeses.',
    price: 50.00, // Placeholder price
    unit: 'each',
    image: '/images/placeholder-board.jpg',
    inStock: true,
    featured: true,
    details: [
      'Dimensions: 8" x 12"', 
      'Thickness: 3/4 inch', 
      'Classic flat surface', 
      'Hand-finished with food-safe oil'
    ],
  },
  {
    id: 'board-juice-groove-8x12',
    name: '8"x12" Cutting Board w/ Juice Groove',
    category: 'cutting-boards',
    description: 'Our classic 8"x12" board featuring a routed juice groove to catch liquids when resting or cutting meats. Keeps your counters perfectly clean.',
    price: 60.00, // Placeholder price
    unit: 'each',
    image: '/images/placeholder-board.jpg',
    inStock: true,
    featured: true,
    details: [
      'Dimensions: 8" x 12"', 
      'Thickness: 3/4 inch', 
      'Routed juice groove', 
      'Hand-finished with food-safe oil'
    ],
  },
  {
    id: 'board-rubber-feet-8x12',
    name: '8"x12" Cutting Board w/ Rubber Feet',
    category: 'cutting-boards',
    description: 'The standard 8"x12" cutting board elevated with non-slip rubber feet for maximum stability on your counter, preventing any sliding during use.',
    price: 55.00, // Placeholder price
    unit: 'each',
    image: '/images/placeholder-board.jpg',
    inStock: true,
    featured: true,
    details: [
      'Dimensions: 8" x 12"', 
      'Thickness: 3/4 inch', 
      'Non-slip rubber feet installed', 
      'Hand-finished with food-safe oil'
    ],
  },
  {
    id: 'board-chamfered-8x12',
    name: '8"x12" Cutting Board w/ Chamfered Edges',
    category: 'cutting-boards',
    description: 'Our 8"x12" board featuring elegant chamfered (angled) edges for a modern look and easy lifting off flat surfaces.',
    price: 55.00, // Placeholder price
    unit: 'each',
    image: '/images/placeholder-board.jpg',
    inStock: true,
    featured: true,
    details: [
      'Dimensions: 8" x 12"', 
      'Thickness: 3/4 inch', 
      'Chamfered/angled edges', 
      'Hand-finished with food-safe oil'
    ],
  }
]

export const getProductsByCategory = (category: Product['category']) =>
  products.filter(p => p.category === category)

export const getFeaturedProducts = () =>
  products.filter(p => p.featured)

export const getProductById = (id: string) =>
  products.find(p => p.id === id)
