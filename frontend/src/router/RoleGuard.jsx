const RoleGuard=({ user, allowedRoles, children })=> {
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}

export default RoleGuard