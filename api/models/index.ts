import type { Sequelize, Model } from 'sequelize'
import { User } from './User'
import { Transaction } from './Transaction'
import { Config } from './Config'
import { Wallet } from './Wallet'
import { Bank } from './Bank'
import { VerificationToken } from './VerificationToken'
import { WalletBalance } from './WalletBalance'
import { Livechat } from './Livechat'
import { Version } from './Version'

export {
  User,
  Transaction,
  Config,
  Wallet,
  Bank,
  VerificationToken,
  WalletBalance,
  Livechat,
  Version
}

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
  Transaction.initModel(sequelize)
  Config.initModel(sequelize)
  Wallet.initModel(sequelize)
  Bank.initModel(sequelize)
  VerificationToken.initModel(sequelize)
  WalletBalance.initModel(sequelize)
  Livechat.initModel(sequelize)
  Version.initModel(sequelize)

  User.hasMany(Transaction, {
    as: 'transactions',
    foreignKey: 'user_id'
  })
  User.hasMany(Transaction, {
    as: 'beneficiaryTransactions',
    foreignKey: 'beneficiary_id'
  })
  User.hasMany(VerificationToken, {
    as: 'verificationTokens',
    foreignKey: 'user_id'
  })
  User.hasMany(WalletBalance, {
    as: 'walletBalances',
    foreignKey: 'user_id'
  })
  User.hasMany(Livechat, {
    as: 'livechats',
    foreignKey: 'user_id'
  })
  Transaction.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })
  Transaction.belongsTo(Wallet, {
    as: 'wallet',
    foreignKey: 'wallet_id'
  })
  Transaction.belongsTo(Bank, {
    as: 'bank',
    foreignKey: 'bank_id'
  })
  Transaction.belongsTo(User, {
    as: 'beneficiary',
    foreignKey: 'beneficiary_id'
  })
  Wallet.hasMany(Transaction, {
    as: 'transactions',
    foreignKey: 'wallet_id'
  })
  Wallet.hasOne(WalletBalance, {
    as: 'walletBalance',
    foreignKey: 'wallet_id'
  })
  Bank.hasMany(Transaction, {
    as: 'transactions',
    foreignKey: 'bank_id'
  })
  WalletBalance.belongsToMany(Transaction, {
    as: 'transactions',
    through: Wallet,
    foreignKey: 'wallet_balance_id',
    otherKey: 'transactions_id',
    onDelete: 'CASCADE'
  })
  WalletBalance.belongsTo(Wallet, {
    as: 'wallet',
    foreignKey: 'wallet_id'
  })
  Livechat.belongsTo(User, {
    as: 'user',
    foreignKey: 'users_id'
  })

  return {
    User,
    Transaction,
    Config,
    Wallet,
    Bank,
    VerificationToken,
    WalletBalance,
    Livechat
  }
}