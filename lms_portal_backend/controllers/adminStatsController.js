const { User, Subscription, Course, Progress } = require('../models/associations');
const { Op } = require('sequelize');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();
    
    // Total students
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    // Total admins
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    
    // Active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });
    
    // Total courses
    const totalCourses = await Course.count();
    
    // Total lessons completed (for analytics)
    const totalCompletedLessons = await Progress.count({
      where: { completed: true }
    });
    
    // Revenue (sum of all subscriptions)
    const revenueResult = await Subscription.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']],
      where: { status: 'active' }
    });
    const totalRevenue = revenueResult[0].dataValues.totalRevenue || 0;
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          admins: totalAdmins
        },
        subscriptions: {
          active: activeSubscriptions
        },
        content: {
          courses: totalCourses,
          completedLessons: totalCompletedLessons
        },
        revenue: {
          total: totalRevenue,
          currency: 'INR'
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get revenue by month (for chart)
exports.getRevenueByMonth = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const subscriptions = await Subscription.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        createdAt: {
          [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`]
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']]
    });
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get revenue by month error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};