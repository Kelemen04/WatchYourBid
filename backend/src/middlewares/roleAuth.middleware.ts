import type { Request, Response, NextFunction } from "express"

const RoleLevels: Record<string, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function verifyRoles(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    console.log(user)

    if (!user || !user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userLevel = RoleLevels[user.role];
    const requiredLevel = RoleLevels[requiredRole];

    if (userLevel === undefined || requiredLevel === undefined) {
      return res.status(500).json({ message: "Role configuration error" });
    }

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: "You don't have permission to execute this task." 
      });
    }

    next();
  };
}