-- Allow Admins to UPDATE any franchise (for Approval, Soft Delete, etc.)
CREATE POLICY "Admins can update any franchise" ON franchises
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Allow Admins to DELETE any franchise (for Permanent Deletion)
CREATE POLICY "Admins can delete any franchise" ON franchises
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
