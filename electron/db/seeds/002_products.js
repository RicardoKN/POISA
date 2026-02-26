exports.seed = async function (knex) {
  await knex('stock_entries').del()
  await knex('products').del()

  const products = [
    { name: 'Arabica Coffee Beans 500g', category: 'Beverages', barcode: '6001234000001', cost_price: 45.00, sale_price: 69.95, quantity: 30, min_threshold: 5 },
    { name: 'Rooibos Tea Bags (40s)', category: 'Beverages', barcode: '6001234000002', cost_price: 18.50, sale_price: 29.95, quantity: 50, min_threshold: 10 },
    { name: 'Full Cream Milk 1L', category: 'Dairy', barcode: '6001234000003', cost_price: 12.00, sale_price: 18.95, quantity: 25, min_threshold: 10 },
    { name: 'Cheddar Cheese 400g', category: 'Dairy', barcode: '6001234000004', cost_price: 35.00, sale_price: 52.95, quantity: 15, min_threshold: 5 },
    { name: 'White Bread Loaf', category: 'Bakery', barcode: '6001234000005', cost_price: 8.50, sale_price: 14.95, quantity: 40, min_threshold: 15 },
    { name: 'Brown Bread Loaf', category: 'Bakery', barcode: '6001234000006', cost_price: 9.00, sale_price: 15.95, quantity: 35, min_threshold: 15 },
    { name: 'Sunflower Cooking Oil 750ml', category: 'Household', barcode: '6001234000007', cost_price: 22.00, sale_price: 34.95, quantity: 20, min_threshold: 5 },
    { name: 'Washing Powder 2kg', category: 'Household', barcode: '6001234000008', cost_price: 38.00, sale_price: 59.95, quantity: 12, min_threshold: 5 },
    { name: 'Bar Soap (3-pack)', category: 'Personal Care', barcode: '6001234000009', cost_price: 15.00, sale_price: 24.95, quantity: 3, min_threshold: 5 },
    { name: 'Toothpaste 100ml', category: 'Personal Care', barcode: '6001234000010', cost_price: 12.50, sale_price: 21.95, quantity: 0, min_threshold: 5 },
    { name: 'Maize Meal 5kg', category: 'Staples', barcode: '6001234000011', cost_price: 28.00, sale_price: 42.95, quantity: 45, min_threshold: 10 },
    { name: 'White Sugar 2.5kg', category: 'Staples', barcode: '6001234000012', cost_price: 32.00, sale_price: 49.95, quantity: 22, min_threshold: 8 },
    { name: 'Tinned Baked Beans 410g', category: 'Canned Goods', barcode: '6001234000013', cost_price: 8.00, sale_price: 13.95, quantity: 60, min_threshold: 15 },
    { name: 'Tinned Pilchards 400g', category: 'Canned Goods', barcode: '6001234000014', cost_price: 14.00, sale_price: 22.95, quantity: 4, min_threshold: 10 },
    { name: 'Coca-Cola 2L', category: 'Beverages', barcode: '6001234000015', cost_price: 11.50, sale_price: 19.95, quantity: 36, min_threshold: 10 },
  ]

  await knex('products').insert(products)

  // Get inserted product IDs and create initial stock entries
  const insertedProducts = await knex('products').select('id', 'quantity')
  const managerStaff = await knex('staff').where({ role: 'manager' }).first()

  const stockEntries = insertedProducts.map((p) => ({
    product_id: p.id,
    type: 'initial',
    quantity: p.quantity,
    supplier: 'Initial Stock',
    notes: 'Seed data — initial stock load',
    staff_id: managerStaff.id,
  }))

  await knex('stock_entries').insert(stockEntries)
}
