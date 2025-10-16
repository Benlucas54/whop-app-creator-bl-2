import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';
import { whopStorage } from '@/lib/whop-storage';
import { headers } from 'next/headers';

// GET - List all stored experience files (admin only)
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const url = new URL(request.url);
    const experienceId = url.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    // Verify user is admin
    const { userId } = await whopSdk.verifyUserToken(headersList);
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!result.hasAccess || result.accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const files = await whopStorage.listExperienceFiles(apiKey);
    
    return NextResponse.json({ 
      success: true, 
      files,
      message: `Found ${files.length} stored experience files`
    });
  } catch (error) {
    console.error('Error listing experience files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete stored experience data (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const url = new URL(request.url);
    const experienceId = url.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    // Verify user is admin
    const { userId } = await whopSdk.verifyUserToken(headersList);
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!result.hasAccess || result.accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const success = await whopStorage.deleteExperienceData(experienceId, apiKey);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Deleted stored data for experience: ${experienceId}`
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete stored data' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting experience data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
