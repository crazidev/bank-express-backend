import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Transaction } from './Transaction'
import type { WalletBalance } from './WalletBalance'

type WalletAssociations = 'transactions' | 'walletBalance'

export class Wallet extends Model<
  InferAttributes<Wallet, {omit: WalletAssociations}>,
  InferCreationAttributes<Wallet, {omit: WalletAssociations}>
> {
  declare id: CreationOptional<number>
  declare name: string | null
  declare shortName: string | null
  declare walletAddress: string | null
  declare network: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Wallet hasMany Transaction
  declare transactions?: NonAttribute<Transaction[]>
  declare getTransactions: HasManyGetAssociationsMixin<Transaction>
  declare setTransactions: HasManySetAssociationsMixin<Transaction, number>
  declare addTransaction: HasManyAddAssociationMixin<Transaction, number>
  declare addTransactions: HasManyAddAssociationsMixin<Transaction, number>
  declare createTransaction: HasManyCreateAssociationMixin<Transaction>
  declare removeTransaction: HasManyRemoveAssociationMixin<Transaction, number>
  declare removeTransactions: HasManyRemoveAssociationsMixin<Transaction, number>
  declare hasTransaction: HasManyHasAssociationMixin<Transaction, number>
  declare hasTransactions: HasManyHasAssociationsMixin<Transaction, number>
  declare countTransactions: HasManyCountAssociationsMixin
  
  // Wallet hasOne WalletBalance
  declare walletBalance?: NonAttribute<WalletBalance>
  declare getWalletBalance: HasOneGetAssociationMixin<WalletBalance>
  declare setWalletBalance: HasOneSetAssociationMixin<WalletBalance, number>
  declare createWalletBalance: HasOneCreateAssociationMixin<WalletBalance>
  
  declare static associations: {
    transactions: Association<Wallet, Transaction>,
    walletBalance: Association<Wallet, WalletBalance>
  }

  static initModel(sequelize: Sequelize): typeof Wallet {
    Wallet.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      shortName: {
        type: DataTypes.STRING
      },
      walletAddress: {
        type: DataTypes.TEXT
      },
      network: {
        type: DataTypes.STRING
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      sequelize
    })
    
    return Wallet
  }
}
