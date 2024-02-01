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
  Sequelize,
} from "sequelize";

import type { Transaction } from "./Transaction";
import type { VerificationToken } from "./VerificationToken";
import type { WalletBalance } from "./WalletBalance";

type UserAssociations =
  | "transactions"
  | "beneficiaryTransactions"
  | "verificationTokens"
  | "walletBalances";

export class User extends Model<
  InferAttributes<User, { omit: UserAssociations }>,
  InferCreationAttributes<User, { omit: UserAssociations }>
> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare email: string | null;
  declare phone: string | null;
  declare emailVerified: boolean | null;
  declare gender: "male" | "female" | null;
  declare ssn: string | null;
  declare ssnStatus: "uploaded" | "verified" | null;
  declare idDoc: string | null;
  declare idDocStatus: "uploaded" | "verified" | null;
  declare accountBalance: number | null;
  declare state: string | null;
  declare country: string | null;
  declare address: string | null;
  declare emailToken: number | null;
  declare dateOfBirth: string | null;
  declare hasDeposited: boolean | null;
  declare password: string;
  declare idDocType:
    | "national_id"
    | "drivers_license"
    | "international_passport"
    | null;
  declare profileImg: string | null;
  declare pin: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare pinStatus: boolean | null;
  declare isVerified: boolean | null;
  declare accountLevel: "tier1" | "tier2" | "tier3" | null;
  declare pushId: string | null;
  declare lastSeen: Date | null;
  declare status: "blocked" | "active" | "suspended" | null;

  // User hasMany Transaction (as Transactions)
  declare transactions?: NonAttribute<Transaction[]>;
  declare getTransactions: HasManyGetAssociationsMixin<Transaction>;
  declare setTransactions: HasManySetAssociationsMixin<Transaction, number>;
  declare addTransaction: HasManyAddAssociationMixin<Transaction, number>;
  declare addTransactions: HasManyAddAssociationsMixin<Transaction, number>;
  declare createTransaction: HasManyCreateAssociationMixin<Transaction>;
  declare removeTransaction: HasManyRemoveAssociationMixin<Transaction, number>;
  declare removeTransactions: HasManyRemoveAssociationsMixin<
    Transaction,
    number
  >;
  declare hasTransaction: HasManyHasAssociationMixin<Transaction, number>;
  declare hasTransactions: HasManyHasAssociationsMixin<Transaction, number>;
  declare countTransactions: HasManyCountAssociationsMixin;

  // User hasMany Transaction (as BeneficiaryTransactions)
  declare beneficiaryTransactions?: NonAttribute<Transaction[]>;
  declare getBeneficiaryTransactions: HasManyGetAssociationsMixin<Transaction>;
  declare setBeneficiaryTransactions: HasManySetAssociationsMixin<
    Transaction,
    number
  >;
  declare addBeneficiaryTransaction: HasManyAddAssociationMixin<
    Transaction,
    number
  >;
  declare addBeneficiaryTransactions: HasManyAddAssociationsMixin<
    Transaction,
    number
  >;
  declare createBeneficiaryTransaction: HasManyCreateAssociationMixin<Transaction>;
  declare removeBeneficiaryTransaction: HasManyRemoveAssociationMixin<
    Transaction,
    number
  >;
  declare removeBeneficiaryTransactions: HasManyRemoveAssociationsMixin<
    Transaction,
    number
  >;
  declare hasBeneficiaryTransaction: HasManyHasAssociationMixin<
    Transaction,
    number
  >;
  declare hasBeneficiaryTransactions: HasManyHasAssociationsMixin<
    Transaction,
    number
  >;
  declare countBeneficiaryTransactions: HasManyCountAssociationsMixin;

  // User hasMany VerificationToken
  declare verificationTokens?: NonAttribute<VerificationToken[]>;
  declare getVerificationTokens: HasManyGetAssociationsMixin<VerificationToken>;
  declare setVerificationTokens: HasManySetAssociationsMixin<
    VerificationToken,
    number
  >;
  declare addVerificationToken: HasManyAddAssociationMixin<
    VerificationToken,
    number
  >;
  declare addVerificationTokens: HasManyAddAssociationsMixin<
    VerificationToken,
    number
  >;
  declare createVerificationToken: HasManyCreateAssociationMixin<VerificationToken>;
  declare removeVerificationToken: HasManyRemoveAssociationMixin<
    VerificationToken,
    number
  >;
  declare removeVerificationTokens: HasManyRemoveAssociationsMixin<
    VerificationToken,
    number
  >;
  declare hasVerificationToken: HasManyHasAssociationMixin<
    VerificationToken,
    number
  >;
  declare hasVerificationTokens: HasManyHasAssociationsMixin<
    VerificationToken,
    number
  >;
  declare countVerificationTokens: HasManyCountAssociationsMixin;

  // User hasMany WalletBalance
  declare walletBalances?: NonAttribute<WalletBalance[]>;
  declare getWalletBalances: HasManyGetAssociationsMixin<WalletBalance>;
  declare setWalletBalances: HasManySetAssociationsMixin<WalletBalance, number>;
  declare addWalletBalance: HasManyAddAssociationMixin<WalletBalance, number>;
  declare addWalletBalances: HasManyAddAssociationsMixin<WalletBalance, number>;
  declare createWalletBalance: HasManyCreateAssociationMixin<WalletBalance>;
  declare removeWalletBalance: HasManyRemoveAssociationMixin<
    WalletBalance,
    number
  >;
  declare removeWalletBalances: HasManyRemoveAssociationsMixin<
    WalletBalance,
    number
  >;
  declare hasWalletBalance: HasManyHasAssociationMixin<WalletBalance, number>;
  declare hasWalletBalances: HasManyHasAssociationsMixin<WalletBalance, number>;
  declare countWalletBalances: HasManyCountAssociationsMixin;

  declare static associations: {
    transactions: Association<User, Transaction>;
    beneficiaryTransactions: Association<User, Transaction>;
    verificationTokens: Association<User, VerificationToken>;
    walletBalances: Association<User, WalletBalance>;
  };

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
        },
        phone: {
          type: DataTypes.STRING,
        },
        emailVerified: {
          type: DataTypes.BOOLEAN,
        },
        gender: {
          type: DataTypes.ENUM("male", "female"),
        },
        ssn: {
          type: DataTypes.STRING,
        },
        ssnStatus: {
          type: DataTypes.ENUM("uploaded", "verified"),
        },
        idDoc: {
          type: DataTypes.STRING,
        },
        idDocStatus: {
          type: DataTypes.ENUM("uploaded", "verified"),
        },
        accountBalance: {
          type: DataTypes.INTEGER,
        },
        state: {
          type: DataTypes.STRING,
        },
        country: {
          type: DataTypes.STRING,
        },
        address: {
          type: DataTypes.STRING,
        },
        emailToken: {
          type: DataTypes.INTEGER,
        },
        dateOfBirth: {
          type: DataTypes.DATEONLY,
        },
        hasDeposited: {
          type: DataTypes.BOOLEAN,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        idDocType: {
          type: DataTypes.ENUM(
            "national_id",
            "drivers_license",
            "international_passport"
          ),
        },
        profileImg: {
          type: DataTypes.STRING,
        },
        pin: {
          type: DataTypes.STRING,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
        accountLevel: {
          type: DataTypes.ENUM("tier1", "tier2", "tier3"),
        },
        pushId: {
          type: DataTypes.STRING,
        },
        lastSeen: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        status: {
          type: DataTypes.ENUM("blocked", "active", "suspended"),
          defaultValue: "active",
        },
        /// Virtual fields
        pinStatus: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.pin == null ? false : true;
          },
        },
        isVerified: {
          type: DataTypes.VIRTUAL,
          get() {
            if (
              this.ssnStatus == "verified" &&
              this.idDocStatus == "verified"
            ) {
              return true;
            } else return false;
          },
        },
        /// Virtual field
      },
      {
        sequelize,
      }
    );

    return User;
  }
}
