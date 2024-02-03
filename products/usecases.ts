import db from './db';
import { Product } from './models';
import * as E from 'fp-ts/Either';

type GetProductsError = { error: 'PRODUCT_NOT_FOUND'; productId: string };

export function useCaseGetProducts() {
  return (ids: string[]): E.Either<GetProductsError, Product[]> => {
    const result: Product[] = [];
    for (const id of ids) {
      const product = db.findProductById(id);
      if (!product) return E.left({ error: 'PRODUCT_NOT_FOUND', productId: id });
      result.push(product);
    }
    return E.right(result);
  };
}
