import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const hello = trpc.useQuery(["hello", { text: "from tRPC" }]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center w-1/2 min-h-screen mx-auto">
        <h1 className="front-extrabold text-center text-7xl">test pages</h1>
        <div className="mt-5">
          <ul className="list-disc">
            <li className="text-lg">
              <Link href={"hardwareTest"}>hardware test</Link>
            </li>
            <li className="text-lg">
              <Link href={"droneSimulation"}>drone simulation</Link>
            </li>
            <li className="text-lg">
              <Link href={"analysisPage"}>analysys</Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Home;
