import React, { useEffect, useState } from "react";
import "./Order.scss";
import { cancleOrderUser, getOrderUser } from "../../api/order";
import { useSelector } from "react-redux";
import { formatNumber } from "../../helper/format";
import { toast } from "react-toastify";
function Order() {
  const { user } = useSelector((state) => state.user);
  const [dataOrder, setDataOrder] = useState([]);
  const fetchDataOrder = async () => {
    try {
      const res = await getOrderUser(user._id);
      if (res.success) {
        setDataOrder(res.response);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleCancleOrder = async (data) => {
    try {
      const res = await cancleOrderUser(data._id);
      if (res.success) {
        toast.success("Hủy đơn hàng thành công");
        fetchDataOrder();
      }
    } catch (error) {
      console.error("Error occurred while canceling order:", error);
    }
  };

  useEffect(() => {
    fetchDataOrder();
  }, [user]);
  return (
    <div className="order">
      <div className="content">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Màu</th>
              <th>Số lượng</th>
              <th>Trạng thái thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {dataOrder?.map((el, index) => (
              el?.products.map((item, productIndex) => (
                <tr key={`${el._id}-${productIndex}`}>
                  <td>{index + 1}</td>
                  <td>
                    <img src={item?.product?.image[0]?.url} alt="Sản phẩm" />
                  </td>
                  <td>{item.color}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {el?.payments === "cod" && el?.status !== "Đã giao"
                      ? "Chưa thanh toán"
                      : "Đã thanh toán"}
                  </td>
                  <td>{formatNumber(el?.totalPrice)}</td>
                  <td>
                    {el?.status}
                    {el?.status === "Chờ xử lý" &&
                      el?.payments !== "online" && (
                        <button
                          onClick={() => handleCancleOrder(el)}
                          className="btn"
                        >
                          Hủy
                        </button>
                      )}
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Order;
