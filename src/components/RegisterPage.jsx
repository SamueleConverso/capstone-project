import RegisterForm from "./RegisterForm";
import GradientText from "./GradientText";

function RegisterPage() {
  return (
    <div>
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={6}
        showBorder={true}
        className="hero-text text-center mb-5 px-4"
      >
        Registrati
      </GradientText>
      <div className="d-flex justify-content-center">
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;
