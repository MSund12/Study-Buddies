export const paginateResults = (model) => async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  try {
    // Add query filters from request
    const query = { ...req.query };
    delete query.page;
    delete query.limit;

    const total = await model.countDocuments(query); // Fixed
    const results = await model.find(query).skip(startIndex).limit(limit);

    res.paginatedResults = {
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
