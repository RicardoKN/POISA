exports.up = function (knex) {
  return knex.schema.createTable('sale_items', (table) => {
    table.increments('id').primary()
    table.integer('sale_id').notNullable().references('id').inTable('sales')
    table.integer('product_id').notNullable().references('id').inTable('products')
    table.integer('quantity').notNullable()
    table.float('unit_price').notNullable()
    table.float('discount').defaultTo(0)
    table.float('line_total').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sale_items')
}
