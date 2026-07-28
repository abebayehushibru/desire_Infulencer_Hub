const service = require("./communityMember.service");

exports.add = async (req, res) => {
  try {
    const data = await service.add(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      message: "Member added successfully.",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.members = async (req, res) => {
  try {
    console.log(req.params.id);
    
    const data = await service.members(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.nonMembers = async (req, res) => {
  try {
    const data = await service.nonMembers(
      req.params.id,
      req.query
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.remove(
      req.params.id,
      req.params.userId
    );

    res.json({
      success: true,
      message: "Member removed successfully.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};