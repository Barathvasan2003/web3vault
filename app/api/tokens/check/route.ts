import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, isTokenBurnedInDB } from '@/lib/db/postgres';

/**
 * GET /api/tokens/check?tokenId=xxx
 * Check if a token has been burned globally
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize database (creates tables if needed)
        await initializeDatabase();

        const searchParams = request.nextUrl.searchParams;
        const tokenId = searchParams.get('tokenId');

        if (!tokenId) {
            return NextResponse.json(
                { error: 'Missing tokenId parameter' },
                { status: 400 }
            );
        }

        // Check if token is burned
        const isBurned = await isTokenBurnedInDB(tokenId);

        return NextResponse.json({
            tokenId,
            isBurned,
            checkedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('❌ Check token API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
