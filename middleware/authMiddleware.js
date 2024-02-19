export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).redirect("/");
    // res.status(401).json({ error: "Unauthorized" });
  }
};
