import { type NextPage } from "next";
import { SignInButton , SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs" ;
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
    const { user } = useUser();

    if (!user) return null;

    return (
      <div className="flex gap-3 w-full">
          <img
            src={user.profileImageUrl}
            alt="Profile image"
            className="h-14 w-14 rounded-full"
          />
          <input
            placeholder="enter post"
            className="bg-transparent grow"/>

      </div>
    );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props:  PostWithUser) => {
  const {post, author} = props;

  return (
    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-3" >
      <img
        src={author.profilePicture}
        alt="Author's image"
        className="h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
          <div className="flex gap-2">
            <span className="font-bold">{`${author.firstName} ${author.lastName}`}</span>
            <span className="font-light">{`@${author.username}`}</span>
            <span className="font-light">{`${dayjs(post.createdAt).fromNow()}`}</span>
          </div>
          <span className="">{post.content}</span>
      </div>
    </div>
  );
}

const Home: NextPage = () => {
  const user = useUser();
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <LoadingPage />
  if (!data) return <div>Error loading data</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
            <div className="flex border-b border-slate-400 p-4"> 
                {!user.isSignedIn &&  (
                    <div className="flex justify-center">
                        <SignInButton/>
                    </div>
                ) }
                {!!user.isSignedIn && <CreatePostWizard /> }
            </div>
            <div className="flex flex-col">
                {data.map((fullPost) => (
                    <PostView {...fullPost} key={fullPost.post.id} />
                ))}
            </div>
        </div>
      </main>
    </>
  );
};

export default Home;
