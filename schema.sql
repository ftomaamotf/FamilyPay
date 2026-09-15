-- ==============================================================================
-- Schema for Global Multi-Tenant Family Fund SaaS (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Tenants / Families (صناديق العائلات حول العالم)
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    currency_code VARCHAR(10) DEFAULT 'IQD',
    currency_symbol VARCHAR(10) DEFAULT 'د.ع',
    monthly_budget NUMERIC(15, 2) DEFAULT 1000000.00,
    fund_pin VARCHAR(20) DEFAULT '9988',
    is_card_frozen BOOLEAN DEFAULT FALSE,
    is_balance_hidden BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users & Members (أصحاب الحسابات والإخوة)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    account_number VARCHAR(50) NOT NULL,
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(100) DEFAULT 'ماستر كي / Qi Card',
    password_hash VARCHAR(255) NOT NULL,
    avatar_color VARCHAR(20) DEFAULT '#10b981',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bank & Fund Cards (بطاقات الدفع والصناديق)
CREATE TABLE IF NOT EXISTS bank_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    card_holder VARCHAR(255) NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    is_sending_card BOOLEAN DEFAULT FALSE,
    is_frozen BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#059669',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Approved Commodities & Spending Fields (السلع والبنود المعتمدة لكل أخ)
CREATE TABLE IF NOT EXISTS approved_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    spending_limit NUMERIC(15, 2) DEFAULT 0.00,
    spent_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Money Requests (طلبات الأموال من الإخوة)
CREATE TABLE IF NOT EXISTS fund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES approved_fields(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Financial Transfers & History (سجل التحويلات والعمليات)
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_account_number VARCHAR(100) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    field_id UUID REFERENCES approved_fields(id) ON DELETE SET NULL,
    field_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    sending_card_id UUID REFERENCES bank_cards(id) ON DELETE SET NULL,
    sending_card_name VARCHAR(255),
    is_security_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Realtime Notifications (الإشعارات الحية)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_by UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
