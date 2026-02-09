import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useState, useEffect } from "react";

import { PlaygroundConnect } from "@/components/PlaygroundConnect";
import Playground from "@/components/playground/Playground";
import { PlaygroundToast } from "@/components/toast/PlaygroundToast";
import { ConfigProvider, useConfig } from "@/hooks/useConfig";
import { ToastProvider, useToast } from "@/components/toast/ToasterProvider";
import { TokenSourceConfigurable, TokenSource } from "livekit-client";

const themeColors = [
  "cyan",
  "green",
  "amber",
  "blue",
  "violet",
  "rose",
  "pink",
  "teal",
];

export default function PlaygroundPage() {
  return (
    <ToastProvider>
      <ConfigProvider>
        <PlaygroundPageInner />
      </ConfigProvider>
    </ToastProvider>
  );
}

function PlaygroundPageInner() {
  const { config } = useConfig();
  const { toastMessage } = useToast();
  const [autoConnect, setAutoConnect] = useState(false);
  const [tokenSource, setTokenSource] = useState<
    TokenSourceConfigurable | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch token and serverUrl from backend on mount
  useEffect(() => {
    const fetchTokenFromBackend = async () => {
      const roomName = `room-${Math.random().toString(36).substring(2, 9)}`;
      const userName = `user-${Math.random().toString(36).substring(2, 9)}`;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/backend-token?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(userName)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.token && data.serverUrl) {
          const source = TokenSource.literal({
            serverUrl: data.serverUrl,
            participantToken: data.token,
          });

          setTokenSource(source);
          setAutoConnect(true);
        } else {
          throw new Error("Invalid response: missing token or serverUrl");
        }
      } catch (err) {
        console.error("Error fetching token from backend:", err);
        let errorMessage = "Failed to fetch token from backend";

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenFromBackend();
  }, []);

  return (
    <>
      <Head>
        <title>{config.title} – Playground</title>
        <meta name="description" content={config.description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex flex-col justify-center px-4 items-center h-full w-full bg-black repeating-square-background">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="left-0 right-0 top-0 absolute z-10"
              initial={{ opacity: 0, translateY: -50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -50 }}
            >
              <PlaygroundToast />
            </motion.div>
          )}
        </AnimatePresence>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <div className="mb-4">Loading...</div>
              <div className="text-sm text-gray-400">Fetching token from backend...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center max-w-md">
              <div className="mb-4 text-red-400">Error: {error}</div>
              <div className="text-sm text-gray-400 mb-4">
                Falling back to manual connection
              </div>
              <PlaygroundConnect
                accentColor={themeColors[0]}
                onConnectClicked={(tokenSource, shouldAutoConnect) => {
                  setTokenSource(tokenSource);
                  if (shouldAutoConnect) {
                    setAutoConnect(true);
                  }
                }}
              />
            </div>
          </div>
        ) : tokenSource ? (
          <Playground
            themeColors={themeColors}
            tokenSource={tokenSource}
            autoConnect={autoConnect}
          />
        ) : (
          <PlaygroundConnect
            accentColor={themeColors[0]}
            onConnectClicked={(tokenSource, shouldAutoConnect) => {
              setTokenSource(tokenSource);
              if (shouldAutoConnect) {
                setAutoConnect(true);
              }
            }}
          />
        )}
      </main>
    </>
  );
}
