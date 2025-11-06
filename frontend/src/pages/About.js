import React from "react";
import "../styles/About.css";

const About = () => {
    return (
        <div className="about-container">
            {/* === HERO BANNER === */}
            {/*<div className="about-hero">*/}
            {/*    <div className="about-hero-overlay">*/}
            {/*        <h1>About Lil Rockstars Racing</h1>*/}
            {/*        <p>Building Champions One Lap at a Time 🏆</p>*/}
            {/*    </div>*/}
            {/*</div>*/}

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
                    family and friendships, celebrating every victory—big or small. And of course, we all strive for the big prize 🏆!<br />
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
                </ul>
                <p className="note">
                    <em>Note:</em> The “Snack Pack” division is exclusive to the Rockstars Series and is not recognized by the Juicebox Division for events outside our series.
                </p>
                <p>
                    <strong>Driver Age Policy:</strong> A driver’s age as of January 1, 2025 determines their division for the entire year.
                </p>
                <p>
                    Example: If your child is 4 years old as of January 1, 2025, they will remain in the 3–5
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
                        If you do not have Facebook, you may register at the event or by phone:{" "}
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
        </div>
    );
};

export default About;