const ROLE_HIERARCHY = {
  ADMIN: ["SMDL", "MDL", "DL", "USER"],
  SMDL:  ["MDL", "DL", "USER"],
  MDL:   ["DL", "USER"],
  DL:    ["USER"],
  USER:  []
};

/**
 * Middleware: only allow specific roles
 * Usage: require("./roleMiddleware")(["ADMIN", "SMDL"])
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required: ${roles.join(" or ")}` });
  }
  next();
};

/**
 * Check if actor can create a user with targetRole
 */
const canCreateRole = (actorRole, targetRole) => {
  return ROLE_HIERARCHY[actorRole]?.includes(targetRole) ?? false;
};

module.exports = { requireRole, canCreateRole, ROLE_HIERARCHY };
