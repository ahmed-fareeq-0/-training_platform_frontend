// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = unknown> {
          success: boolean;
          message?: string;
          data: T;
          errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
          success: boolean;
          message?: string;
          data: T[];
          pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    totalPages: number;
          };
}

// ==========================================
// USER & AUTH TYPES
// ==========================================

export enum UserRole {
          SUPER_ADMIN = 'super_admin',
          MANAGER = 'manager',
          TRAINER = 'trainer',
          TRAINEE = 'trainee',
}

export interface User {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          role: UserRole;
          profile_image?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
}

export interface AuthTokens {
          accessToken: string;
          refreshToken: string;
}

export interface LoginResponse {
          user: User;
          accessToken: string;
          refreshToken: string;
}

// ==========================================
// ENUMS
// ==========================================

export enum BookingStatus {
          PENDING_REVIEW = 'pending_review',
          PENDING = 'pending',
          CONFIRMED = 'confirmed',
          CANCELLED = 'cancelled',
          ATTENDED = 'attended',
          NO_SHOW = 'no_show',
          PAID = 'paid',
}

export enum WorkshopStatus {
          DRAFT = 'draft',
          SCHEDULED = 'scheduled',
          ONGOING = 'ongoing',
          COMPLETED = 'completed',
          CANCELLED = 'cancelled',
}



export enum AttendanceStatus {
          PRESENT = 'present',
          ABSENT = 'absent',
          EXCUSED = 'excused',
}

export interface WorkshopAttendance {
          id: string;
          workshop_id: string;
          trainee_id: string;
          date: string;
          status: AttendanceStatus;
          notes?: string;
          recorded_by?: string;
          created_at: string;
          updated_at: string;
}

export interface DailyAttendanceRecord {
          trainee_id: string;
          full_name: string;
          email: string;
          profile_image?: string;
          booking_id: string;
          attendance_status?: AttendanceStatus;
          attendance_notes?: string;
}

export enum NotificationType {
          BOOKING_CREATED = 'booking_created',
          BOOKING_CONFIRMED = 'booking_confirmed',
          BOOKING_CANCELLED = 'booking_cancelled',
          BOOKING_ATTENDED = 'booking_attended',
          BOOKING_PAID = 'booking_paid',
          WORKSHOP_APPROVED = 'workshop_approved',
          WORKSHOP_REJECTED = 'workshop_rejected',
          ENROLLMENT_APPROVED = 'enrollment_approved',
          ENROLLMENT_REJECTED = 'enrollment_rejected',
}

export * from './manager.types';

// ==========================================
// DOMAIN MODELS
// ==========================================

export interface Specialization {
          id: string;
          name_ar: string;
          name_en: string;
          description_ar?: string;
          description_en?: string;
          icon?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
}

export interface Workshop {
          id: string;
          title_ar: string;
          title_en: string;
          description_ar?: string;
          description_en?: string;
          specialization_id: string;
          trainer_id: string;
          price: number;
          total_seats: number;
          duration_hours: number;
          location_ar?: string;
          location_en?: string;
          location_details?: string;
          start_date: string;
          end_date: string;
          session_start_time?: string;
          session_end_time?: string;
          status: WorkshopStatus;
          is_approved: boolean | null;
          cover_image?: string;
          requires_approval?: boolean;
          created_at: string;
          updated_at: string;
          // Joined fields
          specialization?: Specialization;
          trainer?: Trainer;
          trainer_name?: string;
          trainer_email?: string;
          trainer_avatar?: string;
          trainer_bio_ar?: string;
          trainer_bio_en?: string;
          trainer_type?: string;
          academic_degree?: string;
          academic_specialization?: string;
          academic_title?: string;
          job_title?: string;
          core_skills?: string;
          trainer_qualifications?: string;
          trainer_experience_years?: number;
}

export interface Booking {
          id: string;
          workshop_id: string;
          user_id: string;
          seat_number: number;
          status: BookingStatus;
          amount: number;
          attended_at?: string;
          payment_confirmed_at?: string;
          payment_confirmed_by?: string;
          created_at: string;
          updated_at: string;
          // Joined
          workshop?: Workshop;
          user?: User;
}

export enum TrainerType {
          PROFESSIONAL = 'professional',
          UNIVERSITY_PROFESSOR = 'university_professor',
}

export interface Trainer {
          id: string;
          user_id: string;
          bio?: string;
          bio_ar?: string;
          bio_en?: string;
          qualifications?: string;
          specialization_id: string;
          trainer_type?: TrainerType | string;
          academic_degree?: string;
          academic_specialization?: string;
          academic_title?: string;
          job_title?: string;
          core_skills?: string;
          experience_years?: number;
          years_of_experience?: number;
          is_approved: boolean;
          approved_by?: string;
          approved_at?: string;
          created_at: string;
          updated_at: string;
          user?: User;
          specialization?: Specialization;
          full_name?: string; // Appended by join for approved endpoint
}

export interface Notification {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read: boolean;
          metadata?: Record<string, unknown>;
          created_at: string;
}

export interface Review {
          id: string;
          workshop_id: string;
          user_id: string;
          rating: number;
          trainer_rating: number;
          comment?: string;
          created_at: string;
          updated_at: string;
          user?: User;
          workshop?: Workshop;
}

export interface RevenueStats {
          expected_revenue: number;
          actual_revenue: number;
          collection_rate: number;
          no_show_rate: number;
          total_bookings: number;
          confirmed_bookings: number;
          paid_bookings: number;
          no_show_bookings: number;
}

// ==========================================
// COURSE TYPES
// ==========================================

export enum CourseLevel {
          BEGINNER = 'beginner',
          INTERMEDIATE = 'intermediate',
          ADVANCED = 'advanced',
}

export enum EnrollmentStatus {
          PENDING_REVIEW = 'pending_review',
          PENDING_PAYMENT = 'pending_payment',
          ACTIVE = 'active',
          COMPLETED = 'completed',
          EXPIRED = 'expired',
          CANCELLED = 'cancelled',
          REJECTED = 'rejected',
}

export enum RequirementType {
          DOCUMENT = 'document',
          PREREQUISITE_COURSE = 'prerequisite_course',
          PREREQUISITE_WORKSHOP = 'prerequisite_workshop',
          MANAGER_APPROVAL = 'manager_approval',
          CUSTOM = 'custom',
}

export interface TrainingRequirement {
          id: string;
          training_type: 'course' | 'workshop';
          training_id: string;
          requirement_type: RequirementType;
          label_ar: string;
          label_en: string;
          description_ar?: string;
          description_en?: string;
          prerequisite_id?: string;
          is_required: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
}

export interface EnrollmentRequirement {
          id: string;
          enrollment_type: 'course' | 'workshop';
          enrollment_id: string;
          requirement_id: string;
          document_url?: string;
          is_satisfied: boolean;
          notes?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          created_at: string;
          updated_at: string;
          // Joined
          requirement?: TrainingRequirement;
}

export interface CourseLesson {
          id: string;
          section_id: string;
          title_ar: string;
          title_en: string;
          lesson_type: 'video' | 'pdf' | 'text';
          media_url?: string;
          duration_seconds: number;
          lesson_order: number;
          is_preview: boolean;
          created_at: string;
          updated_at: string;
}

export interface CourseSection {
          id: string;
          course_id: string;
          title_ar: string;
          title_en: string;
          section_order: number;
          lessons?: CourseLesson[];
          created_at: string;
          updated_at: string;
}

export interface Course {
          id: string;
          title_ar: string;
          title_en: string;
          description_ar?: string;
          description_en?: string;
          trainer_id: string;
          specialization_id: string;
          price: number;
          cover_image?: string;
          preview_video_url?: string;
          level: CourseLevel;
          language: string;
          total_duration_minutes: number;
          is_published: boolean;
          is_approved: boolean | null;
          is_active: boolean;
          requires_approval?: boolean;
          created_at: string;
          updated_at: string;
          // Joined data
          trainer_name?: string;
          trainer_avatar?: string;
          trainer_bio_ar?: string;
          trainer_bio_en?: string;
          trainer_type?: string;
          academic_degree?: string;
          academic_specialization?: string;
          academic_title?: string;
          job_title?: string;
          core_skills?: string;
          trainer_experience_years?: number;
          trainer_qualifications?: string;
          specialization_name_ar?: string;
          specialization_name_en?: string;
          specialization_icon?: string;
          enrolled_count?: number;
          sections?: CourseSection[];
}

export interface CourseEnrollment {
          id: string;
          course_id: string;
          user_id: string;
          status: EnrollmentStatus;
          amount_paid: number;
          payment_proof?: string;
          payment_method?: string;
          confirmed_by?: string;
          confirmed_at?: string;
          created_at: string;
          updated_at: string;
          // Joined
          title_ar?: string;
          title_en?: string;
          cover_image?: string;
          price?: number;
          level?: string;
          total_duration_minutes?: number;
          trainer_name?: string;
          // For admin view
          course_title_ar?: string;
          course_title_en?: string;
          user_name?: string;
          user_email?: string;
          user_phone?: string;
}

