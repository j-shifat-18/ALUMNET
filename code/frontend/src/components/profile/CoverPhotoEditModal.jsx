"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ImageUp } from "lucide-react";
import placeholderCover from "../../../public/cover_placeholder.jpg";

const CoverPhotoEditModal = ({ onClose, currentImage, onSave }) => {
  const fileInputRef = useRef(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(currentImage || "");
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
        setCoverImageUrl(data.data.url);
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
    if (!coverImageUrl) {
      return;
    }
    if (onSave) {
      onSave(coverImageUrl);
    }
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Cover Photo">
      <div className="space-y-4 p-4">
        <div className="flex justify-center">
          <Image
            src={coverImageUrl || placeholderCover}
            alt="user"
            width={500}
            height={500}
            className="object-cover"
          />
        </div>

        <div className="mt-6">
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
            className="border-2 border-zinc-900 w-full rounded-md hover:cursor-pointer hover:text-zinc-900/90 hover:border-zinc-900/90 block"
          >
            <p className="flex items-center gap-2 p-2 justify-center">
              <ImageUp />
              {isUploading ? "Uploading..." : "Upload your photo"}
            </p>
          </label>
          {selectedPhotoName && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {selectedPhotoName}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="default"
            disabled={!coverImageUrl}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CoverPhotoEditModal;
