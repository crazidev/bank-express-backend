const DataTypes = require("sequelize").DataTypes;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("transactions", {
      amount: {
        type: DataTypes.INTEGER,
        field: "amount",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed"),
        field: "status",
      },
      paymentMethod: {
        type: DataTypes.ENUM("bank_transfer", "crypto", "inter_transfer"),
        field: "payment_method",
        allowNull: false,
      },
      narration: {
        type: DataTypes.STRING,
        field: "narration",
      },
      reference: {
        type: DataTypes.UUID,
        field: "reference",
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
      },
      walletId: {
        type: DataTypes.INTEGER,
        field: "wallet_id",
      },
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      beneficiaryId: {
        type: DataTypes.INTEGER,
        field: "beneficiary_id",
      },
      beneficiaryName: {
        type: DataTypes.STRING,
        field: "beneficiary_name",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
      bankId: {
        type: DataTypes.INTEGER,
        field: "bank_id",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("transactions");
  },
};
