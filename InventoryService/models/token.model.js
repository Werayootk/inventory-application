module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    "Token",
    {
      token: {
        type: DataTypes.STRING,
      },
      expiresAt: {
        type: DataTypes.DATE
      }
    },{
      timestamps: true
    }
  );

  Token.associate = (models) => {
    Token.belongsTo(models.User, {
      foreignKey: "userId",
      allowNull: true
    });
  };

  return Token;
};
