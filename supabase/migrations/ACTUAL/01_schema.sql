-- FILE: 01_schema.sql
-- Defines all custom types and tables for the database.

-- Create custom enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TYPE public.ncc_wing_type AS ENUM ('air');
CREATE TYPE public.experience_type AS ENUM ('placement', 'internship');
CREATE TYPE public.ncc_certification AS ENUM ('A', 'B','C','Other','N/D');

-- Create Students table
CREATE TABLE public.students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role app_role NOT NULL DEFAULT 'student',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    branch VARCHAR(100),
    year INT,
    roll_no TEXT UNIQUE,
    address TEXT,
    phone_number VARCHAR(15),
    parents_phone_number VARCHAR(15),
    aadhaar_number VARCHAR(12) UNIQUE,
    pan_number VARCHAR(10) UNIQUE,
    account_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create NCC_Details table
CREATE TABLE public.ncc_details (
    ncc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
    ncc_wing ncc_wing_type NOT NULL DEFAULT 'air',
    regimental_number VARCHAR(50) UNIQUE,
    my_ncc_certification ncc_certification NOT NULL DEFAULT 'N/D', 
    camps_attended INT,
    awards_received_in_national_camp INT,
    enrollment_date DATE,
    cadet_rank VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Placements_Internships table
CREATE TABLE public.placements_internships (
    experience_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(student_id) ON DELETE CASCADE NOT NULL,
    experience experience_type NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);