import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';
import { whopStorage, type ExperienceData } from '@/lib/whop-storage';
import { headers } from 'next/headers';

// Types are now imported from whop-storage.ts

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

    // Try to retrieve stored data from Whop storage
    try {
      const apiKey = process.env.WHOP_API_KEY;
      if (!apiKey) {
        console.log('No WHOP_API_KEY found, returning defaults');
      } else {
        const storedData = await whopStorage.getExperienceData(experienceId, apiKey);
        if (storedData) {
          console.log('Retrieved stored data for experience:', experienceId);
          return NextResponse.json(storedData);
        }
      }
    } catch (error) {
      console.log('No stored data found, returning defaults:', error);
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

    // Store data using Whop storage
    try {
      const apiKey = process.env.WHOP_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'Storage not configured' }, { status: 500 });
      }

      const success = await whopStorage.saveExperienceData(experienceId, data, apiKey);
      
      if (success) {
        console.log('Successfully saved data for experience:', experienceId);
        return NextResponse.json({ success: true, data });
      } else {
        console.error('Failed to save data for experience:', experienceId);
        return NextResponse.json({ success: false, error: 'Failed to save to storage' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error saving experience data:', error);
      return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving experience data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
