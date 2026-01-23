import React from "react";
import Layout from "../components/Layout";

export default function Accessibility() {
    return (
        <Layout title="Accessibility Statement">
            <section>
                <h1>Accessibility Statement</h1>

                <p>
                    Lil Rockstars Racing is committed to ensuring digital accessibility for
                    people of all abilities. We are continually improving the user
                    experience for everyone and applying relevant accessibility standards.
                </p>

                <h2>Our Commitment</h2>
                <p>
                    We strive to conform to the Web Content Accessibility Guidelines (WCAG)
                    2.1, Level AA, and to provide an inclusive experience for all users,
                    including those who rely on assistive technologies such as screen
                    readers, keyboard navigation, and voice recognition software.
                </p>

                <h2>Accessibility Features</h2>
                <ul>
                    <li>Semantic HTML and ARIA landmarks</li>
                    <li>Keyboard-navigable menus and forms</li>
                    <li>Clear focus indicators</li>
                    <li>Readable color contrast</li>
                    <li>Descriptive labels and error messages</li>
                </ul>

                <h2>Ongoing Improvements</h2>
                <p>
                    Accessibility is an ongoing effort. We regularly review our site to
                    identify and fix accessibility barriers.
                </p>

                <h2>Need Assistance?</h2>
                <p>
                    If you experience difficulty accessing any part of this website, or
                    have suggestions for improvement, please contact us and we will work
                    with you to provide the information you need.
                </p>

                <p>
                    <strong>Email:</strong> webmaster@lilrockstarsracing.com
                </p>
            </section>
        </Layout>
    );
}