import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize
} from 'sequelize'
import type { Bank } from './Bank'
import type { User } from './User'
import type { Wallet } from './Wallet'

type TransactionAssociations = 'user' | 'wallet' | 'bank' | 'beneficiary'

export class Transaction extends Model<
  InferAttributes<Transaction, { omit: TransactionAssociations }>,
  InferCreationAttributes<Transaction, { omit: TransactionAssociations }>
> {
  declare amount: number
  declare status: 'pending' | 'completed' | null
  declare paymentMethod: 'bank_transfer' | 'crypto' | 'inter_transfer'
  declare narration: string | null
  declare reference: string | null
  declare userId: number | null
  declare walletId: number | null
  declare walletNetwork: string | null
  declare id: CreationOptional<number>
  declare beneficiaryId: number | null
  declare beneficiaryName: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Transaction belongsTo User
  declare user?: NonAttribute<User>
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, number>
  declare createUser: BelongsToCreateAssociationMixin<User>

  // Transaction belongsTo Wallet
  declare wallet?: NonAttribute<Wallet>
  declare getWallet: BelongsToGetAssociationMixin<Wallet>
  declare setWallet: BelongsToSetAssociationMixin<Wallet, number>
  declare createWallet: BelongsToCreateAssociationMixin<Wallet>

  // Transaction belongsTo Bank
  declare bank?: NonAttribute<Bank>
  declare getBank: BelongsToGetAssociationMixin<Bank>
  declare setBank: BelongsToSetAssociationMixin<Bank, number>
  declare createBank: BelongsToCreateAssociationMixin<Bank>

  // Transaction belongsTo User (as Beneficiary)
  declare beneficiary?: NonAttribute<User>
  declare getBeneficiary: BelongsToGetAssociationMixin<User>
  declare setBeneficiary: BelongsToSetAssociationMixin<User, number>
  declare createBeneficiary: BelongsToCreateAssociationMixin<User>

  declare static associations: {
    user: Association<Transaction, User>,
    wallet: Association<Transaction, Wallet>,
    bank: Association<Transaction, Bank>,
    beneficiary: Association<Transaction, User>
  }

  static initModel(sequelize: Sequelize): typeof Transaction {
    Transaction.init({
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed')
      },
      paymentMethod: {
        type: DataTypes.ENUM('bank_transfer', 'crypto', 'inter_transfer'),
        allowNull: false
      },
      narration: {
        type: DataTypes.STRING
      },
      reference: {
        type: DataTypes.UUID
      },
      userId: {
        type: DataTypes.INTEGER
      },
      walletId: {
        type: DataTypes.INTEGER
      },
      walletNetwork: {
        type: DataTypes.STRING
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      beneficiaryId: {
        type: DataTypes.INTEGER
      },
      beneficiaryName: {
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

    return Transaction
  }
}
