import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #F46600; /* Blue */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  z-index: 1000;
`;

export default LoadingSpinner