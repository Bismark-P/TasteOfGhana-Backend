export const getDashboard = async (req, res) => {
  const { role } = req.user;

  switch (role) {
    case 'admin':
      return res.json({ summary: "Admin dashboard summary data" });

    case 'vendor':
      return res.json({ summary: "Vendor dashboard with product stats" });

    case 'customer':
      return res.json({ summary: "Customer dashboard with order history" });

    default:
      return res.status(403).json({ message: "Access denied" });
  }
};
