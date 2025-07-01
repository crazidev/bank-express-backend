import {
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  Sequelize
} from 'sequelize'

export class VerificationToken extends Model<
  InferAttributes<VerificationToken>,
  InferCreationAttributes<VerificationToken>
> {
  declare id: CreationOptional<number>
  declare userId: number | null
  declare token: string | null
  // declare tokenUsed: boolean | null
  declare expiresAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof VerificationToken {
    VerificationToken.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      userId: {
        type: DataTypes.INTEGER
      },
      token: {
        type: DataTypes.STRING(6)
      },
      // tokenUsed: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false
      // },
      expiresAt: {
        type: DataTypes.DATE
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

    return VerificationToken
  }
}
