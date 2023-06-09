import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs" ;
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

export const CreatePostWizard = () => {
    const { user } = useUser();
    const [ input, setInput ] = useState("");
    const ctx = api.useContext();
    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
        onSuccess: () => {
            setInput("");
            void ctx.posts.getAll.invalidate();
        },
        onError: (e) => {
            const errorMessage = e.data?.zodError?.fieldErrors.content;
            if(errorMessage && errorMessage[0]){
                toast.error(errorMessage[0]);
            } else {
                toast.error("Failed to post! Please try again later.");
            }
       },
    });

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
            className="bg-transparent grow"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    mutate({ content: input });
                }
            }}
            disabled={isPosting}
          />
      </div>
    );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
type PostAuthor  = PostWithUser["author"];
const PostAuthorLink = (author: PostAuthor ) => {

    return(
      <>
        <span className="font-bold">{`${author.firstName} ${author.lastName}`}</span>
        <Link href={`/@${author.username}`} className="hover:underline">
            <span className="font-light">{`@${author.username}`}</span>
        </Link>
      </>
    );
}


export const PostView = (props:  PostWithUser) => {
  const {post, author} = props;

  return (
    <div key={post.id} className="flex border-b border-slate-400 p-4 gap-3" >
      <img
        src={author.profilePicture}
        alt="Author's image"
        className="h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
          <div className="flex gap-1">
            <PostAuthorLink {...author} />
            <span className="font-light">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
          </div>
          <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
}

export const PostFeed = () => {
    const { data, isLoading } = api.posts.getAll.useQuery();

    if(isLoading) return <LoadingPage />
    if(!data) return <div>Error Loading data</div>

    return(
             <div className="flex flex-col">
                {data.map((fullPost) => (
                    <PostView {...fullPost} key={fullPost.post.id} />
                ))}
            </div>
    );
}

