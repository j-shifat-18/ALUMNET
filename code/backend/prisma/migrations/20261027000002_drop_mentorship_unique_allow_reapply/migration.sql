-- Drop the unique constraint on (studentId, alumniId) so students can
-- re-apply for mentorship after a previous request was ENDED or REJECTED.
-- Application-level logic (findFirst with status IN [PENDING, ACCEPTED])
-- prevents genuine duplicates.

DROP INDEX IF EXISTS "MentorshipRequest_studentId_alumniId_key";
