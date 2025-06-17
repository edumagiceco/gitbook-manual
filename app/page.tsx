import Link from "next/link";
import { ArrowRight, BookOpen, Code, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero Section */}
      <div className="flex flex-col items-start space-y-8 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Build beautiful{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              documentation
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-gray-600 md:text-xl dark:text-gray-400">
            Create professional documentation sites with our GitBook-style manual platform. 
            Fast, accessible, and beautifully designed.
          </p>
        </div>
        
        <div className="mx-auto flex flex-col gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/examples"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            View Examples
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-5xl py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Beautiful Design</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Clean, modern interface inspired by GitBook with excellent typography and spacing.
            </p>
          </div>
          
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Code className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Markdown Support</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Write content in Markdown with support for code highlighting, tables, and more.
            </p>
          </div>
          
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Responsive Layout</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Three-column layout that adapts beautifully to any screen size and device.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mx-auto max-w-4xl py-12">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
          <h2 className="text-2xl font-bold">Quick Start</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started with our documentation platform in minutes.
          </p>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                1
              </div>
              <div>
                <p className="font-medium">Explore the documentation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse through our comprehensive guides and examples.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                2
              </div>
              <div>
                <p className="font-medium">Follow the setup guide</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn how to install and configure the platform.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                3
              </div>
              <div>
                <p className="font-medium">Start building</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create your first documentation pages with Markdown.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              href="/docs/introduction"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Read the full guide
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
