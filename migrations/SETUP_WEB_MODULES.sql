-- Create public.web_leads Table
CREATE TABLE IF NOT EXISTS public.web_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_interested TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Converted', 'Spam')) NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create public.blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT DEFAULT 'General' NOT NULL,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')) NOT NULL,
    read_time INTEGER DEFAULT 5 NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create public.testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    company TEXT,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.web_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Enable permissive RLS for CRM operations (authenticated users can read and write all marketing data)
DROP POLICY IF EXISTS "Web Leads Permissive Access" ON public.web_leads;
CREATE POLICY "Web Leads Permissive Access" ON public.web_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Web Leads Anon Insert" ON public.web_leads;
CREATE POLICY "Web Leads Anon Insert" ON public.web_leads FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Blogs Permissive Access" ON public.blogs;
CREATE POLICY "Blogs Permissive Access" ON public.blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Blogs Public Read" ON public.blogs;
CREATE POLICY "Blogs Public Read" ON public.blogs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Testimonials Permissive Access" ON public.testimonials;
CREATE POLICY "Testimonials Permissive Access" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Testimonials Public Read" ON public.testimonials;
CREATE POLICY "Testimonials Public Read" ON public.testimonials FOR SELECT TO anon USING (true);
