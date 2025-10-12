-- FILE: 01_schema.sql
-- Defines all custom types and tables for the database.

-- Create custom enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TYPE public.ncc_wing_type AS ENUM ('air');
CREATE TYPE public.experience_type AS ENUM ('placement', 'internship');
CREATE TYPE public.ncc_certification AS ENUM ('A', 'B','C','Other','N/D');

-- Create Students table
CREATE TABLE public.placements_internships (
  experience_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  experience experience_type NOT NULL
  company_name character varying NOT NULL,
  role character varying,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT placements_internships_pkey PRIMARY KEY (experience_id),
  CONSTRAINT placements_internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.students (
  student_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  branch character varying,
  year integer,
  address text,
  phone_number character varying,
  parents_phone_number character varying,
  aadhaar_number character varying UNIQUE,
  pan_number character varying UNIQUE,
  account_number character varying,
  created_at timestamp with time zone DEFAULT now(),
  roll_no text UNIQUE,
  CONSTRAINT students_pkey PRIMARY KEY (student_id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'student'::app_role,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);