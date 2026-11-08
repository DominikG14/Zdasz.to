export const toUserView = user => ({ id: user.id, username: user.username, email: user.email, isAdmin: Boolean(user.is_admin) });
