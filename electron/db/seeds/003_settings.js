exports.seed = async function (knex) {
  await knex('settings').del()

  await knex('settings').insert([
    { key: 'shop_name', value: 'POISA Retail Store' },
    { key: 'shop_address', value: '123 Main Mall, Gaborone' },
    { key: 'shop_phone', value: '+267 7X XXX XXX' },
    { key: 'default_min_threshold', value: '5' },
  ])
}
