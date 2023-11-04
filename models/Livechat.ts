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
import type { User } from './User'

type LivechatAssociations = 'user'

export class Livechat extends Model<
    InferAttributes<Livechat, { omit: LivechatAssociations }>,
    InferCreationAttributes<Livechat, { omit: LivechatAssociations }>
> {
    declare id: CreationOptional<number>
    declare userId: number | null
    declare fromAdmin: boolean | null
    declare message: string
    declare type: 'text' | 'image' | 'file' | null
    declare fileUrl: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Livechat belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, number>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<Livechat, User>
    }

    static initModel(sequelize: Sequelize): typeof Livechat {
        Livechat.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER
            },
            fromAdmin: {
                type: DataTypes.BOOLEAN
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM('text', 'image', 'file')
            },
            fileUrl: {
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

        return Livechat
    }
}