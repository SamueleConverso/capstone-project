import React from "react";
import styled from "styled-components";

const CoolInput = (props) => {
  return (
    <StyledWrapper width={props.width} height={props.height}>
      <div className="inputBox">
        <input
          required
          type="text"
          value={props.value}
          onChange={props.onChange}
        />
        <span>{props.text}</span>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .inputBox {
    position: relative;
    //height: 44px;
  }

  .inputBox input {
    width: ${(props) => (props.width ? `${props.width}` : "fit-content")};
    height: ${(props) => (props.height ? `${props.height}` : "fit-content")};
    padding: 15px 20px;
    outline: none;
    background: #212121;
    border-radius: 10px;
    color: #fff;
    border: 2px solid #7e188d;
    font-size: 1em;
  }

  .inputBox span {
    position: absolute;
    left: 0;
    padding: 15px 20px;
    pointer-events: none;
    font-size: 1em;
    transition: 0.4s cubic-bezier(0.05, 0.81, 0, 0.93);
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.1em;
  }

  .inputBox input:focus ~ span,
  .inputBox input:valid ~ span {
    font-size: 0.7em;
    transform: translateX(14px) translateY(-7.5px);
    padding: 0 5px;
    border-radius: 10px;
    background: #212121;
    letter-spacing: 0em;
    border: 2px solid #05bdc2;
  }
`;

export default CoolInput;
