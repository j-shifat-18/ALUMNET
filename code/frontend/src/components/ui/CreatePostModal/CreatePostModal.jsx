"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Modal from "../modal";
import Button from "../button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import placeholderUser from "../../../../public/placeholder-user.jpg";
import axiosInstance from "@/lib/axios";

const CreatePostModal = ({ isOpen, onClose, dbUser, onPostCreated }) => {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Error uploading photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePostSubmit = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/v1/posts", {
        content: content.trim(),
        imageUrl: imageUrl || null,
      });

      if (response.data) {
        setContent("");
        setImageUrl("");
        if (onPostCreated) {
          onPostCreated(response.data);
        }
        onClose();
      }
    } catch (err) {
      console.error("Post creation error:", err);
      setError(err.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" size="md">
      <div className="space-y-4 p-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gray-200 dark:border-gray-700">
            <Image
              src={dbUser?.profileImage || placeholderUser}
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">
              {dbUser?.name || "User"}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {dbUser?.role ? dbUser.role.toLowerCase() : "Member"}
            </span>
          </div>
        </div>

        <div className="min-h-[100px] max-h-[300px] overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none border-none outline-none text-base text-gray-900 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 p-0"
          />
        </div>

        {isUploading && (
          <div className="flex items-center justify-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">Uploading photo...</span>
          </div>
        )}

        {imageUrl && !isUploading && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-72 bg-black/5">
            <Image
              src={imageUrl}
              alt="Post Upload"
              width={600}
              height={400}
              unoptimized
              className="w-full h-auto max-h-72 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}

        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPosting}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-5 h-5 text-green-500" />
              <span>Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isPosting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePostSubmit}
              disabled={!content.trim() || isUploading || isPosting}
            >
              {isPosting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
