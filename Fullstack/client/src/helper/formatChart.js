import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
export const formatPie = (data) => {
  const statusCounts = data.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return pieChartData;
};

export const formatBarChartNoPadding = (data) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const weekRevenues = {};
  let weekNumber = 1;

  data.forEach((el) => {
    const paidDate = new Date(el.createdAt);

    // Chỉ xử lý đơn hàng "Đã giao" trong tháng hiện tại
    if (
      el.status === "Đã giao" &&
      paidDate >= monthStart &&
      paidDate <= monthEnd
    ) {
      const weekStart = startOfWeek(paidDate);
      const weekEnd = endOfWeek(paidDate);
      const weekKey = weekStart.getTime(); // Dùng timestamp để làm khóa

      if (!weekRevenues[weekKey]) {
        weekRevenues[weekKey] = {
          name: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`,
          revenue: +el.price || 0, // Đảm bảo price là số hợp lệ
          weekNumber: weekNumber,
        };
        weekNumber++;
      } else {
        weekRevenues[weekKey].revenue += Number(el.price) || 0; // Cộng doanh thu nếu đã có tuần
      }
    }
  });

  // Sắp xếp các tuần theo thời gian
  const sortedWeeklyRevenues = Object.values(weekRevenues).sort(
    (a, b) => a.weekNumber - b.weekNumber
  );

  return sortedWeeklyRevenues;
};
