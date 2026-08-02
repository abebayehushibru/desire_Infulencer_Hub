const repo = require("./dashboard.repository");

exports.getDashboard = async ({ userId, role }) => {
  switch (role) {
    case "super_admin":
    case "admin":
      return repo.getAdminDashboard();

    case "business":
      return repo.getBusinessDashboard(userId);

    case "agent":
      return repo.getAgentDashboard(userId);

    case "influencer":
      return repo.getInfluencerDashboard(userId);

    default:
      throw new Error("Invalid role");
  }
};