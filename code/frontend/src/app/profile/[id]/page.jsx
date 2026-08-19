"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoadingScreen from '@/components/layout/LoadingScreen';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import cover_placeholder from "../../../../public/cover_placeholder.jpg";
import user_placeholder from "../../../../public/placeholder-user.jpg";
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthProvider';
import axiosInstance from '@/lib/axios';
import Divider from '@/components/ui/Divider';
import Swal from 'sweetalert2';
import { Camera, Construction, FileUser, Globe, ImagePlus, ListChevronsDownUp, ListChevronsUpDown, PencilLine, Plus, UserRoundCheck, UserRoundPlus, X, Loader2, Briefcase, Trash2, Check, Clock, GraduationCap, Award, Trophy, ExternalLink, Calendar, Building2, UploadCloud } from 'lucide-react';
import { EditDrawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, Button } from '@/components/ui/Drawer';
import Modal from '@/components/ui/Modal';
import GenderDropdown from '@/components/profile/GenderDropdown';
import ProfilePhotoEditModal from '@/components/profile/ProfilePhotoEditModal';
import CoverPhotoEditModal from '@/components/profile/CoverPhotoEditModal';
import CreatePostModal from '@/components/posts/CreatePostModal';
import RequestMentorshipModal from '@/components/mentorship/RequestMentorshipModal';
import PostCard from '@/components/posts/PostCard';
import { GithubIcon as Github } from '@/components/ui/Icons';
import IUTLogo from "../../../../public/IUT.png";
import SkillsMultiSelect from '@/components/profile/SkillsMultiSelect';

const profileCache = new Map();
const postsCache = new Map();

export default function Profile() {

  const { user, dbUser: authDbUser, setDbUser: setAuthDbUser } = useAuth();
  const { id } = useParams();
  
  const [dbUser, setDbUser] = useState(() => (id ? profileCache.get(id) || null : null));
  const [basicInfoDrawerOpen, setBasicInfoDrawerOpen] = useState(false);
  const [contactInfoDrawerOpen, setContactInfoDrawerOpen] = useState(false);
  const [additionalInfoDrawerOpen, setAdditionalInfoDrawerOpen] = useState(false);
  const [editInfoDrawerOpen, setEditInfoDrawerOpen] = useState(false);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [editingSkills, setEditingSkills] = useState([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certList, setCertList] = useState([]);
  const [achieveList, setAchieveList] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertCategory, setNewCertCategory] = useState("CERTIFICATE");
  const [newCertIssuedBy, setNewCertIssuedBy] = useState("");
  const [newCertIssueDate, setNewCertIssueDate] = useState("");
  const [newCertExpiryDate, setNewCertExpiryDate] = useState("");
  const [newCertCredentialId, setNewCertCredentialId] = useState("");
  const [newCertCredentialUrl, setNewCertCredentialUrl] = useState("");
  const [newCertImageUrl, setNewCertImageUrl] = useState("");
  const [newAchieveUrl, setNewAchieveUrl] = useState("");
  const [newCertDescription, setNewCertDescription] = useState("");
  const [isUploadingCertImage, setIsUploadingCertImage] = useState(false);
  const certFileInputRef = useRef(null);
  const [previewCertImage, setPreviewCertImage] = useState(null);
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);
  const [coverPhotoModalOpen, setCoverPhotoModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [requestMentorshipModalOpen, setRequestMentorshipModalOpen] = useState(false);
  const [mentorshipRequestStatus, setMentorshipRequestStatus] = useState(null);
  const textareaRef = useRef(null);
  
  const cachedUser = id ? profileCache.get(id) : null;
  const [bio, setBio] = useState(cachedUser?.bio || "");
  const [name, setName] = useState(cachedUser?.name || "");
  const [location, setLocation] = useState(cachedUser?.location || "");
  const [contactNo, setContactNo] = useState(cachedUser?.contactNo || "");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [followed, setFollowed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [selectedGender, setSelectedGender] = useState(cachedUser?.gender || "");
  const [profileImageUrl, setProfileImageUrl] = useState(cachedUser?.profileImage || "");
  const [coverImageUrl, setCoverImageUrl] = useState(cachedUser?.coverImage || "");

  const [profileFollowingList, setProfileFollowingList] = useState([]);
  const [profileFollowersList, setProfileFollowersList] = useState([]);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [isFollowerOfProfile, setIsFollowerOfProfile] = useState(false);
  const [togglingProfileFollow, setTogglingProfileFollow] = useState(false);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [connectionsModalTab, setConnectionsModalTab] = useState("FOLLOWING");
  const [loadingProfileConnections, setLoadingProfileConnections] = useState(false);

  const fetchProfileConnections = useCallback(async () => {
    if (!id) return;
    setLoadingProfileConnections(true);
    try {
      const [followingRes, followersRes] = await Promise.all([
        axiosInstance.get(`/api/v1/users/${id}/following`, {
          validateStatus: (status) => status < 500,
        }),
        axiosInstance.get(`/api/v1/users/${id}/followers`, {
          validateStatus: (status) => status < 500,
        }),
      ]);

      const followingData =
        followingRes.status === 200 && followingRes.data?.data
          ? followingRes.data.data
          : [];
      const followersData =
        followersRes.status === 200 && followersRes.data?.data
          ? followersRes.data.data
          : [];

      setProfileFollowingList(followingData);
      setProfileFollowersList(followersData);

      if (user?.uid && user.uid !== id) {
        const statusRes = await axiosInstance.get(
          `/api/v1/users/${id}/follow/status`,
          { validateStatus: (status) => status < 500 }
        );
        if (statusRes.status === 200 && statusRes.data?.data) {
          setIsFollowingProfile(statusRes.data.data.isFollowing);
        }

        const isFollower = followingData.some((u) => u.uid === user.uid);
        setIsFollowerOfProfile(isFollower);
      }
    } catch (err) {
      console.error("Error fetching profile connections:", err);
    } finally {
      setLoadingProfileConnections(false);
    }
  }, [id, user?.uid]);

  useEffect(() => {
    fetchProfileConnections();
  }, [fetchProfileConnections]);

  useEffect(() => {
    if (authDbUser?.role === "STUDENT" && dbUser?.role === "ALUMNI" && (dbUser?.id || dbUser?.uid)) {
      axiosInstance
        .get("/api/v1/mentorship/sent", { validateStatus: (s) => s < 500 })
        .then((res) => {
          if (res.status === 200 && Array.isArray(res.data?.data)) {
            const matched = res.data.data.find(
              (r) => r.alumniId === dbUser.id || r.alumni?.uid === dbUser.uid
            );
            if (matched) {
              setMentorshipRequestStatus(matched.status);
            }
          }
        })
        .catch(() => {});
    }
  }, [authDbUser?.role, dbUser?.role, dbUser?.id, dbUser?.uid]);

  const handleToggleFollowProfile = async () => {
    if (!user?.uid || user.uid === id || togglingProfileFollow) return;
    const isCurrentlyFollowing = isFollowingProfile;

    setIsFollowingProfile(!isCurrentlyFollowing);
    setTogglingProfileFollow(true);

    if (!isCurrentlyFollowing) {
      setProfileFollowersList((prev) => [user, ...prev]);
    } else {
      setProfileFollowersList((prev) => prev.filter((u) => u.uid !== user.uid));
    }

    try {
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/api/v1/users/${id}/follow`, {
          validateStatus: (status) => status < 500,
        });
      } else {
        await axiosInstance.post(`/api/v1/users/${id}/follow`, {}, {
          validateStatus: (status) => status < 500,
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsFollowingProfile(true);
      } else if (err.response?.status === 404 && isCurrentlyFollowing) {
        setIsFollowingProfile(false);
      } else {
        console.error("Error toggling follow on profile:", err.response?.data || err);
        setIsFollowingProfile(isCurrentlyFollowing);
        if (!isCurrentlyFollowing) {
          setProfileFollowersList((prev) => prev.filter((u) => u.uid !== user.uid));
        } else {
          setProfileFollowersList((prev) => [user, ...prev]);
        }
      }
    } finally {
      setTogglingProfileFollow(false);
    }
  };
  
  const [posts, setPosts] = useState(() => (id ? postsCache.get(id) || [] : []));
  const [loadingPosts, setLoadingPosts] = useState(() => (id ? !postsCache.has(id) : true));

  useEffect(() => {
    if (!id) return;

    axiosInstance.get(`/api/v1/profiles/${id}`)
      .then(response => {
        const data = response.data.data;
        profileCache.set(id, data);
        setDbUser(data);

        setName(data?.name || "");
        setBio(data?.bio || "");
        setContactNo(data?.contactNo || "");
        setLocation(data?.location || "");
        setSelectedGender(data?.gender || "");
        setProfileImageUrl(data?.profileImage || "");
        setCoverImageUrl(data?.coverImage || "");

        const userProfile = data?.role === 'STUDENT' ? data?.studentProfile : data?.alumniProfile;
        setGithubUrl(userProfile?.githubUrl || "");
        setPortfolioUrl(userProfile?.portfolioUrl || "");
        setResumeUrl(userProfile?.resumeUrl || "");
        setCurrentCompany(userProfile?.currentCompany || "");
        setCurrentPosition(userProfile?.currentPosition || "");
      })
      .catch(err => {
        console.error("Error fetching profile:", err.response?.data || err.message);
      });
  }, [id]);

  const [postsRefreshKey, setPostsRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const loadPosts = async () => {
      try {
        let userPosts = [];
        try {
          const res = await axiosInstance.get(`/api/v1/posts/user/${id}`);
          if (res.data?.data) {
            userPosts = res.data.data;
          }
        } catch (err) {
          const res = await axiosInstance.get(`/api/v1/posts`);
          if (res.data?.data) {
            userPosts = res.data.data.filter((p) => p.author?.uid === id);
          }
        }
        if (isMounted) {
          postsCache.set(id, userPosts);
          setPosts(userPosts);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [id, postsRefreshKey]);

  const profile = dbUser?.role === 'STUDENT' ? dbUser?.studentProfile : dbUser?.alumniProfile;
  const isOwner = user?.uid === id;

  const updateUserProfileState = (updater) => {
    setDbUser((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (id) {
        profileCache.set(id, next);
      }
      if (isOwner && setAuthDbUser) {
        setTimeout(() => setAuthDbUser(next), 0);
      }
      return next;
    });
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleEditBasicInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        gender: selectedGender,
      });
      updateUserProfileState(prev => ({ ...prev, gender: selectedGender }));
      setBasicInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleEditContactInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        contactNo: contactNo,
      });
      updateUserProfileState(prev => ({ ...prev, contactNo: contactNo }));
      setContactInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      new URL(withProtocol);
      return withProtocol;
    } catch {
      return null;
    }
  };

  const handleEditAdditionalInfo = async () => {
    try {
      setIsSaving(true);
      const isStudent = dbUser?.role === "STUDENT";
      const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};

      let subProfile = {};
      if (isStudent) {
        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          careerGoal: existing.careerGoal || null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          resumeUrl: normalizeUrl(resumeUrl),
          portfolioUrl: normalizeUrl(portfolioUrl),
          githubUrl: normalizeUrl(githubUrl),
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
        };
      } else {
        const gradYear = existing.graduationYear
          ? parseInt(existing.graduationYear)
          : existing.batch && !isNaN(parseInt(existing.batch))
          ? parseInt(existing.batch)
          : new Date().getFullYear();

        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          graduationYear: gradYear,
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          industry: existing.industry || null,
          experienceYears: existing.experienceYears ? parseInt(existing.experienceYears) : null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          expertiseAreas: existing.expertiseAreas || [],
          education: existing.education || null,
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
          resumeUrl: normalizeUrl(resumeUrl),
          githubUrl: normalizeUrl(githubUrl),
          portfolioUrl: normalizeUrl(portfolioUrl),
          personalWebsite: normalizeUrl(existing.personalWebsite),
          mentorshipDomains: existing.mentorshipDomains || [],
        };
      }

      const role = dbUser?.role || (isStudent ? "STUDENT" : "ALUMNI");
      const profileKey = isStudent ? "studentProfile" : "alumniProfile";
      const payload = {
        role,
        [profileKey]: subProfile,
      };

      const res = await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      if (res.data?.data) {
        updateUserProfileState(res.data.data);
      } else {
        updateUserProfileState((prev) => ({
          ...prev,
          [profileKey]: {
            ...(prev?.[profileKey] || {}),
            ...subProfile,
          },
        }));
      }
      setAdditionalInfoDrawerOpen(false);
    } catch (err) {
      console.error("Error updating additional info:", err.response?.data || err);
    } finally {
      setIsSaving(false);
    }
  };

  const openJobModal = () => {
    const isStudent = dbUser?.role === "STUDENT";
    const subProf = isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile;

    setCurrentCompany(subProf?.currentCompany || "");
    setCurrentPosition(subProf?.currentPosition || "");
    setJobDrawerOpen(true);
  };

  const handleEditJobInfo = async () => {
    try {
      setIsSaving(true);
      const isStudent = dbUser?.role === "STUDENT";
      const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};

      let subProfile = {};
      if (isStudent) {
        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          careerGoal: existing.careerGoal || null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          currentCompany: currentCompany?.trim() || null,
          currentPosition: currentPosition?.trim() || null,
          resumeUrl: normalizeUrl(existing.resumeUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
        };
      } else {
        const gradYear = existing.graduationYear
          ? parseInt(existing.graduationYear)
          : existing.batch && !isNaN(parseInt(existing.batch))
          ? parseInt(existing.batch)
          : new Date().getFullYear();

        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          graduationYear: gradYear,
          currentCompany: currentCompany?.trim() || null,
          currentPosition: currentPosition?.trim() || null,
          industry: existing.industry || null,
          experienceYears: existing.experienceYears ? parseInt(existing.experienceYears) : null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          expertiseAreas: existing.expertiseAreas || [],
          education: existing.education || null,
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
          resumeUrl: normalizeUrl(existing.resumeUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          personalWebsite: normalizeUrl(existing.personalWebsite),
          mentorshipDomains: existing.mentorshipDomains || [],
        };
      }

      const role = dbUser?.role || (isStudent ? "STUDENT" : "ALUMNI");
      const profileKey = isStudent ? "studentProfile" : "alumniProfile";
      const payload = {
        role,
        [profileKey]: subProfile,
      };

      const res = await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      if (res.data?.data) {
        updateUserProfileState(res.data.data);
      } else {
        updateUserProfileState((prev) => ({
          ...prev,
          [profileKey]: {
            ...(prev?.[profileKey] || {}),
            ...subProfile,
          },
        }));
      }
      setJobDrawerOpen(false);
    } catch (err) {
      console.error("Error updating job info:", err.response?.data || err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJobInfo = async () => {
    const result = await Swal.fire({
      title: "Delete Job Experience?",
      text: "Are you sure you want to remove this experience from your profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    try {
      setIsSaving(true);
      const isStudent = dbUser?.role === "STUDENT";
      const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};

      let subProfile = {};
      if (isStudent) {
        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          careerGoal: existing.careerGoal || null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          currentCompany: null,
          currentPosition: null,
          resumeUrl: normalizeUrl(existing.resumeUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
        };
      } else {
        const gradYear = existing.graduationYear
          ? parseInt(existing.graduationYear)
          : existing.batch && !isNaN(parseInt(existing.batch))
          ? parseInt(existing.batch)
          : new Date().getFullYear();

        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          graduationYear: gradYear,
          currentCompany: null,
          currentPosition: null,
          industry: existing.industry || null,
          experienceYears: existing.experienceYears ? parseInt(existing.experienceYears) : null,
          interestedDomains: existing.interestedDomains || [],
          skills: existing.skills || [],
          expertiseAreas: existing.expertiseAreas || [],
          education: existing.education || null,
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
          resumeUrl: normalizeUrl(existing.resumeUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          personalWebsite: normalizeUrl(existing.personalWebsite),
          mentorshipDomains: existing.mentorshipDomains || [],
        };
      }

      const role = dbUser?.role || (isStudent ? "STUDENT" : "ALUMNI");
      const profileKey = isStudent ? "studentProfile" : "alumniProfile";
      const payload = {
        role,
        [profileKey]: subProfile,
      };

      const res = await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      if (res.data?.data) {
        updateUserProfileState(res.data.data);
      } else {
        updateUserProfileState((prev) => ({
          ...prev,
          [profileKey]: {
            ...(prev?.[profileKey] || {}),
            ...subProfile,
          },
        }));
      }
      setCurrentCompany("");
      setCurrentPosition("");
      setJobDrawerOpen(false);

      Swal.fire({
        title: "Deleted!",
        text: "Job experience has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting job info:", err.response?.data || err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete job experience.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openSkillsModal = () => {
    const isStudent = dbUser?.role === "STUDENT";
    const subProf = isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile;
    const currentSkills = subProf?.skills || [];
    const mapped = currentSkills.map((s, idx) => ({ id: idx + 1, name: s, value: s }));
    setEditingSkills(mapped);
    setSkillsModalOpen(true);
  };

  const handleSaveSkills = async (updatedSkillsList) => {
    try {
      setIsSaving(true);
      const isStudent = dbUser?.role === "STUDENT";
      const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};

      const mapped = updatedSkillsList.map((s) => (typeof s === "string" ? s : s.name || s));

      let subProfile = {};
      if (isStudent) {
        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          careerGoal: existing.careerGoal || null,
          interestedDomains: existing.interestedDomains || [],
          skills: mapped,
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          resumeUrl: normalizeUrl(existing.resumeUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
        };
      } else {
        const gradYear = existing.graduationYear
          ? parseInt(existing.graduationYear)
          : existing.batch && !isNaN(parseInt(existing.batch))
          ? parseInt(existing.batch)
          : new Date().getFullYear();

        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          graduationYear: gradYear,
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          industry: existing.industry || null,
          experienceYears: existing.experienceYears ? parseInt(existing.experienceYears) : null,
          interestedDomains: existing.interestedDomains || [],
          skills: mapped,
          expertiseAreas: existing.expertiseAreas || [],
          education: existing.education || null,
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
          resumeUrl: normalizeUrl(existing.resumeUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          personalWebsite: normalizeUrl(existing.personalWebsite),
          mentorshipDomains: existing.mentorshipDomains || [],
        };
      }

      const role = dbUser?.role || (isStudent ? "STUDENT" : "ALUMNI");
      const profileKey = isStudent ? "studentProfile" : "alumniProfile";
      const payload = {
        role,
        [profileKey]: subProfile,
      };

      const res = await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      if (res.data?.data) {
        updateUserProfileState(res.data.data);
      } else {
        updateUserProfileState((prev) => ({
          ...prev,
          [profileKey]: {
            ...(prev?.[profileKey] || {}),
            skills: mapped,
          },
        }));
      }
      setSkillsModalOpen(false);

      Swal.fire({
        title: "Saved!",
        text: "Your skills have been updated.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error updating skills:", err.response?.data || err);
      Swal.fire({
        title: "Error!",
        text: "Failed to update skills.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSingleSkill = async (skillToRemove) => {
    const confirm = await Swal.fire({
      title: "Remove skill?",
      text: `Are you sure you want to remove "${skillToRemove}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsSaving(true);
      const isStudent = dbUser?.role === "STUDENT";
      const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};

      const updatedSkills = (existing.skills || []).filter((s) => s !== skillToRemove);

      let subProfile = {};
      if (isStudent) {
        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          careerGoal: existing.careerGoal || null,
          interestedDomains: existing.interestedDomains || [],
          skills: updatedSkills,
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          resumeUrl: normalizeUrl(existing.resumeUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
        };
      } else {
        const gradYear = existing.graduationYear
          ? parseInt(existing.graduationYear)
          : existing.batch && !isNaN(parseInt(existing.batch))
          ? parseInt(existing.batch)
          : new Date().getFullYear();

        subProfile = {
          department: existing.department || "General",
          program: existing.program || "General",
          batch: existing.batch || "1",
          graduationYear: gradYear,
          currentCompany: existing.currentCompany || null,
          currentPosition: existing.currentPosition || null,
          industry: existing.industry || null,
          experienceYears: existing.experienceYears ? parseInt(existing.experienceYears) : null,
          interestedDomains: existing.interestedDomains || [],
          skills: updatedSkills,
          expertiseAreas: existing.expertiseAreas || [],
          education: existing.education || null,
          certifications: existing.certifications || [],
          achievements: existing.achievements || [],
          resumeUrl: normalizeUrl(existing.resumeUrl),
          githubUrl: normalizeUrl(existing.githubUrl),
          portfolioUrl: normalizeUrl(existing.portfolioUrl),
          personalWebsite: normalizeUrl(existing.personalWebsite),
          mentorshipDomains: existing.mentorshipDomains || [],
        };
      }

      const role = dbUser?.role || (isStudent ? "STUDENT" : "ALUMNI");
      const profileKey = isStudent ? "studentProfile" : "alumniProfile";
      const payload = {
        role,
        [profileKey]: subProfile,
      };

      const res = await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
      if (res.data?.data) {
        updateUserProfileState(res.data.data);
      } else {
        updateUserProfileState((prev) => ({
          ...prev,
          [profileKey]: {
            ...(prev?.[profileKey] || {}),
            skills: updatedSkills,
          },
        }));
      }

      Swal.fire({
        title: "Removed!",
        text: "Skill removed successfully.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error removing skill:", err.response?.data || err);
      Swal.fire({
        title: "Error!",
        text: "Failed to remove skill.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProfileInfo = async () => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        name, bio, location,
      });
      updateUserProfileState(prev => ({ ...prev, name, bio, location }));
      setEditInfoDrawerOpen(false);
    }
    catch (err) {

    }
    finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhotoSave = async (imageUrl) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        profileImage: imageUrl,
      });
      updateUserProfileState(prev => ({ ...prev, profileImage: imageUrl }));
      setProfileImageUrl(imageUrl);
      setProfilePhotoModalOpen(false);
    } catch (error) {
      console.error("Error updating profile photo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverPhotoSave = async (imageUrl) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, {
        coverImage: imageUrl,
      });
      updateUserProfileState(prev => ({ ...prev, coverImage: imageUrl }));
      setCoverImageUrl(imageUrl);
      setCoverPhotoModalOpen(false);
    } catch (error) {
      console.error("Error updating cover photo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetCertModalForm = () => {
    setNewCertTitle("");
    setNewCertIssuedBy("");
    setNewCertIssueDate("");
    setNewCertExpiryDate("");
    setNewCertCredentialId("");
    setNewCertCredentialUrl("");
    setNewCertImageUrl("");
    setNewAchieveUrl("");
    setNewCertDescription("");
    setIsUploadingCertImage(false);
    if (certFileInputRef.current) {
      certFileInputRef.current.value = "";
    }
  };

  const handleCertImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCertImage(true);
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
      if (data.success && data.data?.url) {
        setNewCertImageUrl(data.data.url);
      } else {
        Swal.fire({
          title: "Upload Failed",
          text: "Failed to upload image. Please try again.",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Certificate image upload error:", err);
      Swal.fire({
        title: "Upload Error",
        text: "Error uploading photo. Please try again.",
        icon: "error",
      });
    } finally {
      setIsUploadingCertImage(false);
    }
  };

  const fetchCredentials = useCallback(async (targetUid) => {
    if (!targetUid) return;
    setLoadingCredentials(true);
    try {
      const [certsRes, achsRes] = await Promise.all([
        axiosInstance.get(`/api/v1/credentials/certifications/${targetUid}`, {
          validateStatus: (s) => s < 500,
        }),
        axiosInstance.get(`/api/v1/credentials/achievements/${targetUid}`, {
          validateStatus: (s) => s < 500,
        }),
      ]);
      if (certsRes.status === 200 && Array.isArray(certsRes.data?.data)) {
        setCertList(certsRes.data.data);
      }
      if (achsRes.status === 200 && Array.isArray(achsRes.data?.data)) {
        setAchieveList(achsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching credentials:", err);
    } finally {
      setLoadingCredentials(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCredentials(id);
    }
  }, [id, fetchCredentials]);

  const handleAddCertificateOrAchievement = async (e) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;

    setIsSaving(true);
    try {
      if (newCertCategory === "CERTIFICATE") {
        if (!newCertIssuedBy.trim() || !newCertIssueDate) {
          Swal.fire({
            title: "Required Fields",
            text: "Please provide Organization (Issued By) and Issue Date.",
            icon: "warning",
          });
          setIsSaving(false);
          return;
        }

        const payload = {
          title: newCertTitle.trim(),
          issuedBy: newCertIssuedBy.trim(),
          issueDate: new Date(newCertIssueDate).toISOString(),
          expiryDate: newCertExpiryDate ? new Date(newCertExpiryDate).toISOString() : null,
          credentialId: newCertCredentialId.trim() || null,
          credentialUrl: newCertCredentialUrl.trim() || null,
          imageUrl: newCertImageUrl.trim() || null,
          description: newCertDescription.trim() || null,
        };

        const res = await axiosInstance.post("/api/v1/credentials/certifications", payload);
        if (res.status === 201 || res.status === 200) {
          if (res.data?.data) {
            setCertList((prev) => [res.data.data, ...prev]);
          } else {
            fetchCredentials(id || user?.uid);
          }
        }
      } else {
        const payload = {
          title: newCertTitle.trim(),
          issuedBy: newCertIssuedBy.trim() || null,
          date: newCertIssueDate ? new Date(newCertIssueDate).toISOString() : null,
          description: newCertDescription.trim() || null,
          imageUrl: newCertImageUrl.trim() || null,
          achievementUrl: newAchieveUrl.trim() || null,
        };

        const res = await axiosInstance.post("/api/v1/credentials/achievements", payload);
        if (res.status === 201 || res.status === 200) {
          if (res.data?.data) {
            setAchieveList((prev) => [res.data.data, ...prev]);
          } else {
            fetchCredentials(id || user?.uid);
          }
        }
      }

      setCertModalOpen(false);
      resetCertModalForm();

      Swal.fire({
        title: "Added!",
        text: `${newCertCategory === "CERTIFICATE" ? "Certification" : "Achievement"} added successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error adding credential:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to add item.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCredential = async (item) => {
    const isCert = item.category === "CERTIFICATE";
    const confirm = await Swal.fire({
      title: `Delete ${isCert ? "Certification" : "Achievement"}?`,
      text: `Are you sure you want to remove "${item.title || item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
      confirmButtonText: "Yes, delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsSaving(true);
      if (item.id) {
        if (isCert) {
          await axiosInstance.delete(`/api/v1/credentials/certifications/${item.id}`);
          setCertList((prev) => prev.filter((c) => c.id !== item.id));
        } else {
          await axiosInstance.delete(`/api/v1/credentials/achievements/${item.id}`);
          setAchieveList((prev) => prev.filter((a) => a.id !== item.id));
        }
      } else {
        const isStudent = dbUser?.role === "STUDENT";
        const existing = (isStudent ? dbUser?.studentProfile : dbUser?.alumniProfile) || {};
        const key = isCert ? "certifications" : "achievements";
        const updated = (existing[key] || []).filter((s) => s !== item.name);

        const payload = {
          role: dbUser?.role,
          [isStudent ? "studentProfile" : "alumniProfile"]: {
            ...existing,
            [key]: updated,
          },
        };

        await axiosInstance.patch(`/api/v1/profiles/${user.uid}`, payload);
        updateUserProfileState((prev) => ({
          ...prev,
          [isStudent ? "studentProfile" : "alumniProfile"]: {
            ...(prev?.[isStudent ? "studentProfile" : "alumniProfile"] || {}),
            [key]: updated,
          },
        }));
      }

      Swal.fire({
        title: "Removed!",
        text: "Item removed successfully.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting credential:", err);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete item.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!dbUser) {
    return (
      <ProtectedRoute>
        <LoadingScreen />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mt-4 sm:mt-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex flex-col gap-5 flex-1 min-w-0 w-full">
            <div className="">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="relative h-36 sm:h-44 lg:h-56 w-full overflow-hidden">
                  <Image
                    src={dbUser?.coverImage || cover_placeholder}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                  />
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setCoverPhotoModalOpen(true)}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full transition-colors cursor-pointer border border-white/40 backdrop-blur-sm"
                      title="Edit cover photo"
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
                <div className="px-4 sm:px-6 pb-5">
                  <div className="relative inline-block -mt-12 sm:-mt-20 lg:-mt-24 mb-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-md relative bg-white dark:bg-gray-800">
                      <Image
                        src={dbUser?.profileImage || user_placeholder}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setProfilePhotoModalOpen(true)}
                        className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10 p-1.5 sm:p-2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-colors cursor-pointer border-2 border-white dark:border-gray-900 shadow-sm"
                        title="Edit profile photo"
                      >
                        <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {dbUser?.name}
                  </h1>
                  {dbUser?.bio && (
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                      {dbUser.bio}
                    </p>
                  )}
                  {dbUser?.location && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      {dbUser.location}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setConnectionsModalTab("FOLLOWING");
                          setConnectionsModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:cursor-pointer group"
                      >
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {profileFollowingList.length}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">Following</span>
                      </button>

                      <span className="text-gray-300 dark:text-gray-700">•</span>

                      <button
                        type="button"
                        onClick={() => {
                          setConnectionsModalTab("FOLLOWERS");
                          setConnectionsModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:cursor-pointer group"
                      >
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {profileFollowersList.length}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">Followers</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <button
                          type="button"
                          className="px-4 py-1.5 border border-zinc-900 dark:border-zinc-100 rounded-xl hover:cursor-pointer hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 text-sm font-medium flex items-center gap-2 transition-colors"
                          onClick={() => setEditInfoDrawerOpen(true)}
                        >
                          <PencilLine className="w-4 h-4" /> Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleToggleFollowProfile}
                            disabled={togglingProfileFollow}
                            className={`px-4 py-1.5 border rounded-xl hover:cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${
                              isFollowingProfile
                                ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                                : isFollowerOfProfile
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600"
                                : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                            }`}
                          >
                            {togglingProfileFollow ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isFollowingProfile ? (
                              <>
                                <UserRoundCheck className="w-4 h-4" /> Following
                              </>
                            ) : isFollowerOfProfile ? (
                              <>
                                <UserRoundPlus className="w-4 h-4" /> Follow Back
                              </>
                            ) : (
                              <>
                                <UserRoundPlus className="w-4 h-4" /> Follow
                              </>
                            )}
                          </button>

                          {authDbUser?.role === "STUDENT" && dbUser?.role === "ALUMNI" && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!mentorshipRequestStatus || mentorshipRequestStatus === "REJECTED") {
                                  setRequestMentorshipModalOpen(true);
                                }
                              }}
                              disabled={mentorshipRequestStatus === "PENDING" || mentorshipRequestStatus === "ACCEPTED"}
                              className={`px-4 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                                mentorshipRequestStatus === "ACCEPTED"
                                  ? "bg-emerald-600 text-white cursor-default"
                                  : mentorshipRequestStatus === "PENDING"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-default"
                                  : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                              }`}
                            >
                              {mentorshipRequestStatus === "ACCEPTED" ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Your Mentor</span>
                                </>
                              ) : mentorshipRequestStatus === "PENDING" ? (
                                <>
                                  <Clock className="w-4 h-4" />
                                  <span>Request Sent</span>
                                </>
                              ) : (
                                <>
                                  <GraduationCap className="w-4 h-4" />
                                  <span>Request Mentorship</span>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCreatePostModalOpen(true)}
                    className='w-full border border-gray-300 dark:border-gray-700 rounded-xl text-left p-5 hover:bg-gray-100 dark:hover:bg-gray-800 hover:cursor-pointer font-bold text-gray-500 dark:text-gray-400 transition-colors'
                  >
                    Post Something...
                  </button>
                  <div className='mt-4 flex items-center gap-4'>
                    <button
                      type="button"
                      onClick={() => setCreatePostModalOpen(true)}
                      className='flex items-center gap-2 font-bold p-3 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300'
                    >
                      <ImagePlus className='text-green-500' /> Add Photo
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {isOwner ? "Your Posts" : `${dbUser?.name ? `${dbUser.name}'s Posts` : "Posts"}`}
                </h4>
                <Divider className='mt-2 mb-4' />

                {loadingPosts ? (
                  <div className="flex justify-center py-6 text-gray-500">
                    <p>Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-base font-medium">No posts shared yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {(showAllPosts ? posts : posts.slice(0, 1)).map((post) => (
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
                    {posts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllPosts((prev) => !prev)}
                        className="mt-3 text-md font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 hover:cursor-pointer w-full transition-colors"
                      >
                        {showAllPosts ? (
                          <div className="pt-3 flex items-center justify-center gap-2">
                            <p>Show Less</p> <ListChevronsDownUp />
                          </div>
                        ) : (
                          <div className="pt-3 flex items-center justify-center gap-2">
                            <p>See More</p> <ListChevronsUpDown />
                          </div>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className='flex justify-between items-center'>
                  <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>Education</h4>
                  {isOwner ? <button type="button" className="btn btn-secondary text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" title="Edit">
                    <Plus className='w-5 h-5 hover:cursor-pointer' />
                  </button> : <></>}
                </div>
                <Divider className='mt-2 mb-4' />
                <div className='flex items-start gap-4'>
                  <div className="w-14 h-14 relative shrink-0">
                    <Image src={IUTLogo} alt='IUT' width={56} height={56} className="object-contain" />
                  </div>
                  <div className="space-y-0.5">
                    <p className='font-bold text-lg text-gray-900 dark:text-white leading-snug'>Islamic University of Technology</p>
                    <p className='text-sm text-gray-600 dark:text-gray-300 font-medium'>{profile?.program}</p>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>Department of {profile?.department}</p>
                    <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 pt-1'>Batch: {profile?.batch}</p>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const hasJob = Boolean(profile?.currentCompany || profile?.currentPosition);
              if (!hasJob && !isOwner) return null;

              return (
                <div className="">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className='flex justify-between items-center'>
                      <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>Experience</h4>
                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCompany("");
                            setCurrentPosition("");
                            setJobDrawerOpen(true);
                          }}
                          className="btn btn-secondary text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Add Job Experience"
                        >
                          <Plus className='w-5 h-5 hover:cursor-pointer' />
                        </button>
                      ) : <></>}
                    </div>
                    <Divider className='mt-2 mb-4' />
                    {hasJob ? (
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-start gap-4 min-w-0'>
                          <div className='p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex-shrink-0'>
                            <Briefcase className='w-6 h-6' />
                          </div>
                          <div className='space-y-1 min-w-0'>
                            {profile?.currentPosition && (
                              <p className='font-bold text-lg text-gray-900 dark:text-white leading-snug'>
                                {profile.currentPosition}
                              </p>
                            )}
                            {profile?.currentCompany && (
                              <p className='text-base font-medium text-gray-700 dark:text-gray-300'>
                                {profile.currentCompany}
                              </p>
                            )}
                          </div>
                        </div>

                        {isOwner && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={openJobModal}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Edit Job Experience"
                            >
                              <PencilLine className='w-4 h-4' />
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteJobInfo}
                              disabled={isSaving}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Delete Job Experience"
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No job experience added yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentCompany("");
                            setCurrentPosition("");
                            setJobDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className='flex justify-between items-center'>
                  <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>Skills</h4>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={openSkillsModal}
                      className="btn btn-secondary"
                      title="Manage Skills"
                    >
                      <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                    </button>
                  )}
                </div>
                <Divider className='mt-2 mb-2' />
                {(() => {
                  const skills = profile?.skills ?? [];
                  if (skills.length === 0) {
                    return isOwner ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No skills added yet.</p>
                        <button
                          type="button"
                          onClick={openSkillsModal}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add Skills
                        </button>
                      </div>
                    ) : (
                      <p className='text-gray-500 dark:text-gray-400 text-sm'>No skills added yet.</p>
                    );
                  }
                  const INITIAL_COUNT = 3;
                  const visible = showAllSkills ? skills : skills.slice(0, INITIAL_COUNT);
                  return (
                    <>
                      {visible.map((skill, idx) => (
                        <React.Fragment key={skill}>
                          <div className="flex items-center justify-between py-2">
                            <p className='text-gray-800 dark:text-gray-200 font-medium'>{skill}</p>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleSkill(skill)}
                                disabled={isSaving}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Remove skill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {idx < visible.length - 1 && <Divider className='mt-1 mb-1' />}
                        </React.Fragment>
                      ))}
                      {skills.length > INITIAL_COUNT && (
                        <button
                          type='button'
                          onClick={() => setShowAllSkills(prev => !prev)}
                          className='mt-3 text-md font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-400 dark:border-gray-800 hover:cursor-pointer w-full transition-colors'
                        >
                          {showAllSkills ? <>
                            <div className='pt-3 flex items-center justify-center gap-2'>
                              <p>Show Less</p> <ListChevronsDownUp />
                            </div>
                          </> : <>
                            <div className='pt-3 flex items-center justify-center gap-2'>
                              <p>Show All</p> <ListChevronsUpDown />
                            </div>
                          </>}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mb-20">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className='flex justify-between items-center'>
                  <h4 className='text-2xl font-bold text-gray-900 dark:text-white'>Certifications & Achievements</h4>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewCertTitle("");
                        setNewCertCategory("CERTIFICATE");
                        setCertModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      title="Add Certificate or Achievement"
                    >
                      <Plus className='w-5 h-5 hover:cursor-pointer' />
                    </button>
                  )}
                </div>
                <Divider className='mt-2 mb-2' />

                {(() => {
                  const legacyCerts = (profile?.certifications ?? []).map((name) => ({
                    name,
                    title: name,
                    category: "CERTIFICATE",
                  }));
                  const legacyAchs = (profile?.achievements ?? []).map((name) => ({
                    name,
                    title: name,
                    category: "ACHIEVEMENT",
                  }));

                  const formattedCerts = certList.map((c) => ({
                    ...c,
                    category: "CERTIFICATE",
                  }));
                  const formattedAchs = achieveList.map((a) => ({
                    ...a,
                    category: "ACHIEVEMENT",
                  }));

                  // If database credentials exist, prefer them; otherwise fallback to legacy
                  const allItems = [
                    ...formattedCerts,
                    ...legacyCerts.filter(
                      (lc) => !formattedCerts.some((fc) => fc.title === lc.title)
                    ),
                    ...formattedAchs,
                    ...legacyAchs.filter(
                      (la) => !formattedAchs.some((fa) => fa.title === la.title)
                    ),
                  ];

                  if (allItems.length === 0 && !loadingCredentials) {
                    return isOwner ? (
                      <div className="text-center py-8 space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Award className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No certifications or achievements added yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            resetCertModalForm();
                            setNewCertCategory("CERTIFICATE");
                            setCertModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add Certificate or Achievement
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                        No certifications or achievements added yet.
                      </p>
                    );
                  }

                  const INITIAL_COUNT = 4;
                  const visibleItems = showAllCerts ? allItems : allItems.slice(0, INITIAL_COUNT);

                  return (
                    <div className="space-y-3 pt-2">
                      {visibleItems.map((item, idx) => {
                        const isCert = item.category === "CERTIFICATE";
                        const linkUrl = item.credentialUrl || item.achievementUrl;
                        const dateFormatted = item.issueDate
                          ? new Date(item.issueDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : item.date
                          ? new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : null;

                        const expiryFormatted = item.expiryDate
                          ? new Date(item.expiryDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : null;

                        return (
                          <div
                            key={item.id ? `cred-${item.id}` : `${item.category}-${item.title}-${idx}`}
                            className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 hover:border-gray-200 dark:hover:border-gray-700 transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                {item.imageUrl ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewCertImage({
                                        url: item.imageUrl,
                                        title: item.title || item.name,
                                      })
                                    }
                                    className="w-12 h-12 rounded-xl overflow-hidden relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shrink-0 shadow-2xs hover:opacity-90 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
                                    title="Click to view certificate photo"
                                  >
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.title || "Certificate"}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </button>
                                ) : (
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                      isCert
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                                    }`}
                                  >
                                    {isCert ? (
                                      <Award className="w-5 h-5" />
                                    ) : (
                                      <Trophy className="w-5 h-5" />
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-sm text-gray-900 dark:text-white leading-snug break-words">
                                      {item.title || item.name}
                                    </h5>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isCert
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
                                      }`}
                                    >
                                      {isCert ? "Certification" : "Achievement"}
                                    </span>
                                  </div>

                                  {item.issuedBy && (
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{item.issuedBy}</span>
                                    </p>
                                  )}

                                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap">
                                    {dateFormatted && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        <span>
                                          {isCert ? `Issued ${dateFormatted}` : dateFormatted}
                                        </span>
                                      </span>
                                    )}

                                    {expiryFormatted && (
                                      <span className="flex items-center gap-1 text-gray-400">
                                        <span>• Expires {expiryFormatted}</span>
                                      </span>
                                    )}

                                    {item.credentialId && (
                                      <span className="text-gray-500 dark:text-gray-400">
                                        • ID: <span className="font-mono">{item.credentialId}</span>
                                      </span>
                                    )}
                                  </div>

                                  {item.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 pt-1 leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}

                                  {linkUrl && (
                                    <div className="pt-1.5">
                                      <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>
                                          {isCert ? "Show Credential" : "View Details / Proof"}
                                        </span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isOwner && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCredential(item)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                                  title={`Delete ${isCert ? "Certificate" : "Achievement"}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {allItems.length > INITIAL_COUNT && (
                        <button
                          type="button"
                          onClick={() => setShowAllCerts((prev) => !prev)}
                          className="mt-3 text-md font-semibold text-gray-700 dark:text-gray-300 border-t border-gray-400 dark:border-gray-800 hover:cursor-pointer w-full transition-colors"
                        >
                          {showAllCerts ? (
                            <div className="pt-3 flex items-center justify-center gap-2">
                              <p>Show Less</p> <ListChevronsDownUp />
                            </div>
                          ) : (
                            <div className="pt-3 flex items-center justify-center gap-2">
                              <p>Show All ({allItems.length})</p> <ListChevronsUpDown />
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>


          </div>

          <aside className="flex flex-col gap-4 w-full lg:w-72 xl:w-80 shrink-0">
            {/* Basic Information Section starts here */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold text-gray-900 dark:text-white'>Basic Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setBasicInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5 text-gray-900 dark:text-white">Role</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5 text-gray-900 dark:text-white">Gender</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.gender}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contant Info section is here */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold text-gray-900 dark:text-white'>Contact Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setContactInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5 text-gray-900 dark:text-white">Email</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xl font-semibold tracking-wide mb-0.5 text-gray-900 dark:text-white">Contact No.</p>
                    <p className="text-md text-gray-700 dark:text-gray-300">{dbUser?.contactNo || "N\\A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info section containing URLs are here */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className='flex justify-between items-center'>
                <h4 className='text-xl font-bold text-gray-900 dark:text-white'>Additional Information</h4>
                {isOwner ? <button type="button" className="btn btn-secondary" onClick={() => setAdditionalInfoDrawerOpen(true)} title="Edit">
                  <PencilLine className='w-5 h-5 hover:cursor-pointer' />
                </button> : <></>}
              </div>
              <Divider className='mt-2 mb-2' />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.githubUrl ? <a href={profile?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                      <div className='flex items-center gap-2'><Github className='w-6 h-6 text-black dark:text-white' /> Github</div>
                    </a> : <div className='flex items-center gap-2'><Github className='w-6 h-6 text-black dark:text-white' /> N\A</div>}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.portfolioUrl ? <a href={profile?.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                      <div className='flex items-center gap-2'><Globe className='w-6 h-6 text-black dark:text-white' /> Portfolio</div>
                    </a> : <div className='flex items-center gap-2'><Globe className='w-6 h-6 text-black dark:text-white' /> N\A</div>}</div>
                  </div>
                </div>
                {
                  dbUser?.role === 'STUDENT' ? <>
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="text-xl text-gray-700 dark:text-gray-300">{profile?.resumeUrl ? <a href={profile?.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                          <div className='flex items-center gap-2'><FileUser className='w-6 h-6 text-black dark:text-white' /> Resume</div>
                        </a> : <div className='flex items-center gap-2'><FileUser className='w-6 h-6 text-black dark:text-white' /> N\A</div>}</div>
                      </div>
                    </div>
                  </> : <></>
                }
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* This handles the edit functionality of BASIC INFO */}
      <EditDrawer open={basicInfoDrawerOpen} onOpenChange={setBasicInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Basic Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Role</label>
            <input value={dbUser?.role} disabled className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200 readOnly'></input>
            <label>Gender</label>
            <GenderDropdown selectedGender={selectedGender} onGenderChange={setSelectedGender}></GenderDropdown>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setBasicInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBasicInfo} disabled={isSaving}>{
              isSaving ? "Saving changes..." : "Save"
            }</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This part handles the edit of CONTACT INFO */}
      <EditDrawer open={contactInfoDrawerOpen} onOpenChange={setContactInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Contact Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Email</label>
            <input value={dbUser?.email} disabled className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200 readOnly'></input>
            <label>Contact No</label>
            <input value={contactNo} onChange={(e) => setContactNo(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setContactInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditContactInfo} disabled={isSaving}>
              {
                isSaving ? "Saving changes..." : "Save"
              }
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This handles the edit of ADDITIONAL INFO section */}
      <EditDrawer open={additionalInfoDrawerOpen} onOpenChange={setAdditionalInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Additional Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Github URL</label>
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Portfolio URL</label>
            <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            {
              dbUser?.role === "STUDENT" ? <>
                <label>Resume URL</label>
                <input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
              </> : <></>
            }
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setAdditionalInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAdditionalInfo} disabled={isSaving}>{
              isSaving ? "Saving changes..." : "Save"
            }</Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {/* This section handles the profile info edit functionality like names, location etc. */}
      <EditDrawer open={editInfoDrawerOpen} onOpenChange={setEditInfoDrawerOpen} side="bottom">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Profile Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 flex-1 overflow-visible">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
            <label>Bio</label>
            <textarea ref={textareaRef} rows={1} value={bio} onChange={(e) => { setBio(e.target.value); handleInput(); }} onInput={handleInput} name="bio" id="bio" placeholder='Write about yourself' className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></textarea>
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className='signin-input w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all duration-200'></input>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditInfoDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleEditProfileInfo} disabled={isSaving}>
              {
                isSaving ? "Saving changes..." : "Save"
              }
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </EditDrawer>

      {profilePhotoModalOpen && (
        <ProfilePhotoEditModal
          onClose={() => setProfilePhotoModalOpen(false)}
          currentImage={dbUser?.profileImage}
          onSave={handleProfilePhotoSave}
        />
      )}

      {coverPhotoModalOpen && (
        <CoverPhotoEditModal
          onClose={() => setCoverPhotoModalOpen(false)}
          currentImage={dbUser?.coverImage}
          onSave={handleCoverPhotoSave}
        />
      )}

      {/* Add / Edit Job Modal */}
      <Modal
        isOpen={jobDrawerOpen}
        onClose={() => setJobDrawerOpen(false)}
        title={Boolean(profile?.currentCompany || profile?.currentPosition) ? "Edit Job Experience" : "Add Job Experience"}
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Job Position <span className="text-xs text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              placeholder="e.g. Software Engineer, Product Designer, Intern"
              className="signin-input w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Jobplace / Company <span className="text-xs text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="e.g. Google, Brain Station 23, IUT"
              className="signin-input w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={() => setJobDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditJobInfo} disabled={isSaving || (!currentPosition?.trim() && !currentCompany?.trim())}>
              {isSaving ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </div>
      </Modal>

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        dbUser={dbUser}
        onPostCreated={() => {
          setPostsRefreshKey((prev) => prev + 1);
        }}
      />

      {connectionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConnectionsModalTab("FOLLOWING")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors hover:cursor-pointer ${
                    connectionsModalTab === "FOLLOWING"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Following ({profileFollowingList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionsModalTab("FOLLOWERS")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors hover:cursor-pointer ${
                    connectionsModalTab === "FOLLOWERS"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Followers ({profileFollowersList.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setConnectionsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {loadingProfileConnections ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              ) : connectionsModalTab === "FOLLOWING" ? (
                profileFollowingList.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">
                    Not following anyone yet.
                  </p>
                ) : (
                  profileFollowingList.map((item) => (
                    <div
                      key={item.uid || item.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Link
                        href={`/profile/${item.uid}`}
                        onClick={() => setConnectionsModalOpen(false)}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700">
                          <Image
                            src={item.profileImage || user_placeholder}
                            alt={item.name || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate hover:underline">
                            {item.name || "User"}
                          </h5>
                          {item.role && (
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                              {item.role}
                            </span>
                          )}
                        </div>
                      </Link>
                      <Link
                        href={`/profile/${item.uid}`}
                        onClick={() => setConnectionsModalOpen(false)}
                        className="px-3 py-1 text-xs font-semibold border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )
              ) : profileFollowersList.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">
                  No followers yet.
                </p>
              ) : (
                profileFollowersList.map((item) => (
                  <div
                    key={item.uid || item.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <Link
                      href={`/profile/${item.uid}`}
                      onClick={() => setConnectionsModalOpen(false)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700">
                        <Image
                          src={item.profileImage || user_placeholder}
                          alt={item.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate hover:underline">
                          {item.name || "User"}
                        </h5>
                        {item.role && (
                          <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                            {item.role}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link
                      href={`/profile/${item.uid}`}
                      onClick={() => setConnectionsModalOpen(false)}
                      className="px-3 py-1 text-xs font-semibold border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <RequestMentorshipModal
        isOpen={requestMentorshipModalOpen}
        onClose={() => setRequestMentorshipModalOpen(false)}
        alumni={dbUser}
        onRequestSent={(data) => {
          setMentorshipRequestStatus("PENDING");
        }}
      />

      <Modal
        isOpen={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
        title="Manage Skills"
        size="md"
        overflow="visible"
      >
        <div className="space-y-4 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Select or Search Skills
            </label>
            <SkillsMultiSelect
              selectedOptions={editingSkills}
              setSelectedOptions={setEditingSkills}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setSkillsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveSkills(editingSkills)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Skills</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title={newCertCategory === "CERTIFICATE" ? "Add Certification" : "Add Achievement"}
        size="lg"
      >
        <form onSubmit={handleAddCertificateOrAchievement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewCertCategory("CERTIFICATE")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  newCertCategory === "CERTIFICATE"
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certification</span>
              </button>
              <button
                type="button"
                onClick={() => setNewCertCategory("ACHIEVEMENT")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  newCertCategory === "ACHIEVEMENT"
                    ? "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Achievement</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              {newCertCategory === "CERTIFICATE" ? "Certification Title *" : "Achievement Title *"}
            </label>
            <input
              type="text"
              value={newCertTitle}
              onChange={(e) => setNewCertTitle(e.target.value)}
              placeholder={
                newCertCategory === "CERTIFICATE"
                  ? "e.g. AWS Certified Solutions Architect Associate"
                  : "e.g. Champion - National Hackathon 2025"
              }
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                {newCertCategory === "CERTIFICATE"
                  ? "Issuing Organization *"
                  : "Issued By / Organization (Optional)"}
              </label>
              <input
                type="text"
                value={newCertIssuedBy}
                onChange={(e) => setNewCertIssuedBy(e.target.value)}
                placeholder={
                  newCertCategory === "CERTIFICATE"
                    ? "e.g. Amazon Web Services, Google, Coursera"
                    : "e.g. IEEE IUT Student Branch"
                }
                required={newCertCategory === "CERTIFICATE"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                {newCertCategory === "CERTIFICATE" ? "Issue Date *" : "Date Achieved (Optional)"}
              </label>
              <input
                type="date"
                value={newCertIssueDate}
                onChange={(e) => setNewCertIssueDate(e.target.value)}
                required={newCertCategory === "CERTIFICATE"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {newCertCategory === "CERTIFICATE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={newCertExpiryDate}
                  onChange={(e) => setNewCertExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Credential ID (Optional)
                </label>
                <input
                  type="text"
                  value={newCertCredentialId}
                  onChange={(e) => setNewCertCredentialId(e.target.value)}
                  placeholder="e.g. AWS-CERT-884920"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              {newCertCategory === "CERTIFICATE"
                ? "Credential Verification URL (Optional)"
                : "Achievement / Proof URL (Optional)"}
            </label>
            <input
              type="url"
              value={newCertCategory === "CERTIFICATE" ? newCertCredentialUrl : newAchieveUrl}
              onChange={(e) =>
                newCertCategory === "CERTIFICATE"
                  ? setNewCertCredentialUrl(e.target.value)
                  : setNewAchieveUrl(e.target.value)
              }
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              {newCertCategory === "CERTIFICATE"
                ? "Certificate Image / Document"
                : "Award / Achievement Picture"}
            </label>

            <input
              ref={certFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCertImageUpload}
              className="hidden"
              id="cert-image-file-input"
            />

            {newCertImageUrl ? (
              <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewCertImage({
                        url: newCertImageUrl,
                        title: newCertTitle || "Certificate Preview",
                      })
                    }
                    className="w-14 h-14 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 shrink-0 shadow-2xs hover:opacity-90 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group"
                    title="Click to view full image"
                  >
                    <Image
                      src={newCertImageUrl}
                      alt="Certificate preview"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      Image Uploaded & Attached
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {newCertImageUrl}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewCertImageUrl("");
                    if (certFileInputRef.current) certFileInputRef.current.value = "";
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="cert-image-file-input"
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                >
                  {isUploadingCertImage ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading certificate image...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 py-1">
                      <UploadCloud className="w-4 h-4 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      <span>Upload certificate or award photo</span>
                    </div>
                  )}
                  <span className="text-[11px] text-gray-400">PNG, JPG, JPEG or WEBP</span>
                </label>

                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    Or paste direct image URL
                  </span>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                </div>

                <input
                  type="url"
                  value={newCertImageUrl}
                  onChange={(e) => setNewCertImageUrl(e.target.value)}
                  placeholder="https://.../certificate.png"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newCertDescription}
              onChange={(e) => setNewCertDescription(e.target.value)}
              placeholder="Brief details regarding this certification or achievement..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setCertModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingCertImage || !newCertTitle.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add {newCertCategory === "CERTIFICATE" ? "Certificate" : "Achievement"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {previewCertImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPreviewCertImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {previewCertImage.title || "Certificate Preview"}
              </h4>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewCertImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewCertImage(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-[300px] max-h-[75vh] w-full bg-zinc-950 flex items-center justify-center p-3 overflow-auto">
              <img
                src={previewCertImage.url}
                alt={previewCertImage.title || "Certificate"}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}
