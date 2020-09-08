import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="App-footer">
      <p>Copyright ⓒ {year} Peter Wood, Many Lakes Software</p>
    </footer>
  );
}

export default Footer;
