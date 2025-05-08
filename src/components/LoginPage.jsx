import LoginForm from "./LoginForm";
import GradientText from "./GradientText";

function LoginPage() {
  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div className="form-container">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={6}
          showBorder={true}
          className="hero-text text-center mb-5 px-4"
        >
          Login
        </GradientText>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
