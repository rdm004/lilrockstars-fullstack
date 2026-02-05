import React from "react";
import "../styles/About.css";

const About = () => {
    return (
        <div className="about-container">
            {/* === INTRO === */}
            <section className="about-section">
                <h2>Lil Rockstars History</h2>
                <p>
                    Founded in 2023, the <em>Lil Rockstars Juicebox / Snackpack Series</em> began as part of
                    the original Juicebox division in Florida before establishing its roots in Fayetteville, NC.
                </p>
                <p>
                    Our journey began with just 25 drivers at our first race. Today, we are proud to have
                    grown to a roster of over 85 racers, ranging in ages from 3 to 7!
                </p>
                <p>
                    Our series is about more than just racing. We emphasize the belief that{" "}
                    <strong>“God is #1”</strong>, no matter where we finish on the track. We also value
                    family and friendships, celebrating every victory—big or small. And of course, we all strive for the big prize 🏆!
                </p>
                <p>
                    <strong>Our mission:</strong> <em>Build Champions One Lap at a Time!</em>
                </p>
            </section>

            {/* === ELIGIBILITY === */}
            <section className="about-section">
                <h2>Eligibility & Divisions</h2>
                <p>
                    We are an independent series inspired by the original Juicebox Division. While we share a
                    common goal, some rules may differ as we are two separate groups.
                </p>
                <ul>
                    <li>👶 <strong>Age Requirement:</strong> 7 and under (as of January 1, 2025)</li>
                    <li>🚗 <strong>Ages 3–5:</strong> Radio Flyer Ultimate Go-Kart (24V only)</li>
                    <li>🏎️ <strong>Ages 6–7:</strong> “Snack Pack” Radio Flyer Extreme Drift Go-Kart (36V only)</li>
                    <li>🏎️ <strong>Ages 7–9:</strong> “Lil Stingers” 50cc Comer 2-cycle engine</li>
                </ul>
                <p className="note">
                    <em>Note:</em> The “Snack Pack” division is exclusive to the Rockstars Series and is not recognized
                    by the Juicebox Division for events outside our series.
                </p>
                <p>
                    <strong>Driver Age Policy:</strong> A driver’s age as of January 1, 2025 determines their division for the entire year.
                </p>
                <p>
                    Example: If your child is 4 years old as of January 1, 2025, they will remain in the 4 year old
                    division for the full season. Changing divisions mid-season will impact points standings.
                </p>
            </section>

            {/* === TECH & EQUIPMENT RULES (FULL WIDTH) === */}
            <section className="about-section">
                <h2>Tech & Equipment Rules</h2>
                <p className="warning">🚨 NO MODIFICATIONS! 🚨</p>
                <p>
                    Must use original equipment from the manufacturer! (This rule applies to
                    performance-related components. Modifications such as custom bodies, body bracing,
                    fairings, steering wheels, or decals are allowed.)
                </p>

                <div className="rules-grid">
                    <div>
                        <h3>✅ Allowed Modifications</h3>
                        <ul>
                            <li>Grip tape</li>
                            <li>Velcro</li>
                            <li>Pedal extenders</li>
                        </ul>
                    </div>
                    <div>
                        <h3>🚫 Prohibited Modifications</h3>
                        <ul>
                            <li>Motors and drive gears: Must remain stock.</li>
                            <li>Batteries: Must match manufacturer voltage.</li>
                            <li>Plastic tires only: No rubber bands, bed liner spray, or traction aids.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* === SAFETY + RACE PROCEDURES === */}
            <section className="about-grid-section">
                <div className="grid-box">
                    <h2>Safety Requirements</h2>
                    <ul>
                        <li>🪖 Helmets: Required (bicycle helmets minimum standard).</li>
                        <li>👟 Footwear: Closed-toe shoes required at all times.</li>
                        <li>🏁 Racing suits: Optional but encouraged.</li>
                    </ul>
                </div>

                <div className="grid-box">
                    <h2>Race Procedures</h2>
                    <ul>
                        <li>Starting positions: Determined by a pill draw.</li>
                        <li>Ages 3–5: 7-wide start from a standing position.</li>
                        <li>
                            Ages 6–7 ("Snack Pack"): Rolling start, 2x2 formation. Shift to third gear on green flag.
                        </li>
                    </ul>
                </div>
            </section>

            {/* === REGISTRATION + PENALTIES === */}
            <section className="about-grid-section">
                <div className="grid-box">
                    <h2>Registration & Conduct</h2>
                    <p>
                        Pre-Registration: Event registration will have a cut-off time, announced with event details.
                    </p>
                    <p>
                        Please create an account on our site by clicking the 'Dashboard' link in the top right of your
                        screen. You can create and manage your racers there. If you are having issues with registering
                        your racer, please reach out to us by phone:{" "}
                        <a href="tel:9102371343">(910) 237-1343</a>.
                    </p>
                </div>

                <div className="grid-box">
                    <h2>Penalties & Disqualifications</h2>
                    <p>
                        <strong>Tech Inspection:</strong> Any driver who fails inspection will not receive awards
                        and must correct the issue before the next event.
                    </p>
                    <p>
                        <strong>Intentional cheating:</strong> Will result in immediate disqualification and
                        removal from the series.
                    </p>
                    <p className="warning">🚫 Cheating will NOT be tolerated! 🚫</p>
                    <p>
                        If you modify your child's kart for an unfair advantage, you are part of the problem — not the solution!
                    </p>
                </div>
            </section>

            {/* === LIL STINGERS RULES (2x2) === */}
            <section className="about-section">
                <h2>Lil Stingers Division Rules</h2>

                {/* ✅ This grid is ONLY for Stingers so it won’t break Tech Rules */}
                <div className="stingers-grid">
                    <div className="stingers-card">
                        <h3>👦 Driver Eligibility</h3>
                        <ul>
                            <li><b>Ages:</b> 7–9 (age determined as of January 1)</li>
                            <li>Designed for safe seat time and learning</li>
                            <li>Karts reach approx. <b>25–30 mph</b> — safety is the top priority</li>
                        </ul>
                    </div>

                    <div className="stingers-card">
                        <h3>🛠️ Kart & Engine Specs</h3>
                        <ul>
                            <li><b>Chassis:</b> Kid Kart chassis (Emmick, Top Kart, Birel)</li>
                            <li><b>Engine:</b> 50cc Comer (2-cycle only)</li>
                            <li><b>Gearing:</b> 10–89</li>
                            <li><b>Tires:</b> 4.5 × 5 inch (any tire)</li>
                            <li><b>Weight:</b> 150 lb combined kart + driver</li>
                        </ul>
                    </div>

                    <div className="stingers-card">
                        <h3>🧤 Required Safety Gear</h3>
                        <ul>
                            <li><b>Raceceiver</b> (one-way radio receiver required)</li>
                            <li><b>Full-face helmet</b></li>
                            <li><b>Neck brace</b></li>
                            <li><b>Closed-toe shoes</b> (required)</li>
                            <li><b>Clothing:</b> Blue jeans + jacket minimum</li>
                            <li><b>Preferred:</b> Racing jacket or full suit</li>
                        </ul>
                    </div>

                    <div className="stingers-card">
                        <h3>🏁 Race Procedures</h3>
                        <ul>
                            <li><b>First 4 points races:</b> seat time learning only</li>
                            <li><b>Format:</b> three (3) 10-lap practice sessions</li>
                            <li>No staging: return to trailers after sessions</li>
                            <li>Must be lined up on time for your section (check running order)</li>
                            <li>Drivers must understand flagman signals</li>
                            <li>Enter/exit track safely and <b>roll across scales</b> when instructed</li>
                        </ul>
                    </div>
                </div>

                <p className="note">
                    <em>Note:</em> “Raceceiver” is a small one-way radio receiver so track staff can communicate with drivers safely.
                </p>
            </section>
        </div>
    );
};

export default About;