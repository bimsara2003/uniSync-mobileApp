const Portfolio = require("../../models/portfolioModel");
const PortfolioItem = require("../../models/portfolioItemModel");
const User = require("../../models/userModel");
const { createS3Uploader, getPresignedUrl } = require("../../utils/s3Upload");
const { deleteFromS3 } = require("../../utils/s3Delete");

const getPresignedImageUrl = async (url) => {
  if (!url) return url;
  try {
    const key = new URL(url).pathname.slice(1);
    return await getPresignedUrl(key, 3600);
  } catch (e) {
    return url;
  }
};

const withPresignedPortfolioUrls = async (data) => {
  if (!data) return null;
  const p = data.portfolio
    ? data.portfolio.toObject
      ? data.portfolio.toObject()
      : { ...data.portfolio }
    : { ...data };

  if (p.userId && p.userId.profilePictureUrl) {
    p.userId.profilePictureUrl = await getPresignedImageUrl(
      p.userId.profilePictureUrl,
    );
  }

  let items = data.items || [];
  if (items.length) {
    items = await Promise.all(
      items.map(async (item) => {
        const itemObj = item.toObject ? item.toObject() : { ...item };
        if (itemObj.imageUrl) {
          itemObj.imageUrl = await getPresignedImageUrl(itemObj.imageUrl);
        }
        return itemObj;
      }),
    );
  }
  return { portfolio: p, items };
};

// Multer middleware for portfolio item image uploads (5 MB)
const uploadPortfolioImage = createS3Uploader({
  keyPrefix: "portfolio",
  allowedTypes: /jpeg|jpg|png|webp/,
  maxSizeMB: 5,
  fieldName: "image",
});

// ─── PORTFOLIO PROFILE ──────────────────────────────────

// GET /api/portfolio/me
// Returns the logged-in student's portfolio (creates one if missing)
const getMyPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id }).populate(
      "userId",
      "firstName lastName profilePictureUrl",
    );

    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id });
      portfolio = await Portfolio.findById(portfolio._id).populate(
        "userId",
        "firstName lastName profilePictureUrl",
      );
    }

    const items = await PortfolioItem.find({
      portfolioId: portfolio._id,
      isVisible: true,
    }).sort({ createdAt: -1 });

    const result = await withPresignedPortfolioUrls({ portfolio, items });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/portfolio/user/:userId
// Returns another student's public portfolio
const getPortfolioByUserId = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      userId: req.params.userId,
    }).populate("userId", "firstName lastName profilePictureUrl");

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    if (!portfolio.isPublic) {
      return res.status(403).json({ message: "This portfolio is private" });
    }

    const items = await PortfolioItem.find({
      portfolioId: portfolio._id,
      isVisible: true,
    }).sort({ createdAt: -1 });

    const result = await withPresignedPortfolioUrls({ portfolio, items });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/portfolio/me
// Update the logged-in student's portfolio profile
const updateMyPortfolio = async (req, res) => {
  try {
    const { headline, bio, skills, linkedIn, gitHub, website, isPublic } =
      req.body;

    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id });
    }

    if (headline !== undefined) portfolio.headline = headline;
    if (bio !== undefined) portfolio.bio = bio;
    if (skills !== undefined) {
      portfolio.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
    if (linkedIn !== undefined) portfolio.linkedIn = linkedIn;
    if (gitHub !== undefined) portfolio.gitHub = gitHub;
    if (website !== undefined) portfolio.website = website;
    if (isPublic !== undefined) portfolio.isPublic = isPublic;

    await portfolio.save();

    // Update user profile picture if uploaded
    if (req.file) {
      // Delete old profile picture from S3 if exists
      if (req.user.profilePictureS3Key) {
        await deleteFromS3(req.user.profilePictureS3Key);
      }

      // Update user document
      const user = await User.findById(req.user._id);
      user.profilePictureUrl = req.file.location;
      user.profilePictureS3Key = req.file.key;
      await user.save();
    }

    res.status(200).json({ message: "Portfolio updated", portfolio });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PORTFOLIO ITEMS ─────────────────────────────────────

// POST /api/portfolio/items
// Add a new item to the student's portfolio (with optional image upload)
const createPortfolioItem = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id });
    }

    const {
      type,
      title,
      description,
      organization,
      startDate,
      endDate,
      isOngoing,
      tags,
      githubLink,
      liveLink,
    } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: "Type and title are required" });
    }

    const itemData = {
      userId: req.user._id,
      portfolioId: portfolio._id,
      type,
      title,
      description,
      organization,
      startDate: startDate || null,
      endDate: endDate || null,
      isOngoing: isOngoing === "true" || isOngoing === true,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      githubLink,
      liveLink,
    };

    if (req.file) {
      itemData.imageUrl = req.file.location;
      itemData.s3Key = req.file.key;
    }

    let item = await PortfolioItem.create(itemData);

    // Get presigned URL for the res
    if (item.imageUrl) {
      item = item.toObject();
      item.imageUrl = await getPresignedImageUrl(item.imageUrl);
    }

    res.status(201).json({ message: "Portfolio item added", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/portfolio/items
// Get all portfolio items for the logged-in student
const getMyPortfolioItems = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      return res.status(200).json([]);
    }

    const filter = { portfolioId: portfolio._id };
    if (req.query.type) filter.type = req.query.type;

    let items = await PortfolioItem.find(filter).sort({ createdAt: -1 });

    items = await Promise.all(
      items.map(async (item) => {
        const itemObj = item.toObject();
        if (itemObj.imageUrl) {
          itemObj.imageUrl = await getPresignedImageUrl(itemObj.imageUrl);
        }
        return itemObj;
      }),
    );

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/portfolio/items/:id
// Get a single portfolio item by ID
const getPortfolioItemById = async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    const isOwner = item.userId.toString() === req.user._id.toString();

    if (!isOwner) {
      // Check if portfolio is public
      const portfolio = await Portfolio.findById(item.portfolioId);
      if (!portfolio || !portfolio.isPublic || !item.isVisible) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    let itemObj = item.toObject();
    if (itemObj.imageUrl) {
      itemObj.imageUrl = await getPresignedImageUrl(itemObj.imageUrl);
    }

    res.status(200).json(itemObj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/portfolio/items/:id
// Update a portfolio item (with optional new image upload)
const updatePortfolioItem = async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this item" });
    }

    const {
      type,
      title,
      description,
      organization,
      startDate,
      endDate,
      isOngoing,
      tags,
      githubLink,
      liveLink,
      isVisible,
    } = req.body;

    if (type) item.type = type;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (organization !== undefined) item.organization = organization;
    if (startDate !== undefined) item.startDate = startDate || null;
    if (endDate !== undefined) item.endDate = endDate || null;
    if (isOngoing !== undefined)
      item.isOngoing = isOngoing === "true" || isOngoing === true;
    if (tags !== undefined)
      item.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (githubLink !== undefined) item.githubLink = githubLink;
    if (liveLink !== undefined) item.liveLink = liveLink;
    if (isVisible !== undefined)
      item.isVisible = isVisible === "true" || isVisible === true;

    // Replace image if a new file was uploaded
    if (req.file) {
      if (item.s3Key) {
        await deleteFromS3(item.s3Key);
      }
      item.imageUrl = req.file.location;
      item.s3Key = req.file.key;
    }

    await item.save();

    let itemObj = item.toObject();
    if (itemObj.imageUrl) {
      itemObj.imageUrl = await getPresignedImageUrl(itemObj.imageUrl);
    }

    res.status(200).json({ message: "Portfolio item updated", item: itemObj });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/portfolio/items/:id
// Delete a portfolio item (also removes image from S3 if exists)
const deletePortfolioItem = async (req, res) => {
  try {
    const item = await PortfolioItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this item" });
    }

    if (item.s3Key) {
      await deleteFromS3(item.s3Key);
    }

    await item.deleteOne();

    res.status(200).json({ message: "Portfolio item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadPortfolioImage,
  getMyPortfolio,
  getPortfolioByUserId,
  updateMyPortfolio,
  createPortfolioItem,
  getMyPortfolioItems,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
};
