import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Slide',
  description:
    'Privacy Policy for Slide - Instagram automation and marketing platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto max-w-4xl px-6">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mb-12 text-muted-foreground">
          Last updated: November 30, 2025
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
            <p className="leading-relaxed text-muted-foreground">
              Welcome to Slide (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;). We are committed to protecting your privacy and
              personal information. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              Instagram automation and marketing platform.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              2. Information We Collect
            </h2>
            <h3 className="mb-3 mt-6 text-lg font-medium">
              Personal Information
            </h3>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment and billing information</li>
              <li>Instagram account information (when connected)</li>
            </ul>

            <h3 className="mb-3 mt-6 text-lg font-medium">Usage Information</h3>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Log data and device information</li>
              <li>Usage patterns and feature interactions</li>
              <li>Automation configurations and settings</li>
              <li>Analytics and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>To provide and maintain our services</li>
              <li>To process transactions and send related information</li>
              <li>To send administrative information and updates</li>
              <li>To respond to inquiries and offer support</li>
              <li>To improve our platform and develop new features</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              4. Information Sharing
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong>Service Providers:</strong> Third-party vendors who
                assist in operating our platform (payment processors, hosting
                providers, analytics services)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              5. Third-Party Services
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Our platform integrates with third-party services including
              Instagram (Meta), Stripe for payments, and other tools. Your use
              of these integrations is subject to their respective privacy
              policies. We encourage you to review the privacy policies of any
              third-party services you connect.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">6. Data Security</h2>
            <p className="leading-relaxed text-muted-foreground">
              We implement appropriate technical and organizational security
              measures to protect your personal information. However, no method
              of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">7. Data Retention</h2>
            <p className="leading-relaxed text-muted-foreground">
              We retain your personal information for as long as your account is
              active or as needed to provide services. We may retain certain
              information as required by law or for legitimate business
              purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">8. Your Rights</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">9. Cookies</h2>
            <p className="leading-relaxed text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your
              experience. You can control cookies through your browser settings.
              Essential cookies are required for the platform to function
              properly.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              10. Children&apos;s Privacy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Our services are not intended for individuals under 18 years of
              age. We do not knowingly collect personal information from
              children.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              11. Changes to This Policy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">12. Contact Us</h2>
            <p className="leading-relaxed text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <p className="mt-4 text-muted-foreground">
              Email:{' '}
              <a
                href="mailto:privacy@slide.so"
                className="text-foreground underline"
              >
                privacy@slide.so
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
