const repo = require("./communityMembers.repository");

class CommunityMemberService {
  async add(communityId, body, authUserId) {
    console.log(communityId, body, authUserId);
    
    const exists = await repo.findMember(
      communityId,
      body.user_id
    );

    if (exists) {
      throw new Error("User already exists in this community.");
    }

    return await repo.create({
      community_id: communityId,
      user_id: body.user_id,
      role: body.role || "member",
      note: body.note,
      invited_by_user_id: authUserId,
    });
  }

  async remove(communityId, userId) {
    const exists = await repo.findMember(
      communityId,
      userId
    );

    if (!exists) {
      throw new Error("Member not found.");
    }

    await repo.remove(communityId, userId);

    return true;
  }

  async members(communityId) {
    return await repo.getMembers(communityId);
  }

  async nonMembers(communityId, query) {
    return await repo.getNonMembers(
      communityId,
      query.search,
      query.page || 1
    );
  }
}

module.exports = new CommunityMemberService();