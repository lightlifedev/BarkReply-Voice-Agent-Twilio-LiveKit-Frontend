import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>LiveKit Voice Agent</title>
        <meta name="description" content="Test and interact with voice agents powered by LiveKit." />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex flex-col justify-center items-center min-h-full w-full bg-black repeating-square-background px-4">
        <section className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
            LiveKit Voice Agent
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Connect to your voice agent and test real-time audio, video, and chat in the playground.
          </p>
          <Link
            href="/playground"
            className="inline-flex text-gray-950 text-base justify-center border border-transparent bg-cyan-500 px-6 py-2.5 rounded-md transition ease-out duration-250 hover:bg-transparent hover:shadow-cyan-500/30 hover:border-cyan-500 hover:text-cyan-500 active:scale-[0.98]"
          >
            Open Voice Playground
          </Link>
        </section>
      </main>
    </>
  );
}
