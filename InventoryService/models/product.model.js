module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      name: {
        type: DataTypes.STRING,
      },
      sku: {
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.STRING,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      price: {
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.STRING,
      }
    },{
      timestamps: true
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: "userId",
      allowNull: true
    });

    Product.hasOne(models.Image, {
      foreignKey: "productId",
      allowNull: true
    })
  };

  return Product;
};


