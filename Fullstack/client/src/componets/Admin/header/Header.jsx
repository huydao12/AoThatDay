import React, { memo } from "react";
import "./Header.scss";
import { useSelector } from "react-redux";
import { FaRegUser } from "react-icons/fa";
import Logo from "../../../styles/image/Logo.png";
import withBase from "../../../hocs/withBase";
function Header({ navigate }) {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="header-ad">
      <div
        className="header-ad--left"
        onClick={() => {
          navigate("/");
        }}
      >
       
        <img src={Logo} className="right--image" alt="" />
      </div>
      <div className="header-ad--right">
        <div className="header-ad--right--image">
          <FaRegUser size={20} />
        </div>
        <p>{user?.name}</p>
      </div>
    </div>
  );
}

export default withBase(memo(Header));
