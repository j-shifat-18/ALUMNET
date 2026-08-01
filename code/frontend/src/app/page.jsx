"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Navbar from "@/components/shared/Navbar/Navbar";
import PostCard from "@/components/ui/PostCard/PostCard";
import CreatePostModal from "@/components/ui/CreatePostModal/CreatePostModal";
import Divider from "@/components/ui/divider";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { ImagePlus, Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  const fetchUserData = () => {
    if (!user) return;
    axiosInstance
      .get("/api/v1/users")
      .then((response) => {
        const signedInUser = response.data.data.find(
          (u) => u.email === user.email
        );
        setUsersList(signedInUser ? [signedInUser] : []);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await axiosInstance.get("/api/v1/posts");
      if (response.data?.data) {
        setPosts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching feed posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, [user]);

  const dbUser = usersList[0];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-black/95">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-6 space-y-6">
          {dbUser?.role === "USER" ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to ALUMNET!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please complete your profile.
              </p>
              <Link
                href="/profile-setup"
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Complete Your Profile to Continue
              </Link>
            </div>
          ) : (
            <>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCreatePostModalOpen(true)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer font-medium text-gray-500 dark:text-gray-400 transition-colors"
                >
                  Post something...
                </button>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCreatePostModalOpen(true)}
                    className="flex items-center gap-2 font-semibold p-2.5 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <ImagePlus className="text-green-500 w-5 h-5" /> Add Photo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Divider />

                {loadingPosts ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading feed...</span>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500">
                    <p className="text-base font-medium">
                      No posts available in the feed yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onDelete={(deletedId) =>
                          setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <CreatePostModal
          isOpen={createPostModalOpen}
          onClose={() => setCreatePostModalOpen(false)}
          dbUser={dbUser}
          onPostCreated={() => {
            fetchPosts();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
