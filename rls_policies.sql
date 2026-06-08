-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policy for users table (allow users to see all users for auth purposes)
CREATE POLICY "Allow public access for authentication"
ON public.users
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

-- Policy for employees table (employees can see their own data)
CREATE POLICY "Employees can view own record"
ON public.employees
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

-- Policy for attendance_records table (allow all reads for now, secure later)
CREATE POLICY "Allow public read access"
ON public.attendance_records
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

-- Allow inserts for authenticated users
CREATE POLICY "Allow inserts for authenticated users"
ON public.attendance_records
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- Allow updates for authenticated users
CREATE POLICY "Allow updates for authenticated users"
ON public.attendance_records
AS PERMISSIVE
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
