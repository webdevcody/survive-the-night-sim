import dynamic from "next/dynamic";
import Link from "next/link";

const ThemeToggle = dynamic(
  async () => (await import("@/components/ThemeToggle")).ThemeToggle,
  {
    ssr: false,
  },
);

export default function Footer() {
  return (
    <footer className="border-t bg-gray-100 py-8 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="mb-12 flex w-full flex-col gap-4 md:mb-4 md:w-1/3">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 md:mb-2">
              Survive The Night
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              A zombie survival simulation game that challenges both AI models
              and human players.
            </p>

            <div className="hidden w-fit md:block">
              <ThemeToggle />
            </div>
          </div>
          <div className="mb-12 w-full md:mb-4 md:w-1/3">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 md:mb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/play"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Play
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Rules
                </Link>
              </li>
              <li>
                <Link
                  href="/playground"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Playground
                </Link>
              </li>
            </ul>
          </div>
          <div className="mb-12 w-full md:mb-4 md:w-1/3">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100 md:mb-2">
              Connect
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Follow us on social media for updates and community discussions.
            </p>
            <div className="mt-2">
              <Link
                href="https://discord.gg/N2uEyp7Rfu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Join our Discord community
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} Survive The Night. All rights
            reserved.
          </p>
          <div className="mt-2 space-x-4">
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
