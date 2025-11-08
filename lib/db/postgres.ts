import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Get PostgreSQL connection pool (Railway database)
 * Uses DATABASE_URL environment variable
 */
export function getPool(): Pool {
    if (!pool) {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        pool = new Pool({
            connectionString: databaseUrl,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false // Railway requires SSL in production
            } : undefined,
            max: 10, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        console.log('🗄️ PostgreSQL pool created');
    }

    return pool;
}

/**
 * Initialize database schema (create tables if they don't exist)
 */
export async function initializeDatabase(): Promise<void> {
    const pool = getPool();

    try {
        // Create burned_tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS burned_tokens (
                token_id VARCHAR(255) PRIMARY KEY,
                burned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                burned_by VARCHAR(255),
                metadata JSONB
            );
        `);

        // Create index for faster lookups
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_burned_at 
            ON burned_tokens(burned_at);
        `);

        console.log('✅ Database tables initialized');
    } catch (error: any) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
}

/**
 * Check if a token is burned
 */
export async function isTokenBurnedInDB(tokenId: string): Promise<boolean> {
    const pool = getPool();

    try {
        const result = await pool.query(
            'SELECT token_id FROM burned_tokens WHERE token_id = $1',
            [tokenId]
        );

        return result.rows.length > 0;
    } catch (error: any) {
        console.error('❌ Failed to check token burn status:', error.message);
        // If DB is down, fail open (don't block access)
        return false;
    }
}

/**
 * Mark a token as burned
 */
export async function burnTokenInDB(
    tokenId: string,
    burnedBy?: string,
    metadata?: any
): Promise<boolean> {
    const pool = getPool();

    try {
        await pool.query(
            `INSERT INTO burned_tokens (token_id, burned_by, metadata) 
             VALUES ($1, $2, $3)
             ON CONFLICT (token_id) DO NOTHING`,
            [tokenId, burnedBy || 'anonymous', metadata ? JSON.stringify(metadata) : null]
        );

        console.log(`🔥 Token ${tokenId} burned in database`);
        return true;
    } catch (error: any) {
        console.error('❌ Failed to burn token:', error.message);
        return false;
    }
}

/**
 * Get all burned tokens (for debugging)
 */
export async function getAllBurnedTokens(): Promise<any[]> {
    const pool = getPool();

    try {
        const result = await pool.query(
            'SELECT * FROM burned_tokens ORDER BY burned_at DESC LIMIT 100'
        );

        return result.rows;
    } catch (error: any) {
        console.error('❌ Failed to get burned tokens:', error.message);
        return [];
    }
}

/**
 * Cleanup old burned tokens (optional - keep last 30 days)
 */
export async function cleanupOldBurnedTokens(): Promise<number> {
    const pool = getPool();

    try {
        const result = await pool.query(
            `DELETE FROM burned_tokens 
             WHERE burned_at < NOW() - INTERVAL '30 days'`
        );

        const deletedCount = result.rowCount || 0;
        console.log(`🧹 Cleaned up ${deletedCount} old burned tokens`);
        return deletedCount;
    } catch (error: any) {
        console.error('❌ Failed to cleanup tokens:', error.message);
        return 0;
    }
}
