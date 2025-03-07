export const validateDomain = (req, res, next) => {
  const { email } = req.body;
  if (!email.endsWith("@yorku.ca")) {
    return res.status(400).json({ message: "Only @yorku.ca emails allowed" });
  }
  next();
};
