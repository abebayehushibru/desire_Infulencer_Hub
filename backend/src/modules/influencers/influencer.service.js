const { sequelize } = require("../../models");
const repository = require("./influencer.repository");
const { hashPassword } = require("../../utils/hash");
const { generate6DigitPassword } = require("../../utils/helper");

exports.create = async (payload) => {
  const transaction = await sequelize.transaction();


  try {
    const {
      user,
      influencer_profile,
      influencer_audience_locations = [],
    } = payload;

    // ==========================
    // Email
    // ==========================

    const emailExists = await repository.findByEmail(user.email);

    if (emailExists) {
      throw new Error("Email already exists.", 409);
    }

    // ==========================
    // Phone 1
    // ==========================

    const phoneExists = await repository.findByPhone(user.phone);

    if (phoneExists) {
      throw new Error("Phone number already exists.", 409);
    }

    // ==========================
    // Phone 2
    // ==========================

    if (user.altPhone) {
      const phone2Exists = await repository.findByPhone2(user.altPhone);

      if (phone2Exists) {
        throw new Error("Secondary phone already exists.", 409);
      }
    }

    // ==========================
    // Profile Link
    // ==========================

    const linkExists = await repository.findByProfileLink(
      influencer_profile.profile_link
    );

    if (linkExists) {
      throw new Error("Profile link already exists.", 409);
    }

    // ==========================
    // Hash Password
    // ==========================
    const userPassword = await generate6DigitPassword();

    user.password = await hashPassword(userPassword);
    user.role = "influencer"
    user.phone2 = user.altPhone
    user.phone1 = user.phone
    user.name_or_company_name = user.fullName
    // ==========================
    // Create User
    // ==========================

    const createdUser = await repository.createUser(
      user,
      transaction
    );

    // ==========================
    // Create Profile
    // ==========================

    const createdProfile =
      await repository.createProfile(
        {
          ...influencer_profile,
          user_id: createdUser.id,
        },
        transaction
      );

    // ==========================
    // Audience Locations
    // ==========================

    if (influencer_audience_locations.length) {
      const audience =
        influencer_audience_locations.map((item) => ({
          ...item,
          influencer_profile_id: createdProfile.id,
        }));

      await repository.createAudienceLocations(
        audience,
        transaction
      );
    }

    // ==========================
    // Commit
    // ==========================

    await transaction.commit();

    return await repository.findById(createdProfile.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

exports.getAll = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;
  const result = await repository.findAll({ page, limit, offset, ...query });

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.ceil(result.count / limit),
    },
  };
}

exports.getById = async (id) => {
  const influencer = await repository.findById(id);


  if (!influencer) {
    throw new Error("Influencer not found.", 404);
  }

  return {
    data:influencer
  };
}
exports. update=async(id, body) =>{
  console.log(body);
  
    const transaction = await sequelize.transaction();

    try {
      const profile = await repository.findById(id);

      if (!profile) {
        throw new Error("Influencer profile not found.", 404);
      }

      // Check profile link uniqueness
      if (
        body.profile_link &&
        body.profile_link !== profile.profile_link
      ) {
        const existing = await repository.findByProfileLink(
          body.profile_link
        );

        if (existing && existing.id !== profile.id) {
          throw new Error(
            "Profile link already exists.",
            409
          );
        }
      }

      await repository.updateProfile(
        id,
        {
          main_platform: body.main_platform,
          profile_link: body.profile_link,
          followers_count: body.followers_count,
          level: body.level,
          bio: body.bio,
          address: body.address,
          languages: body.languages,
          is_verified:body.is_verified
        },
        transaction
      );

      await transaction.commit();

      return await repository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

exports. updateAudience=async(profileId, locations)=> {
    const transaction =
      await sequelize.transaction();

    try {
      const profile =
        await repository.findById(profileId);

      if (!profile) {
        throw new Error(
          "Influencer profile not found.",
          404
        );
      }

      if (!Array.isArray(locations)) {
        throw new Error(
          "Audience data must be an array.",
          400
        );
      }

      // const total = locations.reduce(
      //   (sum, item) =>
      //     sum + Number(item.audience_percentage || 0),
      //   0
      // );

      // if (total > 100) {
      //   throw new Error(
      //     "Audience percentage cannot exceed 100%.",
      //     400
      //   );
      // }

      // Remove old audience
      await repository.deleteAudience(
        profileId,
        transaction
      );

      // Insert new audience
      await repository.createAudience(
        profileId,
        locations,
        transaction
      );

      await transaction.commit();

      return await repository.findAudience(
        profileId
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

