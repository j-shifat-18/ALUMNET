"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ImageUp, Loader2 } from "lucide-react";
import placeholderUser from "../../../public/placeholder-user.jpg";

const ProfilePhotoEditModal = ({ onClose, currentImage, onSave }) => {
  const fileInputRef = useRef(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(currentImage || "");
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedPhotoName(file.name);
    setIsUploading(true);

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
        setProfileImageUrl(data.data.url);
      } else {
        alert("Photo upload failed");
      }
    } catch (err) {
      alert("Error uploading photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profileImageUrl) {
      return;
    }
    if (onSave) {
      onSave(profileImageUrl);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Profile Photo" size="md">
      <div className="space-y-6 py-2">
        <div className="flex justify-center">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800">
            <Image
              src={profileImageUrl || placeholderUser}
              alt="Profile preview"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <input
            id="photo-upload"
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <label
            htmlFor="photo-upload"
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-600 dark:hover:border-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 w-full rounded-xl hover:cursor-pointer transition-all duration-200 block p-4 text-center group"
          >
            <div className="flex items-center gap-2.5 justify-center font-medium text-sm sm:text-base">
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Uploading photo...</span>
                </>
              ) : (
                <>
                  <ImageUp className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
                  <span>Choose new profile photo</span>
                </>
              )}
            </div>
          </label>
          {selectedPhotoName && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium truncate px-4">
              {selectedPhotoName}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!profileImageUrl || isUploading}
            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Save Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePhotoEditModal;
