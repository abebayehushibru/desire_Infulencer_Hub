const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Community = sequelize.define(
    "Community",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },


      // Basic Information
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },


      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      about: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      goals: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      rules: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },


      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },


      categories: {
        type: DataTypes.JSON,
        defaultValue: [],
      },


      platforms: {
        type: DataTypes.JSON,
        defaultValue: [],
      },


      // Images
      profile_photo_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },


      cover_photo_document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },


      // Access
      visibility: {
        type: DataTypes.ENUM(
          "public",
          "private"
        ),
        defaultValue: "private",
      },


      status: {
        type: DataTypes.ENUM(
          "pending",
          "active",
          "inactive",
          "blocked"
        ),
        defaultValue: "pending",
      },


      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue:false,
      },


      // Commission
      commission_type:{
        type:DataTypes.ENUM(
          "Rate",
          "Fixed"
        ),
        defaultValue:"Rate",
      },


      commission_rate:{
        type:DataTypes.FLOAT,
        allowNull:true,
      },


      commission_amount:{
        type:DataTypes.FLOAT,
        allowNull:true,
      },


      // Manager
      manager_user_id:{
        type:DataTypes.UUID,
        allowNull:true,
      },


      // Statistics
      total_members: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },


      total_agents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },


      total_campaigns: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

    },


    {
      tableName: "communities",

      underscored:true,

      timestamps:true,

      createdAt:"created_at",

      updatedAt:"updated_at",


      indexes:[
        {
          unique:true,
          fields:["name"]
        },


        {
          fields:["status"]
        }
      ]

    }
  );



  Community.associate=(models)=>{


    // Business owner
    Community.belongsTo(models.User,{
      foreignKey:"business_user_id",
      as:"business",
    });



    // Manager
    Community.belongsTo(models.User,{
      foreignKey:"manager_user_id",
      as:"manager",
    });



    // Profile image
    Community.belongsTo(models.Document,{
      foreignKey:"profile_photo_document_id",
      as:"profile_photo",
    });



    // Cover image
    Community.belongsTo(models.Document,{
      foreignKey:"cover_photo_document_id",
      as:"cover_photo",
    });



    // Members
    Community.hasMany(models.CommunityMember,{
      foreignKey:"community_id",
      as:"members",
      onDelete:"CASCADE",
    });
Community.hasOne(models.Chat, {
    foreignKey: "target_id",
    as: "chat",
    constraints: false,
  });

  };


  return Community;
};