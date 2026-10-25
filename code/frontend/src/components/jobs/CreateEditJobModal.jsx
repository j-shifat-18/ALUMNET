"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import DatePicker from "@/components/ui/DatePicker";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import { Loader2, X, Briefcase, Building2, MapPin, Banknote, Calendar, GraduationCap, Link as LinkIcon, Check } from "lucide-react";

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REFERRAL", label: "Alumni Referral" },
  { value: "RESEARCH", label: "Research Position" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contract" },
];

const WORK_MODES = [
  { value: "IN_PERSON", label: "In-Person" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const DEPARTMENTS = [
  "All Departments",
  "CSE (Computer Science & Engineering)",
  "SWE (Software Engineering)",
  "EEE (Electrical & Electronic Engineering)",
  "ME (Mechanical Engineering)",
  "CEE (Civil & Environmental Engineering)",
  "IPE (Industrial & Production Engineering)",
  "BTM (BBA in Technology Management)",
];

function JobFormContent({ jobToEdit, onClose, onSuccess }) {
  const isEditing = Boolean(jobToEdit);

  const [title, setTitle] = useState(() => jobToEdit?.title || "");
  const [company, setCompany] = useState(() => jobToEdit?.company || "");
  const [location, setLocation] = useState(() => jobToEdit?.location || "");
  const [workMode, setWorkMode] = useState(() => jobToEdit?.workMode || "IN_PERSON");
  const [jobType, setJobType] = useState(() => jobToEdit?.jobType || "FULL_TIME");
  const [department, setDepartment] = useState(() => jobToEdit?.department || "");
  const [skills, setSkills] = useState(() => (Array.isArray(jobToEdit?.skills) ? jobToEdit.skills : []));
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState(() => jobToEdit?.description || "");
  const [requirements, setRequirements] = useState(() => jobToEdit?.requirements || "");
  const [salaryRange, setSalaryRange] = useState(() => jobToEdit?.salaryRange || "");
  const [applicationUrl, setApplicationUrl] = useState(() => jobToEdit?.applicationUrl || "");
  const [deadline, setDeadline] = useState(() =>
    jobToEdit?.deadline ? new Date(jobToEdit.deadline).toISOString().split("T")[0] : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(/^,+|,+$/g, "");
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Job title is required.");
      return;
    }
    if (!company.trim()) {
      setFormError("Company name is required.");
      return;
    }
    if (!description.trim()) {
      setFormError("Job description is required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || null,
        workMode,
        jobType,
        department: department === "All Departments" ? null : department.trim() || null,
        skills,
        description: description.trim(),
        requirements: requirements.trim() || null,
        salaryRange: salaryRange.trim() || null,
        applicationUrl: applicationUrl.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      if (isEditing) {
        const res = await axiosInstance.patch(`/api/v1/jobs/${jobToEdit.id}`, payload);
        Swal.fire({
          title: "Updated!",
          text: "Job post has been updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onSuccess?.(res.data?.data);
      } else {
        const res = await axiosInstance.post("/api/v1/jobs", payload);
        Swal.fire({
          title: "Posted!",
          text: "Job opportunity posted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onSuccess?.(res.data?.data);
      }

      onClose();
    } catch (err) {
      console.error("Error saving job post:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save job post. Please try again.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {formError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Title and Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer, Machine Learning Intern"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Company / Institution <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Brain Station 23, IUT"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
        </div>
      </div>

      {/* Job Type & Work Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Opportunity Type <span className="text-red-500">*</span>
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Work Mode <span className="text-red-500">*</span>
          </label>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {WORK_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Location / City
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dhaka, Bangladesh or Remote Worldwide"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Target Department
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. CSE, SWE, EEE, or All"
              list="department-suggestions"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <datalist id="department-suggestions">
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Salary Range & Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Salary / Compensation <span className="text-gray-400 normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g. 50k - 70k BDT, $60k/yr, or Negotiable"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Application Deadline <span className="text-gray-400 normal-case">(Optional)</span>
          </label>
          <DatePicker
            value={deadline}
            onChange={(val) => setDeadline(val)}
            placeholder="Select deadline date"
            minDate={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Application Link or Email */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Application Link or Contact Email <span className="text-gray-400 normal-case">(Optional)</span>
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            placeholder="e.g. https://careers.company.com/apply or jobs@company.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Skills Tag Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Key Skills & Technologies <span className="text-gray-400 normal-case">(Press Enter to add tag)</span>
        </label>
        <div className="p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
              >
                #{skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="Type skill tag (e.g. React, Next.js, Python, Figma) and press Enter..."
            className="w-full px-2 py-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the opportunity, core responsibilities, team environment, perks..."
          className="w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
          required
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Requirements & Qualifications <span className="text-gray-400 normal-case">(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g. 1+ years experience, solid understanding of DS & Algorithms, familiarity with Docker..."
          className="w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isEditing ? "Update Job Post" : "Post Opportunity"}</span>
        </button>
      </div>
    </form>
  );
}

export default function CreateEditJobModal({
  isOpen,
  onClose,
  jobToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(jobToEdit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Job Opportunity" : "Post a New Opportunity / Referral"}
      size="lg"
    >
      {isOpen && (
        <JobFormContent
          key={jobToEdit?.id || "create"}
          jobToEdit={jobToEdit}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
