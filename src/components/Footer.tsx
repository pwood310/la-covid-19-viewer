import React from "react";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();
  console.log("year is ", year)
  return (
    <footer className="Footer">
      <p>
        Copyright ⓒ {year} Peter Wood - Many Lakes Software, Contact:
        <a href="mailto:info@manylakes.io">info@manylakes.io</a>, Data
        from the&nbsp;
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/datadesk/california-coronavirus-data"
        >
          LA Times
        </a>
      </p>
    </footer>
  );
}

export default Footer;
