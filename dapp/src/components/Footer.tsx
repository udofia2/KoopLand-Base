import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-lightgray bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-tan mb-4">Koopland</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover AI-Vetted Ideas, Buy with Any Token
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-foreground">SideShift</span>,{" "}
              <span className="font-semibold text-foreground">Polygon Labs</span>{" "}
              through <span className="font-semibold text-foreground">AKINDO</span>.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-tan transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-tan transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-tan transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Connect
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-sm text-muted-foreground hover:text-tan transition-colors"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/create-idea"
                  className="text-sm text-muted-foreground hover:text-tan transition-colors"
                >
                  Create Idea
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-lightgray">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} Koopland. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

