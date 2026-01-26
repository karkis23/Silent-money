-- Create the income_idea_reviews table
CREATE TABLE IF NOT EXISTS income_idea_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    idea_id UUID REFERENCES income_ideas(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure a user can only review an idea once
    UNIQUE(user_id, idea_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE income_idea_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read reviews
CREATE POLICY "Anyone can view reviews" 
ON income_idea_reviews FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert their own reviews
CREATE POLICY "Users can create their own reviews" 
ON income_idea_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON income_idea_reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON income_idea_reviews FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function to update the average rating on income_ideas (if we want to cache it)
-- For now, we can calculate it on the fly, but adding a trigger is better for performance later.
