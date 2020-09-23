import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="App-footer">
      <p>
        Copyright ⓒ {year} Peter Wood, Many Lakes Software, Raw data from the &nbsp; 
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/datadesk/california-coronavirus-data">
           LA Times
        </a>
      </p>
    </footer>
  );
}

export default Footer;
