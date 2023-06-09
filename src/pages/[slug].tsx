import { type NextPage } from "next";
import Head from "next/head";
import  Image from "next/image";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { type RouterOutputs, api } from "~/utils/api";

type ProfileUser = RouterOutputs["profile"]["getUserByUserName"];

const ProfileHeaderFullName = (user: ProfileUser) => {
    return(
        <div className="font-bold ml-4 text-2xl">{`${user.firstName} ${user.lastName}`}</div>
    )
}

const ProfileHeader = (user: ProfileUser) => {

    return(
      <div>
       <ProfileHeaderFullName {...user}/>
        <div className="h-48">
          <div className="relative h-32 bg-slate-600" >
            <Image
              src={user.profilePicture}
              alt={`${user.username ?? "unknown"}'s profile picture`}
              width={128}
              height={128}
              className="rounded-full border-2 border-black bg-black absoloute left-4 bottom-0 transform translate-y-1/2 -mb-1/2 ml-4" 
            />
          </div>
        </div>
        <br />
        <ProfileHeaderFullName {...user}/>
        <div className="font-light ml-4">{`@${user.username ?? "unknown"}`}</div>
      </div>
    );
}

const ProfileFeed = (props: {userId: string}) => {
    const {data, isLoading} = api.posts.getPostsByUserId.useQuery({
        userId: props.userId
    });

    if(isLoading) return <LoadingPage />
    if(!data || data.length === 0) return <div>User has not posted</div>

    return(
        <div className="flex flex-col" data-name="ProfileFeed">
          {data.map( p => <PostView {...p} key={p.post.id} />)}
        </div>
    );
}


// t(wpm). find out how to set up routing to this page so that it can be called profile rather than slug. 
const Profile:  NextPage = () => {
    const router = useRouter();
    const slug = (Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug) ?? "unknown";
    const username = slug.replace("@", "");

    const { data, isLoading } = api.profile.getUserByUserName.useQuery({
        username
    });

    if(isLoading) return <LoadingPage />
    if(!data) return <div>404</div>

    return (
      <>
        <Head>
          <title>Message board - Profile for {data.username}</title>
          <meta name="description" content="Displays user profiles" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PageLayout>
            <ProfileHeader {...data}/>
            <ProfileFeed  userId={data.id}/>
        </PageLayout>
      </>
    );
}

export default Profile;
