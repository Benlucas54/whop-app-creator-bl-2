import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';
import { headers } from 'next/headers';

interface VideoData {
  id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
}

interface ExperienceData {
  title: string;
  subtitle: string;
  videos: VideoData[];
}

// GET - Retrieve experience data
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const url = new URL(request.url);
    const experienceId = url.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    // Verify user access
    const { userId } = await whopSdk.verifyUserToken(headersList);
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!result.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For now, we'll use a simple approach since Whop SDK doesn't expose metadata
    // In a production app, you might want to use a separate database or storage solution
    try {
      // This is a placeholder - in a real implementation, you'd store data in a database
      // or use Whop's storage API if available
      console.log('Checking for stored data for experience:', experienceId);
    } catch (error) {
      console.log('No stored data found, returning defaults');
    }

    // Return default data if no stored data found
    const defaultData: ExperienceData = {
      title: 'Welcome to Your Video Experience',
      subtitle: 'Share, react, and engage with videos like never before',
      videos: [
        {
          id: '1',
          title: 'Introduction to Whop',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: '3:32',
          createdAt: new Date('2024-01-15').toISOString(),
        },
        {
          id: '2',
          title: 'Getting Started with Next.js',
          url: 'https://www.youtube.com/embed/DGQwd1_Apzc',
          duration: '10:45',
          createdAt: new Date('2024-02-20').toISOString(),
        },
        {
          id: '3',
          title: 'Tailwind CSS Basics',
          url: 'https://www.youtube.com/embed/pfaSUYaSgRo',
          duration: '7:18',
          createdAt: new Date('2024-03-01').toISOString(),
        },
      ],
    };

    return NextResponse.json(defaultData);
  } catch (error) {
    console.error('Error retrieving experience data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Save experience data
export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const url = new URL(request.url);
    const experienceId = url.searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    // Verify user access and check if admin
    const { userId } = await whopSdk.verifyUserToken(headersList);
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!result.hasAccess || result.accessLevel !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data: ExperienceData = await request.json();

    // Store data - for now we'll use a simple approach
    // In a production app, you'd use a proper database or storage solution
    try {
      // This is a placeholder - in a real implementation, you'd save to a database
      console.log('Saving data for experience:', experienceId, data);
      
      // For now, we'll just return success
      // The data will persist in the client-side state during the session
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error('Error saving experience data:', error);
      return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving experience data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
