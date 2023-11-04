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
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Transaction } from './Transaction'

type BankAssociations = 'transactions'

export class Bank extends Model<
  InferAttributes<Bank, {omit: BankAssociations}>,
  InferCreationAttributes<Bank, {omit: BankAssociations}>
> {
  declare bankName: string | null
  declare bankCode: string | null
  declare id: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Bank hasMany Transaction
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
  
  declare static associations: {
    transactions: Association<Bank, Transaction>
  }

  static initModel(sequelize: Sequelize): typeof Bank {
    Bank.init({
      bankName: {
        type: DataTypes.STRING
      },
      bankCode: {
        type: DataTypes.STRING
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
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
    
    return Bank
  }
}
