import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as Icon from "react-bootstrap-icons";

const UserDropdownMenu = () => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch({ type: "LOGOUT", payload: true });
    dispatch({ type: "LOGIN_SUCCESS", payload: false });
  };

  return (
    <StyledWrapper>
      <div className="card">
        <ul className="list">
          <li className="element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={25}
              height={25}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7e8590"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-pencil"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
            <p className="label">Modifica</p>
          </li>
        </ul>

        <ul className="list">
          <li
            onClick={() => {
              handleLogout();
            }}
            className="element"
          >
            <Icon.BoxArrowLeft />
            <p className="label">Logout</p>
          </li>
        </ul>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 180px;
    /* background-color: rgba(36, 40, 50, 1);
  background-image: linear-gradient(135deg, rgba(36, 40, 50, 1) 0%, rgba(36, 40, 50, 1) 40%, rgba(37, 28, 40, 1) 100%); */

    background-color: rgba(36, 40, 50, 1);
    background-image: linear-gradient(
      139deg,
      rgba(36, 40, 50, 1) 0%,
      rgba(36, 40, 50, 1) 0%,
      rgba(37, 28, 40, 1) 100%
    );

    border-radius: 10px;
    padding: 15px 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card .separator {
    border-top: 1.5px solid #42434a;
  }

  .card .list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0px 10px;
  }

  .card .list .element {
    display: flex;
    align-items: center;
    color: #7e8590;
    gap: 10px;
    transition: all 0.3s ease-out;
    padding: 4px 7px;
    border-radius: 6px;
    cursor: pointer;
  }

  .card .list .element svg {
    width: 19px;
    height: 19px;
    transition: all 0.3s ease-out;
  }

  .card .list .element .label {
    font-weight: 600;
  }

  .card .list .element:hover {
    background-color: #5353ff;
    color: #ffffff;
    transform: translate(1px, -1px);
  }
  .card .list .delete:hover {
    background-color: #8e2a2a;
  }

  .card .list .element:active {
    transform: scale(0.99);
  }

  .card .list:not(:last-child) .element:hover svg {
    stroke: #ffffff;
  }

  .card .list:last-child svg {
    stroke: #bd89ff;
  }
  .card .list:last-child .element {
    color: #bd89ff;
  }

  .card .list:last-child .element:hover {
    background-color: rgba(56, 45, 71, 0.836);
  }

  p {
    margin: 0px;
  }
`;

export default UserDropdownMenu;
