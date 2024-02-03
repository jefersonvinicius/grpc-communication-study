export type Order = {
  id: string;
  items: { id: string; name: string; price: number; amount: number }[];
  total: number;
  created_at: Date;
};
