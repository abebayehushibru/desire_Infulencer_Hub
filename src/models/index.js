const { sequelize } = require("../config/database");

const models = {};

// Import Models
const User = require("./User");
const Session = require("./Session");
const Document = require("./Document");
const BusinessProfile = require("./BusinessProfile");
const InfluencerProfile = require("./InfluencerProfile");
const InfluencerAudienceLocation = require("./InfluencerAudienceLocation");
const Campaign = require("./Campiagn");
const CommunityMember = require("./CommunityMember");
const Community = require("./Community");
const CampaignClaim = require("./CampaignClaim");

const Chat = require("./Chat");
const Message = require("./Message");


// Initialize Models

models.User = User(sequelize);

models.Session = Session(sequelize);

models.Document = Document(sequelize);

models.BusinessProfile = BusinessProfile(sequelize);

models.InfluencerProfile = InfluencerProfile(sequelize);

models.InfluencerAudienceLocation = InfluencerAudienceLocation(sequelize);


models.Campaign = Campaign(sequelize);


models.Community = Community(sequelize);
models.CommunityMember = CommunityMember(sequelize);
models.CampaignClaim = CampaignClaim(sequelize);

models.Chat = Chat(sequelize);
models.Message = Message(sequelize);

// Add Sequelize Instance

models.sequelize = sequelize;


// Create Associations

Object.keys(models).forEach((modelName) => {

  if (
    models[modelName].associate &&
    typeof models[modelName].associate === "function"
  ) {

    models[modelName].associate(models);

  }

});


module.exports = models;