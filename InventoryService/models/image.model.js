module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define(
      "Image",
      {
        fileName: {
          type: DataTypes.STRING,
        },
        filePath: {
          type: DataTypes.STRING,
        },
        fileType: {
          type: DataTypes.STRING,
        },
        fileSize: {
          type: DataTypes.STRING,
        },
      },{
        timestamps: false
      }
    );
  
    Image.associate = (models) => {
      Image.belongsTo(models.Product, {
        foreignKey: "productId",
        allowNull: true
      });
    };
  
    return Image;
  };