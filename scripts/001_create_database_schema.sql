-- Create the main tables for sentiment analysis app

-- Comments table to store social media comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', 'instagram', 'reddit', etc.
  platform_post_id VARCHAR(255), -- Original post ID from the platform
  author_username VARCHAR(255),
  author_display_name VARCHAR(255),
  posted_at TIMESTAMP WITH TIME ZONE,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language_code VARCHAR(10) DEFAULT 'en',
  translated_content TEXT, -- For multilingual support
  metadata JSONB DEFAULT '{}', -- Store platform-specific data (likes, shares, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sentiment analysis results table
CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  sentiment VARCHAR(20) NOT NULL, -- 'positive', 'negative', 'neutral'
  confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  emotions JSONB, -- Store detailed emotion analysis (e.g., {"joy":0.75,"anger":0.10})
  keywords TEXT[], -- Array of extracted keywords
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_version VARCHAR(50) DEFAULT 'groq-v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics/hashtags table for categorization
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for comment-topic relationships
CREATE TABLE IF NOT EXISTS comment_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  relevance_score NUMERIC(4,3) DEFAULT 1.000 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, topic_id)
);

-- Analytics aggregation table for performance
CREATE TABLE IF NOT EXISTS sentiment_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform VARCHAR(50),
  topic_id UUID REFERENCES topics(id),
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  avg_confidence NUMERIC(4,3) CHECK (avg_confidence >= 0 AND avg_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, platform, topic_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_platform ON comments(platform);
CREATE INDEX IF NOT EXISTS idx_comments_posted_at ON comments(posted_at);
CREATE INDEX IF NOT EXISTS idx_comments_language ON comments(language_code);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_comment_id ON sentiment_analysis(comment_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_sentiment ON sentiment_analysis(sentiment);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_analyzed_at ON sentiment_analysis(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_comment_topics_comment_id ON comment_topics(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_topics_topic_id ON comment_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_summary_date ON sentiment_summary(date);
CREATE INDEX IF NOT EXISTS idx_sentiment_summary_platform ON sentiment_summary(platform);
CREATE INDEX IF NOT EXISTS idx_sentiment_summary_composite ON sentiment_summary(date, platform, topic_id);

-- Insert some default topics
INSERT INTO topics (name, description) VALUES 
  ('General', 'General discussion and comments'),
  ('Product Feedback', 'Comments about products and services'),
  ('Customer Support', 'Support-related discussions'),
  ('Marketing', 'Marketing and promotional content'),
  ('Brand Mention', 'Direct brand mentions and references')
ON CONFLICT (name) DO NOTHING;
