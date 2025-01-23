import Fundo from "./fundo.jpg";


const Background = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${Fundo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      
    </div>
  );
};

export default Background;
