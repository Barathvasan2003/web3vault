import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, burnTokenInDB } from '@/lib/db/postgres';

/**
 * POST /api/tokens/burn
 * Mark a token as burned globally (Railway PostgreSQL)
 */
export async function POST(request: NextRequest) {
    try {
        // Initialize database (creates tables if needed)
        await initializeDatabase();

        const body = await request.json();
        const { tokenId, burnedBy, metadata } = body;

        if (!tokenId) {
            return NextResponse.json(
                { error: 'Missing tokenId' },
                { status: 400 }
            );
        }

        // Burn token in database
        const success = await burnTokenInDB(tokenId, burnedBy, metadata);

        if (success) {
            return NextResponse.json({
                success: true,
                message: 'Token burned successfully',
                tokenId,
                burnedAt: new Date().toISOString()
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to burn token' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('❌ Burn token API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
