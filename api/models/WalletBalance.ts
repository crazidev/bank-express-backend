import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Transaction } from './Transaction'
import type { Wallet } from './Wallet'

type WalletBalanceAssociations = 'transactions' | 'wallet'

export class WalletBalance extends Model<
  InferAttributes<WalletBalance, { omit: WalletBalanceAssociations }>,
  InferCreationAttributes<WalletBalance, { omit: WalletBalanceAssociations }>
> {
  declare id: CreationOptional<number>
  declare userId: number | null
  declare walletId: number | null
  declare balance: number | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // WalletBalance belongsToMany Transaction
  declare transactions?: NonAttribute<Transaction[]>
  declare getTransactions: BelongsToManyGetAssociationsMixin<Transaction>
  declare setTransactions: BelongsToManySetAssociationsMixin<Transaction, number>
  declare addTransaction: BelongsToManyAddAssociationMixin<Transaction, number>
  declare addTransactions: BelongsToManyAddAssociationsMixin<Transaction, number>
  declare createTransaction: BelongsToManyCreateAssociationMixin<Transaction>
  declare removeTransaction: BelongsToManyRemoveAssociationMixin<Transaction, number>
  declare removeTransactions: BelongsToManyRemoveAssociationsMixin<Transaction, number>
  declare hasTransaction: BelongsToManyHasAssociationMixin<Transaction, number>
  declare hasTransactions: BelongsToManyHasAssociationsMixin<Transaction, number>
  declare countTransactions: BelongsToManyCountAssociationsMixin

  // WalletBalance belongsTo Wallet
  declare wallet?: NonAttribute<Wallet>
  declare getWallet: BelongsToGetAssociationMixin<Wallet>
  declare setWallet: BelongsToSetAssociationMixin<Wallet, number>
  declare createWallet: BelongsToCreateAssociationMixin<Wallet>

  declare static associations: {
    transactions: Association<WalletBalance, Transaction>,
    wallet: Association<WalletBalance, Wallet>
  }

  static initModel(sequelize: Sequelize): typeof WalletBalance {
    WalletBalance.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER
      },
      walletId: {
        type: DataTypes.INTEGER
      },
      balance: {
        type: DataTypes.INTEGER
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

    return WalletBalance
  }
}
