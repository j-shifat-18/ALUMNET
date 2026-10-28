"use client";

import React, { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import DatePicker from "@/components/ui/DatePicker";
import SkillsMultiSelect from "@/components/profile/SkillsMultiSelect";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import { Loader2, X, Briefcase, Building2, MapPin, Banknote, Calendar, GraduationCap, Link as LinkIcon, Check, ChevronDown } from "lucide-react";

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
  "CSE (Computer Science & Engineering)",
  "SWE (Software Engineering)",
  "EEE (Electrical & Electronic Engineering)",
  "ME (Mechanical Engineering)",
  "CEE (Civil & Environmental Engineering)",
  "IPE (Industrial & Production Engineering)",
  "BTM (BBA in Technology Management)",
];

function DepartmentMultiSelect({ selected = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = DEPARTMENTS.length > 0 && selected.length === DEPARTMENTS.length;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...DEPARTMENTS]);
    }
  };

  const toggleDept = (dept) => {
    if (selected.includes(dept)) {
      onChange(selected.filter((d) => d !== dept));
    } else {
      onChange([...selected, dept]);
    }
  };

  const removeDept = (dept, e) => {
    e.stopPropagation();
    onChange(selected.filter((d) => d !== dept));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] w-full pl-10 pr-9 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 transition-all flex flex-wrap items-center gap-1.5"
      >
        <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />

        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm py-0.5">Select departments (or All)</span>
        ) : (
          selected.map((dept) => {
            const shortCode = dept.split(" ")[0];
            return (
              <span
                key={dept}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
              >
                {shortCode}
                <button
                  type="button"
                  onClick={(e) => removeDept(dept, e)}
                  className="hover:text-red-500 rounded p-0.5 transition-colors cursor-pointer"
                  title={`Remove ${shortCode}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div
            onClick={toggleAll}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer text-xs font-bold border-b border-gray-100 dark:border-gray-800 mb-1 text-gray-900 dark:text-white"
          >
            <span>All Departments (Open to All)</span>
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                allSelected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-0.5">
            {DEPARTMENTS.map((dept) => {
              const isChecked = selected.includes(dept);
              return (
                <div
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <span>{dept}</span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JobFormContent({ jobToEdit, onClose, onSuccess }) {
  const isEditing = Boolean(jobToEdit);

  const [title, setTitle] = useState(() => jobToEdit?.title || "");
  const [company, setCompany] = useState(() => jobToEdit?.company || "");
  const [location, setLocation] = useState(() => jobToEdit?.location || "");
  const [workMode, setWorkMode] = useState(() => jobToEdit?.workMode || "IN_PERSON");
  const [jobType, setJobType] = useState(() => jobToEdit?.jobType || "FULL_TIME");
  const [departments, setDepartments] = useState(() => {
    if (Array.isArray(jobToEdit?.departments) && jobToEdit.departments.length > 0) {
      return jobToEdit.departments;
    }
    if (jobToEdit?.department) {
      if (jobToEdit.department === "All Departments") {
        return [...DEPARTMENTS];
      }
      return jobToEdit.department.split(",").map((d) => d.trim()).filter(Boolean);
    }
    return [];
  });
  const [skills, setSkills] = useState(() => {
    if (!Array.isArray(jobToEdit?.skills)) return [];
    return jobToEdit.skills.map((s) =>
      typeof s === "object" && s !== null
        ? s
        : { id: s, name: s, value: String(s).toLowerCase() }
    );
  });
  const [description, setDescription] = useState(() => jobToEdit?.description || "");
  const [requirements, setRequirements] = useState(() => jobToEdit?.requirements || "");
  const [salaryRange, setSalaryRange] = useState(() => jobToEdit?.salaryRange || "");
  const [applicationUrl, setApplicationUrl] = useState(() => jobToEdit?.applicationUrl || "");
  const [deadline, setDeadline] = useState(() =>
    jobToEdit?.deadline ? new Date(jobToEdit.deadline).toISOString().split("T")[0] : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
      const mappedSkills = Array.isArray(skills)
        ? skills.map((s) => (typeof s === "string" ? s : s.name || s.value || String(s)))
        : [];

      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || null,
        workMode,
        jobType,
        departments,
        department: departments.length > 0 ? departments.join(", ") : null,
        skills: mappedSkills,
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
              placeholder="e.g. Software Engineer"
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
              placeholder="e.g. Google or IUT"
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
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dhaka, Bangladesh"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Target Departments <span className="text-gray-400 normal-case">(Select one or more)</span>
          </label>
          <DepartmentMultiSelect selected={departments} onChange={setDepartments} />
        </div>
      </div>

      {/* Salary Range & Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Salary <span className="text-gray-400 normal-case">(Optional)</span>
          </label>
          <div className="relative">
            <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g. 50k - 70k BDT or $60k/yr"
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
            placeholder="Select deadline"
            minDate={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Application Link or Email */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Application Link / Contact Email <span className="text-gray-400 normal-case">(Optional)</span>
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            placeholder="https://... or jobs@company.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Skills & Technologies */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
          Key Skills & Technologies
        </label>
        <SkillsMultiSelect
          selectedOptions={skills}
          setSelectedOptions={setSkills}
          placeholder="Search technologies (e.g. React, Python)..."
        />
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
          placeholder="Describe responsibilities, perks, and team..."
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
          placeholder="Key qualifications and requirements..."
          className="w-full px-3.5 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
        />
      </div>

      {/* Footer */}
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
      title={isEditing ? "Edit Job Opportunity" : "Post a New Opportunity"}
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
