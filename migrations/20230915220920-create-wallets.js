const DataTypes = require('sequelize').DataTypes

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wallets', {
      id: {
        type: DataTypes.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        field: 'name'
      },
      shortName: {
        type: DataTypes.STRING,
        field: 'short_name'
      },
      walletAddress: {
        type: DataTypes.TEXT,
        field: 'wallet_address'
      },
      network: {
        type: DataTypes.STRING,
        field: 'network'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      walletBalanceId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: 'wallet_balance_id'
      },
      transactionsId: {
        type: DataTypes.INTEGER,
        field: 'transactions_id'
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallets');
  },
};