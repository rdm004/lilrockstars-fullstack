import React from "react";
import Layout from "../components/Layout";

export default function Privacy() {
    return (
        <Layout title="Privacy Policy">
            <section>
                <h1>Privacy Policy</h1>

                <p>
                    Lil Rockstars Racing respects your privacy and is committed to
                    protecting the personal information you provide to us.
                </p>

                <h2>Information We Collect</h2>
                <ul>
                    <li>Parent/guardian contact information</li>
                    <li>Racer registration details (name, age, division)</li>
                    <li>Login credentials and account information</li>
                </ul>

                <h2>How We Use Information</h2>
                <ul>
                    <li>To manage race registrations and events</li>
                    <li>To communicate important updates</li>
                    <li>To improve our services and website functionality</li>
                </ul>

                <h2>Children’s Privacy</h2>
                <p>
                    We collect information about minors only with the consent of a parent
                    or legal guardian, solely for participation in Lil Rockstars Racing
                    events.
                </p>

                <h2>Data Security</h2>
                <p>
                    We implement reasonable security measures to protect personal
                    information. However, no method of transmission over the internet is
                    100% secure.
                </p>

                <h2>Contact</h2>
                <p>
                    If you have questions about this Privacy Policy, please contact us at:
                </p>

                <p>
                    <strong>Email:</strong> support@lilrockstarsracing.com
                </p>
            </section>
        </Layout>
    );
}