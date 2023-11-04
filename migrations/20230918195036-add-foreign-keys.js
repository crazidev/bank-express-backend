const DataTypes = require('sequelize').DataTypes

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('transactions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'transactions_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('transactions', {
      fields: ['wallet_id'],
      type: 'foreign key',
      name: 'transactions_wallet_id_fkey',
      references: {
        table: 'wallets',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('transactions', {
      fields: ['beneficiary_id'],
      type: 'foreign key',
      name: 'transactions_beneficiary_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('transactions', {
      fields: ['bank_id'],
      type: 'foreign key',
      name: 'transactions_bank_id_fkey',
      references: {
        table: 'banks',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('wallets', {
      fields: ['wallet_balance_id'],
      type: 'foreign key',
      name: 'wallets_wallet_balance_id_fkey',
      references: {
        table: 'wallet_balances',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('wallets', {
      fields: ['transactions_id'],
      type: 'foreign key',
      name: 'wallets_transactions_id_fkey',
      references: {
        table: 'transactions',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('verification_tokens', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'verification_tokens_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('wallet_balances', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'wallet_balances_user_id_fkey',
      references: {
        table: 'users',
        field: 'id'
      }
    })
    
    await queryInterface.addConstraint('wallet_balances', {
      fields: ['wallet_id'],
      type: 'foreign key',
      name: 'wallet_balances_wallet_id_fkey',
      references: {
        table: 'wallets',
        field: 'id'
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('transactions', 'transactions_user_id_fkey')
    await queryInterface.removeConstraint('transactions', 'transactions_wallet_id_fkey')
    await queryInterface.removeConstraint('transactions', 'transactions_beneficiary_id_fkey')
    await queryInterface.removeConstraint('transactions', 'transactions_bank_id_fkey')
    await queryInterface.removeConstraint('wallets', 'wallets_wallet_balance_id_fkey')
    await queryInterface.removeConstraint('wallets', 'wallets_transactions_id_fkey')
    await queryInterface.removeConstraint('verification_tokens', 'verification_tokens_user_id_fkey')
    await queryInterface.removeConstraint('wallet_balances', 'wallet_balances_user_id_fkey')
    await queryInterface.removeConstraint('wallet_balances', 'wallet_balances_wallet_id_fkey')
  }
};