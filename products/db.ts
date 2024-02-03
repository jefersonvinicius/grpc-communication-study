import { Product } from './models';

const products = new Map<string, Product>();

function saveProduct(product: Product) {
  products.set(product.id, product);
}

function findProductById(id: string) {
  return products.get(id);
}

export default {
  saveProduct,
  findProductById,
};
