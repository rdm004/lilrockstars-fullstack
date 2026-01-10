import React from "react";
import "../styles/Contact.css";
import "../styles/Shared-Buttons.css"

const Contact = () => {
    return (
        <div className="contact-container">
            <h1>We’d Love to Hear From You!</h1>
            <p className="contact-intro">
                Have questions about our races, events, or want to join our series?
                Reach out to us through any of the options below — we’d love to connect!
            </p>

            <div className="contact-grid">
                {/* === LEFT CARD === */}
                <div className="contact-card">
                    <h2>General Inquiries</h2>
                    <p>
                        <strong>Email:</strong>{" "}
                        <a href="mailto:info@lilrockstarsracing.com">
                            info@lilrockstarsracing.com
                        </a>
                    </p>
                    <hr />
                    <p>
                        Want to reach out directly to the Lil Rockstars Series Promoter?
                        <br />
                        <br />
                        <strong>Email:</strong>{" "}
                        <a href="mailto:admin@lilrockstarsracing.com">
                            admin@lilrockstarsracing.com
                        </a>
                        <br />
                        <strong>Phone:</strong>{" "}
                        <a href="tel:9102371343">(910) 237-1343</a>
                    </p>
                    <hr />
                    <p>
                        If you’re having issues with our site, please contact our webmaster:
                        <br />
                        <br />
                        <strong>Email:</strong>{" "}
                        <a href="mailto:webmaster@lilrockstarsracing.com">
                            webmaster@lilrockstarsracing.com
                        </a>
                    </p>
                </div>

                {/* === RIGHT CARD === */}
                <div className="contact-card-social-card">
                    <h2>Stay Connected</h2>
                    <p>
                        For the latest updates, photos, and event information, follow us on Facebook!
                    </p>
                    <a
                        href="https://www.facebook.com/profile.php?id=100091910351052"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="facebook-button"
                    >
                        <div className="facebook-icon-container">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="facebook-icon"
                            >
                                <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.325v21.351C0 23.4.6 24
      1.325 24H12.82V14.706h-3.17v-3.622h3.17V8.413c0-3.13 1.91-4.832
      4.7-4.832 1.34 0 2.493.099 2.829.144v3.28l-1.942.001c-1.524
      0-1.819.724-1.819 1.787v2.344h3.637l-.474 3.622h-3.163V24h6.203
      C23.4 24 24 23.4 24 22.675V1.325C24 .6 23.4 0 22.675 0z" />
                            </svg>
                        </div>
                        Lil Rockstars
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contact;