const apiUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "https://school-mangment-backend.vercel.app/api/v1";
const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID ?? "";

export async function publicApi<T>(path: string): Promise<T | null> {
  try {
    const joiner = path.includes("?") ? "&" : "?";
    const response = await fetch(`${apiUrl}${path}${schoolId ? `${joiner}schoolId=${encodeURIComponent(schoolId)}` : ""}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch { return null; }
}

export type HomeData = { data: { school?: { nameBn: string; nameEn: string; eiin: string; address: string; foundedYear: string | null; logoUrl: string | null; phone: string | null; email: string | null }; stats?: { students: number; teachers: number }; teachers: Array<{ id: string; nameBn: string; username: string | null }>; meritoriousStudents: Array<{ id: string; nameBn: string; registrationNumber: string | null; photoUrl: string | null; totalMarks: number | null; gpa: string | null }>; blocks: Array<{ key: string; titleBn: string; isEnabled: boolean; orderIndex: number }>; menuItems: Array<{ id: string; labelBn: string; href: string; isVisible: boolean; orderIndex: number }>; banners: Array<{ imageUrl: string; titleBn: string; captionBn: string | null; href: string | null }>; pages: Array<{ id: string; slug: string; titleBn: string; body: string }>; notices: Array<{ id: string; titleBn: string; category: string; isPinned: boolean; createdAt: string; details: string }>; news: Array<{ id: string; titleBn: string; summary: string; imageUrl: string | null; publishedAt: string | null }>; events: Array<{ id: string; titleBn: string; details: string; venue: string | null; startsAt: string }>; services: Array<{ id: string; titleBn: string; icon: string }>; serviceLinks: Array<{ id: string; serviceBoxId: string; labelBn: string; href: string }>; galleries: Array<{ id: string; titleBn: string; coverUrl: string | null }>; downloads: Array<{ id: string; titleBn: string; fileUrl: string; category: string }>; links: Array<{ id: string; labelBn: string; url: string }>; quotes: Array<{ textBn: string; authorBn: string | null }>; messages: Array<{ personNameBn: string; designationBn: string; body: string; photoUrl: string | null }> } };

/** GET /public/teachers */
export type PublicTeacher = {
  id: string;
  nameBn: string;
  designationBn: string | null;
  /** Comma-joined distinct assigned subjects; may be "". */
  subjectBn: string;
  photoUrl: string | null;
  qualificationBn: string | null;
  joiningOrder: number;
};
export type PublicTeachersResponse = { data: PublicTeacher[] };

/** GET /public/students (+ optional classId/sectionId filters) */
export type PublicStudent = {
  id: string;
  nameBn: string;
  classId: string | null;
  classBn: string | null;
  sectionId: string | null;
  sectionBn: string | null;
  roll: number | null;
  registrationNumber: string | null;
};
export type PublicStudentsResponse = {
  data: PublicStudent[];
  counts: Array<{ classId: string | null; classBn: string | null; count: number }>;
};

/** GET /public/content/holidays */
export type HolidayRow = {
  id: string;
  titleBn: string;
  fromDate: string;
  toDate: string;
  dayCount: number;
};
export type HolidaysResponse = { data: HolidayRow[] };

/** GET /public/content/videos */
export type VideoRow = {
  id: string;
  titleBn: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  publishedAt: string | null;
};
export type VideosResponse = { data: VideoRow[] };

/** GET /public/content/committee */
export type CommitteeRow = {
  id: string;
  nameBn: string;
  roleBn: string;
  photoUrl: string | null;
  orderIndex: number;
};
export type CommitteeResponse = { data: CommitteeRow[] };

/** GET /public/content/galleries — albums now embed items */
export type GalleryItemRow = {
  id: string;
  galleryId: string;
  imageUrl: string;
  captionBn: string | null;
  orderIndex: number;
};
export type GalleryRow = {
  id: string;
  titleBn: string;
  coverUrl: string | null;
  descriptionBn?: string | null;
  items: GalleryItemRow[];
};
export type GalleriesResponse = { data: GalleryRow[] };

/** GET /public/exams */
export type PublicExam = {
  id: string;
  nameBn: string;
  sessionYear: string | number | null;
  classId: string | null;
  classNameBn: string | null;
  publishAt: string | null;
  status: "published" | "scheduled";
};
export type PublicExamsResponse = { data: PublicExam[] };

/** GET /public/results */
export type PublicResultRow = {
  registrationNumber: string | null;
  nameBn: string;
  classId: string | null;
  totalMarks: number;
  gpa: string;
  letter: string;
  meritPosition: number | null;
  isPassed: boolean;
};
export type PublicResultsResponse = { data: PublicResultRow[]; examId: string | null };

/** GET /public/routine?type=class */
export type RoutineClassRow = {
  id: string;
  dayOfWeek: number;
  period: number;
  room: string | null;
  classId: string;
  classNameBn: string | null;
  sectionId: string | null;
  sectionNameBn: string | null;
  subjectId: string | null;
  subjectNameBn: string | null;
  teacherId: string | null;
  teacherNameBn: string | null;
};
export type RoutineClassResponse = { data: RoutineClassRow[] };

/** GET /public/routine?type=exam */
export type RoutineExamRow = {
  examId: string;
  nameBn: string;
  classId: string | null;
  classNameBn: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isPublished: boolean;
  publishAt: string | null;
  subjects: string[];
};
export type RoutineExamResponse = { data: RoutineExamRow[] };
