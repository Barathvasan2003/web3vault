/**
 * API endpoint to store and retrieve encrypted files by CID
 * This enables cross-device file sharing
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for hackathon (use database in production)
const fileStorage = new Map<string, string>();

/**
 * GET /api/files/[cid]
 * Download encrypted file by CID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const cid = params.cid;

        if (!cid) {
            return NextResponse.json(
                { error: 'CID is required' },
                { status: 400 }
            );
        }

        // Get from in-memory storage
        const encryptedData = fileStorage.get(cid);

        if (!encryptedData) {
            return NextResponse.json(
                { error: 'File not found. It may have expired or never been uploaded.' },
                { status: 404 }
            );
        }

        console.log(`✅ File retrieved for CID: ${cid}`);

        return NextResponse.json({
            cid,
            data: encryptedData,
            success: true
        });

    } catch (error: any) {
        console.error('Error retrieving file:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve file' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/files/[cid]
 * Upload encrypted file with CID
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { cid: string } }
) {
    try {
        const cid = params.cid;
        const body = await request.json();
        const { data } = body;

        if (!cid || !data) {
            return NextResponse.json(
                { error: 'CID and data are required' },
                { status: 400 }
            );
        }

        // Store in memory (use database in production)
        fileStorage.set(cid, data);

        console.log(`✅ File stored with CID: ${cid}`);
        console.log(`📊 Total files in storage: ${fileStorage.size}`);

        return NextResponse.json({
            cid,
            success: true,
            message: 'File stored successfully'
        });

    } catch (error: any) {
        console.error('Error storing file:', error);
        return NextResponse.json(
            { error: 'Failed to store file' },
            { status: 500 }
        );
    }
}
