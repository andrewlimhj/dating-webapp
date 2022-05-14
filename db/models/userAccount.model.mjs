export default function initUserAccountModel(sequelize, DataTypes) {
  return sequelize.define(
    'user_account',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      profession: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      date_of_birth: {
        type: DataTypes.DATE,
      },
      photo_link: {
        type: DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    },
  );
}
