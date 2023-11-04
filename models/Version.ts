import {
    CreationOptional,
    DataTypes,
    InferCreationAttributes,
    InferAttributes,
    Model,
    Sequelize
} from 'sequelize'

export class Version extends Model<
    InferAttributes<Version>,
    InferCreationAttributes<Version>
> {
    declare id: CreationOptional<number>
    declare version: string | null
    declare status: 'active' | 'inactive'

    static initModel(sequelize: Sequelize): typeof Version {
        Version.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            version: {
                type: DataTypes.TEXT,
                defaultValue: '0.1.0'
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'active'
            },
        }, {
            sequelize,
            timestamps: false
        })

        return Version
    }
}
