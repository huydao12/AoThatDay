import React, { useEffect, useState } from "react";
import "./Dashbord.scss";
import { getOrders } from "../../../api/order";
import PeiChard from "./Chart/PeiChard";
// import BarChartNoPadding from "./Chart/BarChartNoPadding";
import { formatNumber, totalPrice } from "../../../helper/format";
import { formatBarChartNoPadding } from "../../../helper/formatChart";

function Dashboard() {
  const [data, setData] = useState([]);
  const [ setBarChartData] = useState([]);
  const fetchData = async () => {
    try {
      const res = await getOrders();
      if (res.success) {
        if (res.success) {
          const processedData = res.response.map((item) => ({
            id: item._id, // Lấy ID của đơn hàng
            name: item.user?.name || "N/A", // Tên người dùng, fallback nếu không tồn tại
            phone: item.user?.phone || "N/A", // Số điện thoại
            address: item.user?.address || "N/A", // Địa chỉ
            price: item.totalPrice || 0, // Tổng giá trị đơn hàng
            payments: item.payments || "N/A", // Phương thức thanh toán
            status: item.status || "N/A", // Trạng thái đơn hàng
            product: item.products || [], // Danh sách sản phẩm
          }));
          setData(processedData);

          const barData = formatBarChartNoPadding(processedData);
          setBarChartData(barData);
        }
      }
    } catch (e) {}
  };
  const total = totalPrice(data);

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="dashbord">
      <div className="dashbord--first">
        <div className="dashbord--first--total">
          <h3>Tổng danh thu</h3>
          <h3>{formatNumber(total)}</h3>
        </div>
      </div>
      <div style={{ width: "400px", height: "400px" }}>
        <PeiChard name="Biểu đồ trạng thái đơn hàng" data={data} />
      </div>
      {/* <div style={{ width: "400px", height: "400px" }}>
        <BarChartNoPadding
          name="Biểu đồ thống kê danh thu các tuần trong tháng"
          data={barChartData}   
        />
      </div> */}
    </div>
  );
}

export default Dashboard;
