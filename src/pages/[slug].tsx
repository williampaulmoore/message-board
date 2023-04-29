import { type NextPage } from "next";
import Head from "next/head";
import  Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { type RouterOutputs, api } from "~/utils/api";

type ProfileUser = RouterOutputs["profile"]["getUserByUserName"];


const ProfileHeader = (user: ProfileUser) => {

    return(
      <>
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
        <div className="font-bold ml-4">{`${user.firstName} ${user.lastName}`}</div>
        <div className="font-light ml-4">{`@${user.username ?? "unknown"}`}</div>
      </>
    );
}


// t(wpm). find out how to set up routing to this page so that it can be called profile rather than slug. 
const Profile:  NextPage = () => {
    const username  = "williampaulmoore";
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
        </PageLayout>
      </>
    );
}

export default Profile;
