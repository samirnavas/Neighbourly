import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🏘️</div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Share More with Your{" "}
            <span className="text-emerald-600">Neighbours</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rent your empty driveway for extra income, or borrow heavy-duty
            tools from people on your street. Hyper-local. Community-first.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/explore">
              <Button size="lg" className="text-base px-8">
                🗺️ Explore the Map
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-base px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              emoji: "📍",
              title: "Browse the Map",
              description:
                "Explore an interactive map of available parking spaces and tools in your neighbourhood.",
            },
            {
              emoji: "📅",
              title: "Book Instantly",
              description:
                "Select your dates and book directly. No middleman, no hassle.",
            },
            {
              emoji: "💰",
              title: "Earn or Save",
              description:
                "List your own driveway or tools to earn extra income, or rent from a neighbour to save.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
            >
              <div className="text-4xl mb-4">{step.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You Can Share
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-8 bg-emerald-50 border border-emerald-100">
              <div className="text-4xl mb-4">🅿️</div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-3">
                Parking Spaces
              </h3>
              <p className="text-emerald-700 mb-4">
                Have an empty driveway or garage? List it and earn money from
                neighbours who need reliable, affordable parking.
              </p>
              <ul className="text-sm text-emerald-600 space-y-1">
                <li>✓ Driveways</li>
                <li>✓ Garages</li>
                <li>✓ Private car parks</li>
              </ul>
            </div>
            <div className="rounded-2xl p-8 bg-blue-50 border border-blue-100">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">
                Tools &amp; Equipment
              </h3>
              <p className="text-blue-700 mb-4">
                Don&apos;t buy when you can borrow. Rent power tools, gardening
                equipment and more from people nearby.
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>✓ Power tools</li>
                <li>✓ Garden equipment</li>
                <li>✓ Construction gear</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to connect with your community?
        </h2>
        <p className="text-emerald-100 mb-8 text-lg">
          Join Neighbourly today — it&apos;s free to sign up.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" variant="outline" className="text-emerald-700 hover:bg-white border-white bg-white text-base px-8">
            Create Your Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-400 bg-gray-50 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Neighbourly. Built with ❤️ for communities.</p>
      </footer>
    </div>
  );
}
