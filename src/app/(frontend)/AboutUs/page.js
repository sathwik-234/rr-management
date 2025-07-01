"use client";
import React from "react";
import "./AboutUs.css"
import { BsPeopleFill } from "react-icons/bs";
import { FcAbout } from "react-icons/fc";

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-content">
        <section className="mission-section">
          <h2 ><FcAbout style={{marginRight : "15px"}}></FcAbout>About This Application</h2>
          <p>
          Welcome to the Room Booking Platform for Running Rooms, developed by the East Coast Railway, Waltair Division. This platform is designed to simplify the booking process and provide a seamless, efficient accommodation experience for crew members and other users.  

Equipped with advanced features for real-time bed availability monitoring, the system significantly reduces waiting times, ensuring timely rest for crew members. By replacing manual calculations, it automates key metrics such as crew counts by headquarters, running room rest durations, meal consumption, bedsheet and blanket usage, peak occupancy, and more, enhancing overall efficiency and convenience.
          </p>
        </section>

        {/* <section className="team-section">
          <h2>--- Gumpina Pradeep Kumar & Gumpina Sai Sathwik</h2>
        </section> */}

        {/* <section className="team-section">
        <h2>
          <BsPeopleFill style={{ marginRight: '15px' }} />
          Meet Our Department
        </h2>

          <div className="team-grid"> */}
          {/* <div className="team-member">
              <img
                src="/DRM.jpg"
                alt="DRM"
                className="team-photo"
              />
              <h3>Lalit Bohra</h3>
              <p>DRM</p>
            </div> */}
            {/* <div className="team-member">
              <img
                src="/ADRM.jpg"
                alt="ADRM"
                className="team-photo"
              />
              <h3>Manoj Kumar Sahoo</h3>
              {/* <p>ADRM(OP)</p> */}
              {/* <p>DRM</p>
            </div>
            <div className="team-member">
              <img
                src="/SrDEE(OP).jpg"
                alt="Sr.DEE(OP)"
                className="team-photo"
              />
              <h3>Siva Naresh Parvatham</h3>
              <p>Sr.DEE(OP)</p>
            </div>
            <div className="team-member">
              <img
                src="/DEE(OP).jpg"
                alt="DEE(OP)"
                className="team-photo"
              />
              <h3>Sanchay    Adari</h3>
              <p>DEE(OP)</p>
            </div>
            <div className="team-member">
              <img
                src="/ADEE(OP).jpg"
                alt="ADEE(OP)"
                className="team-photo"
              />
              <h3>S. Baliyar Singh</h3>
              <p>ADEE(OP)</p>
            </div>
          </div> */} 
        {/* </section> */}
      </div>
    </div>
  );
}

export default AboutUs;
