const DataTypes = require("sequelize").DataTypes;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        field: "first_name",
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        field: "email",
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        field: "email_verified",
      },
      gender: {
        type: DataTypes.ENUM("male", "female"),
        field: "gender",
      },
      ssn: {
        type: DataTypes.STRING,
        field: "ssn",
      },
      ssnStatus: {
        type: DataTypes.ENUM("uploaded", "verified"),
        field: "ssn_status",
      },
      idDoc: {
        type: DataTypes.STRING,
        field: "id_doc",
      },
      idDocStatus: {
        type: DataTypes.ENUM("uploaded", "verified"),
        field: "id_doc_status",
      },
      accountBalance: {
        type: DataTypes.INTEGER,
        field: "account_balance",
      },
      state: {
        type: DataTypes.STRING,
        field: "state",
      },
      country: {
        type: DataTypes.STRING,
        field: "country",
      },
      address: {
        type: DataTypes.STRING,
        field: "address",
      },
      emailToken: {
        type: DataTypes.INTEGER,
        field: "email_token",
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: "date_of_birth",
      },
      hasDeposited: {
        type: DataTypes.BOOLEAN,
        field: "has_deposited",
      },
      password: {
        type: DataTypes.STRING,
        field: "password",
        allowNull: false,
      },
      idDocType: {
        type: DataTypes.ENUM(
          "national_id",
          "drivers_license",
          "international_passport"
        ),
        field: "id_doc_type",
      },
      profileImg: {
        type: DataTypes.STRING,
        field: "profile_img",
      },
      pin: {
        type: DataTypes.STRING,
        field: "pin",
      },
      accountLevel: {
        field: "accountLevel",
        type: DataTypes.ENUM("tier1", "tier2", "tier3"),
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
