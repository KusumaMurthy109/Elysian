import {useEffect, useState} from "react";
import {collection, query, orderBy, onSnapshot} from "firebase/firestore";
import {FIREBASE_DB} from "../../FirebaseConfig";

// This defines what the post object should look like
export type Post = {
  id: string;
  urls: string[]; // Allow users to upload multiple pictures.
  uploader: string;
  uid: string;
  city: {
    id: string;
    name: string;
    country: string;
  };
  review: string;
  ratingValue: number;
  timestamp: number;
  likeCount?: number;
};

export const usePosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const q = query(
            collection(FIREBASE_DB, "posts"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot (q, (snapshot) => {
            const data:Post[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Post, "id">),
            }));

            setPosts(data);
        });
        return () => unsubscribe();
    }, []);

    return {posts};
};