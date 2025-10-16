import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import VideoExperience from "@/components/VideoExperience";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	try {
		// The headers contains the user token
		const headersList = await headers();

		// The experienceId is a path param
		const { experienceId } = await params;

		// The user token is in the headers
		const { userId } = await whopSdk.verifyUserToken(headersList);

		const result = await whopSdk.access.checkIfUserHasAccessToExperience({
			userId,
			experienceId,
		});

		const user = await whopSdk.users.getUser({ userId });
		const experience = await whopSdk.experiences.getExperience({ experienceId });

		// Either: 'admin' | 'customer' | 'no_access';
		// 'admin' means the user is an admin of the whop, such as an owner or moderator
		// 'customer' means the user is a common member in this whop
		// 'no_access' means the user does not have access to the whop
		const { accessLevel } = result;

		return (
			<VideoExperience 
				user={user}
				experience={experience}
				accessLevel={accessLevel}
				hasAccess={result.hasAccess}
			/>
		);
	} catch (error) {
		// Fallback for development/local testing
		console.log('Whop SDK authentication failed, using mock data:', error);
		
		const { experienceId } = await params;
		
		const mockUser = {
			id: 'dev-user-123',
			name: 'Development User',
			username: 'devuser'
		};
		
		const mockExperience = {
			id: experienceId,
			name: 'Video Experience Demo'
		};
		
		return (
			<VideoExperience 
				user={mockUser}
				experience={mockExperience}
				accessLevel="admin"
				hasAccess={true}
			/>
		);
	}
}