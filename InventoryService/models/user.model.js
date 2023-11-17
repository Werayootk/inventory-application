module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isLongEnough(value) {
            if (value.length < 6) {
              throw new Error('Password must be at least 6 characters long');
            }
          }
        }
      },
      photo: {
        type: DataTypes.STRING,
      },
      bio: {
        type: DataTypes.STRING,
      }
    },{
      timestamps: true
    }
  );

  User.associate = (models) => {
    User.hasOne(models.Token, {
      foreignKey: "userId",
      allowNull: true
    });

    User.hasMany(models.Product, {
      foreignKey: "userId",
      allowNull: true
    });
  };

  return User;
};
