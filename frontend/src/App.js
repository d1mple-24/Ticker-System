import React from "react";
import Home from "./Ticket Designs/Home";
import Trouble from "./Ticket Designs/Trouble";

const App = () => {
  const currentPath = window.location.pathname;

  return (
    <>
      {currentPath === "/" && <Home />}
      {currentPath === "/troubleshooting" && <Trouble />}
    </>
  );
};

export default App;
