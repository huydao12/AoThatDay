import React, { memo, useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import Tabble from "../../common/Tabble/Tabble";
import LoadingItem from "../../Loading/LoadingItem";
import { deleteOrder, getOrders, updateStatusOrder } from "../../../api/order";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { formatNumber } from "../../../helper/format";
import { fetchProduct } from "../../../redux/slice/productSlice";
import withBase from "../../../hocs/withBase";
import socketIOClient from "socket.io-client";

function AdminOrder({ dispatch }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ENDPOINT = "http://localhost:8000";
  const socketIo = socketIOClient(ENDPOINT, {
    transport: ["websocket"],
    withCredentials: true,
  });

  const fetchData = async () => {
    try {
      const res = await getOrders();
      if (res.success) {
        const processedData = res.response.map((item) => ({
          id: item._id,
          name: item.user?.name || "N/A",
          phone: item.user?.phone || "N/A",
          address: item.user?.address || "N/A",
          price: item.totalPrice || 0,
          payments: item.payments || "N/A",
          status: item.status || "N/A",
          product: item.products || [],
        }));

        setData(processedData);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Phone",
      accessor: "phone",
    },
    {
      Header: "Address",
      accessor: "address",
    },
    {
      Header: "Product",
      accessor: "product",
      Cell: ({ value }) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {value?.map((product, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={product?.product?.image?.[0]?.url || ""}
                  alt="product"
                  style={{ width: "50px", height: "50px", marginRight: "8px" }}
                />
                <div>
                  <p style={{ padding: "0", margin: "0" }}>
                    {product?.product?.name || "N/A"}
                  </p>
                  <p style={{ padding: "0", margin: "0" }}>
                    Quantity: {product?.quantity || 0}
                  </p>
                  <p style={{ padding: "0", margin: "0" }}>
                    Color: {product?.color || "N/A"}
                  </p>
                </div>
              </div>
              <br />
            </div>
          )) || <p>No products</p>}
        </div>
      ),
    },
    {
      Header: "Price",
      accessor: "price",
      Cell: ({ value }) => <p>{formatNumber(value)}</p>,
    },
    {
      Header: "Payment",
      accessor: "payments",
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row }) => {
        // Kiểm tra trạng thái bị khóa
        const isLocked = ["Đã nhận hàng", "Bom hàng"].includes(row.values.status);

        return (
          <div>
            {isLocked ? (
              // Hiển thị trạng thái dạng văn bản khi bị khóa
              <span>{row.values.status}</span>
            ) : (
              <select
                defaultValue={row.values?.status}
                onChange={(e) => handleStatusChange(e, row.values)}
              >
                <option>{row.values.status}</option>
                {row.values.status === "Chờ xử lý" && (
                  <option value="Đã chuyển hàng">Đã chuyển hàng</option>
                )}
                {row.values.status === "Đã chuyển hàng" && (
                  <>
                    <option value="Bom hàng">Bom hàng</option>
                    <option value="Đã nhận hàng">Đã nhận hàng</option>
                  </>
                )}
              </select>
            )}
          </div>
        );
      },
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex" }}>
          <span
            onClick={() => handleDelete(row)}
            style={{
              padding: "8px",
              border: "1px black solid",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              marginRight: "2px",
              color: "red",
              cursor: "pointer",
            }}
          >
            <AiOutlineDelete />
          </span>
        </div>
      ),
    },
  ];

  const handleStatusChange = async (e, values) => {
    const value = e.target.value;
    const { id, status } = values;

    // Không cho phép thay đổi trạng thái nếu đã là "Đã nhận hàng" hoặc "Bom hàng"
    if (["Đã nhận hàng", "Bom hàng"].includes(status)) {
      toast.warning("Trạng thái này không thể thay đổi!");
      return;
    }

    if (value === "Bom hàng") {
      const confirmResult = await Swal.fire({
        title: "Xác nhận bom hàng",
        text: "Bạn có chắc chắn muốn chuyển trạng thái sang Bom hàng?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (!confirmResult.isConfirmed) {
        e.target.value = values.status;
        return;
      }
    }

    if (value === "Đã nhận hàng") {
      const confirmResult = await Swal.fire({
        title: "Xác nhận đã nhận hàng",
        text: "Bạn có chắc chắn đơn hàng này đã được giao thành công?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      });

      if (!confirmResult.isConfirmed) {
        e.target.value = values.status;
        return;
      }
    }

    try {
      setLoading(true);
      const res = await updateStatusOrder(id, { status: value });
      setLoading(false);
      if (res?.success) {
        toast.success("Cập nhật trạng thái thành công");
        socketIo.emit("addproduct", id);
        fetchData();
        dispatch(fetchProduct());
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  const handleDelete = async (data) => {
    try {
      const { id } = data.values;
      if (
        data?.values?.payments === "online" &&
        data?.values?.status === "Chờ xử lý"
      )
        return toast.warning("Bạn không thể xóa đơn hàng này");

      Swal.fire({
        title: "Bạn có muốn xóa đơn hàng này?",
        showCancelButton: true,
        confirmButtonText: "Xóa",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const res = await deleteOrder(id);
          setLoading(false);
          if (res?.success) {
            toast.success(res?.mes);
            fetchData();
            Swal.fire("Đã xóa!", "", "Thành công");
          }
        }
      });
    } catch (e) {}
  };

  return (
    <div>
      <LoadingItem isLoading={loading}>
        <div className="product-admin">
          <div style={{ height: "90vh", overflowY: "scroll" }}>
            <Tabble title="Sản phẩm" data={data || []} columns={columns} />
          </div>
        </div>
      </LoadingItem>
    </div>
  );
}

export default withBase(memo(AdminOrder));
